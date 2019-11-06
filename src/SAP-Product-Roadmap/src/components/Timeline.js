import React, { Component } from 'react';

//import material ui components
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import StepConnector from '@material-ui/core/StepConnector';

//import css
import '../css/Timeline.css';

//import svg assets
import { ProductIcons } from '../assets/prod-icons';

const ConnectorStyleTimeline = withStyles({
    line: {
        borderColor: '#3D82F0',
        borderTopStyle: "dashed",
        borderWidth: "4px"
    },
})(StepConnector);

const useColorlibTimelineIconStyles = makeStyles({
    root: {
        zIndex: 1,
        height: 31,
        display: 'flex',
        alignItems: 'flex-end'
    }
});

function ColorlibTimelineIcon(item) {
    const classes = useColorlibTimelineIconStyles();
    return (
        <div className={classes.root}>
            <img src={renderIcon("timelineDot")} alt={item.label}></img>
        </div>
    );
}

function renderIcon(icon) {
    return ProductIcons[0][icon];
}

class Timeline extends Component {
    render() {
        return (
            <div className="roadmap-stepper">
                <Stepper alternativeLabel nonLinear={true} connector={<ConnectorStyleTimeline />}>
                    {this.props.timeline.map(item => (
                        <Step key={item.id}>
                            <StepLabel className="roadmap-step-label" StepIconComponent={ColorlibTimelineIcon} StepIconProps={item}>
                                <div className="roadmap-timeline-content">
                                    <label className="roadmap-timeline-label">{item.label}</label>
                                    {item.bullets.map(bullet => (
                                        <div key={bullet.id} className="roadmap-bullet-content">
                                            <img className="roadmap-bullet-image" src={renderIcon("triangleBullet")} alt=""></img>
                                            <label className="roadmap-timeline-bullet-label">
                                                {bullet.text}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </div>
        );
    }
};

export {
    Timeline
};