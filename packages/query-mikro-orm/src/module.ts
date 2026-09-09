import { MikroOrmModule } from '@mikro-orm/nestjs'
import { DynamicModule } from '@nestjs/common'
import { assertAdapterCapabilities, Class, QueryAdapterCapabilities } from '@ptc-org/nestjs-query-core'

import { createMikroOrmQueryServiceProviders, EntityServiceOptions } from './providers'

/**
 * The optional nestjs-query features the mikro-orm adapter can honour.
 */
export const MIKRO_ORM_ADAPTER_CAPABILITIES: QueryAdapterCapabilities = {
  adapter: '@ptc-org/nestjs-query-mikro-orm',
  relationJoinConditions: false
}

function toServedClasses(entity: Class<object> | EntityServiceOptions): Class<unknown>[] {
  if (typeof entity === 'object' && 'entity' in entity) {
    return entity.dto ? [entity.entity, entity.dto] : [entity.entity]
  }

  return [entity]
}

export class NestjsQueryMikroOrmModule {
  static forFeature(entities: Array<Class<object> | EntityServiceOptions>, dataSource?: string): DynamicModule {
    assertAdapterCapabilities(MIKRO_ORM_ADAPTER_CAPABILITIES, entities.flatMap(toServedClasses))

    const queryServiceProviders = createMikroOrmQueryServiceProviders(entities, dataSource)
    const entityClasses = entities.map((e) => (typeof e === 'object' && 'entity' in e ? e.entity : e))
    const mikroOrmModule = MikroOrmModule.forFeature(entityClasses, dataSource)

    return {
      imports: [mikroOrmModule],
      module: NestjsQueryMikroOrmModule,
      providers: queryServiceProviders,
      exports: [...queryServiceProviders, mikroOrmModule]
    }
  }
}
