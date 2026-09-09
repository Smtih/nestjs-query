import { DEFAULT_RELATION_JOIN_CONDITION_KEY, reserveRelationJoinConditionKey } from '@ptc-org/nestjs-query-core'
import { Document } from 'mongoose'

import { NestjsQueryMongooseModule } from '../src'
import { TestEntity, TestEntitySchema } from './__fixtures__'

describe('NestjsQueryTypegooseModule', () => {
  it('should create a module', () => {
    const typeOrmModule = NestjsQueryMongooseModule.forFeature([
      { document: TestEntity, name: TestEntity.name, schema: TestEntitySchema }
    ])
    expect(typeOrmModule.imports).toHaveLength(1)
    expect(typeOrmModule.module).toBe(NestjsQueryMongooseModule)
    expect(typeOrmModule.providers).toHaveLength(1)
    expect(typeOrmModule.exports).toHaveLength(2)
  })

  it('should throw when a document enables relation join conditions', () => {
    class JoinConditionsDocument extends Document {}

    reserveRelationJoinConditionKey(JoinConditionsDocument, DEFAULT_RELATION_JOIN_CONDITION_KEY)

    expect(() =>
      NestjsQueryMongooseModule.forFeature([
        { document: JoinConditionsDocument, name: TestEntity.name, schema: TestEntitySchema }
      ])
    ).toThrow(
      '`enableRelationJoinConditions` is enabled for JoinConditionsDocument but @ptc-org/nestjs-query-mongoose cannot inject conditions into a JOIN ON clause.'
    )
  })
})
