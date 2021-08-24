import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import axios from 'axios';
//import ChatRoom from './ChatRoom';
import Pagination from './Pagination';
import PaginationInput from './PaginationInput';
import Alert from './Alert';

var target = document.getElementById('root');
const defaultErrorMessage = 'An error occurred';

function Input({ addRoom }) {
    const [loading, setLoading] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [description, setDescription] = useState('');
    const [chatType, setChatType] = useState('Ephemeral');
    const [chatTypes, setChatTypes] = useState([]);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const [serverError, setServerError] = useState(false);
    const [serverErrorMessages, setServerErrorMessages] = useState([]);

    useEffect(() => {
        const url = '/Chat/GetChatTypes';
        setLoading(true);
        axios.get(url)
            .then(response => response.data)
            .then(list => {
                setChatTypes(list);
                console.log(list);
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

    const validate = () => {
        const errors = {};

        if (roomName.length === 0) {
            errors.roomName = 'Please enter a room name!';
        } else if (roomName.length <= 1) {
            errors.roomName = 'Room name must be at least 2 characters long!';
        }

        // description may be blank
        return errors;
    }

    const handleClick = e => {
        e.preventDefault();

        const errorsObj = validate();
        setErrors(errorsObj);

        if (Object.keys(errorsObj).length !== 0) {
            setSuccess(false);
            return;
        }

        const url = `/Chat/AddChatRoom`;
        setSuccess(true);

        const data = { roomName: roomName, description: description, chatType: chatType };
        //console.log(data);

        axios.post(url, null, { params: data })
            .then(response => {
                return response.data
            })
            .then(newRoom => {
                console.log(newRoom);
                addRoom(newRoom);
                setRoomName('');
                setDescription('');
                console.log('** room created');
            })
            .catch(error => {
                setServerError(true);
                let errorMessage = defaultErrorMessage;
                if (error.response && error.response.data.length !== 0) {
                    errorMessage = error.response.data;
                }
                setServerErrorMessages(prev => [...prev, errorMessage]);
                console.error(error);
            })
    }

    const handleChange = e => {
        setRoomName(e.target.value);

        let allErrors = errors;
        delete allErrors[roomName];
        setErrors(allErrors);
    }

    if (serverError) {
        return (
            <div className='center-div'>
                {
                    serverErrorMessages.map((error, step) => <Alert key={step} type='error' message={error} />)
                }
                <Alert type='error' message='Please reload the page and try again!' />
            </div>
        );
    }

    return (
        <div id="form-container">
            <div id="create-room-form">
                <h2>Create a new room!</h2>
                <div>
                    {
                        (success && !serverError) && (<Alert type='success' message='Successfully submited!'/>)
                    }
                    <input
                        name="roomName"
                        type="text"
                        placeholder="Your room"
                        value={roomName}
                        onChange={handleChange}
                        autoComplete="off"
                    />
                    { errors?.roomName && <Alert type='error' message={errors.roomName} /> }
                    <input
                        name="description"
                        type="text"
                        placeholder="Description"
                        value={description}
                        onChange={e => { setDescription(e.target.value) }}
                        autoComplete="off"
                    />
                    <select value={chatType} onChange={e => setChatType(e.target.value)}>
                        {
                            chatTypes.map(chatType => {
                                return chatType != 'Private' ? <option key={chatType} value={chatType}>{chatType}</option> : null
                            })
                        }
                    </select>
                    <button id="create-room-button" type="submit" onClick={handleClick}>Submit</button>
                </div>
            </div>
        </div>
    )
}

function ChatRoom({ room, chatTypes }) {
    const url = `/Chat/DisplayChatRoom?roomName=${room.roomName}`;

    return (
        <div className='black-card'>
            <div className='card-box'>
                <div className='card-content'>
                    <h2>{chatTypes[room.chatType]}</h2>
                    <h3>{room.roomName}</h3>
                    <p>{room.description}</p>
                    <a href={url}>Enter</a>
                </div>
            </div>
        </div>
    )
}

function ChatRoomsContainer() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [roomsPerPage, setRoomsPerPage] = useState(9);
    const [currentPage, setCurrentPage] = useState(1);
    const [tmpPage, setTmpPage] = useState(1);
    const [pagesCnt, setPagesCnt] = useState(0);
    const [currentRooms, setCurrentRooms] = useState([]);
    const [chatTypes, setChatTypes] = useState([]);
    const [serverError, setServerError] = useState(false);
    const [serverErrorMessages, setServerErrorMessages] = useState([]);


    useEffect(() => {
        const url = '/Chat/GetPublicRooms';
        const getChatTypesUrl = '/Chat/GetChatTypes';
        console.log('Fetching Rooms from database');
        setLoading(true);

        axios(url)
            .then(response => {
                return response.data;
            })
            .then(data => {
                setRooms(data);
            })
            .catch(error => {
                setServerError(true);
                let errorMessage = defaultErrorMessage;
                if (error.response && error.response.data.length !== 0) {
                    errorMessage = error.response.data;
                }
                setServerErrorMessages(prev => [...prev, errorMessage]);
                console.log(error);
            })
            .finally(() => setLoading(false));

        setLoading(true);
        axios.get(getChatTypesUrl)
            .then(response => response.data)
            .then(list => setChatTypes(list))
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
        setPagesCnt(Math.ceil(rooms.length / roomsPerPage));

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
            setTmpPage(1);
            setCurrentPage(1);
            return;
        }
        else if ((tmpPage - Math.floor(tmpPage)) !== 0) {
            setTmpPage(1);
            setCurrentPage(1);
            return;
        }

        //const pages = Math.ceil(rooms.length / roomsPerPage);
        input = input < 1 ? 1 : input;
        input = input > pagesCnt ? pagesCnt : input;
        setTmpPage(input);
        setCurrentPage(input);
    }

    const paginate = pageNumber => setCurrentPage(pageNumber);

    const nextPage = () => {
        //const pages = Math.ceil(rooms.length / roomsPerPage);
        setCurrentPage(prevPage => prevPage == pagesCnt ? pagesCnt : prevPage + 1);
    }

    const previousPage = () => {
        setCurrentPage(prevPage => prevPage == 1 ? 1 : prevPage - 1);
    }

    const addRoom = room => {
        setRooms([...rooms, room]);
    }

    return (
        <div id="contents">
            <div id='previous-page-mobile' onClick={previousPage}><span>&#8249;</span></div>
            <div id='next-page-mobile' onClick={nextPage}><span>&#8250;</span></div>
            <Input addRoom={addRoom} />
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
            <div id="chat-rooms-container">
                {
                    loading ? <span>Loading...</span> :
                        currentRooms.map(room => {
                            return <ChatRoom key={room.roomName} room={room} chatTypes={chatTypes} />
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
    )
}

ReactDOM.render(<ChatRoomsContainer />, target);