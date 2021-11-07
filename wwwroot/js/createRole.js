import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Alert from './Alert';

var root = document.getElementById('root');
const defaultErrorMessage = 'An error occurred!';

const RoleForm = () => {
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const [created, setCreated] = useState(false);
    const [state, setState] = useState({
        roleName: ''
    });
    const [serverError, setServerError] = useState(false);
    const [serverErrorMessages, setServerErrorMessages] = useState([]);

    const validateForm = () => {
        console.log('state: ');
        console.log(state);
        if (state.roleName.length === 0) {
            errors.roleName = 'Please enter a Role Name!';
        } else if (state.roleName.length < 2) {
            errors.roleName = 'Role Name must be at least 2 characters long!';
        } else if (state.roleName.length > 100) {
            errors.roleName = 'Role Name must be under 100 characters!';
        }

        return errors;
    }

    const handleChange = event => {
        setState({ ...state, [event.target.name]: event.target.value });

        let allErrors = errors;
        delete allErrors[event.target.name];
        setErrors(allErrors);

        setCreated(false);
        setServerError(false);
        setSuccess(false);
        setServerErrorMessages([]);

        event.preventDefault();
    }

    const handleSubmit = event => {
        event.preventDefault();
        const errorsObj = validateForm();
        setErrors(errorsObj);
        reset();

        console.log('errors: ');
        console.log(errorsObj);

        if (Object.keys(errorsObj).length !== 0) {
            setErrors(errorsObj);
            setSuccess(false);
            return;
        }

        setCreated(false);
        setSuccess(true);
        const url = '/Administration/CreateRole';
        setServerError(false);
        setServerErrorMessages([]);

        import('axios').then(({ default: axios }) => {

            axios.post(url, state)
                .then(response => response.data)
                .then(() => {
                    setCreated(true);
                })
                .catch(error => {
                    console.log(error.toString());
                    let errorMessage = defaultErrorMessage;
                    setServerError(true);

                    if (error.response && error.response.data.length !== 0) {
                        errorMessage = error.response.data;
                    }

                    setServerErrorMessages(prev => [...prev, errorMessage]);
                })
        })
            .catch(error => console.error(error.toString()));
    }

    const reset = () => {
        setState({
            roleName: ''
        });

        setCreated(false);
        setServerError(false);
        setSuccess(false);
        setErrors({});
        setServerErrorMessages([]);
    }

    return (
        <div className='center-div'>
            <h2 className='title'>Create Role</h2>
            <form onSubmit={handleSubmit}>
                {
                    created && <Alert type='success' message='Role created successfully!' />
                }
                {
                    (success && !serverError && !created) && <Alert type='success' message='Sent successfully!'/>
                }
                {
                    serverError ?
                        <div>
                            {
                                serverErrorMessages.map((error, step) => <Alert key={step} type='error' message={error} />)
                            }
                        </div> :
                        null
                }
                <div className='form'>
                    <input
                        className='form-input'
                        type='text'
                        name='roleName'
                        id='roleName'
                        placeholder=' '
                        autoComplete='off'
                        value={state.roleName}
                        onChange={handleChange}
                    />
                    <label htmlFor='roleMame' className='form-label'>Role Name</label>
                </div>
                {errors?.roleName && <Alert type='error' message={errors.roleName} />}
                <button type='submit' className='form-button'>Create</button>
            </form>
            <button type='button' className='form-button' onClick={reset}>Reset</button>
            <a href='/Administration/DisplayRoles' className='form-button'>Browse roles</a>
        </div>
    );
}

ReactDOM.render(<RoleForm />, root);