import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';


interface User {
    id: string;
    name: string;
    x: number;
    y: number;
    reflection: boolean;
    character: number;
    gesture: string;
}

interface SharedData {
    io: Server | null;
    online_users: User[];
    server: HTTPServer | null;
}

const shared: SharedData = {
    io: null,
    online_users: [],
    server: null
};

export default shared;