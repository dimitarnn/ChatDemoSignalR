import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Alert from './Alert';

var root = document.getElementById('root');
var userId = _userId;
const defaultErrorMessage = 'An error occurred!';

const Role = ({ role, toggleRole }) => {

    const handleChange = () => {
        role.isSelected = !role.isSelected;
        toggleRole(role);
    }

    return (
        <div className='edit-user-role'>
            <input
                id={`isSelected_${role.roleId}`}
                type='checkbox'
                name={`isSelected_${role.roleId}`}
                checked={role.isSelected}
                onChange={handleChange}
            />
            <label className='role-label' htmlFor={`isSelected_${role.roleId}`}>
                {role.roleName}
            </label>
        </div>
    );
}

const UserRolesContainer = () => {
    const [userRoles, setUserRoles] = useState([]);
    const [serverError, setServerError] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [serverErrorMessages, setServerErrorMessages] = useState([]);

    useEffect(() => {
        console.log('starting...');

        import('axios').then(({ default: axios }) => {
            console.log('requesting data...');
            const url = `/Administration/GetUserRoles?userId=${userId}`;

            axios.get(url)
                .then(response => response.data)
                .then(list => {
                    console.log('Model fetched: ');
                    console.log(list);
                    setUserRoles(list);
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
        /// update submit
        event.preventDefault();

        import('axios').then(({ default: axios }) => {
            const url = '/Administration/EditUserRoles';

            setSubmitSuccess(true);

            axios.post(url, userRoles, {
                params: {
                    userId: userId
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

    const toggleRole = role => {
        setSubmitSuccess(false);
        setServerError(false);
        setUpdateSuccess(false);
        setServerErrorMessages([]);

        let currentRoles = [];

        for (let i = 0; i < userRoles.length; ++i) {
            if (userRoles[i].roleId === role.roleId) {
                console.log('role changed: ');
                console.log(userRoles[i]);
                console.log(role);
                currentRoles.push(role)
            }
            else {
                currentRoles.push(userRoles[i]);
            }
        }

        setUserRoles(currentRoles);
    }

    const dropAllRoles = () => {
        let currentRoles = [];

        for (let i = 0; i < userRoles.length; ++i) {
            currentRoles.push({ ...userRoles[i], isSelected: false });
        }

        setUserRoles(currentRoles);
    }

    return (
        <div>
            <div className='center-div'>
                <h2 className='title'>Add or remove user from roles</h2>
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
            <div className='edit-user-roles-container'>
                {
                    userRoles.map((role, step) => <Role key={step} role={role} toggleRole={toggleRole} />)
                }
            </div>
            <div className='button-field'>
                <a onClick={handleSubmit} className='form-button'>Update</a>
                <a onClick={dropAllRoles} className='form-button'>Remove from all roles</a>
                <a href={`/Administration/EditUser?id=${userId}`} className='form-button'>Cancel</a>
            </div>
        </div>
    );
}

ReactDOM.render(<UserRolesContainer />, root);