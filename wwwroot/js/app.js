import React from "react";
import ReactDOM from "react-dom";

var app = document.getElementById('root');

class Test extends React.Component {
    render() {
        return (
            <div>
                <h1>Test class from React</h1>
                <h2><i>Testing</i></h2>
            </div>
        );
    }
}

ReactDOM.render(<Test />, app);