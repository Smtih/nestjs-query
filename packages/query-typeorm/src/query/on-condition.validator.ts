import { Filter, ON_CONDITION_KEY } from '@ptc-org/nestjs-query-core'

/**
 * Thrown when a filter carries an `on` key in a position that cannot be attached to a
 * `JOIN ... ON` clause.
 */
export class InvalidOnConditionPlacementError extends Error {
  constructor(detail: string) {
    super(`\`on\` conditions are only supported at the top level of a relation filter, ${detail}.`)

    this.name = 'InvalidOnConditionPlacementError'
  }
}

function isFilterLike(filter: unknown): filter is Record<string, unknown> {
  return !!filter && typeof filter === 'object'
}

function hasOnCondition(filter: unknown): boolean {
  return isFilterLike(filter) && ON_CONDITION_KEY in filter
}

function assertNoRootOnCondition(filter: Filter<unknown>): void {
  if (hasOnCondition(filter)) {
    throw new InvalidOnConditionPlacementError('not at the root filter level')
  }
}

function assertNoOnConditionInsideBooleanExpression(filter: unknown): void {
  if (!isFilterLike(filter)) {
    return
  }

  for (const [key, value] of Object.entries(filter)) {
    if (key !== 'and' && key !== 'or') {
      assertNoOnConditionInsideBooleanExpression(value)
      continue
    }

    if (!Array.isArray(value)) {
      continue
    }

    for (const subFilter of value) {
      if (hasOnCondition(subFilter)) {
        throw new InvalidOnConditionPlacementError('not inside an `and`/`or` expression')
      }

      assertNoOnConditionInsideBooleanExpression(subFilter)
    }
  }
}

/**
 * @internal
 *
 * Asserts that every `on` key in a filter sits at the top level of a relation filter, the only
 * position from which it can be injected into a join.
 *
 * @param filter - the root filter to validate.
 */
export function assertValidOnConditionPlacement(filter: Filter<unknown>): void {
  assertNoRootOnCondition(filter)
  assertNoOnConditionInsideBooleanExpression(filter)
}
