import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import * as SignalR from '@microsoft/signalr';
import Pagination from './Pagination';
import PaginationInput from './PaginationInput';

var root = document.getElementById('root');
const roomName = _roomName;

function User({ user, connection }) {
    const [available, setAvailable] = useState(true);


    const handleClick = () => {
        const url = `/JoinRoomRequest/SendRequest?userId=${user.id}&roomName=${roomName}`;
        axios.get(url)
            .then(response => response.data)
            .then(notification => {
                console.log('invite request sent');
                console.log('notification: ');
                console.log(notification);
                setAvailable(false);
                connection.invoke('SendNotificationToUserId', notification.userId, notification);
            })
            .catch(error => console.error(error.toString()));
    }

    return (
        <div className='black-card user'>
            <div className='card-box'>
                <div className='card-content'>
                    <h2>Invite</h2>
                    <h3 className='user'>{user.userName}</h3>
                    {
                        available ?
                            <a onClick={handleClick}>Invite to room</a> :
                            <a href='#' className='joined'>Invited</a>
                    }
                </div>
            </div>
        </div>
        //<div className="card">
        //    <div className="card-header">
        //        {user.userName}
        //    </div>
        //    <div className="card-body">
        //        {
        //            available ? <a className="btn-dark" onClick={handleClick}>Invite to room</a> : <a className="btn-success">Invited!</a>
        //        }
        //    </div>
        //</div>
    );
}

function UsersContainer() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [connection, setConnection] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [tmpPage, setTmpPage] = useState(1);
    const [usersPerPage, setUsersPerPage] = useState(9);
    const [currentUsers, setCurrentUsers] = useState([]);

    useEffect(() => {
        const url = `/User/GetUsersNotInRoomOrInvited?roomName=${roomName}`;
        setLoading(true);
        axios.get(url)
            .then(response => response.data)
            .then(list => setUsers(list))
            .catch(error => console.error(error.toString()))
            .finally(() => setLoading(false));

        const connection = new SignalR.HubConnectionBuilder()
            .withUrl('/messages')
            .build();

        setConnection(connection);
    }, []);

    useEffect(() => {
        if (connection == null)
            return;

        connection.start()
            .then(() => console.log('Invite users connection established.'))
            .catch(error => console.error(error.toString()));
    }, [connection]);

    useEffect(() => {
        const indexOfLastUser = currentPage * usersPerPage;
        const indexOfFirstUser = indexOfLastUser - usersPerPage;
        setCurrentUsers(users.slice(indexOfFirstUser, indexOfLastUser));
    }, [users]);

    useEffect(() => {
        setTmpPage(currentPage);
        const indexOfLastUser = currentPage * usersPerPage;
        const indexOfFirstUser = indexOfLastUser- usersPerPage;
        setCurrentUsers(users.slice(indexOfFirstUser, indexOfLastUser));
    }, [currentPage]);

    const handleChange = e => {
        setTmpPage(e.target.value);
    }

    const handleClick = () => {
        let input = tmpPage;

        if (isNaN(tmpPage) || isNaN(parseFloat(tmpPage))) {
            setTmpPage(1);
            setCurrentPage(1);
            return;
        }
        else if ((tmpPage - Math.floor(tmpPage)) !== 0) {
            setTmpPage(1);
            setCurrentPage(1);
            return;
        }

        const pagesCnt = Math.ceil(users.length / usersPerPage);
        input = input < 1 ? 1 : input;
        input = input > pagesCnt ? pagesCnt : input;
        setTmpPage(input);
        setCurrentPage(input);
    }

    const paginate = pageNumber => setCurrentPage(pageNumber);

    const nextPage = () => {
        const pagesCnt = Math.ceil(users.length / usersPerPage);
        setCurrentPage(prevPage => prevPage == pagesCnt ? pagesCnt : prevPage + 1);
    }

    const previousPage = () => {
        setCurrentPage(prevPage => prevPage == 1 ? 1 : prevPage - 1);
    }

    return (
        <div>
            <div id='previous-page-mobile' onClick={previousPage}><span>&#8249;</span></div>
            <div id='next-page-mobile' onClick={nextPage}><span>&#8250;</span></div>
            <div className='card-container'>
                {
                    loading ? <span>Loading...</span> :
                        currentUsers.map(user => {
                            return <User key={user.userName} user={user} connection={connection} />
                        })
                }
            </div>
            <Pagination
                loading={loading}
                currentPage={currentPage}
                totalRooms={users.length}
                roomsPerPage={usersPerPage}
                paginate={paginate}
                nextPage={nextPage}
                previousPage={previousPage}
            />
            <PaginationInput
                tmpPage={tmpPage}
                handleChange={handleChange}
                handleClick={handleClick}
            />
        </div>
    );
}

ReactDOM.render(<UsersContainer />, root);