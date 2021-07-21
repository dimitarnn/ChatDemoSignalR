import React from 'react';

function Message({ color, sender, text, sendTime }) {
    return (
        <div className="message">
            <div className="header">
                <div>{sendTime}</div>
            </div>
            <p>
                <span className="sender" style={{ color }}>{sender}: </span>
                <span className="text">
                    {text}
                </span>
            </p>
        </div>
    );
}

export default Message;