import { Filter, FilterComparisonOperators } from '@ptc-org/nestjs-query-core'
import { format as formatSql } from 'sql-formatter'
import { DataSource, Repository } from 'typeorm'

import { EntityComparisonField, SQLComparisonBuilder, WhereBuilder } from '../../src/query'
import { createTestConnection } from '../__fixtures__/connection.fixture'
import { TestEntity } from '../__fixtures__/test.entity'
import { TestRelation } from '../__fixtures__/test-relation.entity'

describe('WhereBuilder', (): void => {
  let dataSource: DataSource
  beforeEach(async () => {
    dataSource = await createTestConnection()
  })
  afterEach(() => dataSource.destroy())

  const getRepo = () => dataSource.getRepository(TestEntity)
  const getQueryBuilder = () => getRepo().createQueryBuilder()
  const createWhereBuilder = () => new WhereBuilder<TestEntity>()

  const expectSQLSnapshot = (filter: Filter<TestEntity>): void => {
    const selectQueryBuilder = createWhereBuilder().build(getQueryBuilder(), filter, {}, 'TestEntity')
    const [sql, params] = selectQueryBuilder.getQueryAndParameters()

    expect(formatSql(sql, { params })).toMatchSnapshot()
  }

  it('should accept a empty filter', (): void => {
    expectSQLSnapshot({})
  })

  it('or multiple operators for a single field together', (): void => {
    expectSQLSnapshot({ numberType: { gt: 10, lt: 20, gte: 21, lte: 31 } })
  })

  it('and multiple field comparisons together', (): void => {
    expectSQLSnapshot({ numberType: { eq: 1 }, stringType: { like: 'foo%' }, boolType: { is: true } })
  })

  describe('and', (): void => {
    it('and multiple expressions together', (): void => {
      expectSQLSnapshot({
        and: [{ numberType: { gt: 10 } }, { numberType: { lt: 20 } }, { numberType: { gte: 30 } }, { numberType: { lte: 40 } }]
      })
    })

    it('and multiple filters together with multiple fields', (): void => {
      expectSQLSnapshot({
        and: [
          { numberType: { gt: 10 }, stringType: { like: 'foo%' } },
          { numberType: { lt: 20 }, stringType: { like: '%bar' } }
        ]
      })
    })

    it('should support nested ors', (): void => {
      expectSQLSnapshot({
        and: [
          { or: [{ numberType: { gt: 10 } }, { numberType: { lt: 20 } }] },
          { or: [{ numberType: { gte: 30 } }, { numberType: { lte: 40 } }] }
        ]
      })
    })

    it('should properly group AND with a sibling field comparison', (): void => {
      expectSQLSnapshot({ and: [{ numberType: { gt: 2 } }, { numberType: { lt: 10 } }], stringType: { eq: 'foo' } })
    })
  })

  describe('or', (): void => {
    it('or multiple expressions together', (): void => {
      expectSQLSnapshot({
        or: [{ numberType: { gt: 10 } }, { numberType: { lt: 20 } }, { numberType: { gte: 30 } }, { numberType: { lte: 40 } }]
      })
    })

    it('and multiple and filters together', (): void => {
      expectSQLSnapshot({
        or: [
          { numberType: { gt: 10 }, stringType: { like: 'foo%' } },
          { numberType: { lt: 20 }, stringType: { like: '%bar' } }
        ]
      })
    })

    it('should support nested ands', (): void => {
      expectSQLSnapshot({
        or: [
          { and: [{ numberType: { gt: 10 } }, { numberType: { lt: 20 } }] },
          { and: [{ numberType: { gte: 30 } }, { numberType: { lte: 40 } }] }
        ]
      })
    })

    it('should properly group OR with a sibling field comparison', (): void => {
      expectSQLSnapshot({ or: [{ numberType: { eq: 2 } }, { numberType: { gt: 10 } }], stringType: { eq: 'foo' } })
    })
  })

  describe('custom SQLComparisonBuilder', (): void => {
    class UpperCaseComparisonBuilder<Entity> extends SQLComparisonBuilder<Entity> {
      public build<F extends keyof Entity>(
        field: F,
        cmp: FilterComparisonOperators<Entity[F]>,
        val: EntityComparisonField<Entity, F>,
        alias?: string
      ) {
        const { sql, params } = super.build(field, cmp, val, alias)

        return { sql: sql.replace(/^(\S+)/, 'UPPER($1)'), params }
      }
    }

    class CollatedComparisonBuilder<Entity> extends SQLComparisonBuilder<Entity> {
      constructor(private readonly collation: string) {
        super()
      }

      public forRelation<Relation>(): SQLComparisonBuilder<Relation> {
        return new CollatedComparisonBuilder<Relation>(this.collation)
      }

      public build<F extends keyof Entity>(
        field: F,
        cmp: FilterComparisonOperators<Entity[F]>,
        val: EntityComparisonField<Entity, F>,
        alias?: string
      ) {
        const { sql, params } = super.build(field, cmp, val, alias)

        return { sql: `${sql} COLLATE ${this.collation}`, params }
      }
    }

    const relationNames = { testRelations: { alias: 'TestRelation', relations: {} } }
    const relationFilter = { testRelations: { relationName: { eq: 'foo' } } } as Filter<TestEntity>

    const buildRelationFilterSql = (sqlComparisonBuilder: SQLComparisonBuilder<TestEntity>): string => {
      const [sql] = new WhereBuilder<TestEntity>(sqlComparisonBuilder)
        .build(getQueryBuilder(), relationFilter, relationNames, 'TestEntity')
        .getQueryAndParameters()

      return sql
    }

    const createRootRepoWithVirtualColumn = (databasePath: keyof TestRelation) =>
      ({
        metadata: {
          columns: [{ databasePath, isVirtualProperty: true, query: (alias: string) => `SELECT 1 FROM ${alias}` }]
        }
      }) as unknown as Repository<TestEntity>

    it('should apply the custom comparison builder to relation comparisons', (): void => {
      expect(buildRelationFilterSql(new UpperCaseComparisonBuilder<TestEntity>())).toContain('UPPER(TestRelation.relationName)')
    })

    it('should let a subclass with its own constructor signature derive its relation comparison builder', (): void => {
      expect(buildRelationFilterSql(new CollatedComparisonBuilder<TestEntity>('BINARY'))).toContain('COLLATE BINARY')
    })

    it('should not resolve relation fields against the root entity metadata', (): void => {
      const sql = buildRelationFilterSql(
        new SQLComparisonBuilder<TestEntity>(
          SQLComparisonBuilder.DEFAULT_COMPARISON_MAP,
          createRootRepoWithVirtualColumn('relationName')
        )
      )

      expect(sql).toContain('TestRelation.relationName')
      expect(sql).not.toContain('SELECT 1 FROM')
    })
  })
})
