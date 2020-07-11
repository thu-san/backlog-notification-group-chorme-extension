import './contentScript.scss';

chrome.storage.sync.get(['color'], function (object) {
  console.log(object);
  console.log('hello');
});
