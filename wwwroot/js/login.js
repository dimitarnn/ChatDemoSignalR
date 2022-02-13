import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import Alert from './Alert';

var root = document.getElementById('root');
const defaultErrorMessage = 'An error occurred!';
const defaultReturnUrl = '/Home/Index';

const Login = () => {
    const [state, setState] = useState({
        username: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const [serverError, setServerError] = useState(false);
    const [serverErrorMessages, setServerErrorMessages] = useState([]);
    const [loggedIn, setLoggedIn] = useState(false);
    const [returnUrl, setReturnUrl] = useState(defaultReturnUrl);

    const handleChange = event => {
        setState({ ...state, [event.target.name]: event.target.value });
        let allErrors = errors;
        delete allErrors[event.target.name];
        setErrors(allErrors);

        setSuccess(false);
        setServerError(false);
        setServerErrorMessages([]);
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

        setReturnUrl(defaultReturnUrl);
        setSuccess(true);
        const url = '/Account/Login';

        const search = window.location.search;
        console.log('search: ' + search);
        const urlParams = new URLSearchParams(search);
        console.log('params: ' + urlParams);
        const redirect = urlParams.get('ReturnUrl');
        console.log('redirect: ' + redirect);

        axios.post(url, null, {
            params: {
                username: state.username,
                password: state.password,
                returnUrl: redirect
            }
        })
            .then(response => response.data)
            .then(redirect => {
                setLoggedIn(true);
                console.log('logged: ' + redirect);

                if (redirect !== null && redirect.length !== 0) {
                    setReturnUrl(redirect);
                }
            })
            .catch(error => {
                console.log('error: ');
                console.log(error);
                console.log('error.response: ');
                console.log(error.response);
                console.log('error.response.data: ');
                console.log(error.response.data);
                setServerError(true);
                if (error.response && error.response.data.length !== 0) {
                    let serverErrors = error.response.data;
                    if (typeof (serverErrors) == "string") {
                        setServerErrorMessages(prev => [...prev, serverErrors]);
                    }
                    else {
                        setServerErrorMessages(prev => [...prev, ...serverErrors]);
                    }
                }
                else {
                    setServerErrorMessages(prev => [...prev, errorMessage]);
                }
                //reset();
            });
    }

    //if (serverError) {
    //    return (
    //        <div className='center-div'>
    //            {
    //                serverErrorMessages.map(error => <Alert type='error' message={error} />)
    //            }
    //        </div>
    //    );
    //}
    if (loggedIn) {
        return (
            <div className='center-div'>
                <Alert type='success' message='Successfully logged in!' />
                <a href={ returnUrl } className='btn-success'>Continue</a>
            </div>
        );
    }
    return (
        <div className='center-div'>
            {
                serverError &&
                <div>
                    {
                        serverErrorMessages.map(error => <Alert type='error' message={error} />)
                    }
                </div>
            }
            <form onSubmit={handleSubmit}>
                {
                    (success && !serverError) && <Alert type='success' message='Submitted successfully!' />
                }
                <div className='form'>
                    <input
                        type='text'
                        id='username'
                        name='username'
                        className='form-input'
                        placeholder=' '
                        autoComplete='off'
                        value={state.username}
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
                        value={state.password}
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