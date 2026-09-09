import { DynamicModule } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { assertAdapterCapabilities, QueryAdapterCapabilities } from '@ptc-org/nestjs-query-core'
import { Document } from 'mongoose'

import { createMongooseQueryServiceProviders, NestjsQueryModelDefinition } from './providers'

/**
 * The optional nestjs-query features the mongoose adapter can honour.
 */
export const MONGOOSE_ADAPTER_CAPABILITIES: QueryAdapterCapabilities = {
  adapter: '@ptc-org/nestjs-query-mongoose',
  relationJoinConditions: false
}

export class NestjsQueryMongooseModule {
  static forFeature(models: NestjsQueryModelDefinition<Document>[], connectionName?: string): DynamicModule {
    assertAdapterCapabilities(
      MONGOOSE_ADAPTER_CAPABILITIES,
      models.map(({ document }) => document)
    )

    const queryServiceProviders = createMongooseQueryServiceProviders(models)
    const mongooseModule = MongooseModule.forFeature(models, connectionName)
    return {
      imports: [mongooseModule],
      module: NestjsQueryMongooseModule,
      providers: [...queryServiceProviders],
      exports: [...queryServiceProviders, mongooseModule]
    }
  }
}
