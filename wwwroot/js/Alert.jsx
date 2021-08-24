import React from 'react';

const Alert = ({ type, message }) => {
    return (
        <div className={'alert ' + (type === 'error' ? 'error' : 'success') }>
            {message}
        </div>
    );
}

export default Alert;