import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import * as SignalR from '@microsoft/signalr';
import Pagination from './Pagination';
import PaginationInput from './PaginationInput';
import Alert from './Alert';

var app = document.getElementById('root');
const defaultErrorMessage = 'An error occurred!';

function User({ user, removeUser, connection }) {
    const [available, setAvailable] = useState(true);
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState(false);
    const [serverErrorMessages, setServerErrorMessages] = useState([]);

    const handleClick = () => {
        const url = `/FriendRequest/SendFriendRequest?userId=${user.id}`;
        setLoading(true);
        axios.get(url)
            .then(response => response.data)
            .then(notification => {
                console.log('freind request sent');
                setAvailable(false);
                if (notification != null &&
                    notification != undefined &&
                    notification.userId != null &&
                    notification.userId != undefined
                )
                    connection.invoke('SendNotificationToUserId', notification.userId, notification);
            })
            .catch(error => {
                setServerError(true);
                let errorMessage = defaultErrorMessage;
                if (error.response && error.response.data.length !== 0) {
                    errorMessage = error.response.data;
                }
                setServerErrorMessages(prev => [...prev, errorMessage]);
                console.error(error.toString());
            })
            .finally(() => setLoading(false));
    }

    return (
        <div className='black-card user'>
            <div className='card-box'>
                <div className='card-content'>
                    <h2>Add</h2>
                    <h3>{user.userName}</h3>
                    {
                        serverError ?
                            <div>
                                {
                                    serverErrorMessages.map((error, step) => <Alert key={step} type='error' message={error} />)
                                }
                            </div> :
                            (
                                available ?
                                    <a onClick={handleClick}>Send Friend Request</a> :
                                    <a href='#' className='joined'>Request Sent!</a>
                            )
                    }
                </div>
            </div>
        </div>
    );
}

function UsersContainer() {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [connection, setConnection] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [tmpPage, setTmpPage] = useState(1);
    const [usersPerPage, setUsersPerPage] = useState(9);
    const [currentUsers, setCurrentUsers] = useState([]);
    const [serverError, setServerError] = useState(false);
    const [serverErrorMessages, setServerErrorMessages] = useState([]);

    const removeUser = user => {
        let usersArray = [...users];
        usersArray.splice(usersArray.indesOf(user));
        setUsers(usersArray);
    }

    useEffect(() => {
        const indexOfLastUser = currentPage * usersPerPage;
        const indexOfFirstUser = indexOfLastUser - usersPerPage;
        setCurrentUsers(users.slice(indexOfFirstUser, indexOfLastUser));
    }, [users]);

    useEffect(() => {
        setTmpPage(currentPage);
        const indexOfLastUser = currentPage * usersPerPage;
        const indexOfFirstUser = indexOfLastUser - usersPerPage;
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

    useEffect(() => {
        const url = '/FriendRequest/GetAvailable';
        setLoading(true);
        axios.get(url)
            .then(response => response.data)
            .then(list => {
                console.log('list received: ');
                console.log(list);
                setUsers(list);
            })
            .catch(error => {
                setServerError(true);
                let errorMessage = defaultErrorMessage;
                if (error.response && error.response.data.length !== 0) {
                    errorMessage = error.response.data;
                }
                setServerErrorMessages(prev => [...prev, errorMessage]);
                console.error(error.toString());
            })
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
            .then(() => console.log('Friends list connection established.'))
            .catch(error => {
                setServerError(true);
                let errorMessage = defaultErrorMessage;
                if (error.response && error.response.data.length !== 0) {
                    errorMessage = error.response.data;
                }
                setServerErrorMessages(prev => [...prev, errorMessage]);
                console.error(error.toString());
            });
    }, [connection]);

    return (
        <div className="contents">
            {
                serverError ?
                    <div>
                        {
                            serverErrorMessages.map((error, step) => <Alert key={step} type='error' message={error} />)
                        }
                        <Alert type='error' message='Please reload the page and try again!' />
                    </div> :
                    null
            }
            <div id='previous-page-mobile' onClick={previousPage}><span>&#8249;</span></div>
            <div id='next-page-mobile' onClick={nextPage}><span>&#8250;</span></div>
            <div className="card-container">
                {
                    loading ? <span>Loading...</span> :
                    currentUsers.map(user => {
                        //console.log(user);
                        return (<User key={user.userName} user={user} removeUser={removeUser} connection={connection} />)
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

ReactDOM.render(<UsersContainer /> , app);