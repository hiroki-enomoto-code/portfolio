"use client";
import { io, Socket } from "socket.io-client";

declare global {
    var __socket__: Socket | undefined;
}

const URL = 'https://switcha.local';
//const URL = 'https://switcha';

export function getSocket(): Socket {
    if (process.env.NODE_ENV === "development") {
        if (!globalThis.__socket__) {
            globalThis.__socket__ = io(URL, {
                path: '/wss/socket.io',
                autoConnect: false,
            });
            globalThis.__socket__.connect();
        }
        return globalThis.__socket__;
    }

    // 本番はモジュールスコープでシングルトン
    let _socket = (getSocket as any)._instance as Socket | undefined;
    if (!_socket) {
        _socket = io(URL, {
            path: '/wss/socket.io',
            autoConnect: false,
        });
        _socket.connect();
        (getSocket as any)._instance = _socket;
    }
    return _socket;
}
