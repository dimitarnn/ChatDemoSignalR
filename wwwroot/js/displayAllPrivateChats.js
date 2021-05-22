import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

var app = document.getElementById('root');

class PrivateChat extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const url = '/Chat/DisplayPrivateChat?friendId=' + this.props.userId;
        const userName = this.props.userName;
        return (
            <div className="card">
                <div className="card-header">
                    {userName}
                </div>
                <div className="card-body">
                    <a href={url} className="btn btn-primary">Go to chat</a>
                </div>
            </div>
        );
    }
}

class ChatContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = { usersList: [] }
    }

    componentDidMount() {
        let my = this;
        $.get('/Chat/GetAllUsers', function (list) {
            //console.log('list inside ChatContainer: ');
            //console.log(list);
            //console.log('state list: ');
            my.setState({ usersList: list });
            //console.log(my.state.usersList);
        }).catch(function (error) {
            return console.error(error.toString());
        });
    }

    render() {
        return (
                this.state.usersList.map((user) => {
                    return (
                        <PrivateChat key={user.Id} userName={user.userName} userId={user.id} />
                    );
                })
            );
    }
}

ReactDOM.render(<ChatContainer />, app);