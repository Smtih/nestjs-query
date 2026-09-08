import { FilterComparisons, FilterFieldComparison, OnConditionFilter } from '@ptc-org/nestjs-query-core'
import { ObjectLiteral } from 'typeorm'

import { EntityComparisonField, SQLComparisonBuilder } from './sql-comparison.builder'

/**
 * @internal
 *
 * A SQL fragment and its bound parameters, in the shape `typeorm`'s join methods expect for their
 * `condition` and `parameters` arguments.
 */
export interface OnConditionSQL {
  condition?: string
  params?: ObjectLiteral
}

const EMPTY_ON_CONDITION: OnConditionSQL = { condition: undefined, params: undefined }

function combineOnConditions(conditions: OnConditionSQL[], operator: string): OnConditionSQL {
  const present = conditions.filter(({ condition }) => condition)

  if (!present.length) {
    return EMPTY_ON_CONDITION
  }

  const params = present.reduce<ObjectLiteral>((merged, { params: conditionParams }) => ({ ...merged, ...conditionParams }), {})

  if (present.length === 1) {
    return { condition: present[0].condition, params }
  }

  return { condition: `(${present.map(({ condition }) => condition).join(operator)})`, params }
}

/**
 * @internal
 *
 * Builds the extra `JOIN ... ON` fragment for the `on` key of a relation filter.
 *
 * Every comparison is delegated to the {@link SQLComparisonBuilder}, so values are always bound as
 * parameters rather than interpolated into the SQL.
 */
export class OnConditionBuilder<Entity> {
  constructor(private readonly sqlComparisonBuilder: SQLComparisonBuilder<Entity> = new SQLComparisonBuilder<Entity>()) {}

  /**
   * Builds the SQL fragment for a relation's join conditions.
   *
   * @param onCondition - the `on` conditions of the relation filter, if any.
   * @param alias - the alias of the relation being joined.
   */
  public build(onCondition: OnConditionFilter<Entity> | undefined, alias: string): OnConditionSQL {
    if (!onCondition) {
      return EMPTY_ON_CONDITION
    }

    const conditions = Object.keys(onCondition).map((field) => this.buildField(onCondition, field, alias))

    return combineOnConditions(conditions, ' AND ')
  }

  private buildField(onCondition: OnConditionFilter<Entity>, field: string, alias: string): OnConditionSQL {
    if (field === 'and') {
      return this.buildGrouping(onCondition.and, alias, ' AND ')
    }

    if (field === 'or') {
      return this.buildGrouping(onCondition.or, alias, ' OR ')
    }

    const entityField = field as keyof Entity

    return this.buildComparison(entityField, this.getComparison(onCondition, entityField), alias)
  }

  private buildGrouping(onConditions: OnConditionFilter<Entity>[] | undefined, alias: string, operator: string): OnConditionSQL {
    if (!Array.isArray(onConditions)) {
      return EMPTY_ON_CONDITION
    }

    return combineOnConditions(
      onConditions.map((onCondition) => this.build(onCondition, alias)),
      operator
    )
  }

  private buildComparison<F extends keyof Entity>(
    field: F,
    comparison: FilterFieldComparison<Entity[F]> | undefined,
    alias: string
  ): OnConditionSQL {
    if (!comparison || typeof comparison !== 'object') {
      return EMPTY_ON_CONDITION
    }

    const operators = Object.keys(comparison) as (keyof FilterFieldComparison<Entity[F]>)[]
    const comparisons = operators.map((operator) => {
      const { sql, params } = this.sqlComparisonBuilder.build(
        field,
        operator,
        comparison[operator] as EntityComparisonField<Entity, F>,
        alias
      )

      return { condition: sql, params }
    })

    return combineOnConditions(comparisons, ' OR ')
  }

  private getComparison<K extends keyof FilterComparisons<Entity>>(
    onCondition: FilterComparisons<Entity>,
    field: K
  ): FilterFieldComparison<Entity[K]> {
    return onCondition[field] as FilterFieldComparison<Entity[K]>
  }
}
