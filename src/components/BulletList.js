import React, { Component } from 'react';

//import css
import '../css/TimelineCurve.css';
import '../css/Timeline.css';
import '../css/BulletList.css';

import { ProductIcons } from '../assets/prod-icons';

function renderIcon(icon) {
    return ProductIcons[0][icon];
}

class BulletList extends Component {
    render() {
        return (<div className="roadmap-bullet-container">
            <label className="roadmap-bullet-list-title">{this.props.description.title}</label>
            {this.props.description.items ? (this.props.description.items.map(item => (
                <div key={item.key} className="roadmap-bullet-content">
                    <img className="roadmap-bullet-image" src={roundBullet} alt=""></img>
                    <label className="roadmap-timeline-bullet-label">
                        {item.label}
                    </label>
                </div>
            ))) :
            <div className="roadmap-bullet-description">{this.props.description.descriptions}</div>}
        </div>)
    }
}

export default BulletList;