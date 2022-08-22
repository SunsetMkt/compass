import React, { useCallback, useMemo } from 'react';
import { connect } from 'react-redux';
import {
  useHoverState,
  css,
  cx,
  ItemActionControls,
  SmallIcon,
  spacing,
} from '@mongodb-js/compass-components';

import type { ItemAction } from '@mongodb-js/compass-components';

import DatabaseCollectionFilter from './database-collection-filter';
import SidebarDatabasesNavigation from './sidebar-databases-navigation';

import { changeFilterRegex } from '../modules/databases';

type DatabasesActions = 'open-create-database';

const navigationItem = css({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  color: 'var(--item-color)',
  backgroundColor: 'var(--item-bg-color)',
  border: 'none',
  height: spacing[5],
  paddingLeft: spacing[3],
  paddingRight: spacing[1],
  position: 'relative',

  ':hover': {
    fontWeight: 'bold',
  },
});

const activeNavigationItem = css({
  color: 'var(--item-color-active)',
  backgroundColor: 'var(--item-bg-color-active)',
  fontWeight: 'bold',

  // this is copied from leafygreen's own navigation, hence the pixel values
  '::before': {
    backgroundColor: 'var(--item-color-active)',
    content: '""',
    position: 'absolute',
    left: '0px',
    top: '6px',
    bottom: '6px',
    width: '4px',
    borderRadius: '0px 6px 6px 0px',
  },
});

const navigationItemLabel = css({
  marginLeft: spacing[2],
});

export function NavigationItem<Actions extends string>({
  isExpanded,
  onAction,
  glyph,
  label,
  actions,
  tabName,
  isActive,
}: {
  isExpanded?: boolean;
  onAction(actionName: string, ...rest: any[]): void;
  glyph: string;
  label: string;
  actions?: ItemAction<Actions>[];
  tabName: string;
  isActive: boolean;
}) {
  const [hoverProps, isHovered] = useHoverState();

  const onClick = useCallback(() => {
    onAction('open-instance-workspace', tabName);
  }, [onAction]);

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className={cx(navigationItem, isActive && activeNavigationItem)}
      onClick={onClick}
      {...hoverProps}
    >
      <SmallIcon glyph={glyph} mode="inherit"></SmallIcon>
      {isExpanded && <span className={navigationItemLabel}>{label}</span>}
      {isExpanded && actions && (
        <ItemActionControls<Actions>
          mode="normal"
          onAction={onAction}
          actions={actions}
          shouldCollapseActionsToMenu
          isActive={isActive}
          isHovered={isHovered}
        ></ItemActionControls>
      )}
    </div>
  );
}

export function NavigationItems({
  isExpanded,
  changeFilterRegex,
  onAction,
  currentLocation,
}: {
  isExpanded?: boolean;
  changeFilterRegex: any;
  onAction: any;
  currentLocation: string | null;
}) {
  const databasesActions = useMemo(() => {
    const actions: ItemAction<DatabasesActions>[] = [];

    actions.push({
      action: 'open-create-database',
      label: 'Create database',
      icon: 'Plus',
    });

    return actions;
  }, []);

  return (
    <>
      <NavigationItem<''>
        isExpanded={isExpanded}
        onAction={onAction}
        glyph="CurlyBraces"
        label="My Queries"
        tabName="My Queries"
        isActive={currentLocation === 'My Queries'}
      />
      <NavigationItem<DatabasesActions>
        isExpanded={isExpanded}
        onAction={onAction}
        glyph="Database"
        label="Databases"
        tabName="Databases"
        actions={databasesActions}
        isActive={currentLocation === 'Databases'}
      />
      <DatabaseCollectionFilter changeFilterRegex={changeFilterRegex} />
      <SidebarDatabasesNavigation />
    </>
  );
}

const mapStateToProps = (state: { location: string | null }) => ({
  currentLocation: state.location,
});

const MappedNavigationItems = connect(mapStateToProps, {
  changeFilterRegex,
})(NavigationItems);

export default MappedNavigationItems;