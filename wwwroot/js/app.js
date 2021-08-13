import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import axios from 'axios';

var app = document.getElementById('root');

function Test() {
    const [loading, setLoading] = useState(false);
    const [rooms, setRooms] = useState([]);
    const [roomsPerPage, setRoomsPerPage] = useState(9);
    const [currentPage, setCurrentPage] = useState(1);
    const [tmpPage, setTmpPage] = useState(1);

    useEffect(() => {
        const url = '/Chat/GetChatRooms';
        setLoading(true);
        axios.get(url)
            .then(response => response.data)
            .then(list => setRooms(list))
            .catch(error => console.error(error.toString()))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        setTmpPage(currentPage);
    }, [currentPage]);

    const handleChange = e => {
        setTmpPage(e.target.value);
    }

    const handleClick = () => {
        let input = tmpPage;

        if (isNaN(tmpPage) || isNaN(parseFloat(tmpPage))) {   // is NaN
            setTmpPage(1);
            setCurrentPage(1);
            return;
        }
        else if ((tmpPage - Math.floor(tmpPage)) !== 0) { // is not whole
            setTmpPage(1);
            setCurrentPage(1);
            return;
        }

        const pages = Math.ceil(rooms.length / roomsPerPage);
        input = input < 1 ? 1 : input;
        input = input > pages ? pages : input;
        setTmpPage(input);
        setCurrentPage(input);
    }

    const paginate = pageNumber => setCurrentPage(pageNumber);

    const nextPage = () => {
        const pages = Math.ceil(rooms.length / roomsPerPage);
        setCurrentPage(prevPage => prevPage == pages ? prevPage : prevPage + 1);
    }
    const previousPage = () => {
        setCurrentPage(prevPage => prevPage == 1 ? 1 : prevPage - 1);
    }

    const indexOfLastRoom = currentPage * roomsPerPage;
    const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
    const currentRooms = rooms.slice(indexOfFirstRoom, indexOfLastRoom);

    return (
        <div>
            <div>Hello</div>
            <Rooms loading={loading} rooms={currentRooms} />
            <Pagination
                loading={loading}
                totalRooms={rooms.length}
                roomsPerPage={roomsPerPage}
                paginate={paginate}
                nextPage={nextPage}
                previousPage={previousPage}
                currentPage={currentPage}
            />
                <div className='page-form'>
                    <input className='page-number-input' value={tmpPage} onChange={handleChange} />
                    <button className='page-number-button' onClick={handleClick}>Go to</button>
                </div>
        </div>
    );
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

function Rooms({ rooms, loading }) {
    if (loading) {
        return (<div>Loading...</div>);
    }

    return (
        <div className='contents'>
            <div id="chat-rooms-container">
                {
                    rooms.map(room => {
                        return <ChatRoom key={room.roomName} roomName={room.roomName} />
                    })
                }
            </div>
        </div>
    );
}

function Pagination({ loading, currentPage, totalRooms, roomsPerPage, paginate, nextPage, previousPage }) {
    if (loading)
        return (<div>Loading...</div>);

    useEffect(() => {
        console.log('----------------------pagination mounted');
    }, []);

    const [displayCnt, setDisplayCnt] = useState(5);
    const [pageNumbers, setPageNumbers] = useState([]);
    const [displayNumbers, setDisplayNumbers] = useState([]);

    useEffect(() => {
        console.log('mounted');
        let arr = [];
        console.log('totalRooms: ' + totalRooms);
        console.log('roomsPerPage: ' + roomsPerPage);
        for (let i = 1; i <= Math.ceil(totalRooms / roomsPerPage); ++i) {
            arr.push(i);
        }

        setPageNumbers(arr);
        console.log(arr);

        console.log('currentPage: ' + currentPage);
        // currentPage is 1-based
        const totalPages = Math.ceil(totalRooms / roomsPerPage);
        console.log('totalPages: ' + totalPages);
        const pageIdx = Math.ceil(currentPage / displayCnt); // 1-based
        const pageFirst = (pageIdx - 1) * displayCnt; // 0-based
        const pageLast = pageFirst + displayCnt - 1; // 0-based
        const startIdx = Math.min(Math.max(0, currentPage - 1 - 2), Math.max(0, totalPages - displayCnt));
        const endIdx = startIdx + displayCnt;

        console.log('pageFirst: ' + pageFirst);
        console.log('pageLast: ' + pageLast);
        console.log('startIdx: ' + startIdx);

        setDisplayNumbers(arr.slice(startIdx, endIdx));
        console.log(arr.slice(startIdx, endIdx));
    }, [currentPage]);

    return (
        <ul className='pagination'>
            <li key={'previous'} className='pagination-item'>
                <a onClick={previousPage}>Previous Page</a>
            </li>
            {
                displayNumbers.map(number => {
                    return (
                        <li key={number} className={'pagination-item' + (number == currentPage ? ' current' : '')}>
                            <a onClick={() => paginate(number)}>{number}</a>
                        </li>
                    );
                })
            }
            <li key={'next'} className='pagination-item'>
                <a onClick={nextPage}>Next Page</a>
            </li>
        </ul>
    );
}

ReactDOM.render(<Test />, app);