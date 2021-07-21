import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

var app = document.getElementById('root');

function PrivateChat({ userId, userName }) {
    const url = `/Chat/DisplayPrivateChat?frienId=${userId}`;

    return (
        <div className="card">
            <div className="card-header">
                {userName}
            </div>
            <div className="card-body">
                <a href={url} className="btn btn-primary">Go to chat</a>
            </div>
        </div>
    );
}

function ChatContainer() {
    const [usersList, setUsersList] = useState([]);

    useEffect(() => {
        axios.get('/Chat/GetAllUsers')
            .then(response => response.data)
            .then(list => setUsersList(list))
            .catch(error => console.error(error.toString()));
    }, []);

    return (
        <div>
            {
                usersList.map(user => {
                    return (
                        <PrivateChat key={user.Id} userName={user.userName} userId={user.id} />
                    );
                })
            }
        </div>
    );
}

ReactDOM.render(<ChatContainer />, app);