import {
  AggregateQuery,
  Filter,
  InvalidRelationJoinConditionError,
  relationJoinCondition,
  SelectRelation
} from '@ptc-org/nestjs-query-core'
import { DataSource, ObjectLiteral } from 'typeorm'

import { FilterQueryBuilder, NestedRelationsAliased } from '../../src/query'
import { createTestConnection } from '../__fixtures__/connection.fixture'
import { TestEntity } from '../__fixtures__/test.entity'
import { TestRelation } from '../__fixtures__/test-relation.entity'

describe('relation join conditions', (): void => {
  let dataSource: DataSource

  beforeEach(async () => {
    dataSource = await createTestConnection()
  })

  afterEach(() => dataSource.destroy())

  const getFilterQueryBuilder = () => new FilterQueryBuilder<TestEntity>(dataSource.getRepository(TestEntity))

  const selectSql = (filter: Filter<TestEntity>): string => {
    const [sql] = getFilterQueryBuilder().select({ filter }).getQueryAndParameters()

    return sql
  }

  const selectParams = (filter: Filter<TestEntity>): ObjectLiteral[] => {
    const [, params] = getFilterQueryBuilder().select({ filter }).getQueryAndParameters()

    return params as ObjectLiteral[]
  }

  const whereIndexOf = (sql: string): number => (sql.includes(' WHERE ') ? sql.indexOf(' WHERE ') : sql.length)

  const joinsOf = (sql: string): string => sql.slice(sql.indexOf('FROM'), whereIndexOf(sql))

  const whereOf = (sql: string): string => sql.slice(whereIndexOf(sql))

  describe('with a join condition', () => {
    it('should add the conditions to the join and not to the where clause', () => {
      const filter = { testRelations: relationJoinCondition<TestRelation>({ relationName: { eq: 'foo1-test-relation-one' } }) }

      expect(joinsOf(selectSql(filter))).toContain('LEFT JOIN "test_relation" "testRelations" ON ')
      expect(joinsOf(selectSql(filter))).toContain('AND ("testRelations"."relation_name" = ?)')
      expect(whereOf(selectSql(filter))).not.toContain('relation_name')
      expect(selectParams(filter)).toEqual(['foo1-test-relation-one'])
    })

    it('should add a sibling filter to the where clause and the conditions to the join', () => {
      const sql = selectSql({
        testRelations: {
          ...relationJoinCondition<TestRelation>({ relationName: { eq: 'kept-in-the-join' } }),
          testRelationPk: { eq: 'filtered-in-the-where' }
        }
      })

      expect(joinsOf(sql)).toContain('AND ("testRelations"."relation_name" = ?)')
      expect(joinsOf(sql)).not.toContain('test_relation_pk" = ')
      expect(whereOf(sql)).toContain('"testRelations"."test_relation_pk" = ?')
      expect(whereOf(sql)).not.toContain('relation_name')
    })

    it('should combine several conditions with AND', () => {
      const sql = selectSql({
        testRelations: relationJoinCondition<TestRelation>({ relationName: { neq: 'a' }, testRelationPk: { neq: 'b' } })
      })

      expect(joinsOf(sql)).toContain('AND (("testRelations"."relation_name" != ? AND "testRelations"."test_relation_pk" != ?))')
    })

    it('should combine the comparisons of a single field with OR', () => {
      const sql = selectSql({
        testRelations: relationJoinCondition<TestRelation>({ relationName: { eq: 'a', like: 'b%' } })
      })

      expect(joinsOf(sql)).toContain('AND (("testRelations"."relation_name" = ? OR "testRelations"."relation_name" LIKE ?))')
    })

    it('should support and / or inside the conditions', () => {
      const sql = selectSql({
        testRelations: relationJoinCondition<TestRelation>({ or: [{ relationName: { eq: 'a' } }, { relationName: { eq: 'b' } }] })
      })

      expect(joinsOf(sql)).toContain('AND (("testRelations"."relation_name" = ? OR "testRelations"."relation_name" = ?))')
    })

    it('should add the conditions of a nested relation to that relation s join', () => {
      const sql = selectSql({
        testRelations: { relationsOfTestRelation: relationJoinCondition({ relationName: { eq: 'nested' } }) }
      } as Filter<TestEntity>)

      expect(joinsOf(sql)).toContain('LEFT JOIN "relation_of_test_relation_entity" "relationsOfTestRelation" ON ')
      expect(joinsOf(sql)).toContain('AND ("relationsOfTestRelation"."relation_name" = ?)')
      expect(whereOf(sql)).not.toContain('relation_name')
    })

    it('should add conditions at every level of a deep relation chain to their own joins', () => {
      const filter = {
        testRelations: {
          ...relationJoinCondition<TestRelation>({ relationName: { eq: 'outer' } }),
          relationsOfTestRelation: relationJoinCondition({ relationName: { eq: 'inner' } })
        }
      } as Filter<TestEntity>
      const sql = selectSql(filter)

      expect(joinsOf(sql)).toContain('AND ("testRelations"."relation_name" = ?)')
      expect(joinsOf(sql)).toContain('AND ("relationsOfTestRelation"."relation_name" = ?)')
      expect(whereOf(sql)).not.toContain('relation_name')
      expect(selectParams(filter)).toEqual(['outer', 'inner'])
    })

    it('should select the relation and add the conditions to its join when the relation is selected', () => {
      const [sql] = getFilterQueryBuilder()
        .select({
          filter: { testRelations: relationJoinCondition<TestRelation>({ relationName: { eq: 'selected' } }) },
          relations: [{ name: 'testRelations', query: {} }]
        })
        .getQueryAndParameters()

      expect(sql).toContain('"testRelations"."relation_name" AS "testRelations_relation_name"')
      expect(joinsOf(sql)).toContain('AND ("testRelations"."relation_name" = ?)')
    })

    it('should add the conditions to the join of the joined table of a many to many relation', () => {
      const filter = { manyTestRelations: relationJoinCondition<TestRelation>({ relationName: { eq: 'many-to-many' } }) }
      const joins = joinsOf(selectSql(filter))

      expect(joins).toContain('LEFT JOIN "test_relation" "manyTestRelations" ON ')
      expect(joins).toContain('AND ("manyTestRelations"."relation_name" = ?)')
      expect(joins).not.toContain(
        '"test_entity_many_test_relations_test_relation" "TestEntity_manyTestRelations" ON "TestEntity_manyTestRelations"."testEntityTestEntityPk"="TestEntity"."test_entity_pk" AND'
      )
      expect(selectParams(filter)).toEqual(['many-to-many'])
    })

    it('should add the conditions of each relation to its own join when several relations carry them', () => {
      const filter = {
        testRelations: relationJoinCondition<TestRelation>({ relationName: { eq: 'one' } }),
        manyToOneRelation: relationJoinCondition<TestRelation>({ relationName: { eq: 'two' } })
      }
      const joins = joinsOf(selectSql(filter))

      expect(joins).toContain('AND ("testRelations"."relation_name" = ?)')
      expect(joins).toContain('AND ("manyToOneRelation"."relation_name" = ?)')
      expect(whereOf(selectSql(filter))).not.toContain('relation_name')
      expect(selectParams(filter)).toEqual(['one', 'two'])
    })

    it('should add the conditions to the join and an and sibling to the where clause', () => {
      const filter: Filter<TestEntity> = {
        testRelations: {
          ...relationJoinCondition<TestRelation>({ relationName: { eq: 'kept-in-the-join' } }),
          and: [{ testRelationPk: { eq: 'a' } }, { testRelationPk: { neq: 'b' } }]
        }
      }

      expect(joinsOf(selectSql(filter))).toContain('AND ("testRelations"."relation_name" = ?)')
      expect(whereOf(selectSql(filter))).toContain('"testRelations"."test_relation_pk" = ?')
      expect(whereOf(selectSql(filter))).not.toContain('relation_name')
      expect(selectParams(filter)).toEqual(['kept-in-the-join', 'a', 'b'])
    })

    it('should add the conditions to the join of an aggregate query', () => {
      const aggregate: AggregateQuery<TestEntity> = { count: [{ field: 'testEntityPk', args: {} }] }
      const [sql] = getFilterQueryBuilder()
        .aggregate(
          { filter: { testRelations: relationJoinCondition<TestRelation>({ relationName: { eq: 'aggregated' } }) } },
          aggregate
        )
        .getQueryAndParameters()

      expect(sql).toContain('AND ("testRelations"."relation_name" = ?)')
      expect(sql).not.toContain(' WHERE ')
    })

    it('should leave the join alone when the conditions are empty', () => {
      const filter = { testRelations: relationJoinCondition<TestRelation>({}) }

      expect(joinsOf(selectSql(filter))).toContain(
        'LEFT JOIN "test_relation" "testRelations" ON "testRelations"."test_entity_id"="TestEntity"."test_entity_pk"'
      )
      expect(selectSql(filter)).not.toContain(' WHERE ')
    })

    it('should fail when the relation has no metadata to build the conditions against', () => {
      const relations: NestedRelationsAliased = {
        testRelations: { alias: 'testRelations', joinCondition: { relationName: { eq: 'a' } } as Filter<unknown> }
      }

      expect(() =>
        getFilterQueryBuilder().applyRelationJoinsRecursive(dataSource.getRepository(TestEntity).createQueryBuilder(), relations)
      ).toThrow(InvalidRelationJoinConditionError)
    })
  })

  describe('without a join condition', () => {
    it('should leave a relation filter in the where clause', () => {
      const sql = selectSql({ testRelations: { relationName: { eq: 'foo1-test-relation-one' } } })

      expect(joinsOf(sql)).toContain('LEFT JOIN "test_relation" "testRelations" ON ')
      expect(joinsOf(sql)).not.toContain('relation_name')
      expect(whereOf(sql)).toContain('"testRelations"."relation_name" = ?')
    })
  })

  describe('the fields a condition may compare', () => {
    it('should fail when a condition names a relation of the relation being joined', () => {
      expect(() =>
        selectSql({
          testRelations: relationJoinCondition<TestRelation>({ relationsOfTestRelation: { relationName: { eq: 'a' } } })
        } as Filter<TestEntity>)
      ).toThrow(
        new InvalidRelationJoinConditionError(
          '"relationsOfTestRelation" cannot be part of the "joinOn" conditions of "testRelations", which can only compare fields of the relation being joined. ' +
            'A condition on a further relation needs a JOIN of its own, which an ON clause has nowhere to put.'
        )
      )
    })

    it('should fail when a condition nests the reserved key again', () => {
      expect(() =>
        selectSql({
          testRelations: relationJoinCondition<TestRelation>(relationJoinCondition({ relationName: { eq: 'a' } }))
        } as Filter<TestEntity>)
      ).toThrow(InvalidRelationJoinConditionError)
    })

    it('should fail when a branch of an and / or names a relation', () => {
      expect(() =>
        selectSql({
          testRelations: relationJoinCondition<TestRelation>({
            or: [{ relationsOfTestRelation: { relationName: { eq: 'a' } } }]
          })
        } as Filter<TestEntity>)
      ).toThrow(InvalidRelationJoinConditionError)
    })
  })

  describe('placement of the reserved key', () => {
    it('should fail when it is used at the root of a filter', () => {
      expect(() => selectSql(relationJoinCondition<TestEntity>({ stringType: { eq: 'a' } }))).toThrow(
        new InvalidRelationJoinConditionError(
          `"joinOn" is only valid in the filter of a relation, where it adds conditions to that relation's JOIN ON clause. ` +
            'A filter of the records a query returns has no JOIN of its own.'
        )
      )
    })

    it('should fail when it is used inside an and / or', () => {
      expect(() =>
        selectSql({ testRelations: { and: [relationJoinCondition<TestRelation>({ relationName: { eq: 'a' } })] } })
      ).toThrow(InvalidRelationJoinConditionError)
    })

    it('should fail when it is used below an and / or', () => {
      expect(() =>
        selectSql({ or: [{ testRelations: relationJoinCondition<TestRelation>({ relationName: { eq: 'a' } }) }] })
      ).toThrow(InvalidRelationJoinConditionError)
    })
  })
})

describe('relation join conditions in the filter of a selected relation', (): void => {
  let dataSource: DataSource

  beforeEach(async () => {
    dataSource = await createTestConnection()
  })

  afterEach(() => dataSource.destroy())

  const selectWithRelations = (filter: Filter<TestEntity>, relations: SelectRelation<TestRelation>[]): string => {
    const [sql] = new FilterQueryBuilder<TestEntity>(dataSource.getRepository(TestEntity))
      .select({ filter, relations: relations as unknown as SelectRelation<TestEntity>[] })
      .getQueryAndParameters()

    return sql
  }

  it('should add the conditions of a relation it descends into to that relation s join', () => {
    const sql = selectWithRelations({}, [
      {
        name: 'testRelations',
        query: {
          filter: {
            relationsOfTestRelation: relationJoinCondition({ relationName: { eq: 'selected-child' } })
          } as Filter<TestRelation>
        }
      }
    ])

    expect(sql).toContain('LEFT JOIN "relation_of_test_relation_entity" "relationsOfTestRelation" ON ')
    expect(sql).toContain('AND ("relationsOfTestRelation"."relation_name" = ?)')
  })

  it('should fail when the reserved key is at the root of the filter, which filters the selected rows', () => {
    expect(() =>
      selectWithRelations({}, [
        {
          name: 'testRelations',
          query: { filter: relationJoinCondition<TestRelation>({ relationName: { eq: 'a' } }) }
        }
      ])
    ).toThrow(
      new InvalidRelationJoinConditionError(
        `"joinOn" is only valid in the filter of a relation, where it adds conditions to that relation's JOIN ON clause. ` +
          'A filter of the records a query returns has no JOIN of its own.'
      )
    )
  })

  it('should fail when the query filter and the selected relation filter both carry conditions for one relation', () => {
    expect(() =>
      selectWithRelations(
        {
          testRelations: {
            relationsOfTestRelation: relationJoinCondition({ relationName: { eq: 'from-the-query' } })
          } as Filter<TestRelation>
        },
        [
          {
            name: 'testRelations',
            query: {
              filter: {
                relationsOfTestRelation: relationJoinCondition({ relationName: { eq: 'from-the-selection' } })
              } as Filter<TestRelation>
            }
          }
        ]
      )
    ).toThrow(
      new InvalidRelationJoinConditionError(
        '"relationsOfTestRelation" is joined once, and carries join conditions in more than one of the filters that reference it. ' +
          'Write the conditions in one of them, or filter the relation through a single filter.'
      )
    )
  })
})
