/**
 * The prefix.
 */
const PREFIX = 'collection';

/**
 * Namespace selected action name.
 */
export const SELECT_NAMESPACE = `${PREFIX}/tabs/SELECT_NAMESPACE`;

/**
 * Create tab action name.
 */
export const CREATE_TAB = `${PREFIX}/tabs/CREATE_TAB`;

/**
 * Close tab action name.
 */
export const CLOSE_TAB = `${PREFIX}/tabs/CLOSE_TAB`;

/**
 * Select tab action name.
 */
export const SELECT_TAB = `${PREFIX}/tabs/SELECT_TAB`;

/**
 * Move tab action name.
 */
export const MOVE_TAB = `${PREFIX}/tabs/MOVE_TAB`;

/**
 * Prev tab action name.
 */
export const PREV_TAB = `${PREFIX}/tabs/PREV_TAB`;

/**
 * Next tab action name.
 */
export const NEXT_TAB = `${PREFIX}/tabs/NEXT_TAB`;

/**
 * The initial state.
 */
export const INITIAL_STATE = [];

/**
 * Handles namespace selected actions.
 *
 * @param {Object} state - The state.
 * @param {Object} action - The action.
 *
 * @returns {Object} The new state.
 */
const doSelectNamespace = (state, action) => {
  if (state.length === 0) {
    // If we don't have any tabs open, then open a new tab with the
    // namespace and set it to the active one.
    return [
      {
        namespace: action.namespace,
        isActive: true,
        isReadonly: action.isReadonly
      }
    ];
  }
  // If we have tabs open, then switch the currently active tab
  // to the new namespace.
  return state.reduce((newState, tab) => {
    if (tab.isActive) {
      newState.push({
        namespace: action.namespace,
        isActive: true,
        isReadonly: action.isReadonly
      });
    } else {
      newState.push({ ...tab });
    }
    return newState;
  }, []);
};

/**
 * Handle create tab actions.
 *
 * @param {Object} state - The state.
 * @param {Object} action - The action.
 *
 * @returns {Object} The new state.
 */
const doCreateTab = (state, action) => {
  const newState = state.map((tab) => {
    return { ...tab, isActive: false };
  });
  newState.push({
    namespace: action.namespace,
    isActive: true,
    isReadonly: action.isReadonly
  });
  return newState;
};

/**
 * Determine if a tab becomes active after an active tab
 * is closed.
 *
 * @param {Number} closeIndex - The index of the tab being closed.
 * @param {Number} currentIndex - The current tab index.
 * @param {Number} numTabs - The number of tabs.
 *
 * @returns {Boolean} If the tab must be active.
 */
const isTabAfterCloseActive = (closeIndex, currentIndex, numTabs) => {
  return (closeIndex === numTabs - 1)
    ? (currentIndex === numTabs - 2)
    : (currentIndex === closeIndex + 1);
};

/**
 * Handle close tab actions.
 *
 * @param {Object} state - The state.
 * @param {Object} action - The action.
 *
 * @returns {Object} The new state.
 */
const doCloseTab = (state, action) => {
  const closeIndex = action.index;
  const activeIndex = state.findIndex((tab) => {
    return tab.isActive;
  });
  const numTabs = state.length;

  return state.reduce((newState, tab, i) => {
    if (closeIndex !== i) {
      // We follow stnadard browser behaviour with tabs on how we
      // handle which tab gets activated if we close the active tab.
      // If the active tab is the last tab, we activate the one before
      // it, otherwise we activate the next tab.
      if (activeIndex === closeIndex) {
        newState.push({ ...tab, isActive: isTabAfterCloseActive(closeIndex, i, numTabs)});
      } else {
        newState.push({ ...tab });
      }
    }
    return newState;
  }, []);
};

/**
 * Handle move tab actions.
 *
 * @param {Object} state - The state.
 * @param {Object} action - The action.
 *
 * @returns {Object} The new state.
 */
const doMoveTab = (state, action) => {
  if (action.fromIndex === action.toIndex) return state;
  const newState = state.map((tab) => ({ ...tab }));
  newState.splice(action.toIndex, 0, newState.splice(action.fromIndex, 1)[0]);
  return newState;
};

/**
 * Determine if a tab is active after the next action.
 *
 * @param {Number} activeIndex - The current active tab index.
 * @param {Number} currentIndex - The currently iterated tab index.
 * @param {Number} numTabs - The total number of tabs.
 *
 * @returns {Boolean} If the tab is active.
 */
const isTabAfterNextActive = (activeIndex, currentIndex, numTabs) => {
  return (activeIndex === numTabs - 1)
    ? (currentIndex === 0)
    : (currentIndex === activeIndex + 1);
};

/**
 * Activate the next tab.
 *
 * @param {Object} state - The state.
 *
 * @returns {Object} The new state.
 */
const doNextTab = (state) => {
  const activeIndex = state.findIndex(tab => tab.isActive);
  return state.map((tab, i) => {
    return { ...tab, isActive: isTabAfterNextActive(activeIndex, i, state.length) };
  });
};

/**
 * Determine if a tab is active after the prev action.
 *
 * @param {Number} activeIndex - The current active tab index.
 * @param {Number} currentIndex - The currently iterated tab index.
 * @param {Number} numTabs - The total number of tabs.
 *
 * @returns {Boolean} If the tab is active.
 */
const isTabAfterPrevActive = (activeIndex, currentIndex, numTabs) => {
  return (activeIndex === 0)
    ? (currentIndex === numTabs - 1)
    : (currentIndex === activeIndex - 1);
};

/**
 * Activate the prev tab.
 *
 * @param {Object} state - The state.
 *
 * @returns {Object} The new state.
 */
const doPrevTab = (state) => {
  const activeIndex = state.findIndex(tab => tab.isActive);
  return state.map((tab, i) => {
    return { ...tab, isActive: isTabAfterPrevActive(activeIndex, i, state.length) };
  });
};

/**
 * Handle select tab actions.
 *
 * @param {Object} state - The state.
 * @param {Object} action - The action.
 *
 * @returns {Object} The new state.
 */
const doSelectTab = (state, action) => {
  return state.map((tab, i) => {
    return { ...tab, isActive: (action.index === i) ? true : false };
  });
};

/**
 * The action to state modifier mappings.
 */
const MAPPINGS = {
  [SELECT_NAMESPACE]: doSelectNamespace,
  [CREATE_TAB]: doCreateTab,
  [CLOSE_TAB]: doCloseTab,
  [MOVE_TAB]: doMoveTab,
  [NEXT_TAB]: doNextTab,
  [PREV_TAB]: doPrevTab,
  [SELECT_TAB]: doSelectTab
};

/**
 * Reducer function for handle state changes to the tabs.
 *
 * @param {String} state - The tabs state.
 * @param {Object} action - The action.
 *
 * @returns {String} The new state.
 */
export default function reducer(state = INITIAL_STATE, action) {
  const fn = MAPPINGS[action.type];
  return fn ? fn(state, action) : state;
}

/**
 * Action creator for create tab.
 *
 * @param {String} namespace - The namespace.
 * @param {Boolean} isReadonly - Is the collection readonly?
 *
 * @returns {Object} The create tab action.
 */
export const createTab = (namespace, isReadonly) => ({
  type: CREATE_TAB,
  namespace: namespace,
  isReadonly: isReadonly || false
});

/**
 * Action creator for close tab.
 *
 * @param {Number} index - The tab index.
 *
 * @returns {Object} The close tab action.
 */
export const closeTab = (index) => ({
  type: CLOSE_TAB,
  index: index
});

/**
 * Action creator for move tab.
 *
 * @param {Number} fromIndex - The from tab index.
 * @param {Number} toIndex - The to tab index.
 *
 * @returns {Object} The move tab action.
 */
export const moveTab = (fromIndex, toIndex) => ({
  type: MOVE_TAB,
  fromIndex: fromIndex,
  toIndex: toIndex
});

/**
 * Action creator for next tab.
 *
 * @returns {Object} The next tab action.
 */
export const nextTab = () => ({
  type: NEXT_TAB
});

/**
 * Action creator for prev tab.
 *
 * @returns {Object} The prev tab action.
 */
export const prevTab = () => ({
  type: PREV_TAB
});

/**
 * Action creator for namespace selected.
 *
 * @param {String} namespace - The namespace.
 * @param {Boolean} isReadonly - Is the collection readonly?
 *
 * @returns {Object} The namespace selected action.
 */
export const selectNamespace = (namespace, isReadonly) => ({
  type: SELECT_NAMESPACE,
  namespace: namespace,
  isReadonly: isReadonly || false
});

/**
 * Action creator for selecting tabs.
 *
 * @param {Number} index - The tab index.
 *
 * @returns {Object} The action.
 */
export const selectTab = (index) => ({
  type: SELECT_TAB,
  index: index
});
