import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

var app = document.getElementById('root');

function Request({ request }) {
    const [state, setState] = useState('');

    const acceptRequest = () => {
        const addFriendUrl = `/User/AddFriend?friendId=${request.senderId}`;
        const acceptRequestUrl = `/FriendRequest/AcceptRequest?id=${request.id}`;
        const createRoomUrl = `/Chat/CreatePrivateRoom?user1Id=${request.userId}&user2Id=${request.senderId}`;

        axios.post(addFriendUrl)
            .then(() => {

                axios.post(createRoomUrl)
                    .then(() => {
                        console.log('private room created');
                    })
                    .catch(error => console.error(error.toString()));

                axios.post(acceptRequestUrl)
                    .then(() => {
                        console.log('request accepted: ');
                        console.log(request);
                        setState('ACCEPTED');
                    })
                    .catch(error => console.error(error.toString()));
            })
            .catch(error => console.error(error.toString()));
    }

    const declineRequest = () => {
        const url = `/FriendRequest/DeclineRequest?id=${request.id}`;
        axios.post(url)
            .then(() => {
                console.log('request declined: ');
                console.log(request);
                setState('DECLINED');
            })
            .catch(error => console.error(error.toString()));
    }

    return (
        <div className="card">
            <div className="card-header">
                From: {request.senderName}
            </div>
            <div className="card-body">
                {
                    state == '' ? <a className="btn-accept" onClick={acceptRequest}>Accept</a> : null
                }
                {
                    state == '' ? <a className="btn-decline" onClick={declineRequest}>Decline</a> : null
                }
                {
                    state == 'ACCEPTED' ? <a className="btn-success">Request accepted!</a> : null
                }
                {
                    state == 'DECLINED' ? <a className="btn-dark">Request declined!</a> : null
                }
            </div>
        </div>
    );
}

function RequestsContainer() {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        const url = '/FriendRequest/GetPending';
        console.log('component mounted');
        axios.get(url)
            .then(response => {
                console.log(response);
                return response.data;
            })
            .then(list => {
                console.log('list items: ');
                console.log(list);
                setRequests(list);
            })
            .catch(error => console.error(error.toString()));
    }, []);

    return (
        <div className="card-container">
            {
                requests.map(request => {
                    return <Request key={request.senderId} request={request} />
                })
            }
        </div>
    );

}

ReactDOM.render(<RequestsContainer />, app);