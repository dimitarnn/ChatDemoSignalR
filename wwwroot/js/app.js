import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import axios from 'axios';
import Pagination from './Pagination';
import PaginationInput from './PaginationInput';

var app = document.getElementById('root');

function Test() {
    const [loading, setLoading] = useState(false);
    const [rooms, setRooms] = useState([]);
    const [roomsPerPage, setRoomsPerPage] = useState(9);
    const [currentPage, setCurrentPage] = useState(1);
    const [tmpPage, setTmpPage] = useState(1);

    useEffect(() => {
        const url = '/Chat/GetPublicRooms';
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
            <div id='previous-page-mobile' onClick={previousPage}><span>&#8249;</span></div>
            <div id='next-page-mobile' onClick={nextPage}><span>&#8250;</span></div>
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
            <PaginationInput tmpPage={tmpPage} handleChange={handleChange} handleClick={handleClick} />
        </div>
    );
}

function ChatRoom({ room }) {
    const url = `/Chat/DisplayChatRoom?roomName=${room.roomName}`;

    return (
        <div className='black-card'>
            <div className='card-box'>
                <div className='card-content'>
                    <h2>Room</h2>
                    <h3>{room.roomName}</h3>
                    <p>{room.description}</p>
                    <a href={url}>Enter</a>
                </div>
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
                        return <ChatRoom key={room.roomName} room={room} />
                    })
                }
            </div>
        </div>
    );
}

ReactDOM.render(<Test />, app);