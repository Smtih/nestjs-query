import { DynamicModule } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { assertAdapterCapabilities, Class, QueryAdapterCapabilities } from '@ptc-org/nestjs-query-core'

import type { DataSource } from 'typeorm'

import { createTypeOrmQueryServiceProviders } from './providers'

/**
 * The optional nestjs-query features the typeorm adapter can honour.
 */
export const TYPEORM_ADAPTER_CAPABILITIES: QueryAdapterCapabilities = {
  adapter: '@ptc-org/nestjs-query-typeorm',
  relationJoinConditions: true
}

export class NestjsQueryTypeOrmModule {
  static forFeature(entities: Class<unknown>[], dataSource?: DataSource | string): DynamicModule {
    assertAdapterCapabilities(TYPEORM_ADAPTER_CAPABILITIES, entities)

    const queryServiceProviders = createTypeOrmQueryServiceProviders(entities, dataSource)
    const typeOrmModule = TypeOrmModule.forFeature(entities, dataSource)

    return {
      imports: [typeOrmModule],
      module: NestjsQueryTypeOrmModule,
      providers: [...queryServiceProviders],
      exports: [...queryServiceProviders, typeOrmModule]
    }
  }
}
