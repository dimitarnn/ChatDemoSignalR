import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import axios from 'axios';

var target = document.getElementById('root');

function Input({ addRoom }) {
    const [roomName, setRoomName] = useState('');

    const handleClick = e => {
        e.preventDefault();
        const url = `/Chat/AddChatRoom`;

        const data = { roomName: roomName };
        //console.log(data);

        axios.post(url, data)
            .then(response => {
                return response.data
            })
            .then(newRoom => {
                addRoom(newRoom);
                setRoomName('');
            })
            .catch(error => {
                console.log(error);
            })
    }

    return (
        <div id="form-container">
            <div id="create-room-form">
                <h2>Create a new room!</h2>
                <div>
                    <input
                        name="roomName"
                        type="text"
                        placeholder="Your room"
                        value={roomName}
                        onChange={e => { setRoomName(e.target.value) }}
                    />
                    <button id="create-room-button" type="submit" onClick={handleClick}>Submit</button>
                </div>
            </div>
        </div>
    )
}

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

function ChatRoomsContainer() {
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        const url = '/Chat/GetChatRooms';
        console.log('Fetching Rooms from database');

        axios(url)
            .then(response => {
                return response.data;
            })
            .then(data => {
                setRooms(data);
            })
            .catch(error => {
                console.log(error);
            });
    }, [])

    const addRoom = room => {
        setRooms([...rooms, room]);
    }

    return (
        <div id="contents">
            <Input addRoom={addRoom} />
            <div id="chat-rooms-container">
                {
                    rooms.map(room => {
                        return <ChatRoom key={room.roomName} roomName={room.roomName} />
                    })
                }
            </div>
        </div>
    )
}

ReactDOM.render(<ChatRoomsContainer />, target);