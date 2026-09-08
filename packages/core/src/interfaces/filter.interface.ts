import { FilterFieldComparison } from './filter-field-comparison.interface'

/**
 * A comparison for fields in T.
 * @example
 * ```ts
 * // name LIKE "Foo%"
 * const filter: Filter<Item> = {
 *   { name: { like: 'Foo%' } },
 * }
 * ```
 *
 * @example
 * ```ts
 * // completed IS TRUE
 * const filter: Filter<Item> = {
 *   { completed: { is: true } },
 * }
 * ```
 * @typeparam T - the type of object to filter on.
 */
export type FilterComparisons<T> = {
  [K in keyof T]?: FilterFieldComparison<T[K]>
}

/**
 * A grouping of filters that should be ANDed or ORed together.
 *
 * * @example
 * ```ts
 * // completed IS TRUE OR name = "Foo"
 * const filter: Filter<Item> = {
 *   or: [
 *     { completed: { is: true } },
 *     { name: { eq: "Foo" } },
 *   ]
 * }
 * ```
 *
 * @example
 * ```ts
 * // completed IS TRUE OR (age > 10 AND age < 20)
 * const filter: Filter<Item> = {
 *   or: [
 *     { completed: { is: true } },
 *     {
 *       and: [
 *         { age: { gt : 10 } },
 *         { age: { lt : 20 } },
 *       ]
 *     },
 *   ]
 * }
 * ```
 */
type FilterGrouping<T> = {
  /**
   * Group an array of filters with an AND operation.
   */
  and?: Filter<T>[]
  /**
   * Group an array of filters with an OR operation.
   */
  or?: Filter<T>[]
}

/**
 * Conditions that are injected into a relation's SQL `JOIN ... ON` clause instead of the `WHERE`
 * clause.
 *
 * Only comparisons on the joined relation's own fields are allowed, optionally grouped with
 * `and`/`or`. Nested relations are not, because a join condition can only reference the relation
 * being joined.
 *
 * @example
 * ```ts
 * // LEFT JOIN "sub_task" ON "sub_task"."task_id" = "task"."id" AND ("sub_task"."completed" = FALSE)
 * const filter: Filter<Task> = {
 *   subTasks: {
 *     on: { completed: { is: false } },
 *   },
 * }
 * ```
 *
 * @typeparam T - the type of object the join condition applies to.
 */
export type OnConditionFilter<T> = FilterComparisons<T> & {
  /**
   * Group an array of join conditions with an AND operation.
   */
  and?: OnConditionFilter<T>[]
  /**
   * Group an array of join conditions with an OR operation.
   */
  or?: OnConditionFilter<T>[]
}

/**
 * The join conditions of a relation filter.
 */
type FilterJoinConditions<T> = {
  /**
   * Conditions to inject into this relation's SQL `JOIN ... ON` clause rather than the `WHERE`
   * clause, which preserves `LEFT JOIN` semantics so parent rows without a matching child are
   * kept.
   *
   * Only honoured at the top level of a relation filter. An `on` at the root filter level, or
   * inside an `and`/`or` expression, has no join to attach to and is rejected.
   */
  on?: OnConditionFilter<T>
}

/**
 * Filter for type T.
 *
 * @example
 * ```ts
 * // name LIKE "Foo%"
 * const filter: Filter<Item> = {
 *   { name: { like: 'Foo%' } },
 * }
 * ```
 *
 * @example
 * ```ts
 * // completed IS TRUE
 * const filter: Filter<Item> = {
 *   { completed: { is: true } },
 * }
 * ```
 *
 * @example
 * ```ts
 * // completed IS TRUE OR name = "Foo"
 * const filter: Filter<Item> = {
 *   or: [
 *     { completed: { is: true } },
 *     { name: { eq: "Foo" } },
 *   ]
 * }
 * ```
 *
 * @example
 * ```ts
 * // completed IS TRUE OR (age > 10 AND age < 20)
 * const filter: Filter<Item> = {
 *   or: [
 *     { completed: { is: true } },
 *     {
 *       and: [
 *         { age: { gt : 10 } },
 *         { age: { lt : 20 } },
 *       ]
 *     },
 *   ]
 * }
 * ```
 *
 * @example
 * ```ts
 * // LEFT JOIN "sub_task" ON "sub_task"."task_id" = "task"."id" AND ("sub_task"."completed" = FALSE)
 * const filter: Filter<Task> = {
 *   subTasks: {
 *     on: { completed: { is: false } },
 *   },
 * }
 * ```
 *
 * @typeparam T - the type of object to filter on.
 */
export type Filter<T> = FilterGrouping<T> & FilterComparisons<T> & FilterJoinConditions<T>
