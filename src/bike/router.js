import Router from 'koa-router';
import bikeStore from './store';
import {broadcast} from "../utils";

let crypto = require('crypto');

export const router = new Router();

router.get('/', async (ctx) => {
    const response = ctx.response;
    const userId = ctx.state.user._id;
    response.body = await bikeStore.find({userId});
    response.status = 200; // ok
});

router.get('/:id', async (ctx) => {
    const userId = ctx.state.user._id;
    const bike = await bikeStore.findOne({_id: ctx.params.id});
    const response = ctx.response;
    if (bike) {
        if (bike.userId === userId) {
            response.body = bike;
            response.status = 200; // ok
        } else {
            response.status = 403; // forbidden
        }
    } else {
        response.status = 404; // not found
    }
});

function uid(len) {
    return crypto.randomBytes(Math.ceil(Math.max(8, len * 2)))
        .toString('base64')
        .replace(/[+\/]/g, '')
        .slice(0, len);
}

async function createId() {
    let tentativeId = uid(16);
    let existentId = await bikeStore.findOne({_id: tentativeId});
    while (existentId) {
        // Try as many times as needed to get an unused _id. As explained in customUtils, the probability of this ever happening is extremely small, so this is O(1)
        tentativeId = uid(16);
        existentId = bikeStore.findOne({_id: tentativeId});
    }
    return tentativeId;
}

const createBike = async (ctx, bike, response) => {
    try {
        const userId = ctx.state.user._id;
        bike.userId = userId;
        bike._id = await createId();
        response.body = await bikeStore.insert(bike);
        response.status = 201; // created
        broadcast(userId, {type: 'created', payload: bike});
    } catch (err) {
        response.body = {message: err.message};
        response.status = 400; // bad request
    }
};

router.post('/', async ctx => await createBike(ctx, ctx.request.body, ctx.response));

router.put('/:id', async (ctx) => {
    const bike = ctx.request.body;
    const id = ctx.params.id;
    const bikeId = bike._id;
    const response = ctx.response;
    if (bikeId && bikeId !== id) {
        response.body = {message: 'Param id and body _id should be the same'};
        response.status = 400; // bad request
        return;
    }
    if (!bikeId) {
        await createBike(ctx, bike, response);
    } else {
        const userId = ctx.state.user._id;
        bike.userId = userId;
        const updatedCount = await bikeStore.update({_id: id}, bike);
        if (updatedCount === 1) {
            response.body = bike;
            response.status = 200; // ok
            broadcast(userId, {type: 'updated', payload: bike});
        } else {
            response.body = {message: 'Resource no longer exists'};
            response.status = 405; // method not allowed
        }
    }
});

router.del('/:id', async (ctx) => {
    const userId = ctx.state.user._id;
    const bike = await bikeStore.findOne({_id: ctx.params.id});
    if (bike && userId !== bike.userId) {
        ctx.response.status = 403; // forbidden
    } else {
        await bikeStore.remove({_id: ctx.params.id});
        broadcast(userId, {type: 'deleted', payload: bike});
        ctx.response.status = 204; // no content
    }
});
