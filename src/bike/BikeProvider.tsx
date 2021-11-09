import React, {useCallback, useContext, useEffect, useReducer} from 'react';
import PropTypes from 'prop-types';
import {getLogger} from '../core';
import {BikeProps} from './BikeProps';
import {createBike, deleteBike, getBikes, newWebSocket, updateBike} from './bikeApi';
import {AuthContext } from "../auth";

const log = getLogger('BikeProvider');

type SaveBikeFn = (bike: BikeProps) => Promise<any>;
type DeleteBikeFn = (bike: BikeProps) => Promise<any>;

export interface BikesState {
    bikes?: BikeProps[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    saveBike?: SaveBikeFn,
    deleting: boolean,
    deletingError?: Error | null,
    deleteBike?: DeleteBikeFn
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: BikesState = {
    fetching: false,
    saving: false,
    deleting: false
};

const FETCH_BIKES_STARTED = 'FETCH_BIKES_STARTED';
const FETCH_BIKES_SUCCEEDED = 'FETCH_BIKES_SUCCEEDED';
const FETCH_BIKES_FAILED = 'FETCH_BIKES_FAILED';
const SAVE_BIKE_STARTED = 'SAVE_BIKE_STARTED';
const SAVE_BIKE_SUCCEEDED = 'SAVE_BIKE_SUCCEEDED';
const SAVE_BIKE_FAILED = 'SAVE_BIKE_FAILED';
const DELETE_BIKE_STARTED = 'DELETE_BIKE_STARTED';
const DELETE_BIKE_SUCCEEDED = 'DELETE_BIKE_SUCCEEDED';
const DELETE_BIKE_FAILED = 'DELETE_BIKE_FAILED';


const reducer: (state: BikesState, action: ActionProps) => BikesState =
    (state, {type, payload}) => {
        switch (type) {
            case FETCH_BIKES_STARTED:
                return {...state, fetching: true, fetchingError: null};
            case FETCH_BIKES_SUCCEEDED:
                return {...state, bikes: payload.bikes, fetching: false};
            case FETCH_BIKES_FAILED:
                return {...state, fetchingError: payload.error, fetching: false};
            case SAVE_BIKE_STARTED:
                return {...state, savingError: null, saving: true};
            case SAVE_BIKE_SUCCEEDED: {
                const bikes = [...(state.bikes || [])];
                const bike = payload.bike;
                const index = bikes.findIndex(it => it._id === bike._id);
                if (index === -1) {
                    bikes.splice(0, 0, bike);
                } else {
                    bikes[index] = bike;
                }
                return {...state, bikes: bikes, saving: false};
            }
            case SAVE_BIKE_FAILED:
                return {...state, savingError: payload.error, saving: false};
            case DELETE_BIKE_STARTED:
                return {...state, deletingError: null, deleting: true};
            case DELETE_BIKE_SUCCEEDED: {
                let bikes = [...(state.bikes || [])];
                const bike = payload.bike;
                const index = bikes.findIndex(it => it._id === bike._id);
                if (index !== -1) {
                    bikes.splice(index, 1);
                }
                return {...state, bikes: bikes, deleting: false};
            }
            case DELETE_BIKE_FAILED:
                return {...state, deletingError: payload.error, deleting: false};
            default:
                return state;
        }
    };

export const BikeContext = React.createContext<BikesState>(initialState);

interface BikeProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const BikeProvider: React.FC<BikeProviderProps> = ({children}) => {
    const { token } = useContext(AuthContext);
    const [state, dispatch] = useReducer(reducer, initialState);
    const {bikes, fetching, fetchingError, saving, savingError, deleting, deletingError} = state;
    useEffect(getBikesEffect, [token]);
    useEffect(wsEffect, [token]);
    const saveBike = useCallback<SaveBikeFn>(saveBikeCallback, [token]);
    const removeBike = useCallback<DeleteBikeFn>(deleteBikeCallback, [token]);

    async function deleteBikeCallback(bike: BikeProps) {
        try {
            log('deleteBike started');
            dispatch({type: DELETE_BIKE_STARTED});
            const deletedBike = await deleteBike(token, bike);
            log('deleteBike succeeded');
            dispatch({type: DELETE_BIKE_SUCCEEDED, payload: {bike: deletedBike}});
        } catch (error) {
            log('deleteBike failed');
            dispatch({type: DELETE_BIKE_FAILED, payload: {error}});
        }
    }

    const value = {
        bikes,
        fetching,
        fetchingError,
        saving,
        savingError,
        saveBike: saveBike,
        deleting,
        deletingError,
        deleteBike: removeBike
    };
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
            if(!token?.trim()){
                return;
            }
            try {
                log('fetchBikes started');
                dispatch({type: FETCH_BIKES_STARTED});
                const bikes = await getBikes(token);
                log('fetchBikes succeeded');
                if (!canceled) {
                    dispatch({type: FETCH_BIKES_SUCCEEDED, payload: {bikes}});
                }
            } catch (error) {
                log('fetchBikes failed');
                dispatch({type: FETCH_BIKES_FAILED, payload: {error}});
            }
        }
    }

    async function saveBikeCallback(bike: BikeProps) {
        try {
            log('saveBike started');
            dispatch({type: SAVE_BIKE_STARTED});
            const savedBike = await (bike._id ? updateBike(token, bike) : createBike(token,bike));
            log('saveBike succeeded');
            dispatch({type: SAVE_BIKE_SUCCEEDED, payload: {bike: savedBike}});
        } catch (error) {
            log('saveBike failed');
            dispatch({type: SAVE_BIKE_FAILED, payload: {error}});
        }
    }

    function wsEffect() {
        let canceled = false;
        log('wsEffect - connecting');
        let closeWebSocket: () => void;
        if(token?.trim()) {
            closeWebSocket = newWebSocket(token,message => {
                if (canceled) {
                    return;
                }
                const {type, payload: bike} = message;
                log(`ws message, bike ${type}`);
                if (type === 'created' || type === 'updated') {
                    dispatch({type: SAVE_BIKE_SUCCEEDED, payload: {bike: bike}});
                }
                if (type === 'deleted') {
                    dispatch({type: DELETE_BIKE_SUCCEEDED, payload: {bike: bike}});
                }
            });
        }
        return () => {
            log('wsEffect - disconnecting');
            canceled = true;
            closeWebSocket?.();
        }
    }
};
