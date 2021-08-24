import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import * as SignalR from '@microsoft/signalr';
import Pagination from './Pagination';
import PaginationInput from './PaginationInput';
import Alert from './Alert';

var root = document.getElementById('root');
const defaultErrorMessage = 'An error occurred!';

function JoinRoomRequest({ request, connection }) {
    const [state, setState] = useState('');
    const joinUrl = `/Chat/JoinRoom?roomName=${request.roomName}`;
    const acceptUrl = `/JoinRoomRequest/Accept?id=${request.id}`;
    const declineUrl = `/JoinRoomRequest/Decline?id=${request.id}`;
    const [serverError, setServerError] = useState(false);
    const [serverErrorMessages, setServerErrorMessages] = useState([]);

    useEffect(() => {
        console.log('request:');
        console.log(request);
        console.log('request status:');
        console.log(request.status);
        let nextState = '';
        if (request.status == 1)
            nextState = 'ACCEPTED';
        else if (request.status == 2)
            nextState = 'DECLINED';
        setState(nextState);
    }, [request]);

    const handleAccept = () => {
        axios.post(joinUrl)
            .then(() => {
                axios.post(acceptUrl)
                    .then(response => response.data)
                    .then(notification => {
                        console.log('invite accepted');
                        console.log('notification: ');
                        console.log(notification);
                        setState('ACCEPTED');
                        request.status = 1; // accepted
                        connection.invoke('SendNotificationToUserId', notification.userId, notification);
                    })
                    .catch(error => {
                        setServerError(true);
                        let errorMessage = defaultErrorMessage;
                        if (error.response && error.response.data.length !== 0) {
                            errorMessage = error.response.data;
                        }
                        setServerErrorMessages(prev => [...prev, errorMessage]);
                        console.error(error.toString())
                    });
            })
            .catch(error => {
                setServerError(true);
                let errorMessage = defaultErrorMessage;
                if (error.response && error.response.data.length !== 0) {
                    errorMessage = error.response.data;
                }
                setServerErrorMessages(prev => [...prev, errorMessage]);
                console.error(error.toString())
            });
    }

    const handleDecline = () => {
        axios.post(declineUrl)
            .then(() => {
                setState('DECLINED');
                request.status = 2; // declined
            })
            .catch(error => {
                setServerError(true);
                let errorMessage = defaultErrorMessage;
                if (error.response && error.response.data.length !== 0) {
                    errorMessage = error.response.data;
                }
                setServerErrorMessages(prev => [...prev, errorMessage]);
                console.error(error.toString())
            });
    }

    return (
        <div className='expanding-card user'>
            <div className='card-face card-face1'>
                <div className='card-content'>
                    <h3>{request.roomName}</h3>
                </div>
            </div>
            <div className='card-face card-face2'>
                <div className='card-content'>
                    <p>{request.senderName}:</p>
                    <p>{request.text}</p>
                    {
                        serverError ?
                            <div>
                                {
                                    serverErrorMessages.map((error, step) => <Alert key={step} type='error' message={error} />)
                                }
                            </div> :
                            null
                    }
                    {
                        (state == '' && !serverError) ? <a onClick={handleAccept}>Join</a> : null
                    }
                    {
                        (state == '' && !serverError) ? <a onClick={handleDecline}>Decline</a> : null
                    }
                    {
                        (state == 'ACCEPTED' && !serverError) ? <a className='joined'>Accepted!</a> : null
                    }
                    {
                        (state == 'DECLINED' && !serverError) ? <a className='joined'>Declined!</a> : null
                    }
                </div>
            </div>
        </div>
    );
}

function RequestsContainer() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [connection, setConnection] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [tmpPage, setTmpPage] = useState(1);
    const [currentRequests, setCurrentRequests] = useState([]);
    const [requestsPerPage, setRequestsPerPage] = useState(9);
    const [serverError, setServerError] = useState(false);
    const [serverErrorMessages, setServerErrorMessages] = useState([]);

    useEffect(() => {
        const url = '/JoinRoomRequest/GetJoinRoomRequests';
        setLoading(true);
        axios.get(url)
            .then(response => response.data)
            .then(list => setRequests(list))
            .catch(error => {
                console.error(error.toString());
                setServerError(true);
                let errorMessage = defaultErrorMessage;
                if (error.response && error.response.data.length !== 0) {
                    errorMessage = error.response.data;
                }
                setServerErrorMessages(prev => [...prev, errorMessage]);
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
            .then(() => console.log('Room Request connection established.'))
            .catch(error => {
                setServerError(true);
                let errorMessage = defaultErrorMessage;
                if (error.response && error.response.data.length !== 0) {
                    errorMessage = error.response.data;
                }
                setServerErrorMessages(prev => [...prev, errorMessage]);
                console.error(error.toString())
            });
    }, [connection]);

    useEffect(() => {
        const indexOfLastRequest = currentPage * requestsPerPage;
        const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
        setCurrentRequests(requests.slice(indexOfFirstRequest, indexOfLastRequest));
    }, [requests]);

    useEffect(() => {
        setTmpPage(currentPage);
        const indexOfLastRequest = currentPage * requestsPerPage;
        const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
        setCurrentRequests(requests.slice(indexOfFirstRequest, indexOfLastRequest));
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

        const pagesCnt = Math.ceil(requests.length / requestsPerPage);
        input = input < 1 ? 1 : input;
        input = input > pagesCnt ? pagesCnt : input;
        setTmpPage(input);
        setCurrentPage(input);
    }

    const paginate = pageNumber => setCurrentPage(pageNumber);

    const nextPage = () => {
        const pagesCnt = Math.ceil(requests.length / requestsPerPage);
        setCurrentPage(prevPage => prevPage == pagesCnt ? pagesCnt : prevPage + 1);
    }

    const previousPage = () => {
        setCurrentPage(prevPage => prevPage == 1 ? 1 : prevPage - 1);
    }

    return (
        <div>
            {
                serverError ?
                    <div>
                        {
                            serverErrorMessages.map((error, step) => <Alert key={step} type='error' message='error' />)
                        }
                        <Alert type='error' message='Please reload the page and try again!' />
                    </div> :
                    null
            }
            <div id='previous-page-mobile' onClick={previousPage}><span>&#8249;</span></div>
            <div id='next-page-mobile' onClick={nextPage}><span>&#8250;</span></div>
            <div className='card-container'>
                {
                    loading ? <span>Loading...</span> :
                        currentRequests.map(request => {
                            return <JoinRoomRequest
                                connection={connection}
                                key={request.roomName}
                                request={request}
                            />
                        })
                }
            </div>
            <Pagination
                loading={loading}
                currentPage={currentPage}
                totalRooms={requests.length}
                roomsPerPage={requestsPerPage}
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

ReactDOM.render(<RequestsContainer />, root);
