import { DEFAULT_RELATION_JOIN_CONDITION_KEY, reserveRelationJoinConditionKey } from '@ptc-org/nestjs-query-core'

import { NestjsQueryTypeOrmModule } from '../src'

describe('NestjsQueryTypeOrmModule', () => {
  it('should create a module', () => {
    class TestEntity {}

    const typeOrmModule = NestjsQueryTypeOrmModule.forFeature([TestEntity])
    expect(typeOrmModule.imports).toHaveLength(1)
    expect(typeOrmModule.module).toBe(NestjsQueryTypeOrmModule)
    expect(typeOrmModule.providers).toHaveLength(1)
    expect(typeOrmModule.exports).toHaveLength(2)
  })

  it('should serve an entity that enables relation join conditions', () => {
    class JoinConditionsEntity {}

    reserveRelationJoinConditionKey(JoinConditionsEntity, DEFAULT_RELATION_JOIN_CONDITION_KEY)

    expect(() => NestjsQueryTypeOrmModule.forFeature([JoinConditionsEntity])).not.toThrow()
  })
})
