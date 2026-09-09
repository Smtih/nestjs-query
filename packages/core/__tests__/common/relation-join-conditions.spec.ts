import {
  clearReservedRelationJoinConditionKeys,
  DEFAULT_RELATION_JOIN_CONDITION_KEY,
  findRelationJoinConditionKey,
  getRelationJoinConditionKey,
  getReservedRelationJoinConditionKeys,
  isReservedRelationJoinConditionKey,
  ON_CONDITION_KEY,
  reserveRelationJoinConditionKey
} from '@ptc-org/nestjs-query-core'

describe('relation join conditions', () => {
  class BaseDTO {}

  class DerivedDTO extends BaseDTO {}

  class UnrelatedDTO {}

  afterEach(clearReservedRelationJoinConditionKeys)

  it('should default the key to `on`', () => {
    expect(DEFAULT_RELATION_JOIN_CONDITION_KEY).toBe('on')
    expect(ON_CONDITION_KEY).toBe(DEFAULT_RELATION_JOIN_CONDITION_KEY)
  })

  it('should reserve nothing until a dto asks for it', () => {
    expect(getReservedRelationJoinConditionKeys()).toEqual([])
    expect(isReservedRelationJoinConditionKey('on')).toBe(false)
    expect(getRelationJoinConditionKey(UnrelatedDTO)).toBeUndefined()
  })

  it('should reserve a key for a dto', () => {
    reserveRelationJoinConditionKey(BaseDTO, 'on')

    expect(getRelationJoinConditionKey(BaseDTO)).toBe('on')
    expect(isReservedRelationJoinConditionKey('on')).toBe(true)
    expect(getReservedRelationJoinConditionKeys()).toEqual(['on'])
  })

  it('should resolve a key reserved by a base dto', () => {
    reserveRelationJoinConditionKey(BaseDTO, 'joinOn')

    expect(getRelationJoinConditionKey(DerivedDTO)).toBe('joinOn')
  })

  it('should not resolve a key for an unrelated dto', () => {
    reserveRelationJoinConditionKey(BaseDTO, 'joinOn')

    expect(getRelationJoinConditionKey(UnrelatedDTO)).toBeUndefined()
  })

  it('should find the reserved key a filter carries', () => {
    reserveRelationJoinConditionKey(BaseDTO, 'joinOn')

    expect(findRelationJoinConditionKey({ joinOn: { id: { eq: 1 } }, name: { eq: 'foo' } })).toBe('joinOn')
  })

  it('should not find an unreserved key', () => {
    expect(findRelationJoinConditionKey({ on: { id: { eq: 1 } } })).toBeUndefined()
  })

  it('should not find a key in a non filter value', () => {
    reserveRelationJoinConditionKey(BaseDTO, 'on')

    expect(findRelationJoinConditionKey(undefined)).toBeUndefined()
    expect(findRelationJoinConditionKey('on')).toBeUndefined()
  })
})
