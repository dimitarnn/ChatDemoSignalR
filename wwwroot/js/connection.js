import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import * as signalR from '@microsoft/signalr';

var target = document.getElementById('root');

function Input({ handleSubmit }) {
    const [user, setUser] = useState('');
    const [message, setMessage] = useState('');

    const onUserChange = event => {
        setUser(event.target.value);
        event.preventDefault();
    }

    const onMessageChange = event => {
        setMessage(event.target.value);
        event.preventDefault();
    }

    const onSubmit = event => {
        event.preventDefault();
        handleSubmit(user, message);
    }

    return (
        <form onSubmit={onSubmit}>
            <div>
                <label htmlFor='user'>User: </label>
                <input id='user' name='user' value={user} onChange={onUserChange} type='text' />
            </div>
            <div>
                <label htmlFor='message-input'>Message: </label>
                <input id='message-input' name='message-input' value={message} onChange={onMessageChange} type='text' />
            </div>
            <button type='submit'>Submit</button>
        </form>
    );
}

function Message({ user, text }) {
    return (
        <div>
            <span>{user} says: </span>
            <span>{text}</span>
        </div>
    );
}

function MessagesContainer({ messages }) {
    return (
        <div>
            <ul>
                {
                    messages.map((message, step) => {
                        return (<Message key={step} user={message.user} text={message.text} />);
                    })
                }
            </ul>
        </div>
    );
}

function App() {
    const [connection, setConnection] = useState(null);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl('/testhub')
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Debug)
            .build();

        setConnection(connection);
    }, []);

    useEffect(() => {
        if (connection) {
            connection.start()
                .then(() => {
                    console.log('Connection established!');

                    //connection.invoke("AddToGroup");

                    connection.on('ReceiveMessage', (user, message) => {

                        const newMessageObj = {
                            user: user,
                            text: message
                        };
                        setMessages(prev => [...prev, newMessageObj]);
                    });

                })
                .catch(error => {
                    console.error(error.toString());
                });
        }
    }, [connection]);

    const handleSubmit = (user, message) => {

        if (connection.connectionStarted) {
            try {
                connection.invoke('SendMessage', user, message);
            }
            catch (error) {
                console.error(error.toString());
            }
        }
    }

    const joinGroup = () => {
        if (connection.connectionStarted) {
            try {
                connection.invoke('JoinGroup');
            }
            catch (error) {
                console.error(error.toString());
            }
        }
    }

    return (
        <div>
            <h1>React SignalR #Last Update 21:22 06.10</h1>
            <Input handleSubmit={handleSubmit} />
            <h4>Messages:</h4>
            <button onClick={joinGroup}>Join Group "TestGroup"</button>
            <MessagesContainer messages={messages} />
        </div>
    );
}

ReactDOM.render(<App />, target);