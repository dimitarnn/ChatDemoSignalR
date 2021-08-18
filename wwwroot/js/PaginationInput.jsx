import React from 'react';
import ReactDOM from 'react-dom';

function PaginationInput({ tmpPage, handleChange, handleClick }) {
    return (
        <div className='page-form'>
            <input className='page-number-input' value={tmpPage} onChange={handleChange} />
            <button className='page-number-button' onClick={handleClick}>Go to</button>
        </div>
    );
}

export default PaginationInput;