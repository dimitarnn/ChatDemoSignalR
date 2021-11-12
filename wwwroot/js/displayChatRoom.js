import React, { useState, useEffect, useReducer, useRef } from 'react';
import ReactDOM from 'react-dom';
//import $ from 'jquery';
import * as signalR from '@microsoft/signalr';
import Message from './Message';
//import axios from 'axios';
//import moment from 'moment';
import { DateTime } from 'luxon';
import Alert from './Alert';

var app = document.getElementById('root');

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
            {
                // for encryption
                //<div id="cypherInput">
                //    <form>
                //        <div className="input-group input-group-sm">
                //            <div className="input-group-prepend">
                //                <span className="input-group-text">Choose a key</span>
                //            </div>
                //            <input onChange={handleInputChange} id="cypher" type="number" step="1" value={cypher} />
                //        </div>
                //    </form>
                //</div>
            }
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
                {
                    // for encryption
                    //    <div className="input-group input-group-sm">
                    //        <div className="input-group-prepend">
                    //            <span className="input-group-text">Choose a key</span>
                    //        </div>
                    //        <input onChange={handleKeyChange} id="key" type="number" step="1" value={key} />
                    //    </div>
                    //
                }
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
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const scrollHeight = $('#messages')[0].scrollHeight;
        const clientHeight = $('#messages')[0].clientHeight;

        if (scrollHeight === clientHeight) {
            setVisible(false);
        }

    }, []);

    const handleClick = e => {
        e.preventDefault();
        $('#messages').animate({ scrollTop: $('#messages')[0].scrollHeight }, 500);
        // state for isVisible ?
    }

    // const style = { isVisible ? { visibility: visible } : { visibility: hidden} }; 

    return (
        <button id="scroll-down-button" style={{ display: (visible ? 'block' : 'none') }} onClick={handleClick}>Go back</button>
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
    const defaultErrorMessage = 'An error occurred!';
    const [state, dispatch] = useReducer(reducer, initialState);
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState(false);
    const [serverErrorMessages, setServerErrorMessages] = useState([]);

    useEffect(() => {
        import('axios').then(({ default: axios }) => {
            setLoading(true);
            setServerError(false);

            axios.get('/Chat/GetMessageCount/', {
                params: {
                    roomName: _roomName
                }
            })
                .then(response => response.data)
                .then(count => {
                    dispatch({ type: 'UPDATE_TOTAL', payload: { total: count } });
                })
                .catch(error => {
                    setServerError(true);
                    let errorMessage = defaultErrorMessage + " at GET /Chat/GetMessageCount/";
                    if (error.response && error.response.data.length !== 0) {
                        errorMessage = error.response.data;
                    }
                    setServerErrorMessages(prev => [...prev, errorMessage]);
                    console.error(error.toString());

                })
                .finally(() => setLoading(false));

            // '/Chat/GetMessages', { params: { roomName: _roomName, index: 0, size: displayCnt } }
            // roomName has a space ' ' instead of '%20'
            setLoading(true);
            axios.get(`/Chat/GetMessages?roomName=${_roomName}&skip=0&size=${displayCnt}`)
                .then(response => response.data)
                .then(list => {
                    dispatch({ type: 'SET_COUNT', payload: { currentCount: list.length } });
                    console.log('Messages received on start: ');
                    console.log(list);
                    updateMessages(list, true);
                })
                .catch(error => {
                    setServerError(true);
                    let errorMessage = defaultErrorMessage + " at GET /Chat/GetMessages";
                    if (error.response && error.response.data.length !== 0) {
                        errorMessage = error.response.data;
                    }
                    setServerErrorMessages(prev => [...prev, errorMessage]);
                    console.error(error.toString());
                })
                .finally(() => setLoading(false));
        });

    }, []);

    const loadOnScroll = () => {
        const isScrolled = $('#messages')[0].scrollHeight - Math.abs($('#messages')[0].scrollTop) <= $('#messages')[0].clientHeight * 1.3;

        const scrollHeight = $('#messages')[0].scrollHeight;
        const clientHeight = $('#messages')[0].clientHeight;

        if (isScrolled || scrollHeight == clientHeight) {
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

            import('axios').then(({ default: axios }) => {
                const url = '/Chat/GetMessages';

                axios.get(url, {
                    params: {
                        roomName: _roomName,
                        skip: messages.length,
                        size: displayCnt
                    }
                })
                    .then(response => response.data)
                    .then(list => {
                        console.log('List received from axios.get call <');
                        dispatch({ type: 'UPDATE_FETCHING', payload: { isFetching: false } });
                        dispatch({ type: 'UPDATE_COUNT', payload: { increase: displayCnt } });
                        updateMessages(list, false);
                    })
                    .catch(error => {
                        let errorMessage = defaultErrorMessage + " at GET /Chat/GetMessages";
                        setServerError(true);
                        if (error.response && error.response.data.length !== 0) {
                            errorMessage = error.response.data;
                        }
                        setServerErrorMessages(prev => [...prev, errorMessage])
                        console.error(error.toString())
                    });
            });
        }
    }

    const isFullDate = false; // based on screen/window width


    //if (serverError) {
    //    return (
    //        <div>
    //            {
    //                serverErrorMessages.map((error, step) => <Alert key={step} type='error' message={error} />)
    //            }
    //            <Alert type='error' message='Please reload the page and try again!' />
    //        </div>
    //    );
    //}
    return (
        <div id="messages" onScroll={loadOnScroll}>
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
            {
                state.currentCount !== state.total ?
                    <div id="content-start">
                        Please wait. Loading...
                    </div> : null
            }
            {
                loading ? <div>Loading...</div> :
                    messages.map(message => {
                        const color = message.sender === 'John Cena' ? '#d15d30' : (message.sender === _user ? '#e053b3' : '#159ea5');
                        let id = message.id;
                        //const display_time = moment(message.sendTime).format('Do MMM hh:mm');
                        let display_time = '';

                        //display_time = moment(message.sendTime).format('Do MMM HH:mm');
                        display_time = DateTime.fromISO(message.sendTime).toFormat('d MMM HH:mm');

                        if (id == undefined || id == null || id == 0) {
                            id = message.sendTime + '_' + message.sender;
                        }

                        return (
                            <Message
                                key={id}
                                //sendTime={formatDate(message.sendTime, isFullDate)}
                                sendTime={display_time}
                                color={color}
                                sender={message.sender}
                                text={message.text}
                            />
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
    const defaultErrorMessage = 'An error occurred!';
    const [state, dispatch] = useReducer(pageReducer, initialPageState);
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState(false);
    const [serverErrorMessages, setServerErrorMessages] = useState([]);

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
        console.log('message received...');
        console.log('scroll type: ' + state.scrollType);

        if (state.scrollType === 0)
            return;

        if (state.scrollType === 1) {
            $('#messages').animate({ scrollTop: $('#messages')[0].scrollHeight }, 500);
        }
        else if (state.scrollType === 2) {
            scrollAfterUpdate();
        }

    }, [state.messages]);

    const handleSubmit = text => {
        const data = { text, roomName: _roomName };

        if (text === undefined || text === null || text.length === 0)
            return;

        import('axios').then(({ default: axios }) => {
            setLoading(true);
            const url = '/Chat/SendMessage';

            axios.post(url, null, { params: { text, roomName: _roomName } })
                .then(response => response.data)
                .then(data => {
                    console.log('Received model from ChatController')
                    console.log(data);
                    state.connection.invoke('SendMessageToGroup', _roomName, data.message);
                    state.connection.invoke('SendNotificationToGroup', _roomName, data.notification);
                })
                .catch(error => {
                    console.log('An error has occurred!');
                    let errorMessage = defaultErrorMessage;
                    setServerError(true);
                    if (error.response && error.response.data.length !== 0) {
                        errorMessage = error.response.data;
                    }
                    setServerErrorMessages(prev => [...prev, errorMessage]);
                    console.error(error.toString());
                })
                .finally(() => setLoading(false));
        });
    }

    useEffect(() => {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl('/messages')
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Debug)
            .build();

        dispatch({ type: 'UPDATE_CONNECTION', payload: { connection } });
    }, []);

    useEffect(() => {
        if (!state.connection)
            return;

        state.connection.start()
            .then(() => {
                console.log('connection started.');
                console.log('joining group.');
                state.connection.invoke('JoinGroup', _roomName);
            })
            .then(() => {
                const message = { text: `User ${_user} connected.`, sender: 'John Cena', sendTime: new Date() };
                console.log(message);
                state.connection.invoke('SendMessageToGroup', _roomName, message);
            })
            .catch(error => {
                let errorMessage = defaultErrorMessage + " at connection start";
                console.error(error.toString());
                setServerError(true);
                if (error.response && error.response.data.length !== 0) {
                    errorMessage = error.response.data;
                }
                setServerErrorMessages(prev => [...prev, errorMessage]);
                console.error(error.toString());
            });

        state.connection.on('ReceiveMessage', message => {
            console.log('*********** Message received');
            const height = $('#messages')[0].scrollHeight;
            const clientHeight = $('#messages')[0].clientHeight;
            const remainder = height - Math.abs($('#messages')[0].scrollTop);

            //const isScrolled = height - Math.abs($('#messages')[0].scrollTop) === $('#messages')[0].clientHeight;
            const diff = (1.0 * remainder / clientHeight);
            const isScrolled = diff <= 1.2;
            const scrollType = isScrolled ? 1 : 0;

            console.log('height: ' + height);
            console.log('scrollTop: ' + Math.abs($('#messages')[0].scrollTop));
            console.log('clientHeight: ' + $('#messages')[0].clientHeight);
            console.log('remainder: ' + remainder);
            console.log('diff: ' + diff);

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