import { TypegooseModule } from '@m8a/nestjs-typegoose'
import { DynamicModule } from '@nestjs/common'
import { assertAdapterCapabilities, Class, QueryAdapterCapabilities } from '@ptc-org/nestjs-query-core'

import { createTypegooseQueryServiceProviders } from './providers'
import { TypegooseClass, TypegooseClassWithOptions } from './typegoose-interface.helpers'

/**
 * The optional nestjs-query features the typegoose adapter can honour.
 */
export const TYPEGOOSE_ADAPTER_CAPABILITIES: QueryAdapterCapabilities = {
  adapter: '@ptc-org/nestjs-query-typegoose',
  relationJoinConditions: false
}

function toModelClass(model: TypegooseClass | TypegooseClassWithOptions): Class<unknown> {
  const modelClass = 'typegooseClass' in model ? model.typegooseClass : model

  return modelClass as Class<unknown>
}

export class NestjsQueryTypegooseModule {
  static forFeature(models: (TypegooseClass | TypegooseClassWithOptions)[], connectionName?: string): DynamicModule {
    assertAdapterCapabilities(TYPEGOOSE_ADAPTER_CAPABILITIES, models.map(toModelClass))

    const queryServiceProviders = createTypegooseQueryServiceProviders(models)
    const typegooseModule = TypegooseModule.forFeature(models, connectionName)
    return {
      imports: [typegooseModule],
      module: NestjsQueryTypegooseModule,
      providers: [...queryServiceProviders],
      exports: [...queryServiceProviders, typegooseModule]
    }
  }
}
