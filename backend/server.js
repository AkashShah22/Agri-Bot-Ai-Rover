const express = require('express');
const http=require('http');
const {Server}=require('socket.io');
const cors=require('cors');


const app=express();
const server=http.createServer(app);
const PORT = process.env.PORT || 5000;

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
const syncRouter=require('./routes/sync')(io);
const telemetryRouter=require('./routes/telemetry');
const analyzeRouter = require('./routes/analyze');
const detectionsRouter = require('./routes/detections');


app.use('/api/sync',syncRouter);
app.use('/api/telemetry',telemetryRouter);
app.use('/api/analyze', analyzeRouter);
app.use('/api/detections', detectionsRouter);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`backend server is running on port ${PORT}`);
});