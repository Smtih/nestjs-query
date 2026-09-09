import { Class } from './class.type'
import { getRelationJoinConditionKey } from './relation-join-conditions'

/**
 * The optional nestjs-query features a persistence adapter declares it can honour.
 *
 * Adapters declare their capabilities so the check for an unsupported feature lives in one place
 * instead of being repeated as an ad hoc throw in every adapter.
 */
export interface QueryAdapterCapabilities {
  /**
   * The adapter's package name, used in error messages.
   */
  adapter: string
  /**
   * Whether the adapter can inject a relation filter's join conditions into the relation's
   * `JOIN ... ON` clause.
   */
  relationJoinConditions: boolean
}

/**
 * Thrown when a DTO enables relation join conditions under an adapter that cannot honour them.
 */
export class UnsupportedRelationJoinConditionsError extends Error {
  constructor(adapter: string, dtoName: string) {
    super(
      `\`enableRelationJoinConditions\` is enabled for ${dtoName} but ${adapter} cannot inject conditions into a JOIN ON clause. ` +
        'Relation join conditions are only supported by @ptc-org/nestjs-query-typeorm. ' +
        `Remove the option from ${dtoName} or serve it with the typeorm adapter.`
    )

    this.name = 'UnsupportedRelationJoinConditionsError'
  }
}

/**
 * Asserts that every class an adapter is asked to serve only uses features the adapter declares.
 *
 * Called from an adapter's `forFeature`, so an unsupported feature fails at application bootstrap
 * rather than at query time.
 *
 * @param capabilities - the features the calling adapter declares support for.
 * @param classes - the entity or DTO classes the adapter was asked to serve.
 */
export function assertAdapterCapabilities(capabilities: QueryAdapterCapabilities, classes: Class<unknown>[]): void {
  if (capabilities.relationJoinConditions) {
    return
  }

  const unsupported = classes.find((Klass) => getRelationJoinConditionKey(Klass) !== undefined)

  if (unsupported) {
    throw new UnsupportedRelationJoinConditionsError(capabilities.adapter, unsupported.name)
  }
}
