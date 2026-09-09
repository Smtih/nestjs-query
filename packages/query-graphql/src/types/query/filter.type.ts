import { Field, InputType, TypeMetadataStorage } from '@nestjs/graphql'
import { Class, Filter, getRelationJoinConditionKey, MapReflector, upperCaseFirst } from '@ptc-org/nestjs-query-core'
import { Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'

import { getDTONames, getGraphqlObjectName } from '../../common'
import { getFilterableFields, getQueryOptions, getRelations, SkipIf } from '../../decorators'
import { HasRequiredFilter } from '../../decorators/has-required.filter'
import { ResolverRelation } from '../../resolvers'
import { createFilterComparisonType } from './field-comparison'
import { isInAllowedList } from './helpers'
import { RelationJoinConditionsOption } from './relation-join-conditions'

const reflector = new MapReflector('nestjs-query:filter-type')
// internal cache is used to exit early if the same filter is requested multiple times
// e.g. if there is a circular reference in the relations
//      `User -> Post -> User-> Post -> ...`
const internalCache = new Map<Class<unknown>, Map<string, FilterConstructor<unknown>>>()

const ON_CONDITION_TYPE_SUFFIX = 'OnCondition'
const RELATION_JOIN_CONDITION_TYPE_PREFIX = 'Relation'

export type FilterTypeOptions = {
  allowedBooleanExpressions?: ('and' | 'or')[]
  filterDepth?: number
  /**
   * Enable the join conditions field on this DTO's generated relation filter type.
   *
   * Conditions under the field are injected into the relation's SQL `JOIN ... ON` clause instead of
   * the `WHERE` clause. The option is read from the *related* DTO, so setting it means "wherever
   * this DTO appears as a filterable relation, its filter accepts join conditions". It is also
   * inherited from a base DTO, so it can be set once on a shared base class.
   *
   * `true` uses the default key `on`; pass `{ field: '<name>' }` when the DTO already declares a
   * field called `on`. Only the typeorm adapter can honour the option — every other adapter throws
   * at bootstrap when it is asked to serve a DTO that enables it.
   *
   * [Default=false]
   */
  enableRelationJoinConditions?: RelationJoinConditionsOption
}

/**
 * Details of a name clash between a DTO's join condition key and one of its own members.
 */
interface RelationJoinConditionKeyClash {
  dtoName: string
  key: string
  member: 'field' | 'relation'
}

/**
 * Thrown when a DTO reserves a join condition key that one of its own fields or relations already
 * uses, which would otherwise silently shadow that member.
 */
export class ReservedRelationJoinConditionKeyError extends Error {
  constructor({ dtoName, key, member }: RelationJoinConditionKeyClash) {
    super(
      `${dtoName} enables relation join conditions under the key \`${key}\`, but also declares a ${member} named \`${key}\`. ` +
        `Reserve a different key with \`@QueryOptions({ enableRelationJoinConditions: { field: '<name>' } })\` on ${dtoName}.`
    )

    this.name = 'ReservedRelationJoinConditionKeyError'
  }
}

export type FilterableRelations = Record<string, Class<unknown>>

export interface FilterConstructor<T> {
  hasRequiredFilters: boolean

  prototype: object

  new (): Filter<T>
}

function getObjectTypeName<DTO>(DTOClass: Class<DTO>): string {
  return getGraphqlObjectName(DTOClass, 'No fields found to create FilterType.')
}

function getFilterableRelations(relations: Record<string, ResolverRelation<unknown>>): FilterableRelations {
  const filterableRelations: FilterableRelations = {}
  Object.keys(relations).forEach((r) => {
    const opts = relations[r]
    if (opts && opts.allowFiltering) {
      filterableRelations[r] = opts.DTO
    }
  })
  return filterableRelations
}

/**
 * The type name prefix for a relation filter that cannot be prefixed with its parent's type name.
 *
 * A relation filter reached at an infinite depth shares its name with the related DTO's own root
 * filter type, which would hand the root filter a join conditions field it has no join to attach
 * to. Marking the relation filter keeps the two apart, while a filter without join conditions is
 * left unmarked so it can keep collapsing onto the structurally identical root filter type.
 */
function getInfiniteDepthRelationFilterPrefix(RelationClass: Class<unknown>): string {
  return getRelationJoinConditionKey(RelationClass) ? RELATION_JOIN_CONDITION_TYPE_PREFIX : ''
}

function assertJoinConditionKeyIsNotAField(TClass: Class<unknown>, key: string): void {
  const clashingField = getFilterableFields(TClass).find(
    ({ propertyName, schemaName }) => propertyName === key || schemaName === key
  )

  if (clashingField) {
    throw new ReservedRelationJoinConditionKeyError({ dtoName: TClass.name, key, member: 'field' })
  }
}

function assertJoinConditionKeyIsNotARelation(TClass: Class<unknown>, key: string): void {
  const { one = {}, many = {} } = getRelations(TClass)

  if (key in one || key in many) {
    throw new ReservedRelationJoinConditionKeyError({ dtoName: TClass.name, key, member: 'relation' })
  }
}

/**
 * Asserts that a DTO's reserved join condition key does not shadow one of the DTO's own members.
 *
 * Without the assertion the key and the member would both be declared as the same GraphQL field,
 * and the member would silently lose its filter.
 */
function assertJoinConditionKeyIsAvailable(TClass: Class<unknown>, key: string): void {
  assertJoinConditionKeyIsNotAField(TClass, key)
  assertJoinConditionKeyIsNotARelation(TClass, key)
}

function getJoinConditionFieldDescription(key: string): string {
  return (
    "Conditions injected into this relation's JOIN ON clause rather than the WHERE clause, " +
    'preserving LEFT JOIN semantics so parent rows without a matching child are kept. Only ' +
    `honoured at the top level of a relation filter: \`${key}\` at the root filter level, or inside ` +
    'an `and`/`or` expression, is rejected.'
  )
}

/**
 * Adds the join conditions field to a filter type that is used as a relation filter.
 *
 * Conditions under the field end up in the relation's `JOIN ... ON` clause, so it is typed with a
 * depth zero filter and therefore cannot itself reference further relations.
 *
 * @param RelationFilter - the relation filter type to add the field to.
 * @param OnConditionFilter - the depth zero filter type the field accepts.
 * @param key - the reserved key the field is declared under.
 */
function addJoinConditionsField<T>(
  RelationFilter: FilterConstructor<T>,
  OnConditionFilter: FilterConstructor<T>,
  key: string
): void {
  const filterPrototype = RelationFilter.prototype

  ValidateNested()(filterPrototype, key)
  Field(() => OnConditionFilter, {
    nullable: true,
    description: getJoinConditionFieldDescription(key)
  })(filterPrototype, key)
  Type(() => OnConditionFilter)(filterPrototype, key)
}

function getOrCreateFilterType<T>(
  TClass: Class<T>,
  prefix: string | null,
  suffix: string | null,
  depth: number
): FilterConstructor<T> {
  const $prefix = prefix ?? ''
  const $suffix = suffix ?? ''

  const name = `${$prefix}${getObjectTypeName(TClass)}${$suffix}`
  const filterType = Number.isFinite(depth) ? '' : 'Deep'
  const typeName = `${name}${filterType}Filter`

  return reflector.memoize(TClass, typeName, () => {
    const { one = {}, many = {} } = getRelations(TClass)

    const filterableRelations: FilterableRelations = { ...getFilterableRelations(one), ...getFilterableRelations(many) }
    const { allowedBooleanExpressions }: FilterTypeOptions = getQueryOptions(TClass) ?? {}

    const fields = getFilterableFields(TClass)

    if (!fields.length) {
      throw new Error(`No fields found to create GraphQLFilter for ${TClass.name}`)
    }

    const joinConditionKey = getRelationJoinConditionKey(TClass)

    if (joinConditionKey) {
      assertJoinConditionKeyIsAvailable(TClass, joinConditionKey)
    }

    const hasRequiredFilters = fields.some((f) => f.advancedOptions?.filterRequired === true)
    const isNotAllowedComparison = (val: 'and' | 'or') => !isInAllowedList(allowedBooleanExpressions, val)

    @InputType(typeName)
    class GraphQLFilter {
      static hasRequiredFilters: boolean = hasRequiredFilters

      @ValidateNested()
      @SkipIf(() => isNotAllowedComparison('and'), Field(() => [GraphQLFilter], { nullable: true }))
      @Type(() => GraphQLFilter)
      and?: Filter<T>[]

      @ValidateNested()
      @SkipIf(() => isNotAllowedComparison('or'), Field(() => [GraphQLFilter], { nullable: true }))
      @Type(() => GraphQLFilter)
      or?: Filter<T>[]
    }

    // if the filter is already in the cache, exist early and return it
    // otherwise add it to the cache early so we don't get into an infinite loop
    let TClassCache = internalCache.get(TClass)

    if (TClassCache && TClassCache.has(typeName)) {
      return TClassCache.get(typeName) as FilterConstructor<T>
    } else {
      TClassCache = TClassCache ?? new Map()

      TClassCache.set(typeName, GraphQLFilter)
      internalCache.set(TClass, TClassCache)
    }

    const { baseName } = getDTONames(TClass)
    fields.forEach(({ schemaName, target, advancedOptions, returnTypeFunc }) => {
      const objectTypeMetadata = TypeMetadataStorage.getObjectTypeMetadataByTarget(target)
      const FC = objectTypeMetadata
        ? getOrCreateFilterType(target, typeName, suffix, depth)
        : createFilterComparisonType({
            FieldType: target,
            fieldName: `${baseName}${upperCaseFirst(schemaName)}`,
            allowedComparisons: advancedOptions?.allowedComparisons,
            returnTypeFunc,
            decorators: advancedOptions?.filterDecorators,
            overrideTypeNamePrefix: advancedOptions?.overrideFilterTypeNamePrefix
          })
      const nullable = advancedOptions?.filterRequired !== true
      ValidateNested()(GraphQLFilter.prototype, schemaName)
      if (advancedOptions?.filterRequired) {
        HasRequiredFilter()(GraphQLFilter.prototype, schemaName)
      }
      Field(() => FC, { name: schemaName, nullable })(GraphQLFilter.prototype, schemaName)
      Type(() => FC)(GraphQLFilter.prototype, schemaName)
    })

    if (depth > 0) {
      Object.keys(filterableRelations).forEach((field) => {
        const FieldType = filterableRelations[field]

        if (FieldType) {
          // if filterDepth is infinite, we don't want to
          // pass the previous name down and just use the base name
          //
          // e.g. `User -> Post -> Category` would result in
          //      `UserFilter -> UserFilterPostFilter -> UserFilterPostFilterCategoryFilter`
          //      this would lead to an infinite loop, so we just use the base name
          //      `UserFilter -> PostFilter -> CategoryFilter`
          const newPrefix = Number.isFinite(depth) ? typeName : getInfiniteDepthRelationFilterPrefix(FieldType)
          const FC = getOrCreateFilterType(FieldType, newPrefix, suffix, depth - 1)
          const relationJoinConditionKey = getRelationJoinConditionKey(FieldType)

          if (relationJoinConditionKey) {
            addJoinConditionsField(
              FC,
              getOrCreateFilterType(FieldType, '', ON_CONDITION_TYPE_SUFFIX, 0),
              relationJoinConditionKey
            )
          }

          ValidateNested()(GraphQLFilter.prototype, field)
          Field(() => FC, { nullable: true })(GraphQLFilter.prototype, field)
          Type(() => FC)(GraphQLFilter.prototype, field)
        }
      })
    }

    return GraphQLFilter as FilterConstructor<T>
  })
}

export function FilterType<T>(TClass: Class<T>): FilterConstructor<T> {
  const { filterDepth = 1 }: FilterTypeOptions = getQueryOptions(TClass) ?? {}
  return getOrCreateFilterType(TClass, null, null, filterDepth)
}

export function DeleteFilterType<T>(TClass: Class<T>): FilterConstructor<T> {
  return getOrCreateFilterType(TClass, null, 'Delete', 0)
}

export function UpdateFilterType<T>(TClass: Class<T>): FilterConstructor<T> {
  return getOrCreateFilterType(TClass, null, 'Update', 0)
}

export function SubscriptionFilterType<T>(TClass: Class<T>): FilterConstructor<T> {
  return getOrCreateFilterType(TClass, null, 'Subscription', 0)
}

export function AggregateFilterType<T>(TClass: Class<T>): FilterConstructor<T> {
  const { filterDepth = 1 }: FilterTypeOptions = getQueryOptions(TClass) ?? {}
  return getOrCreateFilterType(TClass, null, 'Aggregate', filterDepth)
}
