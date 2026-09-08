import { OnConditionFilter } from '@ptc-org/nestjs-query-core'

import { OnConditionBuilder, OnConditionSQL } from '../../src/query'
import { TestEntity } from '../__fixtures__/test.entity'

describe('OnConditionBuilder', (): void => {
  const createOnConditionBuilder = () => new OnConditionBuilder<TestEntity>()

  const buildOnCondition = (onCondition?: OnConditionFilter<TestEntity>): OnConditionSQL =>
    createOnConditionBuilder().build(onCondition, 'TestEntity')

  const withStableParamNames = (condition?: string): string | undefined =>
    condition?.replace(/:\.\.\.param\w+/g, ':...param').replace(/:param\w+/g, ':param')

  it('should return an empty condition when there are no join conditions', (): void => {
    expect(buildOnCondition(undefined)).toEqual({ condition: undefined, params: undefined })
  })

  it('should return an empty condition for an empty filter', (): void => {
    expect(buildOnCondition({})).toEqual({ condition: undefined, params: undefined })
  })

  it('should return an empty condition when a comparison is not an object', (): void => {
    expect(buildOnCondition({ stringType: 'foo' } as unknown as OnConditionFilter<TestEntity>)).toEqual({
      condition: undefined,
      params: undefined
    })
  })

  it('should qualify the compared field with the relation alias', (): void => {
    const { condition, params } = buildOnCondition({ numberType: { eq: 1 } })

    expect(withStableParamNames(condition)).toBe('TestEntity.numberType = :param')
    expect(Object.values(params)).toEqual([1])
  })

  it('should bind values as parameters instead of interpolating them', (): void => {
    const { condition, params } = buildOnCondition({ stringType: { eq: "foo'; DROP TABLE test_entity; --" } })

    expect(condition).not.toContain('DROP TABLE')
    expect(Object.values(params)).toEqual(["foo'; DROP TABLE test_entity; --"])
  })

  it('should not bind parameters for is comparisons', (): void => {
    const { condition, params } = buildOnCondition({ boolType: { is: false } })

    expect(condition).toBe('TestEntity.boolType = FALSE')
    expect(params).toEqual({})
  })

  it('should and multiple field comparisons together', (): void => {
    const { condition, params } = buildOnCondition({ boolType: { is: false }, dateType: { is: null } })

    expect(condition).toBe('(TestEntity.boolType = FALSE AND TestEntity.dateType IS NULL)')
    expect(params).toEqual({})
  })

  it('should or multiple operators for a single field together', (): void => {
    const { condition, params } = buildOnCondition({ numberType: { gt: 10, lt: 20 } })

    expect(withStableParamNames(condition)).toBe('(TestEntity.numberType > :param OR TestEntity.numberType < :param)')
    expect(Object.values(params)).toEqual([10, 20])
  })

  describe('and', (): void => {
    it('should and multiple expressions together', (): void => {
      const { condition } = buildOnCondition({ and: [{ boolType: { is: true } }, { dateType: { is: null } }] })

      expect(condition).toBe('(TestEntity.boolType = TRUE AND TestEntity.dateType IS NULL)')
    })

    it('should ignore a non array value', (): void => {
      expect(buildOnCondition({ and: {} } as unknown as OnConditionFilter<TestEntity>)).toEqual({
        condition: undefined,
        params: undefined
      })
    })
  })

  describe('or', (): void => {
    it('should or multiple expressions together', (): void => {
      const { condition } = buildOnCondition({ or: [{ boolType: { is: true } }, { dateType: { is: null } }] })

      expect(condition).toBe('(TestEntity.boolType = TRUE OR TestEntity.dateType IS NULL)')
    })

    it('should support nested ands', (): void => {
      const { condition } = buildOnCondition({
        or: [{ and: [{ boolType: { is: true } }, { dateType: { is: null } }] }, { boolType: { is: false } }]
      })

      expect(condition).toBe('((TestEntity.boolType = TRUE AND TestEntity.dateType IS NULL) OR TestEntity.boolType = FALSE)')
    })

    it('should and a boolean expression with a sibling field comparison', (): void => {
      const { condition } = buildOnCondition({
        boolType: { is: false },
        or: [{ dateType: { is: null } }, { dateType: { isNot: null } }]
      })

      expect(condition).toBe('(TestEntity.boolType = FALSE AND (TestEntity.dateType IS NULL OR TestEntity.dateType IS NOT NULL))')
    })
  })

  it('should merge the parameters of every comparison', (): void => {
    const { params } = buildOnCondition({
      numberType: { eq: 1 },
      and: [{ stringType: { eq: 'foo' } }, { or: [{ stringType: { eq: 'bar' } }] }]
    })

    expect(Object.values(params).sort()).toEqual([1, 'bar', 'foo'])
  })
})
