import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import Alert from './Alert';

var root = document.getElementById('root');

const Login = () => {
    const [state, setState] = useState({
        username: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const [serverError, setServerError] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);

    const handleChange = event => {
        setState({ ...state, [event.target.name]: event.target.value });
        let allErrors = errors;
        delete allErrors[event.target.name];
        setErrors(allErrors);

        event.preventDefault();
    }

    const reset = () => {
        setState({
            username: '',
            password: ''
        });

        setErrors({});
    }

    const validateForm = () => {
        const errors = {};

        if (state.username.length === 0) {
            errors.username = 'Please enter your username!';
        }

        if (state.password.length === 0) {
            errors.password = 'Please enter your password!';
        }

        return errors;
    }

    const handleSubmit = event => {
        console.log('On submit');
        event.preventDefault();
        const errorsObj = validateForm();
        setErrors(errorsObj);

        if (Object.keys(errorsObj).length !== 0) {
            setSuccess(false);
            return;
        }

        setSuccess(true);
        const url = '/Account/Login';

        axios.post(url, null, {
            params: {
                username: state.username,
                password: state.password
            }
        })
            .then(response => response.data)
            .then(() => {
                setLoggedIn(true);
            })
            .catch(error => {
                setServerError(true);
                console.error(error.toString());
                reset();
            });
    }

    if (serverError) {
        return (
            <div className='center-div'>
                <Alert type='error' message='An error occurred!' />
                <a href='/Account/Login' className='btn-success'>Try again</a>
            </div>
        );
    }
    if (loggedIn) {
        return (
            <div className='center-div'>
                <Alert type='success' message='Successfully logged in!' />
                <a href='/Home/Index' className='btn-success'>Continue</a>
            </div>
        );
    }
    return (
        <div className='center-div'>
            <form onSubmit={handleSubmit}>
                {
                    success && <Alert type='success' message='Submitted successfully!' />
                }
                <div className='form'>
                    <input
                        type='text'
                        id='username'
                        name='username'
                        className='form-input'
                        placeholder=' '
                        autoComplete='off'
                        onChange={handleChange}
                    />
                    <label htmlFor='username' className='form-label'>Username</label>
                </div>
                {errors?.username && <Alert type='error' message={errors.username} />}
                <div className='form'>
                    <input
                        type='password'
                        id='password'
                        name='password'
                        className='form-input'
                        placeholder=' '
                        autoComplete='off'
                        onChange={handleChange}
                    />
                    <label htmlFor='password' className='form-label'>Password</label>
                </div>
                {errors?.password && <Alert type='error' message={errors.password} />}
                <button type='submit' className='form-button'>Submit</button>
            </form>
            <button type='button' className='form-button' onClick={reset}>Reset Form</button>
            <a href='/Account/Register' className='form-button'>Register</a>
        </div>
    );
}

ReactDOM.render(<Login />, root);