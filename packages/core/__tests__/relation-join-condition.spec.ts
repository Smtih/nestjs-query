import {
  assertNoRelationJoinConditions,
  assertValidRelationJoinConditionPlacement,
  Filter,
  InvalidRelationJoinConditionError,
  RELATION_JOIN_CONDITION_KEY,
  relationJoinCondition,
  RelationJoinConditionScope,
  UnsupportedRelationJoinConditionError
} from '../src'

describe('relation join condition key', (): void => {
  it('should build a relation filter that carries conditions under the key', () => {
    expect(relationJoinCondition({ name: { eq: 'a' } })).toEqual({ joinOn: { name: { eq: 'a' } } })
  })

  describe('asserting a service cannot honour the conditions', () => {
    it.each([
      ['a relation filter', { rel: { joinOn: { name: { eq: 'a' } } } }],
      ['a nested relation filter', { rel: { child: { joinOn: { name: { eq: 'a' } } } } }],
      ['a branch of an and', { and: [{ rel: { joinOn: { name: { eq: 'a' } } } }] }],
      ['a branch of an or', { or: [{ rel: { joinOn: { name: { eq: 'a' } } } }] }]
    ])('should throw for conditions carried by %s', (_, filter) => {
      expect(() => assertNoRelationJoinConditions(filter as Filter<unknown>)).toThrow(
        new UnsupportedRelationJoinConditionError(
          'This query service does not support relation join conditions, and cannot evaluate the "joinOn" key in a filter. ' +
            'Relation join conditions are supported by @ptc-org/nestjs-query-typeorm.'
        )
      )
    })

    it.each([
      ['an empty filter', {}],
      ['no filter', undefined],
      ['a filter without the key', { name: { eq: 'a' }, rel: { name: { eq: 'b' } } }]
    ])('should pass %s', (_, filter) => {
      expect(() => assertNoRelationJoinConditions(filter as Filter<unknown>)).not.toThrow()
    })
  })

  describe('placement of the reserved key', () => {
    const scopeOf = (relations: Record<string, unknown>): RelationJoinConditionScope => {
      const scope: RelationJoinConditionScope = (key) =>
        key in relations ? scopeOf(relations[key] as Record<string, unknown>) : undefined

      return scope
    }

    const scope = scopeOf({ rel: { child: {} } })

    const assertPlacement = (filter: Record<string, unknown>) => () =>
      assertValidRelationJoinConditionPlacement(filter as Filter<unknown>, scope)

    it('should allow the key in the filter of a relation', () => {
      expect(assertPlacement({ rel: relationJoinCondition({ name: { eq: 'a' } }) })).not.toThrow()
    })

    it('should allow the key in the filter of a relation of a relation', () => {
      expect(assertPlacement({ rel: { child: relationJoinCondition({ name: { eq: 'a' } }) } })).not.toThrow()
    })

    it('should reject the key at the root of a filter', () => {
      expect(assertPlacement(relationJoinCondition({ name: { eq: 'a' } }))).toThrow(
        new InvalidRelationJoinConditionError(
          `"joinOn" is only valid in the filter of a relation, where it adds conditions to that relation's JOIN ON clause. ` +
            'A filter of the records a query returns has no JOIN of its own.'
        )
      )
    })

    it('should reject the key inside an and', () => {
      expect(assertPlacement({ rel: { and: [relationJoinCondition({ name: { eq: 'a' } })] } })).toThrow(
        new InvalidRelationJoinConditionError(
          `"joinOn" is only valid in the filter of a relation, and cannot be used inside an "and" or an "or". ` +
            'A relation referenced from several branches is joined once for all of them, so there is no one JOIN the conditions would belong to.'
        )
      )
    })

    it('should reject the key below an or', () => {
      expect(assertPlacement({ or: [{ rel: relationJoinCondition({ name: { eq: 'a' } }) }] })).toThrow(
        InvalidRelationJoinConditionError
      )
    })

    it('should reject the key nested inside a join condition', () => {
      expect(assertPlacement({ rel: relationJoinCondition(relationJoinCondition({ name: { eq: 'a' } })) })).toThrow(
        new InvalidRelationJoinConditionError(
          '"joinOn" cannot be nested inside the "joinOn" conditions of "rel". ' +
            'An ON clause constrains the one relation being joined, and nothing beyond it.'
        )
      )
    })

    it('should reject a condition that names a relation of the relation being joined', () => {
      expect(assertPlacement({ rel: relationJoinCondition({ child: { name: { eq: 'a' } } }) })).toThrow(
        new InvalidRelationJoinConditionError(
          '"child" cannot be part of the "joinOn" conditions of "rel", which can only compare fields of the relation being joined. ' +
            'A condition on a further relation needs a JOIN of its own, which an ON clause has nowhere to put.'
        )
      )
    })

    it('should reject a relation named in a branch of an and inside a join condition', () => {
      expect(assertPlacement({ rel: relationJoinCondition({ and: [{ child: { name: { eq: 'a' } } }] }) })).toThrow(
        InvalidRelationJoinConditionError
      )
    })

    it('should leave a key that names no relation to the persistence layer', () => {
      expect(assertPlacement({ notARelation: relationJoinCondition({ name: { eq: 'a' } }) })).not.toThrow()
    })
  })
})
