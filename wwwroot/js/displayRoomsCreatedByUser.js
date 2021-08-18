import React, { useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import Pagination from './Pagination';
import PaginationInput from './PaginationInput';

var root = document.getElementById('root');

function ChatRoom({ room }) {
    const url1 = `/User/GetUsersNotInRoom?roomName=${room.roomName}`;
    const url = `/User/InviteUsers?roomName=${room.roomName}`;

    return (
        <div className='black-card'>
            <div className='card-box'>
                <div className='card-content'>
                    <h2>Room</h2>
                    <h3>{room.roomName}</h3>
                    <p>{room.description}</p>
                    <a href={url}>Invite users</a>
                </div>
            </div>
        </div>
        //<div className="chatroom">
        //    <div className="chatroom-header">{roomName}</div>
        //    <div className="chatroom-body">
        //        <a href={url} className="btn-dark">Invide Users</a>
        //    </div>
        //</div>
    )
}

function ChatRoomsContainer() {
    const [loading, setLoading] = useState(false);
    const [rooms, setRooms] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [tmpPage, setTmpPage] = useState(1);
    const [roomsPerPage, setRoomsPerPage] = useState(9);
    const [currentRooms, setCurrentRooms] = useState([]);

    useEffect(() => {
        const url = '/Chat/GetRoomsCreatedBy';
        setLoading(true);

        axios.get(url)
            .then(response => response.data)
            .then(list => setRooms(list))
            .catch(error => console.error(error.toString()))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const indexOfLastRoom = currentPage * roomsPerPage;
        const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
        setCurrentRooms(rooms.slice(indexOfFirstRoom, indexOfLastRoom));
    }, [rooms]);

    useEffect(() => {
        setTmpPage(currentPage);
        const indexOfLastRoom = currentPage * roomsPerPage;
        const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
        setCurrentRooms(rooms.slice(indexOfFirstRoom, indexOfLastRoom));
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

    return (
        <div>
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