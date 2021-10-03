import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { v4 as uuidv4 } from 'uuid';

var target = document.getElementById('root');

const chunkSize = 1048576 * 3;

function ProgressBar({ progress }) {
    const [style, setStyle] = useState({});

    useEffect(() => {
        const newStyle = {
            opacity: 1,
            width: `${progress}%`
        }

        setStyle(newStyle);
    }, [progress]);

    return (
        <div className='progress'>
            <div className='progress-done' style={style}>
                {progress}%
            </div>
        </div>
    );
}

function Info({ messages }) {
    return (
        <div className='info-container'>
            {
                messages.map((message, step) => {
                    const idx = messages.length - step;
                    return <InfoMessage key={step} message={message} idx={idx} />
                })
            }
        </div>
    );
}

function InfoMessage({ message, idx }) {
    return (
        <div className='info'>
            {idx}: {message}
        </div>
    );
}

function FileUploadForm() {
    const [showProgress, setShowProgress] = useState(false);
    const [counter, setCounter] = useState(1);
    const [fileToBeUploaded, setFileToBeUploaded] = useState({});
    const [beginningOfTheChunk, setBeginningOfTheChunk] = useState(0);
    const [endOfTheChunk, setEndOfTheChunk] = useState(chunkSize);
    const [progress, setProgress] = useState(0);
    const [fileTitle, setFileTitle] = useState('');
    const [fileGuid, setFileGuid] = useState('');
    const [fileSize, setFileSize] = useState(0);
    const [chunkCount, setChunkCount] = useState(0);
    const [displayInfo, setDisplayInfo] = useState(false);
    const [infoMessages, setInfoMessages] = useState([]);
    const [isUploaded, setIsUploaded] = useState(false);

    useEffect(() => {
        if (fileSize > 0 && !isUploaded && progress < 100) {
            fileUpload(counter);
        }
    }, [fileToBeUploaded, progress]);

    const getFileContext = event => {
        setIsUploaded(false);
        setDisplayInfo(true);
        const message = 'File received';
        setInfoMessages(prev => [message, ...prev]);

        resetChunkProperties();

        const _file = event.target.files[0];
        setFileSize(_file.size);
        setFileTitle(_file.name);

        const _totalCount = _file.size % chunkSize === 0 ? _file.size / chunkSize : Math.floor(_file.size / chunkSize) + 1;
        setChunkCount(_totalCount);

        setFileToBeUploaded(_file);

        const _fileID = uuidv4() + '.' + _file.name.split('.').pop();
        setFileGuid(_fileID);
    }

    const fileUpload = () => {
        setDisplayInfo(true);
        const message = 'Uploading file...';
        setInfoMessages(prev => [message, ...prev]);
        
        
        if (counter <= chunkCount) {
            setCounter(prev => prev + 1);
            var chunk = fileToBeUploaded.slice(beginningOfTheChunk, endOfTheChunk);
            uploadChunk(chunk);
        }
    }

    const uploadChunk = chunk => {
        setDisplayInfo(true);
        const message = 'Uploading chunk: ' + counter;
        setInfoMessages(prev => [message, ...prev]);

        try {
            import('axios').then(({ default: axios }) => {
                axios.post('/File/UploadChunks', chunk, {
                    params: {
                        id: counter,
                        fileName: fileGuid
                    },
                    headers: { 'Content-Type': 'application/json' }
                })
                    .then(response => response.data)
                    .then(() => {
                        setBeginningOfTheChunk(endOfTheChunk);
                        setEndOfTheChunk(prev => prev + chunkSize);

                        if (counter === chunkCount) {
                            setDisplayInfo(true);
                            const message = 'Process is complete, counter: ' + counter;
                            setInfoMessages(prev => [message, ...prev]);

                            uploadCompleted();
                        } else {
                            var percentage = (counter / chunkCount) * 100;
                            setProgress(percentage);
                        }
                    })
                    .catch(error => {
                        setDisplayInfo(true);
                        const message = 'An error occurred.';
                        setInfoMessages(prev => [message, ...prev]);
                        console.error(error.toString());
                    });
            })
                .catch(error => console.error(error.toString()));
        }
        catch (error) {
            console.error(error.toString());
        }
    }

    const uploadCompleted = () => {
        setDisplayInfo(true);
        const message = 'Upload completed';
        setInfoMessages(prev => [message, ...prev]);

        var formData = new FormData();
        formData.append('fileName', fileGuid);

        import('axios').then(({ default: axios }) => {
            axios.post('/File/UploadComplete', {}, {
                params: {
                    fileName: fileGuid,
                    fileTitle: fileTitle,
                },
                data: formData,
            })
                .then(() => {
                    setProgress(100);
                    setIsUploaded(true);
                })
                .catch(error => console.error(error.toString()));
        })
            .catch(error => console.error(error.toString()));
    }

    const resetChunkProperties = () => {
        setShowProgress(true);
        setProgress(0);
        setCounter(1);
        setBeginningOfTheChunk(0);
        setEndOfTheChunk(chunkSize);
    }

    return (
        <div>
            {
                displayInfo ?
                    <div className='center-div compact'>
                        <Info messages={infoMessages} />
                    </div> :
                    null
            }
            <div className='center-div'>
                <form>
                    <div className='center-div compact'>
                        <div className='file-input-form'>
                            <label htmlFor='file' className='file-label'>File input: </label>
                            <input id='file' name='file' type='file' className='form-input' onChange={getFileContext} />
                        </div>
                    </div>
                    {
                        <div className='center-div compact' style={{ display: showProgress ? 'block' : 'none' }}>
                            <ProgressBar progress={Math.floor(progress)} />
                        </div>
                    }
                </form>
            </div>
        </div>
    );
}

ReactDOM.render(<FileUploadForm />, target);