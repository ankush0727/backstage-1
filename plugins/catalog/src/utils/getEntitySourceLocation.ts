/*
 * Copyright 2020 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  Entity,
  parseLocationReference,
  SOURCE_LOCATION_ANNOTATION,
} from '@backstage/catalog-model';
import { ConfigApi } from '@backstage/core';
import { ScmIntegrations } from '@backstage/integration';

export type EntitySourceLocation = {
  url: string;
  type?: string;
};

export function getEntitySourceLocation(
  entity: Entity,
  config: ConfigApi,
): EntitySourceLocation | undefined {
  const sourceLocation =
    entity.metadata.annotations?.[SOURCE_LOCATION_ANNOTATION];

  if (!sourceLocation) {
    return undefined;
  }

  try {
    const sourceLocationRef = parseLocationReference(sourceLocation);
    const scmIntegrations = ScmIntegrations.fromConfig(config);
    const integration = scmIntegrations.byUrl(sourceLocationRef.target);

    return {
      url: sourceLocationRef.target,
      type: integration?.type,
    };
  } catch {
    return undefined;
  }
}
