import { DEFAULT_RELATION_JOIN_CONDITION_KEY, reserveRelationJoinConditionKey } from '@ptc-org/nestjs-query-core'
import { Model } from 'sequelize-typescript'

import { NestjsQuerySequelizeModule } from '../src'

describe('NestjsQueryTypeOrmModule', () => {
  it('should create a module', () => {
    class TestEntity extends Model<TestEntity> {}

    const module = NestjsQuerySequelizeModule.forFeature([TestEntity])
    expect(module.imports).toHaveLength(1)
    expect(module.module).toBe(NestjsQuerySequelizeModule)
    expect(module.providers).toHaveLength(1)
    expect(module.exports).toHaveLength(2)
  })

  it('should throw when an entity enables relation join conditions', () => {
    class JoinConditionsEntity extends Model<JoinConditionsEntity> {}

    reserveRelationJoinConditionKey(JoinConditionsEntity, DEFAULT_RELATION_JOIN_CONDITION_KEY)

    expect(() => NestjsQuerySequelizeModule.forFeature([JoinConditionsEntity])).toThrow(
      '`enableRelationJoinConditions` is enabled for JoinConditionsEntity but @ptc-org/nestjs-query-sequelize cannot inject conditions into a JOIN ON clause.'
    )
  })
})
