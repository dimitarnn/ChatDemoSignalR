import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

var app = document.getElementById('root');

function User({ user, removeUser }) {
    const [available, setAvailable] = useState(true);

    const handleClick = () => {
        const url = `/FriendRequest/SendFriendRequest?userId=${user.id}`;
        axios.get(url)
            .then(() => {
                console.log('freind request sent');
                setAvailable(false);
            })
            .catch(error => console.error(error.toString()));
    }

    return (
        <div className="card">
            <div className="card-header">
                {user.userName}
            </div>
            <div className="card-body">
                {
                    available ? <a className="btn-dark" onClick={handleClick}>Send Friend Request</a> : <a className="btn-success">Request Sent!</a>
                }
            </div>
        </div>
    );
}

function UsersContainer() {
    const [users, setUsers] = useState([]);

    const removeUser = user => {
        let usersArray = [...users];
        usersArray.splice(usersArray.indesOf(user));
        setUsers(usersArray);
    }

    useEffect(() => {
        const url = '/FriendRequest/GetAvailable';
        axios.get(url)
            .then(response => response.data)
            .then(list => {
                console.log('list received: ');
                console.log(list);
                setUsers(list);
            })
            .catch(error => console.error(error.toString()));
    }, []);

    return (
        <div className="contents">
            <div className="card-container">
                {
                    users.map(user => {
                        console.log(user);
                        return (<User key={user.userName} user={user} removeUser={removeUser} />)
                    })
                }
            </div>
        </div>
    );
}

ReactDOM.render(<UsersContainer /> , app);