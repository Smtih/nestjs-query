import {
  Filter,
  hasRelationJoinConditions,
  InvalidRelationJoinConditionError,
  RELATION_JOIN_CONDITION_KEY,
  RelationJoinConditionScope
} from '@ptc-org/nestjs-query-core'
import { EntityMetadata, ObjectLiteral } from 'typeorm'

/**
 * @internal
 *
 * A predicate added to a relation's `JOIN ... ON` clause, in the form `typeorm`'s join methods take
 * it. An empty condition leaves the join with only the predicate `typeorm` derives from the
 * relation's metadata.
 */
export interface JoinCondition {
  condition?: string
  params?: ObjectLiteral
}

/**
 * @internal
 */
export const EMPTY_JOIN_CONDITION: JoinCondition = {}

/**
 * @internal
 *
 * The relations of an entity, in the form the join condition placement rules read them.
 *
 * @param metadata - metadata of the entity a filter filters.
 */
export function relationJoinConditionScope(metadata: EntityMetadata): RelationJoinConditionScope {
  return (key) => {
    const relation = metadata.relations.find(({ propertyName }) => propertyName === key)

    return relation ? relationJoinConditionScope(relation.inverseEntityMetadata) : undefined
  }
}

/**
 * @internal
 *
 * Whether a value is a filter, rather than a comparison value or a list of filters.
 *
 * @param value - the value to check.
 */
export function isFilter(value: unknown): value is Filter<unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * @internal
 *
 * The conditions a relation's filter adds to that relation's `JOIN ... ON` clause, if it has any.
 *
 * @param filter - the filter of a relation.
 */
export function getJoinConditionFilter(filter: unknown): Filter<unknown> | undefined {
  if (!isFilter(filter)) {
    return undefined
  }

  const joinCondition = (filter as Record<string, unknown>)[RELATION_JOIN_CONDITION_KEY]

  return isFilter(joinCondition) ? joinCondition : undefined
}

/**
 * @internal
 *
 * Whether a filter has anything left to add to the WHERE clause once its join conditions are taken
 * out of it.
 *
 * @param filter - the filter of a relation.
 */
export function hasWhereConditions(filter: Filter<unknown>): boolean {
  return Object.keys(filter).some((key) => key !== RELATION_JOIN_CONDITION_KEY)
}

/**
 * @internal
 *
 * Joins conditions into a single condition, bracketing it when there is more than one so that it
 * keeps its meaning next to the predicate `typeorm` derives from the relation's metadata.
 *
 * @param conditions - the conditions to combine.
 * @param operator - the SQL operator to combine them with.
 */
export function combineJoinConditions(conditions: JoinCondition[], operator: ' AND ' | ' OR '): JoinCondition {
  const present = conditions.filter(({ condition }) => condition)

  if (!present.length) {
    return EMPTY_JOIN_CONDITION
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
 * Fails when a filter carries relation join conditions and the query being built joins no relation,
 * so that conditions there is no ON clause to add them to are refused rather than dropped.
 *
 * A relation filter that only carries join conditions adds nothing to a WHERE clause, so a query
 * built without the JOIN the conditions belong to would otherwise run as though the relation had
 * never been filtered.
 *
 * @param filter - the filter of the query being built.
 * @param query - what is being built, named in the error.
 */
export function assertNoConditionsWithoutAJoin(filter: Filter<unknown> | undefined, query: string): void {
  if (!hasRelationJoinConditions(filter)) {
    return
  }

  throw new InvalidRelationJoinConditionError(
    `"${RELATION_JOIN_CONDITION_KEY}" conditions cannot be built into ${query}, which joins no relation. ` +
      'Conditions that no ON clause could be given are refused rather than dropped from the query.'
  )
}
