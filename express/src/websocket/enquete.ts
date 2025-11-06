import { Socket } from 'socket.io';
import shared from '../shared';


import {
    ServerToClientEvents,
    ClientToServerEvents,
    EnqueteType
} from '../types';

const IS_TEST = true;

class EnqueteSocket {

    private Enquete: EnqueteType | null;
    private EnqueteTimer: NodeJS.Timeout | null;

    constructor() {
        this.Enquete = null;
        this.EnqueteTimer = null;
    }

    public socketEvents(socket : Socket<ClientToServerEvents, ServerToClientEvents>) {
        socket.on('createEnquete', this.createEnquete.bind(this, socket));
        socket.on('selectEnquete', this.selectEnquete.bind(this, socket));
        socket.on('endEnquete', this.endEnquete.bind(this, socket));
    }

    disconnect(socket : Socket<ClientToServerEvents, ServerToClientEvents>){
        if (this.EnqueteTimer && this.Enquete && this.Enquete.id === socket.id) {
            clearInterval(this.EnqueteTimer);
            this.EnqueteTimer = null;
            this.Enquete = null;
        }
    }

    private createEnquete : ClientToServerEvents['createEnquete']  = (socket, data, callback) => {
        try {

            console.log(shared.online_users);

            if (this.Enquete) throw new Error('すでにアンケートが存在します。');

            const initialTime = 10 * 1000;
    
            this.Enquete = {
                id: socket.id,
                detail: data.detail,
                answers: data.answers,
                status: 'active',
            };
    
            let remainingTime = initialTime;
            this.EnqueteTimer = setInterval(() => {
                remainingTime -= 1000;
    
                if (remainingTime <= 0) {
                    clearInterval(this.EnqueteTimer);
                    this.EnqueteTimer = null;
    
                    if (!this.Enquete) {
                        clearInterval(this.EnqueteTimer);
                        this.EnqueteTimer = null;
                        throw new Error('enqueteTimeUpdate中。アンケートが存在しません。');
                    }
    
                    this.Enquete.status = 'end';
                    shared.io.emit('endEnquete', this.Enquete);
                    
                    this.Enquete = null;
                    clearInterval(this.EnqueteTimer);
                    this.EnqueteTimer = null;
                    return;
                }
    
                shared.io.emit('enqueteTimeUpdate', remainingTime);
            }, 1000);
    
            shared.io.emit('createEnquete', this.Enquete);

            callback({ status: 'success', message: 'アンケートの作成成功' });
            
        } catch (error) {
            callback({ status: 'error', message: error.message });
        }
    }

    private selectEnquete : ClientToServerEvents['selectEnquete'] = (socket, answerId, callback) => {
        try {
            if (!this.Enquete) throw new Error('アンケートが存在しません。');

            const answerIndex = this.Enquete.answers.findIndex(answer => answer.id === answerId);
            
            if (answerIndex === -1) throw new Error('無効な回答が選択されました。');

            this.Enquete.answers[answerIndex].count += 1;
            shared.io.emit('selectEnquete', this.Enquete);

            callback({ status: 'success', message: '回答が選択されました。' });
        } catch (error) {
            callback({ status: 'error', message: error.message });
        }
    }

    private endEnquete :ClientToServerEvents['endEnquete'] = (socket, id, callback) =>{
        try {
            if (this.EnqueteTimer) {
                clearInterval(this.EnqueteTimer);
                this.EnqueteTimer = null;
            }

            if (!this.Enquete) throw new Error('アンケートが存在しません。');

            this.Enquete = null;
            shared.io.emit('endEnquete', this.Enquete);

            callback({ status: 'success', message: 'アンケートが正常に終了しました' });
        } catch (error) {
            callback({ status: 'error', message: error.message });
        }
    }

}

export default EnqueteSocket;