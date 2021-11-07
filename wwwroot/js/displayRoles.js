import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Alert from './Alert';

var root = document.getElementById('root');
const defaultErrorMessage = 'An error occurred!';

const Role = ({ role }) => {
    const [expand, setExpand] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [loading, setLoading] = useState(false);
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
        const url = `/Administration/DeleteRole?id=${role.id}`;

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
        <div className='role'>
            <div className={ expand ? 'role-name expanded' : 'role-name'} onClick={toggle}>
                <span>
                    {role.name}
                </span>
            </div>
            {
                isDeleted &&
                <div className='display-deleted-role'>
                    <span className='delete-span'>
                        <Alert type='error' message='Role deleted!' />
                    </span>
                </div>
            }
            {
                //serverError &&
                //<div className='display-deleted-role'>
                //    <Alert type='error' message={serverErrorMessages[0]} />
                //</div>
            }
            {
                (expand && !isDeleted) &&
                <div className='role-buttons'>
                    <a className='form-button' href={`/Administration/EditRole?id=${role.id}`}>Edit</a>
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

const RolesContainer = () => {
    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        import('axios').then(({ default: axios }) => {
            const url = '/Administration/GetRoles';
            setLoading(true);

            axios.get(url)
                .then(response => response.data)
                .then(list => {
                    console.log('roles: ');
                    console.log(list);
                    setRoles(list);
                })
                .catch(error => console.error(error.toString()))
                .finally(() => setLoading(false));
        })
            .catch(error => console.error(error.toString()));
    }, []);

    return (
        <div className='roles-container'>
            {
                roles.map((role, step) => <Role key={step} role={role} />)
            }
        </div>
    );
}

ReactDOM.render(<RolesContainer />, root);