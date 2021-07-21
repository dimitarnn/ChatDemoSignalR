import React, { useState, useEffect, useReducer, useRef } from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import * as signalR from '@microsoft/signalr';
import Message from './Message';
import axios from 'axios';

var app = document.getElementById('root');

function addLeadingZeros(n) {
    if (n <= 9)
        return '0' + n;
    return n;
}

function formatDate(date, isFullDate) {
    date = new Date(date);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = addLeadingZeros(month);
    var day = date.getDate();
    day = addLeadingZeros(day);
    var hours = date.getHours();
    hours = addLeadingZeros(hours);
    var minutes = date.getMinutes();
    minutes = addLeadingZeros(minutes);
    var seconds = date.getSeconds();
    seconds = addLeadingZeros(seconds);

    let fullDate = day + '/' + month + '/' + year + ' ' + hours + ':' + minutes + ':' + seconds;
    let shortDate = day + '/' + month + ' ' + hours + ':' + minutes;

    return (isFullDate === true ? fullDate : shortDate);
}

function Info({ roomName, user }) {
    const [cypher, setCypher] = useState(1);

    const handleInputChange = e => {
        setCypher(e.target.value);
    }

    return (
        <div id="info">
            <div id="roomNameDiv">
                <h4 id="roomName">{roomName}</h4>
            </div>
            <div id="userNameDiv">
                <h4 id="username">Logged as: {user}</h4>
            </div>
            <div id="user" hidden>{user}</div>
            <div id="cypherInput">
                <form>
                    <div className="input-group input-group-sm">
                        <div className="input-group-prepend">
                            <span className="input-group-text">Choose a key</span>
                        </div>
                        <input onChange={handleInputChange} id="cypher" type="number" step="1" value={cypher} />
                    </div>
                </form>
            </div>
        </div>
    );
}

function Input({ handleSubmit }) {
    const [key, setKey] = useState(1);
    const [text, setText] = useState('');
    const input = useRef(null);

    useEffect(() => {
        input.current.focus();
    }, [])

    const handleTextChange = e => {
        setText(e.target.value);
    }

    const handleKeyChange = e => {
        setKey(e.target.value);
    }

    const handleClick = () => {
        handleSubmit(text);
        setText('');
        input.current.focus();
    }

    return (
        <form>
            <div className="chat-input">
                <ScrollDownButton />
                <div className="input-group input-group-sm">
                    <div className="input-group-prepend">
                        <span className="input-group-text">Choose a key</span>
                    </div>
                    <input onChange={handleKeyChange} id="key" type="number" step="1" value={key} />
                </div>
                <div className="input-group">
                    <textarea
                        id="message"
                        ref={input}
                        onChange={handleTextChange}
                        placeholder="Your message"
                        value={text}
                        name="message"
                        className="form-control"
                    >
                    </textarea>
                    <div className="input-group-append">
                        <button
                            onClick={handleClick}
                            className="btn btn-outline-secondary"
                            type="button"
                            id="groupSendButton"
                        >
                            Send Message
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}

function ScrollDownButton() {
    const handleClick = e => {
        e.preventDefault();
        $('#messages').animate({ scrollTop: $('#messages')[0].scrollHeight }, 500);
        // state for isVisible ?
    }

    // const style = { isVisible ? { visibility: visible } : { visibility: hidden} }; 

    return (
        <button id="scroll-down-button" onClick={handleClick}>Go back</button>
    );
}

const initialState = {
    total: 0,
    currentCount: 0,
    isFetching: false
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'UPDATE_TOTAL':
            return { ...state, total: action.payload.total };
        case 'SET_COUNT':
            return { ...state, currentCount: action.payload.currentCount };
        case 'UPDATE_COUNT':
            return { ...state, currentCount: state.currentCount + action.payload.increase };
        case 'UPDATE_FETCHING':
            return { ...state, isFetching: action.payload.isFetching };
        default:
            return state;
    }
}

function Messages({ displayCnt, updateMessages, messages }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {

        axios.get('/Chat/GetMessageCount/', { params: { roomName: _roomName } })
            .then(response => response.data)
            .then(count => {
                dispatch({ type: 'UPDATE_TOTAL', payload: { total: count } });
            })
            .catch(error => console.error(error.toString()));

        // '/Chat/GetMessages', { params: { roomName: _roomName, index: 0, size: displayCnt } }
        // roomName has a space ' ' instead of '%20'
        axios.get(`/Chat/GetMessages?roomName=${_roomName}&skip=0&size=${displayCnt}`)
            .then(response => response.data)
            .then(list => {
                dispatch({ type: 'SET_COUNT', payload: { currentCount: displayCnt } });
                updateMessages(list, true);
            })
            .catch(error => console.error(error.toString()));

    }, []);

    const loadOnScroll = () => {
        const isScrolled = $('#messages')[0].scrollHeight - Math.abs($('#messages')[0].scrollTop) <= $('#messages')[0].clientHeight * 1.3;

        if (isScrolled) {
            $('#scroll-down-button').fadeOut();
        }
        else {
            $('#scroll-down-button').fadeIn();
        }

        if (state.currentCount >= state.total) {
            $('#content-start').hide();
            return;
        }

        const isAtTop = $('#messages')[0].scrollTop == 0;

        if (isAtTop) {
            if (state.isFetching)
                return;
            dispatch({ type: 'UPDATE_FETCHING', payload: { isFetching: true } });
            const index = Math.ceil(state.currentCount / displayCnt) + 1;
            const url = '/Chat/GetMessages';
            //console.log(`index: ${index}, size: ${displayCnt}`)
            axios.get(url, {
                params: {
                    roomName: _roomName,
                    skip: messages.length,
                    size: displayCnt
                }
            }) // { params: { roomName: _roomName, index: index, size: displayCnt } }
                .then(response => response.data)
                .then(list => {
                    dispatch({ type: 'UPDATE_FETCHING', payload: { isFetching: false } });
                    dispatch({ type: 'UPDATE_COUNT', payload: { increase: displayCnt } });
                    updateMessages(list, false);
                })
                .catch(error => console.error(error.toString()));
        }
    }

    const isFullDate = false; // based on screen/window width

    return (
        <div id="messages" onScroll={loadOnScroll}>
            {
                state.currentCount !== state.total ?
                    <div id="content-start">
                        Please wait. Loading...
                    </div> : null
            }
            {
                messages.map(message => {
                    const color = message.sender === 'John Cena' ? '#d15d30' : (message.sender === _user ? '#e053b3' : '#159ea5');
                    let id = message.id;

                    if (id == undefined || id == null || id == 0) {
                        id = message.sendTime + '_' + message.sender;
                    }

                    return (
                        <Message key={id} sendTime={formatDate(message.sendTime, isFullDate)} color={color} sender={message.sender} text={message.text} />
                    );
                })
            }
        </div>
    );
}

const initialPageState = {
    messages: [],
    connection: null,
    displayCnt: 25,
    lastHeight: 0,
    isInitial: true,
    scrollType: 0
};

const pageReducer = (state, action) => {
    switch (action.type) {
        case 'PREPEND_MESSAGES':
            return {
                ...state,
                messages: [...action.payload.list, ...state.messages],
                lastHeight: action.payload.height,
                scrollType: action.payload.scrollType,
            };
        case 'APPEND_MESSAGES':
            return {
                ...state,
                messages: [...state.messages, ...action.payload.list],
                lastHeight: action.payload.height,
                scrollType: action.payload.scrollType,
            };
        case 'UPDATE_INITIAL':
            return { ...state, isInitial: action.payload.isInitial };
        case 'UPDATE_CONNECTION':
            return { ...state, connection: action.payload.connection };
        default:
            return state;
    }
}

const encryptText = (text, offset) => {     // simple encryption function for testing
    var code_a = 'a'.charCodeAt(0);
    var code_A = 'A'.charCodeAt(0);
    const regex_a = new RegExp('[a-z]');
    const regex_A = new RegExp('[A-Z]');

    offset = parseInt(offset) % 26;
    var plaintext = '';

    for (var i = 0; i < text.length; ++i) {
        var code = text.charCodeAt(i);
        var tmp = text[i];

        if (regex_a.test(text[i])) {
            tmp = String.fromCharCode(code_a + (code - code_a + offset + 26) % 26);
        }
        else if (regex_A.test(text[i])) {
            tmp = String.fromCharCode(code_A + (code - code_A + offset + 26) % 26);
        }

        plaintext += tmp;
    }

    return plaintext;
}

function Page({ displayName }) {
    const [state, dispatch] = useReducer(pageReducer, initialPageState);

    const scrollAfterUpdate = () => {
        //console.log('~Scroll after update.');
        const currentHeight = $('#messages')[0].scrollHeight;
        $('#messages').animate({ scrollTop: currentHeight - state.lastHeight }, 500);
    }

    const updateMessages = (list, isInitial) => {
        const height = $('#messages')[0].scrollHeight;
        const scrollType = isInitial ? 1 : 2;

        dispatch({ type: 'PREPEND_MESSAGES', payload: { list, height, scrollType } });
    }

    useEffect(() => {

        //console.log('Messages updated');
        //console.log(state.messages);
        //console.log('Scroll Type: ' + state.scrollType);

        if (state.scrollType == 0)
            return;

        if (state.scrollType == 1) {
            $('#messages').animate({ scrollTop: $('#messages')[0].scrollHeight }, 500);
        }
        else if (state.scrollType == 2){
            scrollAfterUpdate();
        }

    }, [state.messages]);

    const handleSubmit = text => {
        const data = { text, roomName: _roomName };
        const url = '/Chat/SendMessage';

        axios.post(url, null, { params: { text, roomName: _roomName } })
            .then(response => response.data)
            .then(data => {
                //const message = { id: data.id, text: data.text, sender: data.sender, sendTime: data.sendTime };
                console.log('Received model from ChatController')
                console.log(data);
                //const message = data.message;
                //const notification = data.notification;
                state.connection.invoke('SendMessageToGroup', _roomName, data.message);
                state.connection.invoke('SendNotificationToGroup', _roomName, data.notification);
            })
            .catch(error => console.error(error.toString()));
    }

    useEffect(() => {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl('/messages')
            .build();

        dispatch({ type: 'UPDATE_CONNECTION', payload: { connection } });
    }, []);

    useEffect(() => {
        if (state.connection == null)
            return;

        state.connection.start()
            .then(() => state.connection.invoke('JoinGroup', _roomName))
            .then(() => {
                //const date = new Date();
                //const id = date.getTime();
                //console.log('id: ');
                //console.log(id);
                const message = { /*id: id, */text: `User ${_user} connected.`, sender: 'John Cena', sendTime: new Date() };
                console.log(message);
                state.connection.invoke('SendMessageToGroup', _roomName, message);
            })
            .catch(error => console.error(error.toString()));

        state.connection.on('ReceiveMessage', message => {
            const height = $('#messages')[0].scrollHeight;
            const isScrolled = height - Math.abs($('#messages')[0].scrollTop) === $('#messages')[0].clientHeight;
            const scrollType = isScrolled ? 1 : 0;
            dispatch({
                type: 'APPEND_MESSAGES',
                payload: {
                    list: [...state.messages, message], // try with single message
                    height,
                    scrollType
                }
            });
        });

    }, [state.connection]);

    return (
        <div id="message-container">
            <Info roomName={displayName} user={_user} />
            <Messages
                roomName={_roomName}
                messages={state.messages}
                updateMessages={updateMessages}
                displayCnt={state.displayCnt}
            />
            <Input handleSubmit={handleSubmit} />
        </div>
    );
}

ReactDOM.render(<Page displayName={_displayName} />, app);