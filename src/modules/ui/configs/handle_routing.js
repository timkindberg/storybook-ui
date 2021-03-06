import qs from 'qs';
export const config = {
  insidePopState: false,
};

export function changeUrl(reduxStore) {
  // Do not change the URL if we are inside a popState event.
  if (config.insidePopState) return;

  const { api, shortcuts } = reduxStore.getState();
  if (!api) return;

  const { selectedKind, selectedStory } = api;
  const queryString = qs.stringify({ selectedKind, selectedStory });

  if (queryString === '') return;

  const { goFullScreen: full, showDownPanel: down, showLeftPanel: left } = shortcuts;
  const layoutQuery = qs.stringify({ full: Number(full), down: Number(down), left: Number(left) });

  const url = `?${queryString}&${layoutQuery}`;
  const state = {
    url,
    selectedKind,
    selectedStory,
    full,
    down,
    left,
  };

  window.history.pushState(state, '', url);
}

export function updateStore(queryParams, actions) {
  const {
    selectedKind,
    selectedStory,
    full,
    down,
    left,
  } = queryParams;

  if (selectedKind && selectedStory) {
    actions.api.selectStory(selectedKind, selectedStory);
  }

  actions.shortcuts.setLayout({
    goFullScreen: Boolean(Number(full)),
    showDownPanel: Boolean(Number(down)),
    showLeftPanel: Boolean(Number(left)),
  });
}

export function handleInitialUrl(actions, location) {
  const queryString = location.search.substring(1);
  if (!queryString || queryString === '') return;

  const parsedQs = qs.parse(queryString);
  updateStore(parsedQs, actions);
}

export default function ({ reduxStore }, actions) {
  // handle initial URL
  handleInitialUrl(actions, window.location);

  // subscribe to reduxStore and change the URL
  reduxStore.subscribe(() => changeUrl(reduxStore));
  changeUrl(reduxStore);

  // handle back button
  window.onpopstate = () => {
    config.insidePopState = true;
    handleInitialUrl(actions, window.location);
    config.insidePopState = false;
  };
}
