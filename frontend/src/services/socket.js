import{io} from "socket.io-client";

const SOCKET_URL="http://10.223.5.115:5000";

export const socket=io(SOCKET_URL,{
    autoConnect:true,
    reconnectionAttempts:5,
    reconnectionDelay:1000,
});