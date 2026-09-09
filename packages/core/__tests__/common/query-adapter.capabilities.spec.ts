import {
  assertAdapterCapabilities,
  clearReservedRelationJoinConditionKeys,
  QueryAdapterCapabilities,
  reserveRelationJoinConditionKey
} from '@ptc-org/nestjs-query-core'

describe('assertAdapterCapabilities', () => {
  class PlainDTO {}

  class JoinConditionsDTO {}

  const supporting: QueryAdapterCapabilities = { adapter: '@ptc-org/nestjs-query-typeorm', relationJoinConditions: true }
  const notSupporting: QueryAdapterCapabilities = { adapter: '@ptc-org/nestjs-query-sequelize', relationJoinConditions: false }

  beforeEach(() => reserveRelationJoinConditionKey(JoinConditionsDTO, 'on'))
  afterEach(clearReservedRelationJoinConditionKeys)

  it('should accept a dto without join conditions', () => {
    expect(() => assertAdapterCapabilities(notSupporting, [PlainDTO])).not.toThrow()
  })

  it('should accept a dto with join conditions on a supporting adapter', () => {
    expect(() => assertAdapterCapabilities(supporting, [JoinConditionsDTO])).not.toThrow()
  })

  it('should reject a dto with join conditions on an adapter that cannot honour them', () => {
    expect(() => assertAdapterCapabilities(notSupporting, [PlainDTO, JoinConditionsDTO])).toThrow(
      '`enableRelationJoinConditions` is enabled for JoinConditionsDTO but @ptc-org/nestjs-query-sequelize cannot inject conditions into a JOIN ON clause. ' +
        'Relation join conditions are only supported by @ptc-org/nestjs-query-typeorm. ' +
        'Remove the option from JoinConditionsDTO or serve it with the typeorm adapter.'
    )
  })
})
