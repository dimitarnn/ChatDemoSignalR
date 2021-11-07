import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Alert from './Alert';

var root = document.getElementById('root');
var roleId = _roleId;
const defaultErrorMessage = 'An error occurred!';

const User = ({ user, toggleUser }) => {

    const handleChange = () => {
        user.isSelected = !user.isSelected;
        toggleUser(user);
    }

    return (
        <div className='user'>
            <input
                id={`isSelected_${user.userId}`}
                type='checkbox'
                name={`isSelected_${user.userId}`}
                checked={user.isSelected}
                onChange={handleChange}
            />
            <label className='user-label' htmlFor={`isSelected_${user.userId}`}>
                {user.userName}
            </label>
        </div>
    );
}

const UsersInRoleContainer = () => {
    const [usersInRole, setUsersInRole] = useState([]);
    const [serverError, setServerError] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [serverErrorMessages, setServerErrorMessages] = useState([]);

    useEffect(() => {
        console.log('starting...');

        import('axios').then(({ default: axios }) => {
            console.log('requesting data...');
            const url = `/Administration/GetUsersInRole?roleId=${roleId}`;

            axios.get(url)
                .then(response => response.data)
                .then(list => {
                    console.log('Model fetched: ');
                    console.log(list);
                    setUsersInRole(list);
                })
                .catch(error => {
                    setServerError(true);
                    console.error(error.toString());
                    let errorMessage = defaultErrorMessage;
                    if (error.response && error.response.data.length !== 0) {
                        errorMessage = error.response.data;
                    }
                    setServerErrorMessages(prev => [...prev, errorMessage]);
                });
        })
            .catch(error => console.error(error.toString()));
    }, []);

    const handleSubmit = event => {
        event.preventDefault();

        import('axios').then(({ default: axios }) => {
            const url = '/Administration/EditUsersInRole';

            setSubmitSuccess(true);

            const data = {
                roleId: roleId,
                model: usersInRole,
            };

            console.log('data: ');
            console.log(data);

            axios.post(url, usersInRole, {
                params: {
                    roleId: roleId
                }
            })
                .then(() => {
                    setUpdateSuccess(true);
                })
                .catch(error => {
                    setServerError(true);
                    console.error(error.toString());
                    let errorMessage = defaultErrorMessage;
                    if (error.response && error.response.data.length !== 0) {
                        errorMessage = error.response.data;
                    }
                    setServerErrorMessages(prev => [...prev, errorMessage]);
                });
        })
            .catch(error => console.error(error.toString()));
    }

    const toggleUser = user => {
        setSubmitSuccess(false);
        setServerError(false);
        setUpdateSuccess(false);
        setServerErrorMessages([]);

        let currentUsers = [];

        for (let i = 0; i < usersInRole.length; ++i) {
            if (usersInRole[i].userId === user.userId) {
                console.log('user changed: ');
                console.log(usersInRole[i]);
                console.log(user);
                currentUsers.push(user)
            }
            else {
                currentUsers.push(usersInRole[i]);
            }
        }

        setUsersInRole(currentUsers);
    }

    const dropAllUsers = () => {
        let currentUsers = [];

        for (let i = 0; i < usersInRole.length; ++i) {
            currentUsers.push({ ...usersInRole[i], isSelected: false });
        }

        setUsersInRole(currentUsers);
    }

    return (
        <div>
            <div className='center-div'>
                <h2 className='title'>Add or remove users from this role</h2>
                {
                    serverError &&
                    <div>
                        {
                            serverErrorMessages.map((error, step) => <Alert key={step} type='error' message={error} />)
                        }
                    </div>
                }
                {
                    (submitSuccess && !serverError && !updateSuccess) && <Alert type='success' message='Sent successfully!' />
                }
                {
                    (!serverError && updateSuccess) && <Alert type='success' message='Updated successfully!' />
                }
            </div>
            <div className='users-container'>
                {
                    usersInRole.map((user, step) => <User key={step} user={user} toggleUser={toggleUser} />)
                }
            </div>
            <div className='button-field'>
                <a onClick={handleSubmit} className='form-button'>Update</a>
                <a onClick={dropAllUsers} className='form-button'>Remove all users</a>
                <a href={`/Administration/EditRole?id=${roleId}`} className='form-button'>Cancel</a>
            </div>
        </div>
    );
}

ReactDOM.render(<UsersInRoleContainer />, root);