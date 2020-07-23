// cSpell:words chzn
import './contentScript.scss';

import $ from 'jquery';
import React from 'react';
import * as ReactDOM from 'react-dom';

import MainComponent, { addNotiGroupComponent } from '../components/MainComponent';
import NotiGroupComponent from '../components/NotiGroupComponent';
import { ISiteData } from '../config/constants';

const siteOrigin = new URL(window.location.href).origin;
chrome.storage.sync.get([siteOrigin], function (obj) {
  const siteData: ISiteData = obj[siteOrigin];
  if (!siteData) {
    return;
  }

  init(siteData, siteOrigin);
});

const init = (siteData: ISiteData, siteOrigin: string) => {
  // window.scrollTo({
  //   top: 1000,
  // });

  /**
   * Init MainComponent
   */
  $('body').append(`<div id="notiGroupMainContainer"></div>`);
  ReactDOM.render(
    <MainComponent
      siteOrigin={siteOrigin}
      defaultSiteData={siteData}
    ></MainComponent>,
    document.getElementById('notiGroupMainContainer')
  );

  // Don't know how many user select lists will be in the page. So check for select lists till 10 seconds and init them
  /**
   * backlog user select lists for notification
   */
  let renderedSelects: HTMLElement[] = [];
  let count = 0;
  const interval = setInterval(() => {
    if (count > 10) {
      clearInterval(interval);
    }

    (
      $(
        '.notified-users, .notifiedUsersArea, #notifiedUsersLeft, #notifiedUsers > div'
      ) || []
    ).each((_, elm) => {
      if (!renderedSelects.includes(elm)) {
        renderedSelects.push(elm);
        renderNotiGroup(elm, renderedSelects.length);
      }
    });

    count++;
  }, 100);
};

const sleep = (ms = 1000) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const renderNotiGroup = async (containerElm: HTMLElement, index: number) => {
  while (!$(containerElm).children('.chzn-done').length) {
    await sleep();
  }

  const smallContainer =
    $(containerElm).parent().attr('id') === 'notifiedUsers';

  $(containerElm).css('display', 'flex');
  $(containerElm)
    .children('.comment-form-label, #labelNotifiedUsersLeft, .NotifyHelp')
    .remove();
  $(containerElm).children('.chzn-container').css('flex', 1);
  if (smallContainer) {
    $(containerElm).css('flex-direction', 'column');
    $(containerElm)
      .children()
      .first()
      .after(
        `<div id="notiGroupContainer${index}" class="notiGroupContainer notiGroupSmallContainer"></div>`
      );
  } else {
    $(containerElm).prepend(
      `<div id="notiGroupContainer${index}" class="notiGroupContainer"></div>`
    );
  }

  const portalContainer = document.getElementById(`notiGroupContainer${index}`);
  if (portalContainer) {
    addNotiGroupComponent(() =>
      ReactDOM.createPortal(
        <NotiGroupComponent
          selectElm={$(containerElm).children('.chzn-done')[0]}
          containerIndex={index}
        />,
        portalContainer
      )
    );
  }
};
