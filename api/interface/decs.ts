declare module 'bili-api';

declare function biliAPI(object: { mid: number; }, targets: ['mid', 'uname', 'roomid', 'sign', 'notice', 'follower', 'guardNum', 'liveStatus', 'online', 'title', 'face', 'topPhoto'], options?: { got: any; }): Promise<{ mid: number; uname: string; roomid: number; sign: string; notice: string; follower: number; guardNum: number; liveStatus: number; online: number; title: string; face: string; topPhoto: string; }>;
