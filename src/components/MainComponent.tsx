import React, { memo, useState } from 'react';

import { ISiteData } from '../config/constants';
import { StoreProvider } from '../store';

type NotiGroupComponent = () => React.ReactPortal;

let innerAdd:
  | undefined
  | ((notiGroupComponent: NotiGroupComponent) => void) = undefined;

export const addNotiGroupComponent = (
  notiGroupComponent: NotiGroupComponent
) => {
  if (innerAdd) {
    innerAdd(notiGroupComponent);
  }
};

export default memo(
  ({
    defaultSiteData,
    siteOrigin,
  }: {
    defaultSiteData: ISiteData;
    siteOrigin: string;
  }) => {
    const [notiGroupComponentList, setNotiGroupComponentList] = useState<
      NotiGroupComponent[]
    >([]);
    innerAdd = (notiGroupComponent) => {
      setNotiGroupComponentList([
        ...notiGroupComponentList,
        notiGroupComponent,
      ]);
    };

    return (
      <StoreProvider defaultState={defaultSiteData} siteOrigin={siteOrigin}>
        {notiGroupComponentList.map((Component, index) => (
          <Component key={index} />
        ))}
      </StoreProvider>
    );
  }
);
