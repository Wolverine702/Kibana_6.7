/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Server } from 'hapi';
import { countBy } from 'lodash';
import { SavedObjectAttributes } from 'src/core/server';
import { CoreSetup } from 'src/core/server';
import { isAgentName } from '../../../common/agent_name';
import { getInternalSavedObjectsClient } from '../helpers/saved_objects_client';
import {
  APM_SERVICES_TELEMETRY_SAVED_OBJECT_TYPE,
  APM_SERVICES_TELEMETRY_SAVED_OBJECT_ID
} from '../../../common/apm_saved_object_constants';
import { LegacySetup } from '../../new-platform/plugin';

export function createApmTelementry(
  agentNames: string[] = []
): SavedObjectAttributes {
  const validAgentNames = agentNames.filter(isAgentName);
  return {
    has_any_services: validAgentNames.length > 0,
    services_per_agent: countBy(validAgentNames)
  };
}

export async function storeApmServicesTelemetry(
  server: Server,
  apmTelemetry: SavedObjectAttributes
) {
  try {
    const internalSavedObjectsClient = getInternalSavedObjectsClient(server);
    await internalSavedObjectsClient.create(
      APM_SERVICES_TELEMETRY_SAVED_OBJECT_TYPE,
      apmTelemetry,
      {
        id: APM_SERVICES_TELEMETRY_SAVED_OBJECT_ID,
        overwrite: true
      }
    );
  } catch (e) {
    server.log(['error'], `Unable to save APM telemetry data: ${e.message}`);
  }
}

interface LegacySetupWithUsageCollector extends LegacySetup {
  server: LegacySetup['server'] & {
    usage: {
      collectorSet: {
        makeUsageCollector: (options: unknown) => unknown;
        register: (options: unknown) => unknown;
      };
    };
  };
}

export function makeApmUsageCollector(
  core: CoreSetup,
  { server }: LegacySetupWithUsageCollector
) {
  const apmUsageCollector = server.usage.collectorSet.makeUsageCollector({
    type: 'apm',
    fetch: async () => {
      const internalSavedObjectsClient = getInternalSavedObjectsClient(server);
      try {
        const apmTelemetrySavedObject = await internalSavedObjectsClient.get(
          APM_SERVICES_TELEMETRY_SAVED_OBJECT_TYPE,
          APM_SERVICES_TELEMETRY_SAVED_OBJECT_ID
        );
        return apmTelemetrySavedObject.attributes;
      } catch (err) {
        return createApmTelementry();
      }
    },
    isReady: () => true
  });
  server.usage.collectorSet.register(apmUsageCollector);
}
