import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

var app = document.getElementById('root');

function PrivateChat({ userId, userName }) {
    const url = `/Chat/DisplayPrivateChat?friendId=${userId}`;

    return (
        <div className="chatroom">
            <div className="chatroom-header">
                {userName}
            </div>
            <div className="chatroom-body">
                <a href={url} className="enter-room-button">Go to chat</a>
            </div>
        </div>
    );
}

function ChatContainer() {
    const [usersList, setUsersList] = useState([]);

    useEffect(() => {
        axios.get('/Chat/GetPrivateChats')
            .then(response => response.data)
            .then(list => { setUsersList(list); console.log(list) })
            .catch(error => console.error(error.toString()));
    }, []);

    return (
        <div>
            <h1>Friends</h1>
            <div id="chat-rooms-container">
                {
                    usersList.map((user) => {
                        return (
                            <PrivateChat key={user.userName} userName={user.userName} userId={user.id} />
                        );
                    })
                }
            </div>
        </div>
    );
}

ReactDOM.render(<ChatContainer />, app);