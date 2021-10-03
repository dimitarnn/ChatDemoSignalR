import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Alert from './Alert';
//import axios from 'axios';

var root = document.getElementById('root');
const defaultErrorMessage = 'An error occurred!';

function Input() {
    const [state, setState] = useState({
        title: '',
        description: '',
        file: null
    });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const [serverError, setServerError] = useState(false);
    const [serverErrorMessages, setServerErrorMessages] = useState([]);

    const handleChange = event => {
        setState({ ...state, [event.target.name]: event.target.value });

        let allErrors = errors;
        delete allErrors[event.target.name];
        setErrors(allErrors);

        setServerError(false);
        setSuccess(false);
        setServerErrorMessages([]);

        event.preventDefault();
    }

    const handleFileChange = event => {
        setState({ ...state, [event.target.name]: event.target.files[0] });

        console.log('file: ');
        console.log(event.target.files[0]);

        let allErrors = errors;
        delete allErrors[event.target.name];
        setErrors(allErrors);

        setServerError(false);
        setSuccess(false);
        setServerErrorMessages([]);

        event.preventDefault();
    }

    const handleSubmit = event => {
        const data = new FormData();

        const keys = Object.keys(state);
        keys.forEach(key => {
            console.log(`key: ${key}, value: ${state[key]}`);
            data.append(key, state[key]);
        });

        import('axios').then(({ default: axios }) => {
            axios.post('/Image/AddImage', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
                .then(response => {
                    setSuccess(true);
                    console.log('success: ');
                    reset();
                })
                .catch(error => {
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
        });

        event.preventDefault();
    }

    const reset = () => {
        setState({
            title: '',
            description: '',
            file: null
        });

        setErrors({});
        setServerError(false);
        setServerErrorMessages([]);
        setSuccess(false);
    }

    return (
        <div className='center-div'>
            <form encType='multipart/form-data' onSubmit={handleSubmit}>
                <div className='form'>
                    <input
                        className='form-input'
                        type='text'
                        name='title'
                        id='title'
                        placeholder=' '
                        autoComplete='off'
                        value={state.title}
                        onChange={handleChange}
                    />
                    <label htmlFor='title' className='form-label'>Title</label>
                </div>
                {errors?.title && <Alert type='error' message={errors.title} />}
                <div className='form'>
                    <input
                        className='form-input'
                        type='text'
                        name='description'
                        id='description'
                        placeholder=' '
                        autoComplete='off'
                        value={state.description}
                        onChange={handleChange}
                    />
                    <label htmlFor='description' className='form-label'>Description</label>
                </div>
                {errors?.description && <Alert type='error' message={errors.description} />}
                <div className='form'>
                    <input
                        className='form-input'
                        type='file'
                        //accept='image/*'
                        name='file'
                        id='file'
                        autoComplete='off'
                        onChange={handleFileChange}
                    />
                    <label htmlFor='file' className='file-label'>Choose a file</label>
                </div>
                {errors?.file && <Alert type='error' message={errors.file} />}
                <button type='submit' className='form-button'>Submit</button>
            </form>
            <button type='button' className='form-button' onClick={reset}>Reset</button>
        </div>
    );
}

ReactDOM.render(<Input />, root);