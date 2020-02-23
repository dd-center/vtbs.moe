"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const got_1 = __importDefault(require("got"));
let vdb;
let vdbTable;
let vtbs;
let io;
const vtb2Table = (vdb) => Object.fromEntries(vdb.vtbs.map(v => [v.uuid, v]));
const vtb2moe = (vdb) => vdb.vtbs.flatMap(({ accounts, uuid }) => accounts
    .filter(({ platform }) => platform === 'bilibili')
    .map(({ id }) => {
    return {
        mid: Number(id),
        uuid,
    };
}))
    .filter((_, index) => {
    if (process.env.MOCK) {
        return index < 5;
    }
    else {
        return true;
    }
});
const update = async () => {
    const body = await got_1.default('https://vdb.vtbs.moe/json/list.json').json().catch(console.error);
    if (body) {
        console.log('vdb update');
        vdb = body;
        vdbTable = vtb2Table(body);
        const moe = vtb2moe(body);
        if (vtbs && vtbs.length !== moe.length) {
            if (io) {
                io.emit('vtbs', moe);
                io.emit('log', 'vdb Change');
            }
            console.log('vdb Change');
        }
        vtbs = moe;
        return { moe, vdb, vdbTable };
    }
    else {
        console.error('vdb error');
        return update();
    }
};
const get = async () => {
    if (vtbs) {
        return vtbs;
    }
    else {
        return (await update()).moe;
    }
};
const getVdbTable = async () => {
    if (vdbTable) {
        return vdbTable;
    }
    else {
        return (await update()).vdbTable;
    }
};
setInterval(update, 1000 * 60);
const bind = (server) => {
    io = server;
};
module.exports = {
    update,
    get,
    bind,
    getVdbTable,
};
