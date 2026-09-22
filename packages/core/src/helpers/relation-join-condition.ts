import { Filter } from '../interfaces'

/**
 * The filter key reserved for a relation's `JOIN ... ON` conditions.
 *
 * Reserved across every filter a query service is given, because it is a word in the filter
 * language rather than a property of one entity: a filter that has to remember which relation
 * spells it which way is worse off than one that cannot use the word at all.
 *
 * A relation whose entity has a filterable property of this name therefore cannot be filtered on
 * that property through the filter of that relation.
 */
export const RELATION_JOIN_CONDITION_KEY = 'joinOn'

/**
 * The filter of a relation that carries conditions for that relation's `JOIN ... ON` clause.
 */
export type RelationJoinConditionFilter<Relation> = Filter<Relation> & {
  [RELATION_JOIN_CONDITION_KEY]?: Filter<Relation>
}

/**
 * Builds the filter of a relation from conditions for that relation's `JOIN ... ON` clause.
 *
 * Use it to write a filter in TypeScript and keep the conditions typed against the relation, which
 * `Filter` cannot do for a key it does not declare.
 *
 * @example
 * ```ts
 * // LEFT JOIN "sub_task" ON "sub_task"."todo_item_id" = "todo_item"."id" AND "sub_task"."completed" = true
 * const filter: Filter<TodoItem> = { subTasks: relationJoinCondition<SubTask>({ completed: { is: true } }) }
 * // { subTasks: { joinOn: { completed: { is: true } } } }
 * ```
 *
 * @param conditions - the conditions to add to the relation's JOIN.
 */
export function relationJoinCondition<Relation>(conditions: Filter<Relation>): RelationJoinConditionFilter<Relation> {
  const relationFilter: RelationJoinConditionFilter<Relation> = {}
  relationFilter[RELATION_JOIN_CONDITION_KEY] = conditions

  return relationFilter
}

/**
 * Thrown when a filter carries relation join conditions and the service executing it cannot honour
 * them.
 *
 * Only `@ptc-org/nestjs-query-typeorm` builds these conditions into a query today. A filter travels
 * to whichever query service executes it, so the key reaches services that would otherwise read it
 * as a field name and answer a different question than the one that was asked.
 */
export class UnsupportedRelationJoinConditionError extends Error {}

function filterHasRelationJoinCondition(filter?: Filter<unknown>): boolean {
  if (!filter || typeof filter !== 'object') {
    return false
  }

  return Object.entries(filter as Record<string, unknown>).some(([key, value]) => {
    if (key === RELATION_JOIN_CONDITION_KEY) {
      return true
    }

    if (Array.isArray(value)) {
      return value.some((branch) => filterHasRelationJoinCondition(branch as Filter<unknown>))
    }

    return filterHasRelationJoinCondition(value as Filter<unknown>)
  })
}

/**
 * Fails when a filter carries relation join conditions, for a query service that cannot honour
 * them.
 *
 * Called by each query service that reads a filter it cannot build a JOIN condition from, so that
 * the key is refused rather than read as the name of a field.
 *
 * @param filter - the filter to check.
 */
export function assertNoRelationJoinConditions(filter?: Filter<unknown>): void {
  if (!filterHasRelationJoinCondition(filter)) {
    return
  }

  throw new UnsupportedRelationJoinConditionError(
    `This query service does not support relation join conditions, and cannot evaluate the "${RELATION_JOIN_CONDITION_KEY}" key in a filter. ` +
      'Relation join conditions are supported by @ptc-org/nestjs-query-typeorm.'
  )
}

/**
 * Thrown when the filter key reserved for a relation's `JOIN ... ON` conditions is used where there
 * is no relation being joined, and so no ON clause the conditions could be added to.
 *
 * A misplaced key is refused rather than dropped from the query, so that a filter asking for
 * something no JOIN can be given fails instead of quietly answering a different question.
 */
export class InvalidRelationJoinConditionError extends Error {}

/**
 * The relations of the entity a filter filters, as far as the join condition rules are concerned.
 *
 * Called with a filter key, it answers with the scope of the entity that key relates to, or
 * `undefined` when the key names something other than a relation. Persistence packages build one
 * from their own metadata, so that the rules below can be stated once without core knowing what a
 * relation is.
 */
export type RelationJoinConditionScope = (key: string) => RelationJoinConditionScope | undefined

/**
 * Where in a filter the reserved join condition key is being looked for.
 *
 * `relation` is the filter of a relation reached directly from the filter of the entity it belongs
 * to, the one position that has a JOIN to add conditions to. `grouped` is anything below an `and`
 * or an `or`, where a relation is joined once for every branch that references it and there is no
 * single JOIN a condition could belong to. `condition` is inside a join condition, which constrains
 * the one relation being joined and nothing beyond it.
 */
type JoinConditionPosition = 'root' | 'relation' | 'grouped' | 'condition'

function isFilter(value: unknown): value is Filter<unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asFilters(value: unknown): Filter<unknown>[] {
  return Array.isArray(value) ? value.filter(isFilter) : []
}

function assertKeyAllowedAt(position: JoinConditionPosition, relationKey: string | null): void {
  if (position === 'root') {
    throw new InvalidRelationJoinConditionError(
      `"${RELATION_JOIN_CONDITION_KEY}" is only valid in the filter of a relation, where it adds conditions to that relation's JOIN ON clause. ` +
        'A filter of the records a query returns has no JOIN of its own.'
    )
  }

  if (position === 'grouped') {
    throw new InvalidRelationJoinConditionError(
      `"${RELATION_JOIN_CONDITION_KEY}" is only valid in the filter of a relation, and cannot be used inside an "and" or an "or". ` +
        'A relation referenced from several branches is joined once for all of them, so there is no one JOIN the conditions would belong to.'
    )
  }

  if (position === 'condition') {
    throw new InvalidRelationJoinConditionError(
      `"${RELATION_JOIN_CONDITION_KEY}" cannot be nested inside the "${RELATION_JOIN_CONDITION_KEY}" conditions of "${relationKey}". ` +
        'An ON clause constrains the one relation being joined, and nothing beyond it.'
    )
  }
}

function assertPlacement(
  filter: Filter<unknown>,
  scope: RelationJoinConditionScope,
  position: JoinConditionPosition,
  relationKey: string | null
): void {
  Object.entries(filter as Record<string, unknown>).forEach(([key, value]) => {
    if (key === RELATION_JOIN_CONDITION_KEY) {
      assertKeyAllowedAt(position, relationKey)

      if (isFilter(value)) {
        assertPlacement(value, scope, 'condition', relationKey)
      }

      return
    }

    if (key === 'and' || key === 'or') {
      const branchPosition = position === 'condition' ? 'condition' : 'grouped'

      asFilters(value).forEach((branch) => assertPlacement(branch, scope, branchPosition, relationKey))

      return
    }

    const relationScope = scope(key)

    if (!relationScope) {
      return
    }

    if (position === 'condition') {
      throw new InvalidRelationJoinConditionError(
        `"${key}" cannot be part of the "${RELATION_JOIN_CONDITION_KEY}" conditions of "${relationKey}", which can only compare fields of the relation being joined. ` +
          'A condition on a further relation needs a JOIN of its own, which an ON clause has nowhere to put.'
      )
    }

    if (isFilter(value)) {
      assertPlacement(value, relationScope, position === 'grouped' ? 'grouped' : 'relation', key)
    }
  })
}

/**
 * Fails when the reserved join condition key appears anywhere but the filter of a relation, rather
 * than letting a condition that cannot be honoured be dropped from the query.
 *
 * The key is valid in exactly one place: the filter of a relation reached from the filter of the
 * entity it belongs to. It is rejected at the root of a filter, inside an `and` or an `or`, and
 * inside another join condition, and the conditions it carries are rejected if they reach past the
 * relation being joined.
 *
 * @param filter - the filter to check.
 * @param scope - the relations of the entity the filter filters.
 */
export function assertValidRelationJoinConditionPlacement(filter: Filter<unknown>, scope: RelationJoinConditionScope): void {
  assertPlacement(filter, scope, 'root', null)
}
