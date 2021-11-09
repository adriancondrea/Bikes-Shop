import axios from 'axios';
import {authConfig, baseUrl, getLogger, withLogs } from '../core';
import {BikeProps} from './BikeProps';

const bikeUrl = `http://${baseUrl}/api/bike`;

export const getBikes: (token: string) => Promise<BikeProps[]> = token => {
    return withLogs(axios.get(bikeUrl, authConfig(token)), 'getBikes');
}

export const createBike: (token: string, bike: BikeProps) => Promise<BikeProps[]> = (token, bike) =>{
    return withLogs(axios.post(bikeUrl, bike, authConfig(token)), 'createBike');
}

export const updateBike: (token: string, bike: BikeProps) => Promise<BikeProps[]> = (token, bike) => {
    return withLogs(axios.put(`${bikeUrl}/${bike._id}`, bike, authConfig(token)), 'updateBike');
}

export const deleteBike: (token: string, bike: BikeProps) => Promise<BikeProps[]> = (token, bike) => {
    return withLogs(axios.delete(`${bikeUrl}/${bike._id}`, authConfig(token)), 'deleteBike');
}

interface MessageData {
    type: string;
    payload: BikeProps;
}

const log = getLogger('ws');

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`);
    ws.onopen = () => {
        log('web socket onopen');
        ws.send(JSON.stringify({ type: 'authorization', payload: { token } }));
    };
    ws.onclose = () => {
        log('web socket onclose');
    };
    ws.onerror = error => {
        log('web socket onerror', error);
    };
    ws.onmessage = messageEvent => {
        log('web socket onmessage');
        onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
        ws.close();
    }
}