import {
  Filter,
  FilterComparisonOperators,
  FilterComparisons,
  FilterFieldComparison,
  RELATION_JOIN_CONDITION_KEY
} from '@ptc-org/nestjs-query-core'
import { Brackets, EntityMetadata } from 'typeorm'

import type { WhereExpressionBuilder } from 'typeorm'

import { deriveBuilder } from './derive-builder'
import { NestedRelationsAliased } from './filter-query.builder'
import { combineJoinConditions, hasWhereConditions, JoinCondition } from './join-condition'
import { EntityComparisonField, SQLComparisonBuilder } from './sql-comparison.builder'

/**
 * @internal
 * Builds a WHERE clause from a Filter.
 */
export class WhereBuilder<Entity> {
  constructor(private readonly sqlComparisonBuilder: SQLComparisonBuilder<Entity> = new SQLComparisonBuilder<Entity>()) {}

  /**
   * Creates a builder like this one bound to another entity's metadata, used when a query descends
   * into a relation, both to build that relation's WHERE clause and to build the conditions its
   * filter adds to the relation's `JOIN ... ON` clause.
   *
   * The derived builder keeps the prototype and the own property descriptors of this builder, and
   * its comparison builder is derived for the same metadata, so a custom builder is neither
   * dropped nor left resolving fields against the root entity.
   *
   * Override this method to construct the derived builder yourself when copying the own property
   * descriptors is not enough, for example when a subclass holds private class fields (which are
   * not copied, and are unreadable on the derived builder) or state that is derived from the root
   * entity's metadata and must not be reused for a relation.
   *
   * @param entityMetadata - metadata of the entity the derived builder builds WHERE clauses for.
   */
  public deriveForEntityMetadata<Relation>(entityMetadata: EntityMetadata): WhereBuilder<Relation> {
    return deriveBuilder<WhereBuilder<Relation>>(this, {
      sqlComparisonBuilder: this.sqlComparisonBuilder.deriveForEntityMetadata<Relation>(entityMetadata)
    })
  }

  /**
   * Builds a WHERE clause from a Filter.
   * @param where - the `typeorm` WhereExpression
   * @param filter - the filter to build the WHERE clause from.
   * @param relationNames - the relations tree.
   * @param alias - optional alias to use to qualify an identifier
   */
  public build<Where extends WhereExpressionBuilder>(
    where: Where,
    filter: Filter<Entity>,
    relationNames: NestedRelationsAliased,
    alias?: string
  ): Where {
    const { and, or } = filter

    if (and && and.length) {
      this.filterAnd(where, and, relationNames, alias)
    }

    if (or && or.length) {
      this.filterOr(where, or, relationNames, alias)
    }

    return this.filterFields(where, filter, relationNames, alias)
  }

  /**
   * Builds the conditions a relation's filter adds to that relation's `JOIN ... ON` clause.
   *
   * The conditions are built by a where builder derived for the relation, so that they are built by
   * the same comparison builder the WHERE clause of that relation would be built by, and so that a
   * field resolves against the relation rather than against the entity it is joined to.
   *
   * @param filter - the conditions carried by the relation's filter.
   * @param relationMetadata - metadata of the relation being joined.
   * @param alias - the alias the relation is joined under.
   */
  public buildRelationJoinCondition<Relation>(
    filter: Filter<Relation>,
    relationMetadata: EntityMetadata,
    alias: string
  ): JoinCondition {
    return this.deriveForEntityMetadata<Relation>(relationMetadata).buildJoinCondition(filter, alias)
  }

  /**
   * ANDs multiple filters together. This will properly group every clause to ensure proper precedence.
   *
   * @param where - the `typeorm` WhereExpression
   * @param filters - the array of filters to AND together
   * @param relationNames - the relations tree.
   * @param alias - optional alias to use to qualify an identifier
   */
  private filterAnd<Where extends WhereExpressionBuilder>(
    where: Where,
    filters: Filter<Entity>[],
    relationNames: NestedRelationsAliased,
    alias: string | undefined
  ): Where {
    return where.andWhere(
      new Brackets((qb) => filters.reduce((w, f) => qb.andWhere(this.createBrackets(f, relationNames, alias)), qb))
    )
  }

  /**
   * ORs multiple filters together. This will properly group every clause to ensure proper precedence.
   *
   * @param where - the `typeorm` WhereExpression
   * @param filter - the array of filters to OR together
   * @param relationNames - the relations tree.
   * @param alias - optional alias to use to qualify an identifier
   */
  private filterOr<Where extends WhereExpressionBuilder>(
    where: Where,
    filter: Filter<Entity>[],
    relationNames: NestedRelationsAliased,
    alias: string | undefined
  ): Where {
    return where.andWhere(
      new Brackets((qb) => filter.reduce((w, f) => qb.orWhere(this.createBrackets(f, relationNames, alias)), qb))
    )
  }

  /**
   * Wraps a filter in brackets to ensure precedence.
   * ```
   * {a: { eq: 1 } } // "(a = 1)"
   * {a: { eq: 1 }, b: { gt: 2 } } // "((a = 1) AND (b > 2))"
   * ```
   * @param filter - the filter to wrap in brackets.
   * @param relationNames - the relations tree.
   * @param alias - optional alias to use to qualify an identifier
   */
  private createBrackets(filter: Filter<Entity>, relationNames: NestedRelationsAliased, alias: string | undefined): Brackets {
    return new Brackets((qb) => this.build(qb, filter, relationNames, alias))
  }

  /**
   * Creates field comparisons from a filter. This method will ignore and/or properties.
   * @param where - the `typeorm` WhereExpression
   * @param filter - the filter with fields to create comparisons for.
   * @param relationNames - the relations tree.
   * @param alias - optional alias to use to qualify an identifier
   */
  private filterFields<Where extends WhereExpressionBuilder>(
    where: Where,
    filter: Filter<Entity>,
    relationNames: NestedRelationsAliased,
    alias: string | undefined
  ): Where {
    return Object.keys(filter).reduce((w, field) => {
      if (field !== 'and' && field !== 'or' && field !== RELATION_JOIN_CONDITION_KEY) {
        return this.withFilterComparison(
          where,
          field as keyof Entity,
          this.getField(filter, field as keyof Entity),
          relationNames,
          alias
        )
      }
      return w
    }, where)
  }

  private getField<K extends keyof FilterComparisons<Entity>>(
    obj: FilterComparisons<Entity>,
    field: K
  ): FilterFieldComparison<Entity[K]> {
    return obj[field] as FilterFieldComparison<Entity[K]>
  }

  private withFilterComparison<T extends keyof Entity, Where extends WhereExpressionBuilder>(
    where: Where,
    field: T,
    cmp: FilterFieldComparison<Entity[T]>,
    relationNames: NestedRelationsAliased,
    alias: string | undefined
  ): Where {
    if (relationNames[field as string]) {
      return this.withRelationFilter(where, field, cmp as Filter<Entity[T]>, relationNames)
    }

    return where.andWhere(
      new Brackets((qb) => {
        const opts = Object.keys(cmp) as (keyof FilterFieldComparison<Entity[T]>)[]
        const sqlComparisons = opts.map((cmpType) =>
          this.sqlComparisonBuilder.build(field, cmpType, cmp[cmpType] as EntityComparisonField<Entity, T>, alias)
        )

        sqlComparisons.map(({ sql, params }) => qb.orWhere(sql, params))
      })
    )
  }

  /**
   * Builds a filter into a single SQL predicate, rather than into a `typeorm` WHERE expression, so
   * that it can be added to a JOIN's ON clause.
   *
   * @param filter - the filter to build the predicate from.
   * @param alias - the alias the filtered entity is joined under.
   */
  private buildJoinCondition(filter: Filter<Entity>, alias: string): JoinCondition {
    return combineJoinConditions(
      Object.keys(filter).map((field) => this.joinConditionForField(filter, field, alias)),
      ' AND '
    )
  }

  private joinConditionForField(filter: Filter<Entity>, field: string, alias: string): JoinCondition {
    if (field === 'and' || field === 'or') {
      const branches = filter[field] ?? []

      return combineJoinConditions(
        branches.map((branch) => this.buildJoinCondition(branch, alias)),
        field === 'and' ? ' AND ' : ' OR '
      )
    }

    return this.comparisonJoinCondition(field as keyof Entity, this.getField(filter, field as keyof Entity), alias)
  }

  private comparisonJoinCondition<T extends keyof Entity>(
    field: T,
    cmp: FilterFieldComparison<Entity[T]>,
    alias: string
  ): JoinCondition {
    const comparisons = Object.keys(cmp).map((cmpType) => {
      const { sql, params } = this.sqlComparisonBuilder.build(
        field,
        cmpType as FilterComparisonOperators<Entity[T]>,
        cmp[cmpType] as EntityComparisonField<Entity, T>,
        alias
      )

      return { condition: sql, params }
    })

    return combineJoinConditions(comparisons, ' OR ')
  }

  private withRelationFilter<T extends keyof Entity, Where extends WhereExpressionBuilder>(
    where: Where,
    field: T,
    cmp: Filter<Entity[T]>,
    relationNames: NestedRelationsAliased
  ): Where {
    if (!hasWhereConditions(cmp)) {
      return where
    }

    return where.andWhere(
      new Brackets((qb) => {
        const nestedRelationAliased = relationNames[field as string]
        const relationWhere = this.deriveForEntityMetadata<Entity[T]>(nestedRelationAliased.metadata)
        const nestedRelationAliasedAlias = nestedRelationAliased.alias
        const nestedRelationAliasedRelationNames = nestedRelationAliased.relations ?? {}

        return relationWhere.build(qb, cmp, nestedRelationAliasedRelationNames, nestedRelationAliasedAlias)
      })
    )
  }
}
