// eslint-disable-next-line max-classes-per-file
import {
  Args,
  Field,
  Float,
  GraphQLTimestamp,
  InputType,
  Int,
  ObjectType,
  Query,
  registerEnumType,
  Resolver
} from '@nestjs/graphql'
import { Class, Filter } from '@ptc-org/nestjs-query-core'
import {
  CursorConnection,
  DeleteFilterType,
  FilterableCursorConnection,
  FilterableField,
  FilterableOffsetConnection,
  FilterableRelation,
  FilterableUnPagedRelation,
  FilterType,
  OffsetConnection,
  QueryOptions,
  Relation,
  SubscriptionFilterType,
  UnPagedRelation,
  UpdateFilterType
} from '@ptc-org/nestjs-query-graphql'
import { plainToClass } from 'class-transformer'
import { buildSchema, getNamedType, GraphQLInputObjectType } from 'graphql'

import { generateSchema } from '../../__fixtures__'

const getQueryFilterInputType = (schema: string, queryName: string): GraphQLInputObjectType => {
  const [filterArg] = buildSchema(schema).getQueryType().getFields()[queryName].args

  return getNamedType(filterArg.type) as GraphQLInputObjectType
}

const getQueryFilterFieldNames = (schema: string, queryName: string): string[] =>
  Object.keys(getQueryFilterInputType(schema, queryName).getFields())

describe('filter types', (): void => {
  enum NumberEnum {
    ONE,
    TWO,
    THREE,
    FOUR
  }

  enum StringEnum {
    ONE_STR = 'one',
    TWO_STR = 'two',
    THREE_STR = 'three',
    FOUR_STR = 'four'
  }

  registerEnumType(StringEnum, {
    name: 'StringEnum'
  })

  registerEnumType(NumberEnum, {
    name: 'NumberEnum'
  })

  @ObjectType({ isAbstract: true })
  class BaseType {
    @FilterableField()
    id!: number
  }

  @ObjectType('TestRelationDto')
  @QueryOptions({ enableRelationJoinConditions: true })
  class TestRelation extends BaseType {
    @FilterableField()
    relationName!: string

    @FilterableField()
    relationAge!: number
  }

  @ObjectType('TestFilterDto')
  @Relation('unFilterableRelation', () => TestRelation)
  @FilterableRelation('filterableRelation', () => TestRelation)
  @UnPagedRelation('unPagedRelations', () => TestRelation)
  @FilterableUnPagedRelation('filterableUnPagedRelations', () => TestRelation)
  @OffsetConnection('unFilterableOffsetConnection', () => TestRelation)
  @FilterableOffsetConnection('filterableOffsetConnection', () => TestRelation)
  @CursorConnection('unFilterableCursorConnection', () => TestRelation)
  @FilterableCursorConnection('filterableCursorConnection', () => TestRelation)
  class TestDto extends BaseType {
    @FilterableField()
    boolField!: boolean

    @FilterableField()
    dateField!: Date

    @FilterableField(() => Float)
    floatField!: number

    @FilterableField(() => Int)
    intField!: number

    @FilterableField()
    numberField!: number

    @FilterableField()
    stringField!: string

    @FilterableField(() => StringEnum)
    stringEnumField!: StringEnum

    @FilterableField(() => NumberEnum)
    numberEnumField!: NumberEnum

    @FilterableField(() => GraphQLTimestamp)
    timestampField!: Date

    @Field()
    nonFilterField!: number
  }

  describe('FilterType', () => {
    const TestGraphQLFilter: Class<Filter<TestDto>> = FilterType(TestDto)

    @InputType()
    class TestDtoFilter extends TestGraphQLFilter {}

    it('should throw an error if the class is not annotated with @ObjectType', () => {
      class TestInvalidFilter {}

      expect(() => FilterType(TestInvalidFilter)).toThrow(
        'No fields found to create FilterType. Ensure TestInvalidFilter is annotated with @nestjs/graphql @ObjectType'
      )
    })

    it('should create the correct filter graphql schema', async () => {
      @Resolver()
      class FilterTypeSpec {
        @Query(() => Int)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        test(@Args('input') input: TestDtoFilter): number {
          return 1
        }
      }

      const schema = await generateSchema([FilterTypeSpec])
      expect(schema).toMatchSnapshot()
    })

    it('should throw an error if no fields are found', () => {
      @ObjectType('TestNoFields')
      class TestInvalidFilter {}

      expect(() => FilterType(TestInvalidFilter)).toThrow('No fields found to create GraphQLFilter for TestInvalidFilter')
    })

    it('should throw an error when the field type is unknown', () => {
      enum EnumField {
        ONE = 'one'
      }

      @ObjectType('TestBadField')
      class TestInvalidFilter {
        @FilterableField(() => EnumField)
        fakeType!: EnumField
      }

      expect(() => FilterType(TestInvalidFilter)).toThrow('Unable to create filter comparison for {"ONE":"one"}.')
    })

    it('should convert and filters to filter class', () => {
      const filterObject: Filter<TestDto> = {
        and: [{ stringField: { eq: 'foo' } }]
      }
      const filterInstance = plainToClass(TestDtoFilter, filterObject)
      expect(filterInstance.and[0]).toBeInstanceOf(TestGraphQLFilter)
    })

    it('should convert or filters to filter class', () => {
      const filterObject: Filter<TestDto> = {
        or: [{ stringField: { eq: 'foo' } }]
      }
      const filterInstance = plainToClass(TestDtoFilter, filterObject)
      expect(filterInstance.or[0]).toBeInstanceOf(TestGraphQLFilter)
    })

    it('should convert relation join conditions to filter class', () => {
      const filterObject = {
        filterableRelation: { on: { relationName: { eq: 'foo' } } }
      } as Filter<TestDto>

      const filterInstance = plainToClass(TestDtoFilter, filterObject) as Record<string, Filter<TestRelation>>
      const relationFilter = filterInstance.filterableRelation

      expect(relationFilter.on.relationName.eq).toBe('foo')
      expect(relationFilter.on.constructor.name).toBe('GraphQLFilter')
    })

    it('should create filter for sub objects', () => {
      @ObjectType('TestSubObjectType')
      class TestSubObjectType {
        @FilterableField(() => TestDto)
        subType!: TestDto
      }
      const TestSubObjectFilter = FilterType(TestSubObjectType)

      const filterObject: Filter<TestSubObjectType> = {
        or: [{ subType: { stringField: { eq: 'foo' } } }]
      }
      const filterInstance = plainToClass(TestSubObjectFilter, filterObject)
      const subType = filterInstance.or[0].subType as Filter<TestDto>
      expect(subType.stringField.eq).toBe(`foo`)
      expect(subType.constructor.name).toBe(`GraphQLFilter`)
    })

    describe('allowedComparisons option', () => {
      @ObjectType('TestAllowedComparison')
      class TestAllowedComparisonsDto extends BaseType {
        @FilterableField({ allowedComparisons: ['is'] })
        boolField!: boolean

        @FilterableField({ allowedComparisons: ['eq', 'neq'] })
        dateField!: Date

        @FilterableField(() => Float, { allowedComparisons: ['gt', 'gte'] })
        floatField!: number

        @FilterableField(() => Int, { allowedComparisons: ['lt', 'lte'] })
        intField!: number

        @FilterableField({ allowedComparisons: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte'] })
        numberField!: number

        @FilterableField({ allowedComparisons: ['like', 'notLike'] })
        stringField!: string
      }

      const TestGraphQLComparisonFilter: Class<Filter<TestDto>> = FilterType(TestAllowedComparisonsDto)

      @InputType()
      class TestComparisonDtoFilter extends TestGraphQLComparisonFilter {}

      it('should only expose allowed comparisons', async () => {
        @Resolver()
        class FilterTypeSpec {
          @Query(() => Int)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          test(@Args('input') input: TestComparisonDtoFilter): number {
            return 1
          }
        }

        const schema = await generateSchema([FilterTypeSpec])
        expect(schema).toMatchSnapshot()
      })

      it('should only expose between/not between comparisons for allowed types', async () => {
        @ObjectType('TestBetweenComparison')
        class TestBetweenComparisonsDto extends BaseType {
          @FilterableField({ allowedComparisons: ['eq', 'between', 'notBetween'] })
          boolField!: boolean

          @FilterableField({ allowedComparisons: ['between', 'notBetween'] })
          dateField!: Date

          @FilterableField(() => Float, { allowedComparisons: ['between', 'notBetween'] })
          floatField!: number

          @FilterableField(() => Int, { allowedComparisons: ['between', 'notBetween'] })
          intField!: number

          @FilterableField({ allowedComparisons: ['between', 'notBetween'] })
          numberField!: number

          @FilterableField({ allowedComparisons: ['eq', 'between', 'notBetween'] })
          stringField!: string
        }

        const TestGraphQLBetweenComparisonFilter: Class<Filter<TestDto>> = FilterType(TestBetweenComparisonsDto)

        @InputType()
        class TestBetweenComparisonDtoFilter extends TestGraphQLBetweenComparisonFilter {}

        @Resolver()
        class FilterBetweenTypeSpec {
          @Query(() => Int)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          test(@Args('input') input: TestBetweenComparisonDtoFilter): number {
            return 1
          }
        }

        const schema = await generateSchema([FilterBetweenTypeSpec])
        expect(schema).toMatchSnapshot()
      })
    })

    describe('filterDecorators option', () => {
      const appliedProperties: { target: unknown; propertyKey: string | symbol }[] = []
      const TestDecorator = (): PropertyDecorator => {
        return (target: unknown, propertyKey: string | symbol): void => {
          appliedProperties.push({ target, propertyKey })
        }
      }
      @ObjectType('TestFilterDecorators')
      class TestFilterDecoratorsDto extends BaseType {
        @FilterableField()
        boolField!: boolean

        @FilterableField({ filterDecorators: [TestDecorator()] })
        dateField!: Date

        @FilterableField(() => Float, { filterDecorators: [TestDecorator()] })
        floatField!: number
      }

      FilterType(TestFilterDecoratorsDto)

      it('should apply the decorator to the correct fields', () => {
        expect(appliedProperties).toMatchSnapshot()
      })
    })

    describe('typeNamePrefix option', () => {
      @ObjectType('TestTypeNamePrefix')
      class TestTypeNamePrefixDto extends BaseType {
        @FilterableField()
        boolField!: boolean

        @FilterableField({ overrideFilterTypeNamePrefix: `MyDate` })
        dateField!: Date

        @FilterableField({ overrideFilterTypeNamePrefix: `MyCustomFloat` })
        floatField!: number
      }

      const TestGraphQLTestTypeNamePrefixFilter: Class<Filter<TestTypeNamePrefixDto>> = FilterType(TestTypeNamePrefixDto)

      it('should apply correct type name prefix', async () => {
        @Resolver()
        class FilterTypeSpec {
          @Query(() => TestTypeNamePrefixDto)
          test(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            @Args('input', { type: () => TestGraphQLTestTypeNamePrefixFilter }) input: typeof TestGraphQLTestTypeNamePrefixFilter
          ): TestTypeNamePrefixDto {
            return {
              id: 1,
              boolField: true,
              dateField: new Date(),
              floatField: 1
            }
          }
        }

        const schema = await generateSchema([FilterTypeSpec])
        expect(schema).toMatchSnapshot()
      })
    })

    describe('allowedBooleanExpressions option', () => {
      describe('only and boolean expressions', () => {
        @ObjectType('TestAllowedComparisons')
        @QueryOptions({ allowedBooleanExpressions: ['and'] })
        class TestOnlyAndBooleanExpressionsDto extends BaseType {
          @FilterableField()
          numberField!: number
        }

        const TestGraphQLComparisonFilter: Class<Filter<TestDto>> = FilterType(TestOnlyAndBooleanExpressionsDto)

        @InputType()
        class TestComparisonDtoFilter extends TestGraphQLComparisonFilter {}

        it('should only expose allowed comparisons', async () => {
          @Resolver()
          class FilterTypeSpec {
            @Query(() => Int)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            test(@Args('input') input: TestComparisonDtoFilter): number {
              return 1
            }
          }

          const schema = await generateSchema([FilterTypeSpec])
          expect(schema).toMatchSnapshot()
        })
      })

      describe('only or boolean expressions', () => {
        @ObjectType('TestAllowedComparisons')
        @QueryOptions({ allowedBooleanExpressions: ['or'] })
        class TestOnlyOrBooleanExpressionsDto extends BaseType {
          @FilterableField()
          numberField!: number
        }

        const TestGraphQLComparisonFilter: Class<Filter<TestDto>> = FilterType(TestOnlyOrBooleanExpressionsDto)

        @InputType()
        class TestComparisonDtoFilter extends TestGraphQLComparisonFilter {}

        it('should only expose allowed comparisons', async () => {
          @Resolver()
          class FilterTypeSpec {
            @Query(() => Int)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            test(@Args('input') input: TestComparisonDtoFilter): number {
              return 1
            }
          }

          const schema = await generateSchema([FilterTypeSpec])
          expect(schema).toMatchSnapshot()
        })
      })

      describe('no boolean expressions', () => {
        @ObjectType('TestAllowedComparisons')
        @QueryOptions({ allowedBooleanExpressions: [] })
        class TestNoBooleanExpressionsDto extends BaseType {
          @FilterableField()
          numberField!: number
        }

        const TestGraphQLComparisonFilter: Class<Filter<TestDto>> = FilterType(TestNoBooleanExpressionsDto)

        @InputType()
        class TestComparisonDtoFilter extends TestGraphQLComparisonFilter {}

        it('should only expose allowed comparisons', async () => {
          @Resolver()
          class FilterTypeSpec {
            @Query(() => Int)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            test(@Args('input') input: TestComparisonDtoFilter): number {
              return 1
            }
          }

          const schema = await generateSchema([FilterTypeSpec])
          expect(schema).toMatchSnapshot()
        })
      })
    })

    describe('filterRequired option', () => {
      @ObjectType('TestFilterRequiredComparison')
      class TestFilterRequiredDto extends BaseType {
        @FilterableField({ filterRequired: true })
        requiredField!: boolean

        @FilterableField({ filterRequired: false })
        nonRequiredField!: Date

        @FilterableField()
        notSpecifiedField!: number
      }

      const TestGraphQLComparisonFilter: Class<Filter<TestDto>> = FilterType(TestFilterRequiredDto)

      @InputType()
      class TestComparisonDtoFilter extends TestGraphQLComparisonFilter {}

      it('should only expose allowed comparisons', async () => {
        @Resolver()
        class FilterTypeSpec {
          @Query(() => Int)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          test(@Args('input') input: TestComparisonDtoFilter): number {
            return 1
          }
        }

        const schema = await generateSchema([FilterTypeSpec])
        expect(schema).toMatchSnapshot()
      })
    })

    describe('filterDepth option', () => {
      it('should generate a 0-level deep filter-type', async () => {
        @ObjectType('TestFilterDepth_0_RelationA')
        @FilterableRelation('filterableRelation', () => TestRelation)
        class TestFilterDepth0RelationADto extends BaseType {
          @FilterableField()
          relationName!: string

          @FilterableField()
          relationAge!: number
        }

        @ObjectType('TestFilterDepth_0')
        @QueryOptions({ filterDepth: 0 })
        @FilterableRelation('filterableRelation', () => TestFilterDepth0RelationADto)
        class TestFilterDepth0Dto extends BaseType {
          @FilterableField()
          numberField!: number
        }

        const TestFilterDepthFilter = FilterType(TestFilterDepth0Dto)

        @Resolver()
        class FilterTypeSpec {
          @Query(() => Int)
          test(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            @Args('input', { type: () => TestFilterDepthFilter }) input: unknown
          ): number {
            return 1
          }
        }

        const schema = await generateSchema([FilterTypeSpec])
        expect(schema).toMatchSnapshot()
      })

      it('should generate a 1-level deep filter-type', async () => {
        @ObjectType('TestFilterDepth_1_RelationA')
        @FilterableRelation('filterableRelation', () => TestRelation)
        class TestFilterDepth1RelationADto extends BaseType {
          @FilterableField()
          relationName!: string

          @FilterableField()
          relationAge!: number
        }

        @ObjectType('TestFilterDepth_1')
        @QueryOptions({ filterDepth: 1 })
        @FilterableRelation('filterableRelation', () => TestFilterDepth1RelationADto)
        class TestFilterDepth1Dto extends BaseType {
          @FilterableField()
          numberField!: number
        }

        const TestFilterDepthFilter = FilterType(TestFilterDepth1Dto)

        @Resolver()
        class FilterTypeSpec {
          @Query(() => Int)
          test(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            @Args('input', { type: () => TestFilterDepthFilter }) input: unknown
          ): number {
            return 1
          }
        }

        const schema = await generateSchema([FilterTypeSpec])
        expect(schema).toMatchSnapshot()
      })

      it('should generate a 2-level deep filter-type', async () => {
        @ObjectType('TestFilterDepth_2_RelationA')
        @FilterableRelation('filterableRelation', () => TestRelation)
        class TestFilterDepth2RelationADto extends BaseType {
          @FilterableField()
          relationName!: string

          @FilterableField()
          relationAge!: number
        }

        @ObjectType('TestFilterDepth_2')
        @QueryOptions({ filterDepth: 2 })
        @FilterableRelation('filterableRelation', () => TestFilterDepth2RelationADto)
        class TestFilterDepth2Dto extends BaseType {
          @FilterableField()
          numberField!: number
        }

        const TestFilterDepthFilter = FilterType(TestFilterDepth2Dto)

        @Resolver()
        class FilterTypeSpec {
          @Query(() => Int)
          test(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            @Args('input', { type: () => TestFilterDepthFilter }) input: unknown
          ): number {
            return 1
          }
        }

        const schema = await generateSchema([FilterTypeSpec])
        expect(schema).toMatchSnapshot()
      })

      it('should generate a infinite deep filter-type', async () => {
        @ObjectType('TestFilterDepth_Infinite_RelationA')
        @FilterableRelation('filterableRelation', () => TestRelation)
        class TestFilterDepthInfiniteRelationADto extends BaseType {
          @FilterableField()
          relationName!: string

          @FilterableField()
          relationAge!: number
        }

        @ObjectType('TestFilterDepth_Infinite')
        @QueryOptions({ filterDepth: Number.POSITIVE_INFINITY })
        @FilterableRelation('filterableRelation', () => TestFilterDepthInfiniteRelationADto)
        class TestFilterDepthInfiniteDto extends BaseType {
          @FilterableField()
          numberField!: number
        }

        const TestFilterDepthFilter = FilterType(TestFilterDepthInfiniteDto)

        @Resolver()
        class FilterTypeSpec {
          @Query(() => Int)
          test(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            @Args('input', { type: () => TestFilterDepthFilter }) input: unknown
          ): number {
            return 1
          }
        }

        const schema = await generateSchema([FilterTypeSpec])
        expect(schema).toMatchSnapshot()
      })

      it("different filterDepth options shouldn't affect each other", async () => {
        @ObjectType('TestFilterDepth_ShouldNotAffect_RelationA')
        @QueryOptions({ filterDepth: 1 })
        @FilterableRelation('filterableRelation', () => TestRelation)
        class TestFilterDepthShouldNotAffectRelationADto extends BaseType {
          @FilterableField()
          relationName!: string

          @FilterableField()
          relationAge!: number
        }

        @ObjectType('TestFilterDepth_ShouldNotAffect')
        @QueryOptions({ filterDepth: Number.POSITIVE_INFINITY })
        @FilterableRelation('filterableRelation', () => TestFilterDepthShouldNotAffectRelationADto)
        class TestFilterDepthShouldNotAffectDto extends BaseType {
          @FilterableField()
          numberField!: number
        }

        const TestFilterDepthFilter = FilterType(TestFilterDepthShouldNotAffectDto)
        const TestFilterDepthRelationAFilter = FilterType(TestFilterDepthShouldNotAffectRelationADto)

        @Resolver()
        class FilterTypeSpec {
          @Query(() => Int)
          testA(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            @Args('input', { type: () => TestFilterDepthFilter }) input: unknown
          ): number {
            return 1
          }

          @Query(() => Int)
          testB(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            @Args('input', { type: () => TestFilterDepthRelationAFilter }) input: unknown
          ): number {
            return 1
          }
        }

        const schema = await generateSchema([FilterTypeSpec])
        expect(schema).toMatchSnapshot()
      })

      it('should return cached types', async () => {
        @ObjectType('TestFilterDepth_ShouldNotAffect_RelationA')
        @QueryOptions({ filterDepth: 1 })
        @FilterableRelation('filterableRelation1', () => TestRelation)
        @FilterableRelation('filterableRelation2', () => TestRelation)
        class TestFilterDepthShouldNotAffectRelationADto extends BaseType {
          @FilterableField()
          relationName!: string

          @FilterableField()
          relationAge!: number
        }

        @ObjectType('TestFilterDepth_ShouldNotAffect')
        @QueryOptions({ filterDepth: Number.POSITIVE_INFINITY })
        @FilterableRelation('filterableRelation1', () => TestFilterDepthShouldNotAffectRelationADto)
        @FilterableRelation('filterableRelation2', () => TestFilterDepthShouldNotAffectRelationADto)
        class TestFilterDepthShouldNotAffectDto extends BaseType {
          @FilterableField()
          numberField!: number
        }

        const TestFilterDepthFilter = FilterType(TestFilterDepthShouldNotAffectDto)
        const TestFilterDepthRelationAFilter = FilterType(TestFilterDepthShouldNotAffectRelationADto)

        @Resolver()
        class FilterTypeSpec {
          @Query(() => Int)
          testA(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            @Args('input', { type: () => TestFilterDepthFilter }) input: unknown
          ): number {
            return 1
          }

          @Query(() => Int)
          testB(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            @Args('input', { type: () => TestFilterDepthRelationAFilter }) input: unknown
          ): number {
            return 1
          }
        }

        const schema = await generateSchema([FilterTypeSpec])
        expect(schema).toMatchSnapshot()
      })

      it('should generate filter types with suffix / 0-level depth', async () => {
        @ObjectType('TestFilterDepth_ShouldNotAffect_RelationA')
        @QueryOptions({ filterDepth: 1 })
        @FilterableRelation('filterableRelation1', () => TestRelation)
        @FilterableRelation('filterableRelation2', () => TestRelation)
        class TestFilterDepthShouldNotAffectRelationADto extends BaseType {
          @FilterableField()
          relationName!: string

          @FilterableField()
          relationAge!: number
        }

        @ObjectType('TestFilterDepth_ShouldNotAffect')
        @QueryOptions({ filterDepth: Number.POSITIVE_INFINITY })
        @FilterableRelation('filterableRelation1', () => TestFilterDepthShouldNotAffectRelationADto)
        @FilterableRelation('filterableRelation2', () => TestFilterDepthShouldNotAffectRelationADto)
        class TestFilterDepthShouldNotAffectDto extends BaseType {
          @FilterableField()
          numberField!: number
        }

        const TestFilterDepthFilter = UpdateFilterType(TestFilterDepthShouldNotAffectDto)
        const TestFilterDepthRelationAFilter = UpdateFilterType(TestFilterDepthShouldNotAffectRelationADto)

        @Resolver()
        class FilterTypeSpec {
          @Query(() => Int)
          testA(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            @Args('input', { type: () => TestFilterDepthFilter }) input: unknown
          ): number {
            return 1
          }

          @Query(() => Int)
          testB(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            @Args('input', { type: () => TestFilterDepthRelationAFilter }) input: unknown
          ): number {
            return 1
          }
        }

        const schema = await generateSchema([FilterTypeSpec])
        expect(schema).toMatchSnapshot()
      })
    })

    describe('enableRelationJoinConditions option', () => {
      it('should not expose join conditions by default', async () => {
        @ObjectType('TestJoinConditionsDisabled_RelationA')
        class TestJoinConditionsDisabledRelationADto extends BaseType {
          @FilterableField()
          relationName!: string
        }

        @ObjectType('TestJoinConditionsDisabled')
        @FilterableRelation('filterableRelation', () => TestJoinConditionsDisabledRelationADto)
        class TestJoinConditionsDisabledDto extends BaseType {
          @FilterableField()
          numberField!: number
        }

        const TestJoinConditionsFilter = FilterType(TestJoinConditionsDisabledDto)

        @Resolver()
        class FilterTypeSpec {
          @Query(() => Int)
          test(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            @Args('input', { type: () => TestJoinConditionsFilter }) input: unknown
          ): number {
            return 1
          }
        }

        const schema = await generateSchema([FilterTypeSpec])
        const relationFilter = getNamedType(
          getQueryFilterInputType(schema, 'test').getFields().filterableRelation.type
        ) as GraphQLInputObjectType

        expect(Object.keys(relationFilter.getFields())).not.toContain('on')
        expect(schema).not.toContain('TestJoinConditionsDisabled_RelationAOnConditionFilter')
        expect(schema).toMatchSnapshot()
      })

      it('should expose join conditions when the relation dto opts in', async () => {
        @ObjectType('TestJoinConditionsEnabled_RelationA')
        @QueryOptions({ enableRelationJoinConditions: true })
        class TestJoinConditionsEnabledRelationADto extends BaseType {
          @FilterableField()
          relationName!: string
        }

        @ObjectType('TestJoinConditionsEnabled')
        @FilterableRelation('filterableRelation', () => TestJoinConditionsEnabledRelationADto)
        class TestJoinConditionsEnabledDto extends BaseType {
          @FilterableField()
          numberField!: number
        }

        const TestJoinConditionsFilter = FilterType(TestJoinConditionsEnabledDto)

        @Resolver()
        class FilterTypeSpec {
          @Query(() => Int)
          test(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            @Args('input', { type: () => TestJoinConditionsFilter }) input: unknown
          ): number {
            return 1
          }
        }

        const schema = await generateSchema([FilterTypeSpec])
        const relationFilter = getNamedType(
          getQueryFilterInputType(schema, 'test').getFields().filterableRelation.type
        ) as GraphQLInputObjectType

        expect(Object.keys(relationFilter.getFields())).toContain('on')
        expect(schema).toContain('input TestJoinConditionsEnabled_RelationAOnConditionFilter')
        expect(schema).toMatchSnapshot()
      })

      it('should keep join conditions off a root filter that is also a relation at infinite depth', async () => {
        @ObjectType('TestJoinConditionsInfinite_RelationA')
        @QueryOptions({ filterDepth: Number.POSITIVE_INFINITY, enableRelationJoinConditions: true })
        class TestJoinConditionsInfiniteRelationADto extends BaseType {
          @FilterableField()
          relationName!: string
        }

        @ObjectType('TestJoinConditionsInfinite')
        @QueryOptions({ filterDepth: Number.POSITIVE_INFINITY })
        @FilterableRelation('filterableRelation', () => TestJoinConditionsInfiniteRelationADto)
        class TestJoinConditionsInfiniteDto extends BaseType {
          @FilterableField()
          numberField!: number
        }

        const TestJoinConditionsFilter = FilterType(TestJoinConditionsInfiniteDto)
        const TestJoinConditionsRelationAFilter = FilterType(TestJoinConditionsInfiniteRelationADto)

        @Resolver()
        class FilterTypeSpec {
          @Query(() => Int)
          testParent(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            @Args('input', { type: () => TestJoinConditionsFilter }) input: unknown
          ): number {
            return 1
          }

          @Query(() => Int)
          testRelation(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            @Args('input', { type: () => TestJoinConditionsRelationAFilter }) input: unknown
          ): number {
            return 1
          }
        }

        const schema = await generateSchema([FilterTypeSpec])
        const relationFilter = getNamedType(
          getQueryFilterInputType(schema, 'testParent').getFields().filterableRelation.type
        ) as GraphQLInputObjectType

        expect(getQueryFilterFieldNames(schema, 'testRelation')).not.toContain('on')
        expect(Object.keys(relationFilter.getFields())).toContain('on')
        expect(relationFilter.name).not.toBe(getQueryFilterInputType(schema, 'testRelation').name)
        expect(schema).toMatchSnapshot()
      })

      it('should expose join conditions under a custom key', async () => {
        @ObjectType('TestJoinConditionsCustomKey_RelationA')
        @QueryOptions({ enableRelationJoinConditions: { field: 'joinOn' } })
        class TestJoinConditionsCustomKeyRelationADto extends BaseType {
          @FilterableField()
          relationName!: string
        }

        @ObjectType('TestJoinConditionsCustomKey')
        @FilterableRelation('filterableRelation', () => TestJoinConditionsCustomKeyRelationADto)
        class TestJoinConditionsCustomKeyDto extends BaseType {
          @FilterableField()
          numberField!: number
        }

        const TestJoinConditionsFilter = FilterType(TestJoinConditionsCustomKeyDto)

        @Resolver()
        class FilterTypeSpec {
          @Query(() => Int)
          test(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            @Args('input', { type: () => TestJoinConditionsFilter }) input: unknown
          ): number {
            return 1
          }
        }

        const schema = await generateSchema([FilterTypeSpec])
        const relationFilter = getNamedType(
          getQueryFilterInputType(schema, 'test').getFields().filterableRelation.type
        ) as GraphQLInputObjectType

        expect(Object.keys(relationFilter.getFields())).toContain('joinOn')
        expect(Object.keys(relationFilter.getFields())).not.toContain('on')
        expect(schema).toContain('input TestJoinConditionsCustomKey_RelationAOnConditionFilter')
        expect(schema).toMatchSnapshot()
      })

      it('should inherit the option from a base dto', async () => {
        @ObjectType({ isAbstract: true })
        @QueryOptions({ enableRelationJoinConditions: true })
        class JoinConditionsEnabledBaseType extends BaseType {}

        @ObjectType('TestJoinConditionsInherited_RelationA')
        class TestJoinConditionsInheritedRelationADto extends JoinConditionsEnabledBaseType {
          @FilterableField()
          relationName!: string
        }

        @ObjectType('TestJoinConditionsInherited')
        @FilterableRelation('filterableRelation', () => TestJoinConditionsInheritedRelationADto)
        class TestJoinConditionsInheritedDto extends BaseType {
          @FilterableField()
          numberField!: number
        }

        const TestJoinConditionsFilter = FilterType(TestJoinConditionsInheritedDto)

        @Resolver()
        class FilterTypeSpec {
          @Query(() => Int)
          test(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            @Args('input', { type: () => TestJoinConditionsFilter }) input: unknown
          ): number {
            return 1
          }
        }

        const schema = await generateSchema([FilterTypeSpec])
        const relationFilter = getNamedType(
          getQueryFilterInputType(schema, 'test').getFields().filterableRelation.type
        ) as GraphQLInputObjectType

        expect(Object.keys(relationFilter.getFields())).toContain('on')
        expect(schema).toContain('input TestJoinConditionsInherited_RelationAOnConditionFilter')
      })

      it('should leave a dtos own `on` field alone when the option is off', async () => {
        @ObjectType('TestJoinConditionsRealOnField_RelationA')
        class TestJoinConditionsRealOnFieldRelationADto extends BaseType {
          @FilterableField()
          on!: string
        }

        @ObjectType('TestJoinConditionsRealOnField')
        @FilterableRelation('filterableRelation', () => TestJoinConditionsRealOnFieldRelationADto)
        class TestJoinConditionsRealOnFieldDto extends BaseType {
          @FilterableField()
          numberField!: number
        }

        const TestJoinConditionsFilter = FilterType(TestJoinConditionsRealOnFieldDto)

        @Resolver()
        class FilterTypeSpec {
          @Query(() => Int)
          test(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            @Args('input', { type: () => TestJoinConditionsFilter }) input: unknown
          ): number {
            return 1
          }
        }

        const schema = await generateSchema([FilterTypeSpec])
        const relationFilter = getNamedType(
          getQueryFilterInputType(schema, 'test').getFields().filterableRelation.type
        ) as GraphQLInputObjectType

        expect(getNamedType(relationFilter.getFields().on.type).name).toBe('StringFieldComparison')
        expect(schema).not.toContain('TestJoinConditionsRealOnField_RelationAOnConditionFilter')
      })

      it('should throw when the reserved key is also a filterable field', () => {
        @ObjectType('TestJoinConditionsFieldClash')
        @QueryOptions({ enableRelationJoinConditions: true })
        class TestJoinConditionsFieldClashDto extends BaseType {
          @FilterableField()
          on!: string
        }

        expect(() => FilterType(TestJoinConditionsFieldClashDto)).toThrow(
          'TestJoinConditionsFieldClashDto enables relation join conditions under the key `on`, but also declares a field named `on`. ' +
            "Reserve a different key with `@QueryOptions({ enableRelationJoinConditions: { field: '<name>' } })` on TestJoinConditionsFieldClashDto."
        )
      })

      it('should throw when the reserved key is also a relation', () => {
        @ObjectType('TestJoinConditionsRelationClash_RelationA')
        class TestJoinConditionsRelationClashRelationADto extends BaseType {
          @FilterableField()
          relationName!: string
        }

        @ObjectType('TestJoinConditionsRelationClash')
        @QueryOptions({ enableRelationJoinConditions: { field: 'joinedVia' } })
        @FilterableRelation('joinedVia', () => TestJoinConditionsRelationClashRelationADto)
        class TestJoinConditionsRelationClashDto extends BaseType {
          @FilterableField()
          numberField!: number
        }

        expect(() => FilterType(TestJoinConditionsRelationClashDto)).toThrow(
          'TestJoinConditionsRelationClashDto enables relation join conditions under the key `joinedVia`, but also declares a relation named `joinedVia`.'
        )
      })
    })
  })

  describe('UpdateFilterType', () => {
    const TestGraphQLFilter: Class<Filter<TestDto>> = UpdateFilterType(TestDto)

    @InputType()
    class TestDtoFilter extends TestGraphQLFilter {}

    it('should throw an error if the class is not annotated with @ObjectType', () => {
      class TestInvalidFilter {}

      expect(() => UpdateFilterType(TestInvalidFilter)).toThrow(
        'No fields found to create FilterType. Ensure TestInvalidFilter is annotated with @nestjs/graphql @ObjectType'
      )
    })

    it('should create the correct filter graphql schema', async () => {
      @Resolver()
      class FilterTypeSpec {
        @Query(() => Int)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        test(@Args('input') input: TestDtoFilter): number {
          return 1
        }
      }

      const schema = await generateSchema([FilterTypeSpec])
      expect(schema).toMatchSnapshot()
    })

    it('should throw an error if no fields are found', () => {
      @ObjectType('TestNoFields')
      class TestInvalidFilter {}

      expect(() => UpdateFilterType(TestInvalidFilter)).toThrow('No fields found to create GraphQLFilter for TestInvalidFilter')
    })

    it('should throw an error when the field type is unknown', () => {
      enum EnumField {
        ONE = 'one'
      }

      @ObjectType('TestBadField')
      class TestInvalidFilter {
        @FilterableField(() => EnumField)
        fakeType!: EnumField
      }

      expect(() => UpdateFilterType(TestInvalidFilter)).toThrow('Unable to create filter comparison for {"ONE":"one"}.')
    })

    it('should convert and filters to filter class', () => {
      const filterObject: Filter<TestDto> = {
        and: [{ stringField: { eq: 'foo' } }]
      }
      const filterInstance = plainToClass(TestDtoFilter, filterObject)
      expect(filterInstance.and[0]).toBeInstanceOf(TestGraphQLFilter)
    })

    it('should convert or filters to filter class', () => {
      const filterObject: Filter<TestDto> = {
        or: [{ stringField: { eq: 'foo' } }]
      }
      const filterInstance = plainToClass(TestDtoFilter, filterObject)
      expect(filterInstance.or[0]).toBeInstanceOf(TestGraphQLFilter)
    })
  })

  describe('DeleteFilterType', () => {
    const TestGraphQLFilter: Class<Filter<TestDto>> = DeleteFilterType(TestDto)

    @InputType()
    class TestDtoFilter extends TestGraphQLFilter {}

    it('should throw an error if the class is not annotated with @ObjectType', () => {
      class TestInvalidFilter {}

      expect(() => DeleteFilterType(TestInvalidFilter)).toThrow(
        'No fields found to create FilterType. Ensure TestInvalidFilter is annotated with @nestjs/graphql @ObjectType'
      )
    })

    it('should create the correct filter graphql schema', async () => {
      @Resolver()
      class FilterTypeSpec {
        @Query(() => Int)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        test(@Args('input') input: TestDtoFilter): number {
          return 1
        }
      }

      const schema = await generateSchema([FilterTypeSpec])
      expect(schema).toMatchSnapshot()
    })

    it('should throw an error if no fields are found', () => {
      @ObjectType('TestNoFields')
      class TestInvalidFilter {}

      expect(() => DeleteFilterType(TestInvalidFilter)).toThrow('No fields found to create GraphQLFilter for TestInvalidFilter')
    })

    it('should throw an error when the field type is unknown', () => {
      enum EnumField {
        ONE = 'one'
      }

      @ObjectType('TestBadField')
      class TestInvalidFilter {
        @FilterableField(() => EnumField)
        fakeType!: EnumField
      }

      expect(() => DeleteFilterType(TestInvalidFilter)).toThrow('Unable to create filter comparison for {"ONE":"one"}.')
    })

    it('should convert and filters to filter class', () => {
      const filterObject: Filter<TestDto> = {
        and: [{ stringField: { eq: 'foo' } }]
      }
      const filterInstance = plainToClass(TestDtoFilter, filterObject)
      expect(filterInstance.and[0]).toBeInstanceOf(TestGraphQLFilter)
    })

    it('should convert or filters to filter class', () => {
      const filterObject: Filter<TestDto> = {
        or: [{ stringField: { eq: 'foo' } }]
      }
      const filterInstance = plainToClass(TestDtoFilter, filterObject)
      expect(filterInstance.or[0]).toBeInstanceOf(TestGraphQLFilter)
    })
  })

  describe('SubscriptionFilterType', () => {
    const TestGraphQLFilter: Class<Filter<TestDto>> = SubscriptionFilterType(TestDto)

    @InputType()
    class TestDtoFilter extends TestGraphQLFilter {}

    it('should throw an error if the class is not annotated with @ObjectType', () => {
      class TestInvalidFilter {}

      expect(() => SubscriptionFilterType(TestInvalidFilter)).toThrow(
        'No fields found to create FilterType. Ensure TestInvalidFilter is annotated with @nestjs/graphql @ObjectType'
      )
    })

    it('should create the correct filter graphql schema', async () => {
      @Resolver()
      class FilterTypeSpec {
        @Query(() => Int)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        test(@Args('input') input: TestDtoFilter): number {
          return 1
        }
      }

      const schema = await generateSchema([FilterTypeSpec])
      expect(schema).toMatchSnapshot()
    })

    it('should throw an error if no fields are found', () => {
      @ObjectType('TestNoFields')
      class TestInvalidFilter {}

      expect(() => SubscriptionFilterType(TestInvalidFilter)).toThrow(
        'No fields found to create GraphQLFilter for TestInvalidFilter'
      )
    })

    it('should throw an error when the field type is unknown', () => {
      enum EnumField {
        ONE = 'one'
      }

      @ObjectType('TestBadField')
      class TestInvalidFilter {
        @FilterableField(() => EnumField)
        fakeType!: EnumField
      }

      expect(() => SubscriptionFilterType(TestInvalidFilter)).toThrow('Unable to create filter comparison for {"ONE":"one"}.')
    })

    it('should convert and filters to filter class', () => {
      const filterObject: Filter<TestDto> = {
        and: [{ stringField: { eq: 'foo' } }]
      }
      const filterInstance = plainToClass(TestDtoFilter, filterObject)
      expect(filterInstance.and[0]).toBeInstanceOf(TestGraphQLFilter)
    })

    it('should convert or filters to filter class', () => {
      const filterObject: Filter<TestDto> = {
        or: [{ stringField: { eq: 'foo' } }]
      }
      const filterInstance = plainToClass(TestDtoFilter, filterObject)
      expect(filterInstance.or[0]).toBeInstanceOf(TestGraphQLFilter)
    })
  })
})
