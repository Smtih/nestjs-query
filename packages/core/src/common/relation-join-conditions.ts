import { Class } from './class.type'
import { MetaValue, ValueReflector } from './reflect.utils'

/**
 * The default name of the reserved filter key that holds a relation's `JOIN ... ON` conditions.
 *
 * It is not a field or relation name and is therefore skipped when collecting the fields a filter
 * references.
 */
export const DEFAULT_RELATION_JOIN_CONDITION_KEY = 'on'

/**
 * The reserved filter key that holds a relation's `JOIN ... ON` conditions.
 *
 * @deprecated The key is configurable per DTO, so prefer {@link DEFAULT_RELATION_JOIN_CONDITION_KEY}
 * for the default name and {@link isReservedRelationJoinConditionKey} to recognise a key.
 */
export const ON_CONDITION_KEY = DEFAULT_RELATION_JOIN_CONDITION_KEY

const RELATION_JOIN_CONDITION_KEY = 'nestjs-query:relation-join-condition-key'

const keyReflector = new ValueReflector(RELATION_JOIN_CONDITION_KEY)

/**
 * Every join condition key any DTO has reserved in this process.
 *
 * A filter reaches the query layer as a plain object with no DTO attached, so the query builders
 * cannot ask a DTO which key it chose and instead recognise a key by membership of this set. The
 * reservation is therefore deliberately process wide, and reserving a key makes it unusable as a
 * filterable field name anywhere, which the GraphQL layer enforces at schema generation time.
 */
const reservedKeys = new Set<string>()

/**
 * Reserves a join condition key for a DTO.
 *
 * @param DTOClass - the DTO whose relation filters accept the key.
 * @param key - the property name that holds the join conditions.
 */
export function reserveRelationJoinConditionKey<DTO>(DTOClass: Class<DTO>, key: string): void {
  keyReflector.set(DTOClass, key)
  reservedKeys.add(key)
}

/**
 * The join condition key a DTO reserved, inherited from a base DTO when the DTO itself declares
 * none, or `undefined` when join conditions are not enabled for it.
 *
 * @param DTOClass - the DTO to read the key from.
 */
export function getRelationJoinConditionKey<DTO>(DTOClass: Class<DTO>): MetaValue<string> {
  return keyReflector.get<DTO, string>(DTOClass, true)
}

/**
 * Whether a filter key is a reserved join condition key rather than a field or relation name.
 *
 * @param key - the filter key to check.
 */
export function isReservedRelationJoinConditionKey(key: string): boolean {
  return reservedKeys.has(key)
}

/**
 * Every reserved join condition key, for error messages and diagnostics.
 */
export function getReservedRelationJoinConditionKeys(): string[] {
  return [...reservedKeys]
}

/**
 * The reserved join condition key a filter carries, if any.
 *
 * @param filter - the relation filter to inspect.
 */
export function findRelationJoinConditionKey(filter: unknown): string | undefined {
  if (!filter || typeof filter !== 'object') {
    return undefined
  }

  return Object.keys(filter).find((key) => isReservedRelationJoinConditionKey(key))
}

/**
 * Drops every reserved join condition key reserved so far.
 *
 * Intended for tests that need to assert behaviour with and without the feature enabled.
 */
export function clearReservedRelationJoinConditionKeys(): void {
  reservedKeys.clear()
}
