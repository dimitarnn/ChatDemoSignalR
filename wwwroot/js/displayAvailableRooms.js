﻿import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import Pagination from './Pagination';
import PaginationInput from './PaginationInput';
import Alert from './Alert';

var root = document.getElementById('root');

function ChatRoom({ room }) {
    const defaultErrorMessage = 'An error occurred!';
    const url = `/Chat/JoinRoom?roomName=${room.roomName}`;
    const [joined, setJoined] = useState(false);
    const [serverError, setServerError] = useState(false);
    const [serverErrorMessages, setServerErrorMessages] = useState([]);

    const handleClick = () => {
        setServerError(false);
        axios.post(url)
            .then(() => {
                setJoined(true);
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
        setJoined(true);
    }

    return (
        <div className='black-card'>
            <div className='card-box'>
                <div className='card-content'>
                    <h2>Room</h2>
                    <h3>{room.roomName}</h3>
                    <p>{room.description}</p>
                    {
                        serverError ?
                            serverErrorMessages.map((error, step) => <Alert key={step} type='error' message={error} />) :
                            joined ?
                                <a href='#' className='joined'>Joined!</a> :
                                <a onClick={handleClick}>Join</a>
                    }
                </div>
            </div>
        </div>
    );
}

function ChatRoomsContainer() {
    const defaultErrorMessage = 'An error occurred!';
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [tmpPage, setTmpPage] = useState(1);
    const [roomsPerPage, setRoomsPerPage] = useState(9);
    const [currentRooms, setCurrentRooms] = useState([]);
    const [serverError, setServerError] = useState(false);
    const [serverErrorMessages, setServerErrorMessages] = useState([]);

    useEffect(() => {
        const url = '/Chat/GetAvailableRooms';
        setLoading(true);
        setServerError(false);
        axios.get(url)
            .then(response => response.data)
            .then(list => {
                setRooms(list);
            })
            .catch(error => {
                setServerError(true);
                let errorMessage = defaultErrorMessage;
                if (error.response && error.response.data.length !== 0) {
                    errorMessage = error.response.data;
                }
                setServerErrorMessages(prev => [...prev, errorMessage]);
                console.error(error.toString())
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const indexOfLastRoom = currentPage * roomsPerPage;
        const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
        setCurrentRooms(rooms.slice(indexOfFirstRoom, indexOfLastRoom));
    }, [rooms]);

    useEffect(() => {
        const indexOfLastRoom = currentPage * roomsPerPage;
        const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
        setCurrentRooms(rooms.slice(indexOfFirstRoom, indexOfLastRoom));
    }, [currentPage]);

    useEffect(() => {
        setTmpPage(currentPage);
    }, [currentPage]);

    const handleChange = e => {
        setTmpPage(e.target.value);
    }

    const handleClick = () => {
        let input = tmpPage;

        if (isNaN(tmpPage) || isNaN(parseFloat(tmpPage))) {
            setCurrentPage(1);
            setTmpPage(1);
            return;
        }
        else if ((tmpPage - Math.floor(tmpPage)) !== 0) {
            setCurrentPage(1);
            setTmpPage(1);
            return;
        }

        const pagesCnt = Math.ceil(rooms.length / roomsPerPage);
        input = input < 1 ? 1 : input;
        input = input > pagesCnt ? pagesCnt : input;
        setTmpPage(input);
        setCurrentPage(input);
    }

    const paginate = pageNumber => setCurrentPage(pageNumber);

    const nextPage = () => {
        const pagesCnt = Math.ceil(rooms.length / roomsPerPage);
        setCurrentPage(prevPage => prevPage == pagesCnt ? pagesCnt : prevPage + 1);
    }

    const previousPage = () => {
        setCurrentPage(prevPage => prevPage == 1 ? 1 : prevPage - 1);
    }

    if (serverError) {
        return (
            <div className='center-div'>
                {
                    serverErrorMessages.map((error, step) => <Alert key={step} type='error' message={error} />)
                }
                <Alert type='error' message='Please refresh the page and try again!' />
            </div>
        );
    }
    return (
        <div id='contents'>
            <div id='previous-page-mobile' onClick={previousPage}><span>&#8249;</span></div>
            <div id='next-page-mobile' onClick={nextPage}><span>&#8250;</span></div>
            <div id='chat-rooms-container'>
                {
                    loading ? <span>Loading...</span> :
                    currentRooms.map(room => {
                        return <ChatRoom key={room.roomName} room={room} />
                    })
                }
            </div>
            <Pagination
                loading={loading}
                currentPage={currentPage}
                totalRooms={rooms.length}
                roomsPerPage={roomsPerPage}
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

ReactDOM.render(<ChatRoomsContainer />, root);