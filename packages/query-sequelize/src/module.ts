import { DynamicModule } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { assertAdapterCapabilities, Class, QueryAdapterCapabilities } from '@ptc-org/nestjs-query-core'
import { ModelCtor, SequelizeOptions } from 'sequelize-typescript'

import { createSequelizeQueryServiceProviders } from './providers'

/**
 * The optional nestjs-query features the sequelize adapter can honour.
 */
export const SEQUELIZE_ADAPTER_CAPABILITIES: QueryAdapterCapabilities = {
  adapter: '@ptc-org/nestjs-query-sequelize',
  relationJoinConditions: false
}

export class NestjsQuerySequelizeModule {
  static forFeature(entities: ModelCtor[], connection?: SequelizeOptions | string): DynamicModule {
    assertAdapterCapabilities(SEQUELIZE_ADAPTER_CAPABILITIES, entities as unknown as Class<unknown>[])

    const queryServiceProviders = createSequelizeQueryServiceProviders(entities, connection)
    const nestjsSequelize = SequelizeModule.forFeature(entities)
    return {
      module: NestjsQuerySequelizeModule,
      imports: [nestjsSequelize],
      providers: [...queryServiceProviders],
      exports: [...queryServiceProviders, nestjsSequelize]
    }
  }
}
