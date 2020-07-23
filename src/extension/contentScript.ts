import './contentScript.scss';

import { ISite, StorageKey } from '../config/constants';

const initBacklogGroupNotification = () => {
  console.log('init pls');
}

chrome.storage.sync.get([StorageKey], function (obj: { BNGEnabledSites: ISite[] }) {
  if (obj[StorageKey].map(({ url }) => url).includes((new URL(window.location.href)).host)) {
    initBacklogGroupNotification();
  }
});
