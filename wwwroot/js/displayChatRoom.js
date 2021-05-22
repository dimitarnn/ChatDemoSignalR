import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import * as signalR from '@microsoft/signalr';

var app = document.getElementById('root');

function addLeadingZeros(n) {
    if (n <= 9)
        return '0' + n;
    return n;
}

function formatDate(date) {
    //console.log('formatDate: ' + typeof (date));
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

    return day + '/' + month + '/' + year + ' ' + hours + ':' + minutes + ':' + seconds;
}

class Info extends React.Component {
    constructor(props) {
        super(props);
        this.state = { cypher: 1 };
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleInputChange(e) {
        this.setState({ cypher: e.target.value });
        console.log('React Page: ');
        console.log('roomName: ' + window.roomName);
    }

    render() {
        const roomName = this.props.roomName;
        const user = this.props.user;
        const cypher = this.state.cypher;
        return (
            <div className="row" id="info">
                <h5 className="col-lg-3 col-md-6 col-sm-12" id="roomName">{roomName}</h5>
                <h4 className="col-lg-5 col-md-6 col-sm-12" id="username">Logged as: {user}</h4>
                <div id="user" hidden>{user}</div>
                <form>
                    <div className="input-group input-group-sm">
                        <div className="input-group-prepend">
                            <span className="input-group-text">Choose a key</span>
                        </div>
                        <input onChange={this.handleInputChange} id="cypher" type="number" step="1" value={cypher} />
                    </div>
                </form>
            </div>
        );
    }
}

class Message extends React.Component {
    render() {
        return (                                    // 888888888
            <div className="message">
                <header>{this.props.sendTime}</header>
                <p>
                    <span className="sender" style={{ color: this.props.color }}>{this.props.sender}: </span>
                    <span className="text">
                        {this.props.text}
                    </span>
                </p>
            </div>
        );
    }
}

class Messages extends React.Component {
    constructor(props) {
        super(props);
    }

    //componentDidMount() {
    //    let message = { text: `User ${_user} connected.`, sender: 'John Cena', sendTime: new Date() };
    //    this.props.connection.invoke('SendMessageToGroup', _roomName, message);
    //}

    componentDidMount() {
        console.log('*** Messages mounted');
    }

    render() {
        const messages = this.props.messages;
        //console.log(messages);
        return (
            <div className="row">
                <div id="messages" className="col-12">
                    {
                        // add color property to message model?
                        messages.map((message, step) => {
                            let color = (message.sender == 'John Cena' ? '#33a59e' : (message.sender === _user ? '#e053b3' : '#000'));
                            //let color = (message.sender === _user ? '#e053b3' : '#000');
                            //console.log('color: ' + color);
                            //console.log(typeof (message.sendTime));
                            return (
                                <Message key={message.id} sendTime={message.sendTime} color={color} sender={message.sender} text={message.text} />
                            );
                        })
                    }
                </div>
            </div>
        );
    }
}

class Input extends React.Component {
    constructor(props) {
        super(props);
        this.handleKeyChange = this.handleKeyChange.bind(this);
        this.handleTextChange = this.handleTextChange.bind(this);
        this.state = { key: 1, text: '' };
    }

    handleTextChange(e) {
        this.setState({ text: e.target.value });
    }

    handleKeyChange(e) {
        this.setState({ key: e.target.value });
    }

    render() {
        const key = this.state.key;
        const text = this.state.text;
        return (
            <form>
                <div className="chat-input">
                    <div className="input-group input-group-sm">
                        <div className="input-group-prepend">
                            <span className="input-group-text">Choose a key</span>
                        </div>
                        <input onChange={this.handleKeyChange} id="key" type="number" step="1" value={key} />
                    </div>
                    <div className="input-group mb-3">
                        <textarea
                            id="message"
                            onChange={this.handleTextChange}
                            placeholder="Your message"
                            value={text}
                            name="message"
                            className="form-control">
                        </textarea>
                        <div className="input-group-append">
                            <button onClick={() => { this.props.handleSubmit(this.state.text); this.setState({ text: '' }); }} className="btn btn-outline-secondary" type="button" id="groupSendButton">Send Message</button>
                        </div>
                    </div>
                </div>
            </form>
        );
    }
}


class Page extends React.Component {
    constructor(props) {
        super(props);
        this.connection = null;
        this.state = { messages: [], connection: null }
        this.handleSubmit = this.handleSubmit.bind(this);
        //this.onReceiveMessage = this.onReceiveMessage.bind(this);
        this.encryptText = this.encryptText.bind(this);
    }

    encryptText(text, offset) {
        var plaintext = ''; console.log('message received:');
        console.log(message);
        this.setState({ messages: [...this.state.messages, message] }); //?
        var code_a = 'a'.charCodeAt(0);
        var code_A = 'A'.charCodeAt(0);
        const regex_a = new RegExp('[a-z]');
        const regex_A = new RegExp('[A-Z]');

        offset = parseInt(offset) % 26;

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

    handleSubmit(text) {
        //let text = e.value.text;
        console.log('submit: ' + text);
        let sender = _user;
        let my = this;

        var data = { text: text, roomName: roomName };

        $.post('/Chat/SendMessage', data)
            .done(function (response) {
                let message = { text: response.text, sender: response.sender, sendTime: response.sendTime };
                console.log('posting message to chat controller');
                my.state.connection.invoke('SendMessageToGroup', _roomName, message).catch(function (err) {
                    return console.error(err.toString());
                });
            })
            .catch(function (error) {
                return console.error(error.toString);
            })
    }

    componentDidMount() {

        console.log('&&& Page mounted');

        const connection = new signalR.HubConnectionBuilder()
            .withUrl('/messages')
            .build();

        console.log('connection: ');
        console.log(connection);

        let my = this;

        /// was here

        let url = '/Chat/GetMessagesInRoom?roomName=' + _roomName;
        $.get(url, function (messages) {
            my.setState({ messages: messages });
            $('#messages').animate({ scrollTop: $('#messages')[0].scrollHeight }, 500);
        }).then(function () {
            my.setState({ connection: connection }, () => {
                console.log('this.state.connection: ');
                console.log(my.state.connection);
                my.state.connection
                    .start()
                    .then(() => {
                        /// send message tho show the user is connected
                        //let message = { text: `User ${_user} connected.`, sender: 'John Cena', sendTime: new Date() };

                        my.state.connection.invoke('JoinGroup', _roomName).then(function () {
                            console.log('--- Joined Group: ' + _roomName);

                            let message = { text: `User ${_user} connected.`, sender: 'John Cena', sendTime: new Date() };
                            my.state.connection.invoke('SendMessageToGroup', _roomName, message).then(function () {
                                console.log('^^^ John Cena Message sent.');
                            });
                        });
                    })
                    .catch(err => console.error(err.toString()));

                my.state.connection.on('ReceiveMessage', function (message) {
                    console.log('message received:');
                    console.log(message);
                    let cnt = my.state.messages.length;
                    let id = my.state.messages[cnt - 1].id;
                    message.id = id + 1;
                    //console.log(my.state.messages);
                    my.setState({ messages: [...my.state.messages, message] });
                });
            });
        }).catch(function (error) {
            return console.error(error.toString());
        })
    }

    componentDidUpdate() {
        $('#messages').animate({ scrollTop: $('#messages')[0].scrollHeight }, 500);
    }

    render() {
        const messages = this.state.messages;
        return (
            <div>
                <Info roomName={_roomName} user={_user} />
                <Messages roomName={_roomName} messages={messages} />
                <Input handleSubmit={this.handleSubmit} />
            </div>
        );
    }
}

ReactDOM.render(<Page />, app);