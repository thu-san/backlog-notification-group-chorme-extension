import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import { Reset } from 'styled-reset';

import LangText, { ResolveLang } from './components/LangText';
import { ISite, ISiteData, StorageKey } from './config/constants';

const App = () => {
  const [loading, setLoading] = useState(true);
  const [sites, setSites] = useState<ISite[]>([]);

  useEffect(() => {
    chrome.storage &&
      chrome.storage.sync.get([StorageKey], (obj) => {
        if (obj[StorageKey] && Array.isArray(obj[StorageKey])) {
          setSites(obj[StorageKey]);
        }

        setLoading(false);
      });
  }, []);

  //#region handlers
  const addSite = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      let { favIconUrl: icon = '', title = '', url = '' } = tabs[0];
      url = new URL(url).origin;
      const index = _.findIndex(sites, { url });
      if (index > -1) {
        sites.splice(index, 1);
      }
      const newSites = [{ icon, title, url }, ...sites];
      setSites(newSites);
      chrome.storage.sync.set({ [StorageKey]: newSites });
      chrome.storage.sync.get([url], (obj) => {
        if (!obj[url]) {
          const defaultData: ISiteData = {
            groups: [],
            selected: 0,
            auto: [],
          };
          chrome.storage.sync.set({ [url]: defaultData });
        }
      });
    });
  };
  const deleteSite = (index: number) => () => {
    if (!window.confirm(ResolveLang('Are you sure you want to delete?'))) {
      return;
    }

    const removedSite = sites.splice(index, 1);
    const newSites = [...sites];
    setSites(newSites);
    chrome.storage.sync.set({ [StorageKey]: newSites });
    if (removedSite[0]) {
      chrome.storage.sync.remove(removedSite[0].url);
    }
  };
  //#endregion

  return (
    <>
      <Reset />
      <ContainerDiv>
        <h1>
          <LangText text="Backlog Site List" />
        </h1>
        {loading ? (
          <StatusP>
            <LangText text="Loading..." />
          </StatusP>
        ) : (
          <>
            <AddSiteBtn onClick={addSite}>
              <LangText text="+ Add Current Site" />
            </AddSiteBtn>
            <ListContainerDiv>
              {sites.length ? (
                sites.map(({ icon, title, url }, index) => (
                  <SiteCardDiv url={icon} key={index}>
                    <div></div>
                    <div>
                      <p>{title}</p>
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        {url}
                      </a>
                    </div>
                    <span
                      role="img"
                      aria-label="Delete"
                      onClick={deleteSite(index)}
                    >
                      ❌
                    </span>
                  </SiteCardDiv>
                ))
              ) : (
                <StatusP>
                  <LangText text="No site added yet" />
                </StatusP>
              )}
            </ListContainerDiv>
          </>
        )}
      </ContainerDiv>
    </>
  );
};

export default App;

//#region styles
const ContainerDiv = styled.div`
  width: 400px;
  height: 500px;
  background: #ccc;
  border: 1px solid black;
  display: flex;
  flex-direction: column;
  font-family: Yu Gothic, Hiragino Kaku Gothic Pro;

  h1 {
    background: white;
    box-shadow: 0 2px 2px rgba(0, 0, 0, 0.3);
    margin: 0;
    text-align: center;
    margin-bottom: 16px;
    font-size: 16px;
    padding: 8px;
  }
`;

const StatusP = styled.p`
  text-align: center;
`;

const AddSiteBtn = styled.button`
  background: #4bf396;
  font-weight: bold;
  font-size: 14px;
  border: 0;
  padding: 12px 80px;
  border-radius: 25px;
  display: block;
  margin: 0 auto 16px;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.3);
  outline: none;
  cursor: pointer;

  &:hover {
    background: #3ee488;
  }

  &:active {
    background: #29d073;
  }
`;

const ListContainerDiv = styled.div`
  box-shadow: inset 0 2px 2px rgba(0, 0, 0, 0.3);
  padding: 16px;
  background: white;
  flex: 1;
  overflow-y: auto;
`;

const SiteCardDiv = styled.div<{ url?: string }>`
  padding: 12px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  display: flex;
  align-items: center;

  & > {
    div:first-child {
      width: 40px;
      height: 40px;
      background: url(${(props) => props.url}) no-repeat;
      background-position: center;
      background-size: contain;
      margin-right: 8px;
    }

    div:nth-child(2) {
      flex: 1;
      margin-right: 8px;
      min-width: 0;

      p,
      a {
        margin: 2px 0;
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        &:last-child {
          color: #888;
        }
      }
    }

    span:last-child {
      display: block;
      cursor: pointer;
      padding: 8px;
    }
  }
`;
//#endregion
