import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

var root = document.getElementById('root');

function ChatRoom({ roomName }) {
    const url = `/Chat/JoinRoom?roomName=${roomName}`;
    const [joined, setJoined] = useState(false);

    const handleClick = () => {
        axios.post(url)
            .then(() => {
                setJoined(true);
            })
            .catch(error => console.error(error.toString()));
        setJoined(true);
    }

    return (
        <div className='chatroom2'>
            <div className='chatroom-header2'>
                {roomName}
            </div>
            <div className='chatroom-body2'>
                {
                    joined ?
                        <a className='btn-joined' href='#'>Joined!</a> :
                        <a className='btn-join' onClick={handleClick}>Join</a>
                }
            </div>
        </div>
    );
}

function ChatRoomsContainer() {
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        const url = '/Chat/GetAvailableRooms';
        axios.get(url)
            .then(response => response.data)
            .then(list => {
                setRooms(list);
            })
            .catch(error => console.error(error.toString()));
    }, []);

    return (
        <div id='contents'>
            <div id='chat-rooms-container'>
                {
                    rooms.map(room => {
                        return <ChatRoom key={room.roomName} roomName={room.roomName} />
                    })
                }
            </div>
        </div>
    );
}

ReactDOM.render(<ChatRoomsContainer />, root);