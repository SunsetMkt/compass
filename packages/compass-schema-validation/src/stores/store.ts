import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import type { RootState } from '../modules';
import reducer, { INITIAL_STATE } from '../modules';
import toNS from 'mongodb-ns';
import { activateValidation } from '../modules/validation';
import { editModeChanged } from '../modules/edit-mode';
import semver from 'semver';
import type { CollectionTabPluginMetadata } from '@mongodb-js/compass-collection';
import type { ActivateHelpers, AppRegistry } from 'hadron-app-registry';
import type {
  ConnectionInfoRef,
  DataService,
} from '@mongodb-js/compass-connections/provider';
import type { MongoDBInstance } from '@mongodb-js/compass-app-stores/provider';
import type { PreferencesAccess } from 'compass-preferences-model';
import type { Logger } from '@mongodb-js/compass-logging/provider';
import type { TrackFunction } from '@mongodb-js/compass-telemetry';

/**
 * The lowest supported version.
 */
const MIN_VERSION = '3.2.0';

type SchemaValidationServices = {
  globalAppRegistry: AppRegistry;
  dataService: Pick<
    DataService,
    'aggregate' | 'collectionInfo' | 'updateCollection'
  >;
  connectionInfoRef: ConnectionInfoRef;
  preferences: PreferencesAccess;
  instance: MongoDBInstance;
  logger: Logger;
  track: TrackFunction;
};

// Exposed for testing
export function configureStore(
  state: Partial<RootState>,
  services: Pick<
    SchemaValidationServices,
    | 'globalAppRegistry'
    | 'dataService'
    | 'preferences'
    | 'logger'
    | 'track'
    | 'connectionInfoRef'
  >
) {
  return createStore(
    reducer,
    {
      ...INITIAL_STATE,
      ...state,
    },
    applyMiddleware(thunk.withExtraArgument(services))
  );
}

/**
 * The store has a combined pipeline reducer plus the thunk middleware.
 */
export function onActivated(
  options: CollectionTabPluginMetadata,
  {
    globalAppRegistry,
    dataService,
    connectionInfoRef,
    preferences,
    instance,
    logger,
    track,
  }: SchemaValidationServices,
  { on, cleanup }: ActivateHelpers
) {
  const store = configureStore(
    {
      namespace: toNS(options.namespace),
      serverVersion: instance.build.version,
      editMode: {
        collectionTimeSeries: !!options.isTimeSeries,
        collectionReadOnly: options.isReadonly ? true : false,
        writeStateStoreReadOnly: !instance.isWritable,
        oldServerReadOnly: semver.gte(MIN_VERSION, instance.build.version),
      },
    },
    {
      dataService,
      connectionInfoRef,
      preferences,
      globalAppRegistry,
      logger,
      track,
    }
  );

  // isWritable can change later
  on(instance, 'change:isWritable', () => {
    store.dispatch(
      editModeChanged({
        writeStateStoreReadOnly: !instance.isWritable,
      })
    );
  });

  // Activate validation when this plugin is first rendered
  store.dispatch(activateValidation());

  return {
    store,
    deactivate: cleanup,
  };
}
