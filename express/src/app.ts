import express from 'express';
import { createServer } from 'http';
import cors from 'cors';


import router from './router';
import SocketManager from './websocket/socket';

const PORT = 4000;

const app = express();
const server = createServer(app);

app.use(cors());
app.use(router);

new SocketManager(server);

server.listen(PORT, () => {
    console.log(`server started on port ${PORT}`);
});