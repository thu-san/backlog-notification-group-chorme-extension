import $ from 'jquery';
import React, { memo, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { ISiteData } from '../config/constants';
import { useStore } from '../store';

export default memo<{
  selectElm: HTMLElement;
  containerIndex: number;
}>(({ selectElm, containerIndex }) => {
  const listContainerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [listVisible, setListVisible] = useState(false);

  const { state, dispatch } = useStore();
  const { selected, auto, groups } = state;

  useEffect(() => {
    const autoUsers = auto.reduce((prevIndex, groupIndex) => {
      return [...prevIndex, ...groups[groupIndex].users];
    }, [] as ISiteData['groups'][0]['users']);
    updateSelectBoxList(autoUsers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //#region outsideClick
  const handleOutsideClick = (e: MouseEvent) => {
    if (
      (listContainerRef.current &&
        listContainerRef.current.contains(e.target as Node)) ||
      (buttonRef.current && buttonRef.current.contains(e.target as Node))
    ) {
      return;
    }
    setListVisible(false);
  };
  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);
  //#endregion

  //#region handlers
  const addGroup = () => {
    const users = $(selectElm).val() as string[];
    if (!users.length) {
      alert('Please select users!');
      return;
    }
    const name = prompt('Please enter group name!');
    if (name === null) {
      return;
    }

    dispatch({
      type: 'ADD_GROUP',
      payload: {
        name,
        users,
      },
    });
  };
  const updateSelectBoxList = (list: string[]) => {
    $(selectElm).val(list);
    $(selectElm)[0].dispatchEvent(new Event('liszt:updated'));
  };
  const selectGroupItem = (itemIndex: number) => () => {
    const item = groups[itemIndex];
    if (!item) {
      return;
    }

    updateSelectBoxList([...($(selectElm).val() as string[]), ...item.users]);
  };
  const deleteGroup = (groupIndex: number, name: string) => () => {
    if (!window.confirm(`Are you sure you want to delete group ${name}?`)) {
      return;
    }

    dispatch({
      type: 'DELETE_GROUP',
      payload: groupIndex,
    });
  };
  //#endregion

  return (
    <>
      <ContainerDiv>
        <DropDownDiv>
          <button
            type="button"
            onClick={() => setListVisible(!listVisible)}
            ref={buttonRef}
          >
            ▼
          </button>
          <button
            type="button"
            disabled={!groups.length}
            onClick={selectGroupItem(selected)}
          >
            {!groups.length || !groups[selected]
              ? '...'
              : groups[selected].name}
          </button>
        </DropDownDiv>
        <ListContainerDiv visible={listVisible} ref={listContainerRef}>
          <ListHeaderDiv>
            <div>Group Name</div>
            <div>
              <span role="img" aria-label="auto">
                ♻️
              </span>
            </div>
          </ListHeaderDiv>
          {groups.length ? (
            groups.map(({ name }, groupIndex) => (
              <ListItemDiv key={groupIndex}>
                <p onClick={selectGroupItem(groupIndex)}>{name}</p>
                <div>
                  <input
                    type="radio"
                    name={`selectedItem${containerIndex}`}
                    id={`radio-${containerIndex}-${groupIndex}`}
                    checked={groupIndex === selected}
                    onChange={() =>
                      dispatch({
                        type: 'CHANGE_SELECTED',
                        payload: groupIndex,
                      })
                    }
                  />
                  <label
                    htmlFor={`radio-${containerIndex}-${groupIndex}`}
                  ></label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    id={`checkbox-${containerIndex}-${groupIndex}`}
                    checked={auto.includes(groupIndex)}
                    onChange={() =>
                      dispatch({
                        type: 'CHANGE_AUTO',
                        payload: groupIndex,
                      })
                    }
                  />
                  <label
                    htmlFor={`checkbox-${containerIndex}-${groupIndex}`}
                    title="Select automatically"
                  ></label>
                </div>
                <div onClick={deleteGroup(groupIndex, name)}>
                  <span role="img" aria-label="delete">
                    ❌
                  </span>
                </div>
              </ListItemDiv>
            ))
          ) : (
            <NoGroupP>
              Please select users and press{' '}
              <span role="img" aria-label="save">
                💾
              </span>
            </NoGroupP>
          )}
        </ListContainerDiv>
      </ContainerDiv>
      <Button type="button" onClick={addGroup}>
        <span role="img" aria-label="save">
          💾
        </span>
      </Button>
      <Button type="button" onClick={() => updateSelectBoxList([])}>
        <span role="img" aria-label="clear">
          🗑️
        </span>
      </Button>
    </>
  );
});

//#region styles
const ContainerDiv = styled.div`
  flex: 1;
  min-width: 0;
`;
const DropDownDiv = styled.div`
  border: 1px solid #aaa;
  display: flex;
  margin-right: 8px;
  height: 26px;
  border-radius: 4px;
  background: white;
  outline: none;

  & > button {
    background: white;
    border: 0;
    height: 100%;
    padding: 0 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    outline: none;

    &:hover {
      background: linear-gradient(0deg, #ccc, white);
    }
  }

  & > button:first-child {
    width: 24px;
    border-right: 1px solid #aaa;
    border-radius: 4px 0 0 4px;
  }

  & > button:last-child {
    flex: 1;
    text-align: left;
    border-radius: 0 4px 4px 0;

    &:disabled {
      cursor: default;
      &:hover {
        background: white;
      }
    }
  }
`;
const ListContainerDiv = styled.div<{ visible: boolean }>`
  position: absolute;
  background: white;
  border-radius: 4px;
  top: 100%;
  width: 200px;
  height: 140px;
  z-index: 10000;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.3);
  overflow-y: scroll;
  display: ${(props) => (props.visible ? 'block' : 'none')};
  outline: none;

  &::-webkit-scrollbar,
  .work-time-table-area::-webkit-scrollbar,
  .work-time-fixed-area::-webkit-scrollbar {
    width: 2px;
    height: 4px;
  }

  &::-webkit-scrollbar-track,
  .work-time-table-area::-webkit-scrollbar-track,
  .work-time-fixed-area::-webkit-scrollbar-track {
    border-radius: 10px;
    background: snow;
  }

  &::-webkit-scrollbar-thumb,
  .work-time-table-area::-webkit-scrollbar-thumb,
  .work-time-fixed-area::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: gray;
  }
`;
const ListHeaderDiv = styled.div`
  display: flex;
  background: #bbb;
  padding: 4px 21px 4px 4px;
  font-size: 10px;
  outline: none;

  & > *:first-child {
    flex: 1;
  }

  & > *:last-child {
    border-left: 1px solid white;
    border-right: 1px solid white;
    padding: 0 4px;
    margin: 0 4px;

    span {
      padding: 0 2px;
      font-size: 12px;
    }
  }
`;
const ListItemDiv = styled.div`
  display: flex;
  font-size: 10px;
  border-bottom: 1px solid #aaa;
  outline: none;

  & > * {
    padding: 6px;
    margin-right: 1px;
    position: relative;
    cursor: pointer;
    background: #fff;
    transition: all linear 300ms;
    display: flex;
    outline: none;

    &:hover {
      background: linear-gradient(0deg, #ccc, white);
    }

    &:last-child {
      margin-right: 0;
    }

    & > label {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      cursor: pointer;
    }
  }

  p {
    flex: 1;
  }
`;
const NoGroupP = styled.p`
  font-size: 11px;
  color: #aaa;
  text-align: center;
  padding-top: 16px;
`;
const Button = styled.button`
  margin-right: 8px;
  padding: 0;
  cursor: pointer;
  background: none;
  border: 0;
  outline: none;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    opacity: 0.8;
  }
`;
//#endregion
