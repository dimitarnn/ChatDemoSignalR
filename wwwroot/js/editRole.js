import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Alert from './Alert';

var root = document.getElementById('root');
const roleId = _roleId;
const defaultErrorMessage = 'An error occurred!';
const toggleMessages = ['Show users in role', 'Hide users in role'];

const EditRoleForm = () => {
    const [role, setRole] = useState(null);
    const [toggleMessageIndex, setToggleMessageIndex] = useState(0);
    const [displayUsers, setDisplayUsers] = useState(false);
    const [success, setSuccess] = useState(false);
    const [editSuccess, setEditSuccess] = useState(false);
    const [serverError, setServerError] = useState(false);
    const [serverErrorMessages, setServerErrorMessages] = useState([]);
    const [errors, setErrors] = useState({});
    const [state, setState] = useState({
        id: '',
        roleName: '',
        users: [],
    });

    useEffect(() => {
        import('axios').then(({ default: axios }) => {
            const url = `/Administration/GetRole?id=${roleId}`;
            setSuccess(false);
            setServerError(false);
            setServerErrorMessages([]);

            axios.get(url)
                .then(response => response.data)
                .then(role => {
                    console.log('Role received: ');
                    console.log(role);
                    setRole(role);
                    setState({ ...state, id: role.id, roleName: role.roleName, users: role.users });
                })
                .catch(error => {
                    console.error(error.toString());
                    setServerError(true);
                    let errorMessage = defaultErrorMessage;
                    if (error.response && error.response.data.length !== 0) {
                        errorMessage = error.response.data;
                    }
                    setServerErrorMessages(prev => [...prev, errorMessage]);
                });
        })
            .catch(error => console.error(error.toString()));
    }, []);

    const onChange = event => {
        event.preventDefault();

        const allErrors = errors;
        delete allErrors[event.target.name];
        setErrors(allErrors);

        setSuccess(false);
        setServerError(false);
        setServerErrorMessages([]);
        setEditSuccess(false);
        setState({ ...state, [event.target.name]: event.target.value });
    }

    const reset = () => {
        setState({ ...state, roleName: '' });
    }

    const validateForm = () => {
        const errors = {};

        if (state.roleName.length === 0) {
            errors.roleName = 'Please enter a Role Name!';
        } else if (state.roleName.length < 2) {
            errors.roleName = 'Role Name must be at least 2 characters long!';
        } else if (state.roleName.length > 100) {
            errors.roleName = 'Role Name cannot exceed 100 characters!';
        }

        return errors;
    }

    const onSubmit = event => {
        event.preventDefault();

        const errorsObj = validateForm();
        setErrors(errorsObj);

        if (Object.keys(errorsObj).length !== 0) {
            setSuccess(false);
            return;
        }

        setSuccess(true);

        import('axios').then(({ default: axios }) => {
            const url = '/Administration/EditRole';
            reset();

            axios.post(url, state)
                .then(response => response.data)
                .then(roleName => {
                    setState({ ...state, roleName: roleName });
                    setEditSuccess(true);
                })
                .catch(error => {
                    console.error(error.toString());
                    setServerError(true);
                    let errorMessage = defaultErrorMessage;
                    if (error.response && error.response.data.length !== 0) {
                        errorMessage = error.response.data;
                    }
                    setServerErrorMessages(prev => [...prev, errorMessage]);
                });
        })
            .catch(error => console.error(error.toString()));
    }

    const redirect = () => {
        location.href = '/Administration/DisplayRoles'
    }

    const toggleUsers = () => {
        setDisplayUsers(prev => !prev);
        setToggleMessageIndex(prev => 1 - prev);
    }

    return (
        <div>
            <div className='center-div compact'>
                <h1 className='title'>Edit Role</h1>
                {
                    (success && editSuccess && !serverError) && <Alert type='success' message='Editted successfully!' />
                }
                {
                    (success && !serverError && !editSuccess) && <Alert type='success' message='Sent successfully!' />
                }
                {
                    serverError &&
                    <div>
                        {
                            serverErrorMessages.map((error, step) => <Alert key={step} type='error' message={error} />)
                        }
                    </div>
                }
                <form onSubmit={onSubmit}>
                    <div className='form'>
                        <input
                            className='form-input'
                            type='text'
                            id='roleId'
                            name='roleId'
                            placeholder=' '
                            value={state.id}
                            disabled
                        />
                        <label htmlFor='roleId' className='form-label'>Role Id</label>
                    </div>
                    <div className='form'>
                        <input
                            className='form-input'
                            type='text'
                            id='roleName'
                            name='roleName'
                            placeholder=' '
                            value={state.roleName}
                            onChange={onChange}
                        />
                        <label htmlFor='roleName' className='form-label'>Role Name</label>
                    </div>
                    { errors?.roleName && <Alert type='error' message={errors.roleName} /> }
                    <button type='submit' className='form-button'>Edit</button>
                    <button onClick={redirect} type='button' className='form-button'>Cancel</button>
                </form>
            </div>
            <div className='center-div compact'>
                <div id='display-users-trigger' onClick={toggleUsers}>{toggleMessages[toggleMessageIndex]}</div>
            </div>
            {
                displayUsers && <UsersContainer users={state.users} collapse={toggleUsers} />
            }
        </div>
    );
}

const User = ({ user }) => {
    return (
        <div className='user'>
            <span className='user-span'>
                {user}
            </span>
        </div>
    );
}

const UsersContainer = ({ users, collapse }) => {

    return (
        <div>
            <div>
                <div className='users-container compact'>
                    {
                        users.length === 0 && <span>No users in this role!</span>
                    }
                    {
                        users.map((user, step) => <User key={step} user={user} />)
                    }
                </div>
            </div>
            <div className='button-field'>
                <a href={`/Administration/EditUsersInRole?roleId=${roleId}`} className='form-button inline-button'>Add or Remove Users</a>
            </div>
        </div>
    );
}

ReactDOM.render(<EditRoleForm />, root);