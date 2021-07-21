import React from 'react';
import * as styles from './style.module.css';

export default class NeonButton extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        //let my = this;
        //let color = this.props.color;
        return (
            <a href={this.props.link} className={styles.neonButton}>{this.props.text}</a>
        );
    }
}