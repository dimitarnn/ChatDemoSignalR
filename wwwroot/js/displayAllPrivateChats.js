import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import Pagination from './Pagination';
import PaginationInput from './PaginationInput';
import Alert from './Alert';

var app = document.getElementById('root');

function PrivateChat({ userId, userName }) {
    const url = `/Chat/DisplayPrivateChat?friendId=${userId}`;

    return (
        <div className='black-card user'>
            <div className='card-box'>
                <div className='card-content'>
                    <h2>Chat</h2>
                    <h3 className='user'>{userName}</h3>
                    <a href={url}>Start chatting!</a>
                </div>
            </div>
        </div>
        //<div className="chatroom">
        //    <div className="chatroom-header">
        //        {userName}
        //    </div>
        //    <div className="chatroom-body">
        //        <a href={url} className="enter-room-button">Go to chat</a>
        //    </div>
        //</div>
    );
}

function ChatContainer() {
    const defaultErrorMessage = 'An error occurred!';
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [tmpPage, setTmpPage] = useState(1);
    const [roomsPerPage, setRoomsPerPage] = useState(9);
    const [currentRooms, setCurrentRooms] = useState([]);
    const [serverError, setServerError] = useState(false);
    const [serverErrorMessages, setServerErrorMessages] = useState([]);

    useEffect(() => {
        setLoading(true);
        setServerError(false);
        axios.get('/Chat/GetPrivateChats')
            .then(response => response.data)
            .then(list => { setUsersList(list); console.log(list) })
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
    }, []);

    useEffect(() => {
        const indexOfLastRoom = currentPage * roomsPerPage;
        const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
        setCurrentRooms(usersList.slice(indexOfFirstRoom, indexOfLastRoom));
    }, [usersList]);

    useEffect(() => {
        const indexOfLastRoom = currentPage * roomsPerPage;
        const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
        setCurrentRooms(usersList.slice(indexOfFirstRoom, indexOfLastRoom));
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

        const pagesCnt = Math.ceil(usersList.length / roomsPerPage);
        input = input < 1 ? 1 : input;
        input = input > pagesCnt ? pagesCnt : input;
        setTmpPage(input);
        setCurrentPage(input);
    }

    const paginate = pageNumber => setCurrentPage(pageNumber);

    const nextPage = () => {
        const pagesCnt = Math.ceil(usersList.length / roomsPerPage);
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
        <div>
            <div id='previous-page-mobile' onClick={previousPage}><span>&#8249;</span></div>
            <div id='next-page-mobile' onClick={nextPage}><span>&#8250;</span></div>
            <h1>Friends</h1>
            <div id="chat-rooms-container">
                {
                    loading ? <span>Loading...</span> :
                    currentRooms.map((user) => {
                        return (
                            <PrivateChat key={user.userName} userName={user.userName} userId={user.id} />
                        );
                    })
                }
            </div>
            <Pagination
                loading={loading}
                currentPage={currentPage}
                totalRooms={usersList.length}
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

ReactDOM.render(<ChatContainer />, app);