import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import shared from '../shared';

import EnqueteSocket from './enquete';
import QuizSocket from './quizSocket';

import {
    ServerToClientEvents,
    ClientToServerEvents,
    LoginToRoom,
} from '../types';

const MAX_USERS = 10;

class SocketManager {
    public io: SocketIOServer;
    private EnqueteSocket: EnqueteSocket;
    private QuizSocket: QuizSocket;

    constructor(server : HTTPServer) {
        this.io = new SocketIOServer<ClientToServerEvents>(server, {
            path: '/wss/socket.io',
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        shared.io = this.io;

        this.EnqueteSocket = new EnqueteSocket();
        this.QuizSocket = new QuizSocket();

        this.io.on('connection', this.socketEvents.bind(this));
    }

    private socketEvents(socket: Socket<ClientToServerEvents, ServerToClientEvents>) {
        socket.on('fetchRoomInfo', this.fetchRoomInfo.bind(this, socket));
        socket.on('loginToRoom', this.loginToRoom.bind(this, socket));
        socket.on('moveUserInChatRoom', this.moveUserInChatRoom.bind(this, socket));
        socket.on('exitChatRoom', this.exitChatRoom.bind(this, socket));
        socket.on('addMessagesToChatRoom', this.addMessagesToChatRoom.bind(this, socket)); 
        socket.on('flipUserDirection', this.flipUserDirection.bind(this, socket));
        socket.on('performUserGesture', this.performUserGesture.bind(this, socket));
    
        socket.on('disconnect', () => {
            this.EnqueteSocket.disconnect(socket);
            shared.online_users = shared.online_users.filter(user => user.id !== socket.id);
            socket.broadcast.emit('changeUsersData', shared.online_users);
            socket.broadcast.emit('roomUserDisconnect', shared.online_users.length);
        });

        this.EnqueteSocket.socketEvents(socket);
        this.QuizSocket.socketEvents(socket);
    }
    private fetchRoomInfo : ClientToServerEvents['fetchRoomInfo'] = (socket, _, callback) => {
        try {
            const user_names = shared.online_users.map(user => user.name);
            socket.emit('fetchRoomInfo', { users: user_names, id: socket.id });

            callback({ status: 'success', message: 'ルーム情報を取得しました' });
        } catch (error) {
            callback({ status : 'error', message: error.message });
        }
    }
    private loginToRoom : ClientToServerEvents['loginToRoom'] = (socket,{ id, name, character }, callback) => {
        try {
            const response : LoginToRoom = {
                users: shared.online_users,
                mine: null,
            };
    
            if (shared.online_users.length >= MAX_USERS || socket.id !== id) {
                throw new Error('ルームに参加できません。最大人数に達しています。');
            }
    
            response.mine = {
                id: socket.id,
                name,
                character,
                x: Math.random() * 80 + 10,
                y: 76,
                reflection: false,
                gesture : '',
            };

            shared.online_users.push(response.mine);
    
            socket.emit("loginToRoom", response);
            socket.broadcast.emit('changeUsersData', shared.online_users);
            socket.broadcast.emit('roomUserDisconnect', shared.online_users.length);

            callback({ status: 'success', message: 'ルーム情報を取得しました' });
        } catch (error) {
            callback({ status : 'error', message: error.message });
        }
    }
    private moveUserInChatRoom : ClientToServerEvents['moveUserInChatRoom'] = (socket,{ id, position }, callback) => {
        try {
            const index = shared.online_users.findIndex(user => user.id === id);
    
            if (index !== -1) {
                shared.online_users[index].x = position.x;
                shared.online_users[index].y = position.y;
            }
            socket.broadcast.emit('changeUsersData', shared.online_users);

            callback({ status: 'success', message: 'ユーザーの位置を更新しました' });
        } catch (error) {
            callback({ status : 'error', message: error.message });
        }
    };
    private exitChatRoom : ClientToServerEvents['exitChatRoom'] = (socket,_, callback) => {
        try {
            shared.online_users = shared.online_users.filter(user => user.id !== socket.id);
            socket.broadcast.emit('changeUsersData', shared.online_users);
            socket.broadcast.emit('roomUserDisconnect', shared.online_users.length);

            callback({ status: 'success', message: 'チャットルームを退出しました' });
        } catch (error) {
            callback({ status : 'error', message: error.message });
        }
    }
    private addMessagesToChatRoom : ClientToServerEvents['addMessagesToChatRoom'] = (socket,chats, callback) => {
        try {
            this.io.emit('addMessagesToChatRoom', chats);
            callback({ status: 'success', message: 'メッセージを追加しました' });
        } catch (error) {
            callback({ status : 'error', message: error.message });
        }
    }
    private flipUserDirection : ClientToServerEvents['flipUserDirection'] = (socket,{ id, reflection }, callback) => {
        try {
            const index = shared.online_users.findIndex(user => user.id === id);
            if (index !== -1) {
                shared.online_users[index].reflection = reflection;
            }
            socket.broadcast.emit('changeUsersData', shared.online_users);

            callback({ status: 'success', message: 'ユーザーの方向を変更しました' });
        } catch (error) {
            callback({ status : 'error', message: error.message });
        }
    }
    private performUserGesture : ClientToServerEvents['performUserGesture'] = (socket,{ id, gesture }, callback) => {
        try {
            socket.broadcast.emit('performUserGesture', { id, gesture });
            callback({ status: 'success', message: 'ユーザーのジェスチャーを実行しました' });
        } catch (error) {
            callback({ status : 'error', message: error.message });
        }
    }
}

export default SocketManager;