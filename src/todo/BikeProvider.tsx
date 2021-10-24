import React, { useCallback, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { BikeProps } from './BikeProps';
import { createBike, getBikes, newWebSocket, updateBike } from './bikeApi';

const log = getLogger('BikeProvider');

type SaveBikeFn = (bike: BikeProps) => Promise<any>;

export interface BikesState {
  bikes?: BikeProps[],
  fetching: boolean,
  fetchingError?: Error | null,
  saving: boolean,
  savingError?: Error | null,
  saveBike?: SaveBikeFn,
}

interface ActionProps {
  type: string,
  payload?: any,
}

const initialState: BikesState = {
  fetching: false,
  saving: false,
};

const FETCH_BIKES_STARTED = 'FETCH_BIKES_STARTED';
const FETCH_BIKES_SUCCEEDED = 'FETCH_BIKES_SUCCEEDED';
const FETCH_BIKES_FAILED = 'FETCH_BIKES_FAILED';
const SAVE_BIKE_STARTED = 'SAVE_BIKE_STARTED';
const SAVE_BIKE_SUCCEEDED = 'SAVE_BIKE_SUCCEEDED';
const SAVE_BIKE_FAILED = 'SAVE_BIKE_FAILED';

const reducer: (state: BikesState, action: ActionProps) => BikesState =
  (state, { type, payload }) => {
    switch (type) {
      case FETCH_BIKES_STARTED:
        return { ...state, fetching: true, fetchingError: null };
      case FETCH_BIKES_SUCCEEDED:
        return { ...state, bikes: payload.bikes, fetching: false };
      case FETCH_BIKES_FAILED:
        return { ...state, fetchingError: payload.error, fetching: false };
      case SAVE_BIKE_STARTED:
        return { ...state, savingError: null, saving: true };
      case SAVE_BIKE_SUCCEEDED:
        const bikes = [...(state.bikes || [])];
        const bike = payload.bike;
        const index = bikes.findIndex(it => it.id === bike.id);
        if (index === -1) {
          bikes.splice(0, 0, bike);
        } else {
          bikes[index] = bike;
        }
        return { ...state, bikes: bikes, saving: false };
      case SAVE_BIKE_FAILED:
        return { ...state, savingError: payload.error, saving: false };
      default:
        return state;
    }
  };

export const BikeContext = React.createContext<BikesState>(initialState);

interface BikeProviderProps {
  children: PropTypes.ReactNodeLike,
}

export const BikeProvider: React.FC<BikeProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { bikes, fetching, fetchingError, saving, savingError } = state;
  useEffect(getBikesEffect, []);
  useEffect(wsEffect, []);
  const saveBike = useCallback<SaveBikeFn>(saveBikeCallback, []);
  const value = { bikes, fetching, fetchingError, saving, savingError, saveBike: saveBike };
  log('returns');
  return (
    <BikeContext.Provider value={value}>
      {children}
    </BikeContext.Provider>
  );

  function getBikesEffect() {
    let canceled = false;
    fetchBikes();
    return () => {
      canceled = true;
    }

    async function fetchBikes() {
      try {
        log('fetchBikes started');
        dispatch({ type: FETCH_BIKES_STARTED });
        const bikes = await getBikes();
        log('fetchBikes succeeded');
        if (!canceled) {
          dispatch({ type: FETCH_BIKES_SUCCEEDED, payload: { bikes } });
        }
      } catch (error) {
        log('fetchBikes failed');
        dispatch({ type: FETCH_BIKES_FAILED, payload: { error } });
      }
    }
  }

  async function saveBikeCallback(bike: BikeProps) {
    try {
      log('saveBike started');
      dispatch({ type: SAVE_BIKE_STARTED });
      const savedBike = await (bike.id ? updateBike(bike) : createBike(bike));
      log('saveBike succeeded');
      dispatch({ type: SAVE_BIKE_SUCCEEDED, payload: { bike: savedBike } });
    } catch (error) {
      log('saveBike failed');
      dispatch({ type: SAVE_BIKE_FAILED, payload: { error } });
    }
  }

  function wsEffect() {
    let canceled = false;
    log('wsEffect - connecting');
    const closeWebSocket = newWebSocket(message => {
      if (canceled) {
        return;
      }
      const { event, payload: { bike }} = message;
      log(`ws message, bike ${event}`);
      if (event === 'created' || event === 'updated') {
        dispatch({ type: SAVE_BIKE_SUCCEEDED, payload: { bike: bike } });
      }
    });
    return () => {
      log('wsEffect - disconnecting');
      canceled = true;
      closeWebSocket();
    }
  }
};
