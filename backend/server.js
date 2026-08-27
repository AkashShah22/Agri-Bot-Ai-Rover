const express = require('express');
const http=require('http');
const {Server}=require('socket.io');
const cors=require('cors');

const app=express();
const server=http.createServer(app);

const io=new Server(server,{
    cors:{
        origin:'*',
        methods:['Get','Post']
    }
});
app.use(cors());
app.use(express.json());

//we need too connect socket logger
io.on('connection',(socket)=>{

    console.log(`frontend client connected: ${socket.id}`);
    socket.on('disconnect',()=>{
        console.log(`client disconnected: ${socket.id}`);
    });
});
//now adding routes codes
const syncRouter=require('../routes/sync')(io);
const telemetryRouter=require('../routes/telemetry');

app.use('/api/sync',syncRouter);
app.use('/api/telemetry',telemetryRouter);

const port=5000;
server.listen(port,()=>{
    console.log(`backend server is running on http://localhost:${port}`);
});
