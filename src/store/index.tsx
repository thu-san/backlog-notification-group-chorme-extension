import React, {
  createContext,
  ReactNode,
  Reducer,
  useContext,
  useEffect,
  useReducer,
} from 'react';

import { ISiteData } from '../config/constants';

type Action =
  | {
      type: 'ADD_GROUP';
      payload: ISiteData['groups'][0];
    }
  | {
      type: 'CHANGE_SELECTED' | 'CHANGE_AUTO' | 'DELETE_GROUP';
      payload: ISiteData['selected'];
    };
const reducer: Reducer<ISiteData, Action> = (state, action) => {
  switch (action.type) {
    case 'ADD_GROUP':
      return { ...state, groups: [...state.groups, action.payload] };
    case 'CHANGE_SELECTED':
      return { ...state, selected: action.payload };
    case 'CHANGE_AUTO': {
      const { auto } = state;
      let newAuto: ISiteData['auto'] = [];
      if (auto.includes(action.payload)) {
        auto.splice(auto.indexOf(action.payload), 1);
        newAuto = [...auto];
      } else {
        newAuto = [...auto, action.payload];
      }

      return {
        ...state,
        auto: newAuto,
      };
    }
    case 'DELETE_GROUP': {
      const { selected, auto, groups } = state;

      let newSelected = selected;
      if (selected === action.payload) {
        newSelected = 0;
      } else if (selected > action.payload) {
        newSelected--;
      }

      let newAuto = auto;
      if (newAuto.includes(action.payload)) {
        newAuto.splice(newAuto.indexOf(action.payload), 1);
      }
      newAuto = newAuto.map((groupIndex) =>
        groupIndex > action.payload ? groupIndex - 1 : groupIndex
      );

      groups.splice(action.payload, 1);

      return {
        ...state,
        selected: newSelected,
        auto: newAuto,
        groups: [...groups],
      };
    }
    default:
      return state;
  }
};

const StoreContext = createContext<{
  state: ISiteData;
  dispatch: React.Dispatch<Action>;
}>({
  state: {
    selected: 0,
    auto: [],
    groups: [],
  },
  dispatch: () => undefined,
});

export const StoreProvider = ({
  children,
  defaultState,
  siteOrigin,
}: {
  children: ReactNode;
  defaultState: ISiteData;
  siteOrigin: string;
}) => {
  const [state, dispatch] = useReducer(reducer, defaultState);
  const value = { state, dispatch };

  /**
   * save to chrome storage
   */
  useEffect(() => {
    chrome.storage.sync.set({ [siteOrigin]: state });
  }, [siteOrigin, state]);

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
