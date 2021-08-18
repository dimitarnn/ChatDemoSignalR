import React from 'react';
import ReactDOM from 'react-dom';

function ChatRoom({ roomName }) {
    const url = `/Chat/DisplayChatRoom?roomName=${roomName}`;

    return (
        <div className="chatroom">
            <div className="chatroom-header">{roomName}</div>
            <div className="chatroom-body">
                <a href={url} className="enter-room-button">Enter</a>
            </div>
        </div>
    )
}

export default ChatRoom;