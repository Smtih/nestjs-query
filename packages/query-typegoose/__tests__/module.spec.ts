import { DEFAULT_RELATION_JOIN_CONDITION_KEY, reserveRelationJoinConditionKey } from '@ptc-org/nestjs-query-core'

import { NestjsQueryTypegooseModule } from '../src'
import { TestEntity } from './__fixtures__'

describe('NestjsQueryTypegooseModule', () => {
  it('should create a module', () => {
    const typegooseModule = NestjsQueryTypegooseModule.forFeature([TestEntity])
    expect(typegooseModule.imports).toHaveLength(1)
    expect(typegooseModule.module).toBe(NestjsQueryTypegooseModule)
    expect(typegooseModule.providers).toHaveLength(1)
    expect(typegooseModule.exports).toHaveLength(2)
  })

  it('should throw when a model enables relation join conditions', () => {
    class JoinConditionsModel {}

    reserveRelationJoinConditionKey(JoinConditionsModel, DEFAULT_RELATION_JOIN_CONDITION_KEY)

    expect(() => NestjsQueryTypegooseModule.forFeature([JoinConditionsModel])).toThrow(
      '`enableRelationJoinConditions` is enabled for JoinConditionsModel but @ptc-org/nestjs-query-typegoose cannot inject conditions into a JOIN ON clause.'
    )
  })
})
