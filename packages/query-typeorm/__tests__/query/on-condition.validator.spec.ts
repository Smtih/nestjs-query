import { Filter } from '@ptc-org/nestjs-query-core'

import { assertValidOnConditionPlacement, InvalidOnConditionPlacementError } from '../../src/query'
import { TestEntity } from '../__fixtures__/test.entity'

describe('assertValidOnConditionPlacement', (): void => {
  const assertPlacement = (filter: Filter<TestEntity>) => () => assertValidOnConditionPlacement(filter)

  it('should accept a filter without join conditions', (): void => {
    expect(assertPlacement({ stringType: { eq: 'foo' } })).not.toThrow()
  })

  it('should accept join conditions at the top level of a relation filter', (): void => {
    expect(assertPlacement({ testRelations: { on: { relationName: { eq: 'foo' } } } })).not.toThrow()
  })

  it('should accept join conditions on a nested relation filter', (): void => {
    expect(
      assertPlacement({
        oneTestRelation: { on: { relationName: { eq: 'foo' } }, testEntity: { on: { boolType: { is: true } } } }
      })
    ).not.toThrow()
  })

  it('should accept join conditions on a relation nested inside an and', (): void => {
    expect(assertPlacement({ and: [{ testRelations: { on: { relationName: { eq: 'foo' } } } }] })).not.toThrow()
  })

  it('should reject join conditions at the root filter level', (): void => {
    expect(assertPlacement({ on: { stringType: { eq: 'foo' } } })).toThrow(
      '`on` conditions are only supported at the top level of a relation filter, not at the root filter level.'
    )
  })

  it('should reject join conditions inside an and', (): void => {
    expect(assertPlacement({ testRelations: { and: [{ on: { relationName: { eq: 'foo' } } }] } })).toThrow(
      '`on` conditions are only supported at the top level of a relation filter, not inside an `and`/`or` expression.'
    )
  })

  it('should reject join conditions inside an or', (): void => {
    expect(assertPlacement({ testRelations: { or: [{ on: { relationName: { eq: 'foo' } } }] } })).toThrow(
      '`on` conditions are only supported at the top level of a relation filter, not inside an `and`/`or` expression.'
    )
  })

  it('should reject join conditions nested deeply inside a boolean expression', (): void => {
    expect(
      assertPlacement({
        and: [{ or: [{ testRelations: { and: [{ on: { relationName: { eq: 'foo' } } }] } }] }]
      })
    ).toThrow(InvalidOnConditionPlacementError)
  })

  it('should throw an InvalidOnConditionPlacementError', (): void => {
    expect(assertPlacement({ on: { stringType: { eq: 'foo' } } })).toThrow(InvalidOnConditionPlacementError)
  })
})
