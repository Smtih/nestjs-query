import { applyFilter, Filter, FilterComparisonOperators } from '@ptc-org/nestjs-query-core'

describe('FilterFieldComparison', () => {
  it('should accept match as a string field comparison operator', () => {
    const stringOperators: FilterComparisonOperators<string>[] = ['match']
    expect(stringOperators).toEqual(['match'])
  })

  it('should throw when a match comparison is applied in memory', () => {
    const filter: Filter<{ title: string }> = { title: { match: 'foo' } }
    expect(() => applyFilter({ title: 'foo' }, filter)).toThrow('unknown comparison "match"')
  })
})
