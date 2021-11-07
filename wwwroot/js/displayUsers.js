import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Alert from './Alert';

var root = document.getElementById('root');
const defaultErrorMessage = 'An error has occurred!';

const User = ({ user }) => {
    const [loading, setLoading] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [expand, setExpand] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [serverError, setServerError] = useState(false);
    const [serverErrorMessages, setServerErrorMessages] = useState([]);

    const clear = () => {
        setServerError(false);
        setServerErrorMessages([]);
    }

    const toggle = () => {
        if (!isDeleted) {
            setExpand(prev => !prev);
            clear();
        }
    }

    const onDeleteClick = () => {
        setConfirmDelete(true);
    }

    const onCancel = () => {
        setConfirmDelete(false);
        clear();
    }

    const handleDelete = () => {
        const url = `/Administration/DeleteUser?id=${user.id}`;

        import('axios').then(({ default: axios }) => {
            setLoading(true);
            clear();
            axios.post(url)
                .then(() => {
                    toggle();
                    setIsDeleted(true);
                })
                .catch(error => {
                    setServerError(true);
                    if (error.response && error.response.data.length !== 0) {
                        let data = error.response.data;
                        if (Object.prototype.toString.call(data) === '[object Array]') {
                            setServerErrorMessages(prev => [...prev, ...error.response.data]);
                        }
                        else {
                            setServerErrorMessages(prev => [...prev, error.response.data]);
                        }
                    }
                    else {
                        setServerErrorMessages(prev => [...prev, defaultErrorMessage]);
                    }
                })
                .finally(() => setLoading(false));
        })
            .catch(error => console.error(error.toString()));
    }

    return (
        <div className='display-user'>
            <div className={expand ? 'display-user-name expanded' : 'display-user-name'} onClick={toggle}>
                <span className='name-span'>
                    {user.userName}
                </span>
            </div>
            {
                isDeleted &&
                <div className='display-deleted-user'>
                    <span className='delete-span'>
                        <Alert type='error' message='User deleted!' />
                    </span>
                </div>
            }
            {
                //serverError &&
                //<div className='display-deleted-user'>
                //    <Alert type='error' message={serverErrorMessages[0]} />
                //</div>
            }
            {
                (expand && !isDeleted) &&
                <div className='display-user-buttons'>
                    <a href={`/Administration/EditUser?id=${user.id}`} className='form-button'>Edit</a>
                    {
                        confirmDelete ? null : <button type='button' className='form-button' onClick={onDeleteClick}>Delete</button>
                    }
                    {
                        serverError &&
                        <span style={{ 'display': 'inline-block' }}>
                            <Alert type='error' message={serverErrorMessages[0]} />
                        </span>
                    }
                    {
                        (confirmDelete && !serverError) && <button type='button' className='form-button' onClick={handleDelete}>Confirm Delete?</button>
                    }
                    {
                        confirmDelete && <button type='button' className='form-button' onClick={onCancel}>Cancel</button>
                    }
                </div>
            }
        </div>
    );
}

const UsersContainer = () => {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const url = '/Administration/GetUsers';
        import('axios').then(({ default: axios }) => {
            setLoading(true);
            axios.get(url)
                .then(response => response.data)
                .then(list => {
                    //console.log('list: ');
                    //console.log(list);
                    setUsers(list);
                })
                .catch(error => console.error(error.toString()))
                .finally(() => setLoading(false));
        })
            .catch(error => console.error(error.toString()));
    }, []);

    return (
        <div>
            <div className='display-users-container'>
                {
                    users.map((user, step) => <User key={step} user={user} />)
                }
            </div>
        </div>
    );
}

ReactDOM.render(<UsersContainer />, root);