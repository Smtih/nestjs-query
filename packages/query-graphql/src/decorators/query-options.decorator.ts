import { Class, MetaValue, reserveRelationJoinConditionKey, ValueReflector } from '@ptc-org/nestjs-query-core'

import { QueryArgsTypeOpts } from '../types'
import { resolveRelationJoinConditionKey } from '../types/query/relation-join-conditions'
import { QUERY_OPTIONS_KEY } from './constants'

const valueReflector = new ValueReflector(QUERY_OPTIONS_KEY)

export type QueryOptionsDecoratorOpts<DTO> = QueryArgsTypeOpts<DTO>

/**
 * Reserves the DTO's join condition key as soon as the DTO is defined, which is before any module
 * can ask an adapter to serve it and before any filter type is generated.
 */
function reserveJoinConditionKey(target: Class<unknown>, opts: QueryOptionsDecoratorOpts<unknown>): void {
  const key = resolveRelationJoinConditionKey(opts.enableRelationJoinConditions)

  if (key) {
    reserveRelationJoinConditionKey(target, key)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function QueryOptions(opts: QueryOptionsDecoratorOpts<any>) {
  return (target: Class<unknown>): void => {
    valueReflector.set(target, opts)
    reserveJoinConditionKey(target, opts)
  }
}

export const getQueryOptions = <DTO>(DTOClass: Class<DTO>): MetaValue<QueryArgsTypeOpts<DTO>> => valueReflector.get(DTOClass)
