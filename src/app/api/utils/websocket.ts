// client/utils/socket.js
import { io } from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
    transports: ['websocket'], // 웹소켓 전송 방식 사용
});

export default socket;