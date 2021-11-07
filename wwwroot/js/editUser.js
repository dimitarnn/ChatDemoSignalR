import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import Alert from './Alert';

var root = document.getElementById('root');
const userId = _id;
const toggleMessages = ['Show user roles', 'Hide user roles'];
const defaultErrorMessage = 'An error occurred!';

const EditUserForm = () => {
    const [user, setUser] = useState(null);
    const [toggleMessageIndex, setToggleMessageIndex] = useState(0);
    const [displayRoles, setDisplayRoles] = useState(false);
    const [success, setSuccess] = useState(false);
    const [editSuccess, setEditSuccess] = useState(false);
    const [serverError, setServerError] = useState(false);
    const [serverErrorMessages, setServerErrorMessages] = useState([]);
    const [errors, setErrors] = useState({});
    const [state, setState] = useState({
        id: '',
        userName: '',
        email: '',
        firstName: '',
        lastName: '',
        roomsLimit: 0,
        friendsLimit: 0,
        roles: [],
    });

    useEffect(() => {
        import('axios').then(({ default: axios }) => {
            const url = `/Administration/GetUser?id=${userId}`;
            setSuccess(false);
            setServerError(false);
            setServerErrorMessages([]);

            axios.get(url)
                .then(response => response.data)
                .then(user => {
                    console.log('User received: ');
                    console.log(user);
                    setUser(user);
                    setState({
                        ...state,
                        id: user.id,
                        userName: user.userName,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        roomsLimit: user.roomsLimit,
                        friendsLimit: user.friendsLimit,
                        roles: user.roles
                    });
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

        console.log('change: ');
        console.log('event name: ');
        console.log(event.target.name);
        console.log('event value: ');
        console.log(event.target.value);
        console.log('value type: ');
        console.log(typeof (event.target.value));

        let value = event.target.value;

        if (event.target.name === 'roomsLimit' || event.target.name === 'friendsLimit') {
            let input = event.target.value;

            if (input !== '') {
                if (isNaN(input) || isNaN(parseFloat(input))) {
                    return;
                } else if ((input - Math.floor(input)) !== 0) {
                    return;
                }
            }

            value = parseInt(value);
        }

        const allErrors = errors;
        delete allErrors[event.target.name];
        setErrors(allErrors);

        setSuccess(false);
        setServerError(false);
        setServerErrorMessages([]);
        setEditSuccess(false);
        setState({ ...state, [event.target.name]: value });
    }

    const reset = () => {
        setState({ ...state, roleName: '' });
    }

    const validateForm = () => {
        const errors = {};

        if (state.userName.length === 0) {
            errors.userName = 'Please enter a User Name!';
        } else if (state.userName.length < 2) {
            errors.userName = 'User Name must be at least 2 characters long!';
        } else if (state.userName.length > 100) {
            errors.userName = 'User Name cannot exceed 100 characters!';
        }

        if (state.firstName.length === 0) {
            errors.firstName = 'Please enter First Name!';
        } else if (state.firstName.length < 2) {
            errors.firstName = 'First Name must be at least 2 characters long!';
        } else if (state.firstName.length > 150) {
            errors.firstName = 'First Name cannot exceed 100 characters!';
        }

        if (state.lastName.length === 0) {
            errors.lastName = 'Please enter Last Name!';
        } else if (state.lastName.length < 2) {
            errors.lastName = 'Last Name must be at least 2 characters long!';
        } else if (state.lastName.length > 150) {
            errors.lastName = 'Last Name cannot exceed 150 characters!';
        }

        console.log('state: ');
        console.log(state);

        if (isNaN(state.roomsLimit) || isNaN(parseFloat(state.roomsLimit))) {
            errors.roomsLimit = 'Please enter a Rooms Limit!';
        } else if ((state.roomsLimit - Math.floor(state.roomsLimit)) !== 0) {
            errors.roomsLimit = 'Please enter a Rooms Limit!';
        } else if (state.roomsLimit <= 0 || state.roomsLimit > 10000) {
            errors.roomsLimit = 'Rooms Limit must be between 1 and 10000';
        }

        if (isNaN(state.friendsLimit) || isNaN(parseFloat(state.friendsLimit))) {
            errors.friendsLimit = 'Please enter a Friends Limit!';
        } else if ((state.friendsLimit - Math.floor(state.friendsLimit)) !== 0) {
            errors.friendsLimit = 'Please enter a Friends Limit!';
        } else if (state.friendsLimit <= 0 || state.friendsLimit > 10000) {
            errors.friendsLimit = 'Friends Limit must be between 1 and 10000';
        }

        return errors;
    }

    const handleIntChange = event => {
        event.preventDefault();
        let input = event.target.value;

        if (isNaN(input) || isNaN(parseFloat(input))) {
            return;
        } else if ((input - Math.floor(input)) !== 0) {
            return;
        }
    }

    const onSubmit = event => {
        event.preventDefault();

        const errorsObj = validateForm();
        setErrors(errorsObj);

        console.log('errors: ');
        const errorKeys = Object.keys(errorsObj);

        errorKeys.forEach((key, index) => {
            console.log(`${key}: ${errors[key]}`);
        });

        console.log('state: ');
        console.log(state);

        if (Object.keys(errorsObj).length !== 0) {
            setSuccess(false);
            return;
        }

        setSuccess(true);

        import('axios').then(({ default: axios }) => {
            const url = '/Administration/EditUser';
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
        location.href = '/Administration/DisplayUsers';
    }

    const toggleRoles = () => {
        setDisplayRoles(prev => !prev);
        setToggleMessageIndex(prev => 1 - prev);
    }

    useEffect(() => {
        if (displayRoles) {
            const e = document.getElementById('manage-user-roles');
            e.scrollIntoView({
                block: 'start',
                behavior: 'smooth',
                inline: 'start'
            });
        }
        else {
            const e = document.getElementById('edit-user');
            e.scrollIntoView({
                block: 'start',
                behavior: 'smooth',
                inline: 'start'
            });
        }
    }, [displayRoles]);

    return (
        <div>
            <div className='center-div compact'>
                <h1 id='edit-user' className='title'>Edit User</h1>
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
                            id='userId'
                            name='userId'
                            placeholder=' '
                            value={state.id}
                            disabled
                        />
                        <label htmlFor='userId' className='form-label'>User Id</label>
                    </div>
                    <div className='form'>
                        <input
                            className='form-input'
                            type='text'
                            id='userName'
                            name='userName'
                            placeholder=' '
                            value={state.userName}
                            onChange={onChange}
                        />
                        <label htmlFor='userName' className='form-label'>User Name</label>
                    </div>
                    {errors?.userName && <Alert type='error' message={errors.userName} />}
                    <div className='form'>
                        <input
                            className='form-input'
                            type='text'
                            id='email'
                            name='email'
                            placeholder=' '
                            value={state.email}
                            disabled
                        />
                        <label htmlFor='email' className='form-label'>Email</label>
                    </div>
                    <div className='form'>
                        <input
                            className='form-input'
                            type='text'
                            id='firstName'
                            name='firstName'
                            placeholder=' '
                            value={state.firstName}
                            onChange={onChange}
                        />
                        <label htmlFor='firstName' className='form-label'>First Name</label>
                    </div>
                    {errors?.firstName && <Alert type='error' message={errors.firstName} />}
                    <div className='form'>
                        <input
                            className='form-input'
                            type='text'
                            id='lastName'
                            name='lastName'
                            placeholder=' '
                            value={state.lastName}
                            onChange={onChange}
                        />
                        <label htmlFor='lastName' className='form-label'>Last Name</label>
                    </div>
                    {errors?.lastName && <Alert type='error' message={errors.lastName} />}
                    <div className='form'>
                        <input
                            className='form-input'
                            type='number'
                            step='1'
                            id='roomsLimit'
                            name='roomsLimit'
                            placeholder=' '
                            value={state.roomsLimit}
                            onChange={onChange}
                        />
                        <label htmlFor='roomsLimit' className='form-label'>Rooms Limit</label>
                    </div>
                    {errors?.roomsLimit && <Alert type='error' message={errors.roomsLimit} />}
                    <div className='form'>
                        <input
                            className='form-input'
                            type='number'
                            step='1'
                            id='friendsLimit'
                            name='friendsLimit'
                            placeholder=' '
                            value={state.friendsLimit}
                            onChange={onChange}
                        />
                        <label htmlFor='friendsLimit' className='form-label'>Friends Limit</label>
                    </div>
                    {errors?.friendsLimit && <Alert type='error' message={errors.friendsLimit} />}
                    <button type='submit' className='form-button'>Edit</button>
                    <button onClick={redirect} type='button' className='form-button'>Cancel</button>
                </form>
            </div>
            <div className='center-div compact'>
                <div id='display-users-trigger' onClick={toggleRoles}>{toggleMessages[toggleMessageIndex]}</div>
            </div>
            {
                displayRoles && <RolesContainer roles={state.roles} collapse={toggleRoles} />
            }
        </div>
    );
}

const Role = ({ role }) => {
    return (
        <div className='user-role'>
            <span className='user-role-span'>
                {role}
            </span>
        </div>
    );
}

const RolesContainer = ({ roles, collapse }) => {

    return (
        <div>
            <div>
                <div className='user-roles-container'>
                    {
                        roles.length === 0 && <span>User hasn't joined any roles!</span>
                    }
                    {
                        roles.map((role, step) => <Role key={step} role={role} />)
                    }
                </div>
            </div>
            <div className='button-field'>
                <a id='manage-user-roles' href={`/Administration/EditUserRoles?userId=${userId}`} className='form-button inline-button'>
                    Add or Remove Roles
                </a>
            </div>
        </div>
    );
}


ReactDOM.render(<EditUserForm />, root);