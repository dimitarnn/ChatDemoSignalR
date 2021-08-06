import React, { useState, useEffect, useReducer } from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import * as signalR from '@microsoft/signalr';
import axios from 'axios';


var target = document.getElementById('notifications');

function Notification({ data, text, isRead, id }) {
    const classes = 'notification' + (isRead ? ' read' : '');
    const [display, setDisplay] = useState(false);
    const [read, setRead] = useState(isRead);

    const handleClick = e => {
        setDisplay(display => !display);
    };

    const handleNotificationClick = id => {
        let url = `/Notification/Read?text=${text}&userId=${data.userId}`;
        if (read)
            url = `/Notification/Unread?text=${text}&userId=${data.userId}`;

        axios.get(url)
            .then(() => {
                setRead(read => !read);
            })
            .catch(error => console.error(error.toString()));
    }

    return (
        <div>
        <div onClick={handleClick} className={(read ? 'notification read' : 'notification')}>
                <span>{text}</span>
                <div style={{ display: (display ? 'flex' : 'none') }} className='notification-links' >
                    <a onClick={() => handleNotificationClick(id)}>Mark as read</a>
                    <a href={data.source}>Open</a>
                </div>
            </div>
            
        </div>
    );
}

const initialState = { notifications: [], total: 0, currentCount: 0, isFetching: false };

function reducer(state, action) {
    switch (action.type) {
        case 'PREPEND_NOTIFICATIONS':
            return { ...state, notifications: [...action.payload.list, ...state.notifications] }
        case 'UPDATE_NOTIFICATIONS':
            return { ...state, notifications: [...state.notifications, ...action.payload.list] };
        case 'UPDATE_TOTAL':
            return { ...state, total: action.payload.total };
        case 'UPDATE_COUNT':
            return { ...state, currentCount: state.currentCount + action.payload.increase };
        case 'UPDATE_FETCHING':
            return { ...state, isFetching: action.payload.isFetching };
        case 'REPLACE_NOTIFICATIONS':
            return { ...state, notifications: action.payload.list };
        default:
            return state;
    }
}

function NotificationsContainer({ displayCnt }) {
    const [connection, setConnection] = useState(null);
    const [state, dispatch] = useReducer(reducer, initialState);

    const loadOnScroll = () => {
        if (state.currentCount >= state.total)
            return;

        // scroll animations and infinite scroll trigger
        const box = $('#notifications-box')[0];
        const isScrolled = (box.scrollHeight - Math.abs(box.scrollTop) === box.clientHeight);

        if (isScrolled) {
            if (state.isFetching)
                return;
            dispatch({ type: 'UPDATE_FETCHING', payload: { isFetching: true } });

            const index = Math.ceil(state.currentCount / displayCnt) + 1;
            const url = '/Notification/LoadNotifications';

            axios.get(url, {
                params: {
                    skip: state.notifications.length,
                    size: displayCnt
                }
            })
                .then(response => response.data)
                .then(list => {
                    dispatch({ type: 'UPDATE_COUNT', payload: { increase: displayCnt } });
                    dispatch({ type: 'UPDATE_NOTIFICATIONS', payload: { list } });
                    dispatch({ type: 'UPDATE_FETCHING', payload: { isFetching: false } });
                })
                .catch(error => console.error(error.toString()));
        }
    }

    useEffect(() => {
        // creating signalR connection
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl('/messages')
            .build();

        setConnection(newConnection);
        

        // loading notifications
        const getCountUrl = '/Notification/GetNotificationsCount';
        axios.get(getCountUrl)
            .then(response => response.data)
            .then(count => {
                dispatch({ type: 'UPDATE_TOTAL', payload: { total: count } });
            })
            .catch(error => console.error(error.toString()));

        const index = Math.ceil(state.currentCount / displayCnt) + 1;
        const url = '/Notification/LoadNotifications'
        axios.get(url, {
            params: {
                skip: state.notifications.length,
                size: displayCnt
            }
        })
            .then(response => response.data)
            .then(list => {
                //console.log(list);
                dispatch({ type: 'UPDATE_COUNT', payload: { increase: displayCnt } });
                dispatch({ type: 'UPDATE_NOTIFICATIONS', payload: { list } })
            })
            .catch(error => console.error(error.toString()));

    }, []);

    useEffect(() => {
        if (connection == null)
            return;

        console.log('connection did update, connection:');
        console.log(connection);

        connection.start()
            .then(() => {
                console.log('Notification connection established.')
            })
            .catch(error => console.error(error.toString()));

        connection.on('ReceiveNotification', notification => {
            //console.log(' *** received notification *** ');

            const index = Math.ceil(state.currentCount / displayCnt) + 1;
            const url = '/Notification/LoadNotifications';

            dispatch({ type: 'PREPEND_NOTIFICATIONS', payload: { list: [notification] } });
        })
    }, [connection]);

    return (
        <div className='notifications-box' id='notifications-box' onScroll={loadOnScroll}>
            {
                state.notifications.map((notification) => {
                    return (
                        <Notification data={notification} key={notification.id} text={notification.text} isRead={notification.isRead} id={notification.id} />
                    );
                })
            }
        </div>
    );
}

ReactDOM.render(<NotificationsContainer displayCnt={20} />, target);