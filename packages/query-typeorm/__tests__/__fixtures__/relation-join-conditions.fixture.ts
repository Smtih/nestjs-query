import { DEFAULT_RELATION_JOIN_CONDITION_KEY, reserveRelationJoinConditionKey } from '@ptc-org/nestjs-query-core'

import { TestEntity } from './test.entity'

/**
 * Reserves the default join condition key for the test entities.
 *
 * Stands in for the `@QueryOptions({ enableRelationJoinConditions: true })` a DTO carries in a
 * GraphQL application, which is what reserves the key there.
 */
export const enableRelationJoinConditions = (): void => {
  reserveRelationJoinConditionKey(TestEntity, DEFAULT_RELATION_JOIN_CONDITION_KEY)
}
