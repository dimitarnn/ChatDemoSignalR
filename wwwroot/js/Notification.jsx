import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';


function Notification({ notification, text, isRead, id }) {
    const classes = 'notification' + (isRead ? ' read' : '');
    const [display, setDisplay] = useState(false);
    const [read, setRead] = useState(isRead);

    const handleClick = e => {
        setDisplay(display => !display);
    };

    const handleNotificationClick = () => {
        console.log('notification: ');
        console.log(notification);
        let url = `/Notification/Read`;
        if (read)
            url = `/Notification/Unread`;

        axios.post(url, null, {
            params: {
                creationTime: notification.creationTime,
                text: notification.text,
                userId: notification.userId
            }
        })
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
                    <a onClick={handleNotificationClick}>Mark as read</a>
                    <a href={notification.source}>Open</a>
                </div>
            </div>

        </div>
    );
}

export default Notification;