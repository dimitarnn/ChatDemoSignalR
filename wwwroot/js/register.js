import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import Alert from './Alert';

var root = document.getElementById('root');
const defaultErrorMessage = 'An error occurred!';

const RegisterForm = () => {
    const [state, setState] = useState({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const [hasSentEmail, setHasSentEmail] = useState(false);
    const [serverError, setServerError] = useState(false);
    const [serverErrorMessages, setServerErrorMessages] = useState([]);

    const validateForm = () => {
        const errors = {};

        if (state.username.length === 0) {
            errors.username = 'Please enter an username!';
        } else if (state.username.length <= 1) {
            errors.username = 'Username must be at least 2 characters long!';
        } else if (state.username.length > 150) {
            errors.username = 'Username must be under 150 characters!';
        }

        if (state.email.length === 0) {
            errors.email = 'Please enter an email!';
        } else if (
            !state.email.match(
                /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/g
            )
        ) {
            errors.email = 'Please enter a valid email!';
        }

        if (state.firstName.length === 0) {
            errors.firstName = 'First name is required!';
        } else if (state.firstName.length <= 1) {
            errors.firstName = 'First name must be at least 2 characters long!';
        } else if (state.firstName.length > 150) {
            errors.firstName = 'First name must be less than 150 characters!';
        }

        if (state.lastName.length === 0) {
            errors.lastName = 'Last name is required!';
        } else if (state.lastName.length <= 1) {
            errors.lastName = 'Last name must be at least 2 characters long!';
        } else if (state.lastName.length > 150) {
            errors.lastName = 'Last name must be less than 150 characters!';
        }

        if (state.password.length === 0) {
            errors.password = 'Password is required!'
        } else if (
            !state.password.match(
                /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm
            )
        ) {
            errors.password = 'Password must contain at least one lowercase letter, one uppercase letter, one number and be at least 8 characters!'
        } else if (state.password !== state.confirmPassword) {
            errors.password = 'Please enter matching passwords!';
        }

        return errors;
    }

    const handleChange = event => {
        setState({ ...state, [event.target.name]: event.target.value });

        let allErrors = errors;
        delete allErrors[event.target.name];
        setErrors(allErrors);

        setServerError(false);
        setServerErrorMessages([]);
        setSuccess(false);

        event.preventDefault();
    }

    const handleSubmit = event => {
        event.preventDefault();
        const errorsObj = validateForm();
        setErrors(errorsObj);

        if (Object.keys(errorsObj).length !== 0) {
            setSuccess(false);
            return;
        }

        setSuccess(true);
        const url = '/Account/Register';
        setServerError(false);
        setServerErrorMessages([]);

        axios.post(url, null, {
            params: {
                username: state.username,
                email: state.email,
                firstName: state.firstName,
                lastName: state.lastName,
                password: state.password
            }
        })
            .then(response => response.data)
            .then(() => {
                setHasSentEmail(true);
                console.log('Verification email sent.');
            })
            .catch(error => {
                console.error(error.toString());
                setServerError(true);
                let errorMessage = defaultErrorMessage;
                if (error.response && error.response.data.length !== 0) {
                    let serverErrors = error.response.data;
                    setServerErrorMessages(prev => [...prev, ...serverErrors]);
                }
                else {
                    setServerErrorMessages(prev => [...prev, errorMessage]);
                }
            });
    }

    const reset = () => {
        setState({
            username: '',
            email: '',
            firstName: '',
            lastName: '',
            password: '',
            confirmPassword: ''
        });

        setErrors({});
        setServerError(false);
        setServerErrorMessages([]);
        setSuccess(false);
    }

    //if (serverError) {
    //    return (
    //        <div className='center-div'>
    //            {
    //                serverErrorMessages.map(error => <Alert type='error' message={error} />)
    //            }
    //            <Alert type='error' message='An error occurred while contacting the server' />
    //            <a href='/Account/Register' className='btn-success'>Try again</a>
    //        </div>
    //    );
    //}
    if (hasSentEmail) {
        return (
            <div>
                <h1>A verification email has been sent.</h1>
                <h3>Please verify your account.</h3>
            </div>
        );
    }
    return (
        <div className='center-div'>
            <h2 className='title'>Register</h2>

            <form onSubmit={handleSubmit}>
                {
                    (success && !serverError) && <Alert type='success' message='Sent successfully!' />
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
                <div className="form">
                    <input
                        className="form-input"
                        type="text"
                        name="username"
                        id="username"
                        placeholder=" "
                        autoComplete="off"
                        value={state.username}
                        onChange={handleChange}
                    />
                    <label htmlFor="username" className="form-label">Username</label>
                </div>
                {errors?.username && <Alert type='error' message={errors.username} />}
                <div className="form">
                    <input
                        className="form-input"
                        type="text"
                        name="email"
                        id="email"
                        placeholder=" "
                        autoComplete="off"
                        value={state.email}
                        onChange={handleChange}
                    />
                    <label htmlFor="email" className="form-label">Email</label>
                </div>
                {errors?.email && <Alert type='error' message={errors.email} />}
                <div className="form">
                    <input
                        className="form-input"
                        name="firstName"
                        id="firstName"
                        placeholder=" "
                        autoComplete="off"
                        value={state.firstName}
                        onChange={handleChange}
                    />
                    <label htmlFor="firstName" className="form-label">First Name</label>
                </div>
                {errors?.firstName && <Alert type='error' message={errors.firstName} />}
                <div className="form">
                    <input
                        className="form-input"
                        name="lastName"
                        id="lastName"
                        placeholder=" "
                        autoComplete="off"
                        value={state.lastName}
                        onChange={handleChange}
                    />
                    <label htmlFor="lastName" className="form-label">Last Name</label>
                </div>
                {errors?.lastName && <Alert type='error' message={errors.lastName} />}
                <div className="form">
                    <input
                        className="form-input"
                        type="password"
                        id="password"
                        name="password"
                        placeholder=" "
                        autoComplete="off"
                        value={state.password}
                        onChange={handleChange}
                    />
                    <label htmlFor="password" className="form-label">Password</label>
                </div>
                {errors?.password && <Alert type='error' message={errors.password} />}
                <div className="form">
                    <input
                        className="form-input"
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder=" "
                        autoComplete="off"
                        value={state.confirmPassword}
                        onChange={handleChange}
                    />
                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                </div>
                {errors?.confirmPassword && <Alert type='error' message={errors.confirmPassword} />}
                <button type="submit" className="form-button">Register</button>
            </form>
            <button type="button" className="form-button" onClick={reset}>Reset</button>
        </div>
    );
}

ReactDOM.render(<RegisterForm />, root);