import React, { useState, useCallback, useEffect } from 'react';
import { connect } from 'react-redux';
import { css, spacing } from '@mongodb-js/compass-components';

import type { IndexView } from '../indexes-toolbar/indexes-toolbar';
import IndexesToolbar from '../indexes-toolbar/indexes-toolbar';
import RegularIndexesTable from '../regular-indexes-table/regular-indexes-table';
import SearchIndexesTable from '../search-indexes-table/search-indexes-table';
import { refreshRegularIndexes } from '../../modules/regular-indexes';
import {
  showCreateModal as openAtlasSearchModalForCreation,
  refreshSearchIndexes,
} from '../../modules/search-indexes';
import type { State as RegularIndexesState } from '../../modules/regular-indexes';
import type { State as SearchIndexesState } from '../../modules/search-indexes';
import { SearchIndexesStatuses } from '../../modules/search-indexes';
import type { SearchIndexesStatus } from '../../modules/search-indexes';
import type { RootState } from '../../modules';
import {
  CreateSearchIndexModal,
  UpdateSearchIndexModal,
} from '../search-indexes-modals';

// This constant is used as a trigger to show an insight whenever number of
// indexes in a collection is more than what is specified here.
const IDEAL_NUMBER_OF_MAX_INDEXES = 10;

const containerStyles = css({
  margin: spacing[3],
  marginTop: 0,
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

type IndexesProps = {
  isReadonlyView?: boolean;
  regularIndexes: Pick<
    RegularIndexesState,
    'indexes' | 'error' | 'isRefreshing'
  >;
  searchIndexes: Pick<SearchIndexesState, 'indexes' | 'error' | 'status'>;
  refreshRegularIndexes: () => void;
  refreshSearchIndexes: () => void;
  onClickCreateAtlasSearchIndex: () => void;
};

function isRefreshingStatus(status: SearchIndexesStatus) {
  return (
    status === SearchIndexesStatuses.PENDING ||
    status === SearchIndexesStatuses.REFRESHING
  );
}

export function Indexes({
  isReadonlyView,
  regularIndexes,
  searchIndexes,
  refreshRegularIndexes,
  refreshSearchIndexes,
  onClickCreateAtlasSearchIndex,
}: IndexesProps) {
  const [currentIndexesView, setCurrentIndexesView] =
    useState<IndexView>('regular-indexes');

  const errorMessage =
    currentIndexesView === 'regular-indexes'
      ? regularIndexes.error
      : searchIndexes.error;

  const hasTooManyIndexes =
    currentIndexesView === 'regular-indexes' &&
    regularIndexes.indexes.length > IDEAL_NUMBER_OF_MAX_INDEXES;

  const isRefreshing =
    currentIndexesView === 'regular-indexes'
      ? regularIndexes.isRefreshing === true
      : isRefreshingStatus(searchIndexes.status);

  const onRefreshIndexes =
    currentIndexesView === 'regular-indexes'
      ? refreshRegularIndexes
      : refreshSearchIndexes;

  const loadIndexes = useCallback(() => {
    if (currentIndexesView === 'regular-indexes') {
      refreshRegularIndexes();
    } else {
      refreshSearchIndexes();
    }
  }, [currentIndexesView, refreshRegularIndexes, refreshSearchIndexes]);

  const changeIndexView = useCallback(
    (view: IndexView) => {
      setCurrentIndexesView(view);
      loadIndexes();
    },
    [loadIndexes]
  );

  useEffect(() => {
    loadIndexes();
  }, [loadIndexes]);

  return (
    <div className={containerStyles}>
      <IndexesToolbar
        errorMessage={errorMessage || null}
        hasTooManyIndexes={hasTooManyIndexes}
        isRefreshing={isRefreshing}
        onRefreshIndexes={onRefreshIndexes}
        onChangeIndexView={changeIndexView}
        onClickCreateAtlasSearchIndex={onClickCreateAtlasSearchIndex}
      />
      {!isReadonlyView && currentIndexesView === 'regular-indexes' && (
        <RegularIndexesTable />
      )}
      {!isReadonlyView && currentIndexesView === 'search-indexes' && (
        <SearchIndexesTable />
      )}
      <CreateSearchIndexModal />
      <UpdateSearchIndexModal />
    </div>
  );
}

const mapState = ({
  isReadonlyView,
  regularIndexes,
  searchIndexes,
}: RootState) => ({
  isReadonlyView,
  regularIndexes,
  searchIndexes,
});

const mapDispatch = {
  refreshRegularIndexes,
  refreshSearchIndexes,
  onClickCreateAtlasSearchIndex: openAtlasSearchModalForCreation,
};

export default connect(mapState, mapDispatch)(Indexes);
