import { createStore, applyMiddleware } from 'redux';
import reducer from '../modules';
import thunk from 'redux-thunk';
import { globalAppRegistryActivated } from '@mongodb-js/mongodb-redux-common/app-registry';

import { changeInstance } from '../modules/instance';
import { filterDatabases } from '../modules/databases';
import { reset } from '../modules/reset';
import { toggleIsWritable } from '../modules/is-writable';
import { changeDescription } from '../modules/description';
import { toggleIsDataLake } from '../modules/is-data-lake';
import { loadDetailsPlugins } from '../modules/details-plugins';
import { toggleIsGenuineMongoDB } from '../modules/is-genuine-mongodb';
import { toggleIsGenuineMongoDBVisible } from '../modules/is-genuine-mongodb-visible';
import { changeConnection } from '../modules/connection-model';

const store = createStore(reducer, applyMiddleware(thunk));

store.onInstanceStatusChange = (instance) => {
  store.dispatch(changeInstance(instance));
};

store.onActivated = (appRegistry) => {
  store.dispatch(globalAppRegistryActivated(appRegistry));
  store.dispatch(loadDetailsPlugins(appRegistry));

  appRegistry.on('data-service-connected', (_, dataService, connectionInfo, legacyConnectionModel) => {
    store.dispatch(changeConnection(legacyConnectionModel));
  });

  appRegistry.on('instance-refreshed', ({ instance }) => {
    // First time we are seeing this model, subscribe to status changes
    if (store.getState().instance === null && instance) {
      instance.on('change:status', store.onInstanceStatusChange);
    }

    store.dispatch(changeInstance(instance));
    store.dispatch(filterDatabases(null, instance.databases.toJSON(), null));
    if (instance.dataLake && instance.dataLake.isDataLake) {
      store.dispatch(toggleIsDataLake(true));
    }
    const isGenuine = instance?.genuineMongoDB?.isGenuine ?? true;
    store.dispatch(toggleIsGenuineMongoDB(!!isGenuine));
    store.dispatch(toggleIsGenuineMongoDBVisible(!isGenuine));
  });

  appRegistry.getStore('DeploymentAwareness.WriteStateStore').listen((state) => {
    store.dispatch(toggleIsWritable(state.isWritable));
    store.dispatch(changeDescription(state.description));
  });

  appRegistry.on('select-namespace', (metadata) => {
    store.dispatch(filterDatabases(null, null, metadata.namespace || ''));
  });

  appRegistry.on('open-namespace-in-new-tab', (metadata) => {
    store.dispatch(filterDatabases(null, null, metadata.namespace || ''));
  });

  appRegistry.on('select-database', (ns) => {
    store.dispatch(filterDatabases(null, null, ns || ''));
  });

  appRegistry.on('data-service-disconnected', () => {
    store.dispatch(reset());
    // @todo: Set the connection name.
  });
};

export default store;
