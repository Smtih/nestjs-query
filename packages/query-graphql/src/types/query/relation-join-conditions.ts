import { DEFAULT_RELATION_JOIN_CONDITION_KEY } from '@ptc-org/nestjs-query-core'

/**
 * Options for the reserved filter key that holds a relation's `JOIN ... ON` conditions.
 */
export type RelationJoinConditionsOptions = {
  /**
   * The name of the reserved key.
   *
   * The name is used as the runtime property name as well as the GraphQL field name, so a DTO that
   * already declares a field called `on` can move the join conditions out of its way.
   */
  field: string
}

/**
 * How a DTO enables relation join conditions: `true` for the default key, or an object naming a
 * different key.
 */
export type RelationJoinConditionsOption = boolean | RelationJoinConditionsOptions

/**
 * The join condition key an `enableRelationJoinConditions` option asks for, or `undefined` when
 * join conditions are not enabled.
 *
 * @param option - the option as declared through `@QueryOptions`.
 */
export function resolveRelationJoinConditionKey(option: RelationJoinConditionsOption | undefined): string | undefined {
  if (!option) {
    return undefined
  }

  return option === true ? DEFAULT_RELATION_JOIN_CONDITION_KEY : option.field
}
