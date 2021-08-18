import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

function Pagination({ loading, currentPage, totalRooms, roomsPerPage, paginate, nextPage, previousPage }) {
    if (loading)
        return (<div>Loading...</div>);

    const [displayCnt, setDisplayCnt] = useState(5);
    const [pageNumbers, setPageNumbers] = useState([]);
    const [displayNumbers, setDisplayNumbers] = useState([]);

    useEffect(() => {
        console.log('mounted');
        let arr = [];
        console.log('totalRooms: ' + totalRooms);
        console.log('roomsPerPage: ' + roomsPerPage);
        for (let i = 1; i <= Math.ceil(totalRooms / roomsPerPage); ++i) {
            arr.push(i);
        }

        setPageNumbers(arr);
        console.log(arr);

        console.log('currentPage: ' + currentPage);
        // currentPage is 1-based
        const totalPages = Math.ceil(totalRooms / roomsPerPage);
        const pageIdx = Math.ceil(currentPage / displayCnt); // 1-based
        const pageFirst = (pageIdx - 1) * displayCnt; // 0-based
        const pageLast = pageFirst + displayCnt - 1; // 0-based
        const startIdx = Math.min(Math.max(0, currentPage - 1 - 2), Math.max(0, totalPages - displayCnt));
        const endIdx = startIdx + displayCnt;

        setDisplayNumbers(arr.slice(startIdx, endIdx));
        console.log(arr.slice(startIdx, endIdx));
    }, [currentPage, totalRooms]);

    return (
        <ul className='pagination'>
            <li key={'previous'} className='pagination-item'>
                <a onClick={previousPage}>Previous Page</a>
            </li>
            {
                displayNumbers.map(number => {
                    return (
                        <li key={number} className={'pagination-item' + (number == currentPage ? ' current' : '')}>
                            <a onClick={() => paginate(number)}>{number}</a>
                        </li>
                    );
                })
            }
            <li key={'next'} className='pagination-item'>
                <a onClick={nextPage}>Next Page</a>
            </li>
        </ul>
    );
}

export default Pagination;