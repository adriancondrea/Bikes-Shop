import axios from 'axios';
import {authConfig, baseUrl, getLogger, withLogs} from '../core';
import {BikeProps} from './BikeProps';
import {Storage} from '@capacitor/storage';

const bikeUrl = `http://${baseUrl}/api/bike`;

export const getBikes: (token: string) => Promise<BikeProps[]> = token => {
    try {
        const result = axios.get(`${bikeUrl}`, authConfig(token));
        result.then(async result => {
            // @ts-ignore
            for (const each of result.data) {
                await Storage.set({
                    key: each._id!,
                    value: JSON.stringify({
                        _id: each._id,
                        name: each.name,
                        condition: each.condition,
                        warranty: each.warranty,
                        price: each.price
                    })
                })
            }
        }).catch(error => {
            if (error.response) {
                console.log('client received an error response (5xx, 4xx)');
            } else if (error.request) {
                console.log('client never received a response, or request never left');
            } else {
                console.log('anything else');
            }
        });
        return withLogs(result, 'getBikes');
    } catch (error) {
        throw error;
    }
    // return withLogs(axios.get(bikeUrl, authConfig(token)), 'getBikes');
}

export const createBike: (token: string, bike: BikeProps) => Promise<BikeProps[]> = (token, bike) => {
    const result = axios.post(`${bikeUrl}`, bike, authConfig(token));
    result.then(async result => {
        const item: any = result.data;
        await Storage.set({
            key: item._id!,
            value: JSON.stringify({
                _id: item._id,
                name: item.name,
                condition: item.condition,
                warranty: item.warranty,
                price: item.price
            })
        })
    }).catch(err => {
        if (err.response) {
            console.log('client received an error response (5xx, 4xx)');
        } else if (err.request) {
            alert('client never received a response, or request never left');
        } else {
            console.log('anything else');
        }
    });
    return withLogs(result, 'createBike');
    //return withLogs(axios.post(bikeUrl, bike, authConfig(token)), 'crateBike');
}

export const updateBike: (token: string, bike: BikeProps) => Promise<BikeProps[]> = (token, bike) => {
    const result = axios.put(`${bikeUrl}/${bike._id}`, bike, authConfig(token));
    result.then(async result => {
        const item: any = result.data;
        await Storage.set({
            key: item._id!,
            value: JSON.stringify({
                _id: item._id,
                name: item.name,
                condition: item.condition,
                warranty: item.warranty,
                price: item.price
            })
        }).catch(err => {
            if (err.response) {
                alert('client received an error response (5xx, 4xx)');
            } else if (err.request) {
                alert('client never received a response, or request never left');
            } else {
                alert('anything else');
            }
        })
    });
    return withLogs(result, 'updateBike');
    //return withLogs(axios.put(`${bikeUrl}/${bike._id}`, bike, authConfig(token)), 'updateBike');
}

export const deleteBike: (token: string, bike: BikeProps) => Promise<BikeProps[]> = (token, bike) => {
    return withLogs(axios.delete(`${bikeUrl}/${bike._id}`, authConfig(token)), 'deleteBike');
}

const equals = (bike1: any, bike2: any) => {
    return bike1.name === bike2.name && bike1.condition === bike2.condition && bike1.warranty === bike2.warranty && bike1.price === bike2.price;
}

// @ts-ignore
export const syncData: (token: string) => Promise<BikeProps[]> = async token => {
    try {
        const {keys} = await Storage.keys();
        const result = axios.get(`${bikeUrl}`, authConfig(token));
        result.then(async result => {
            for (const key of keys) {
                if (key !== 'token') {
                    // @ts-ignore
                    const bikeOnServer = result.data.find((each: { _id: string; }) => each._id === key);
                    const bikeLocal = await Storage.get({key: key});

                    if (bikeOnServer !== undefined && !equals(bikeOnServer, JSON.parse(bikeLocal.value!))) { //update
                        axios.put(`${bikeUrl}/${key}`, JSON.parse(bikeLocal.value!), authConfig(token));
                    } else if (bikeOnServer === undefined) { //create
                        axios.post(`${bikeUrl}`, JSON.parse(bikeLocal.value!), authConfig(token));
                    } // nothing changed
                }
            }
        }).catch(err => {
            if (err.response) {
                console.log('client received an error response (5xx, 4xx)');
            } else if (err.request) {
                console.log('client never received a response, or request never left');
            } else {
                console.log('anything else');
            }
        })
        return withLogs(result, 'syncItems');
    } catch (error) {
        throw error;
    }
}

interface MessageData {
    type: string;
    payload: {
        bike: BikeProps;
    };
}

const log = getLogger('ws');

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`);
    ws.onopen = () => {
        log('web socket onopen');
        ws.send(JSON.stringify({type: 'authorization', payload: {token}}));
    };
    ws.onclose = function (event) {
        console.log(event);
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