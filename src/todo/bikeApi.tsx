import axios from 'axios';
import {getLogger} from '../core';
import {BikeProps} from './BikeProps';

const log = getLogger('bikeApi');

const baseUrl = 'localhost:3000';
const bikeUrl = `http://${baseUrl}/bike`;

interface ResponseProps<T> {
    data: T;
}

function withLogs<T>(promise: Promise<ResponseProps<T>>, fnName: string): Promise<T> {
    log(`${fnName} - started`);
    return promise
        .then(res => {
            log(`${fnName} - succeeded`);
            return Promise.resolve(res.data);
        })
        .catch(err => {
            log(`${fnName} - failed`);
            return Promise.reject(err);
        });
}

const config = {
    headers: {
        'Content-Type': 'application/json'
    }
};

export const getBikes: () => Promise<BikeProps[]> = () => {
    return withLogs(axios.get(bikeUrl, config), 'getBikes');
}

export const createBike: (bike: BikeProps) => Promise<BikeProps[]> = bike => {
    return withLogs(axios.post(bikeUrl, bike, config), 'createBike');
}

export const updateBike: (bike: BikeProps) => Promise<BikeProps[]> = bike => {
    return withLogs(axios.put(`${bikeUrl}/${bike.id}`, bike, config), 'updateBike');
}

interface MessageData {
    event: string;
    payload: {
        bike: BikeProps;
    };
}

export const newWebSocket = (onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`)
    ws.onopen = () => {
        log('web socket onopen');
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
