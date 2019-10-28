import React, { Component } from 'react';

//import material ui components
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import { makeStyles } from '@material-ui/core/styles';

//import css
import '../css/TimelineVertical.css';

//import svg assets
import { ProductIcons } from '../assets/prod-icons';

const useColorlibTimelineIconStyles = makeStyles({
    root: {
        zIndex: 1,
        height: 31,
        display: 'flex',
        alignItems: 'flex-end'
    }
});

const useSmallColorlibTimelineIconStyles = makeStyles({
    root: {
        zIndex: 1,
        height: 17,
        display: 'flex',
        alignItems: 'flex-end'
    }
});

function ColorlibTimelineIcon(args) {
    const classes = useColorlibTimelineIconStyles();
    const smallClasses = useSmallColorlibTimelineIconStyles();
    const dot = args.smallWindow ? "timelineDotSmall" : "timelineDot";
    return (
        <div className={args.smallWindow ? smallClasses.root : classes.root}>
            <img src={renderIcon(dot)} alt={args.item.label}></img>
        </div>
    );
}

function ColorlibTimelineBulletIcon(item) {
    const classes = useColorlibTimelineIconStyles();
    return (
        <img className={classes.root} src={renderIcon("triangleBullet")} alt={item.label}></img>
    );
}

function renderIcon(icon) {
    return ProductIcons[0][icon];
}

class TimelineVertical extends Component {
    render() {
        return (
            <div className={"roadmap-timeline-vertical" + (this.props.smallWindow ? " roadmap-timeline-vertical-small" : "")}>
                <Stepper nonLinear={true} orientation={"vertical"}>
                    {this.props.timeline.map(item => (
                        <Step key={item.id}>
                            <StepLabel className="roadmap-timeline-vertical-label" 
                                        StepIconComponent={ColorlibTimelineIcon} 
                                        StepIconProps={{item: item, smallWindow: this.props.smallWindow}} >
                                {item.label}
                            </StepLabel>
                            <div className="roadmap-timeline-vertical-line">
                                {item.bullets.map(bullet => (
                                    <StepLabel key={bullet.id}
                                        className="roadmap-timeline-vertical-bullet-label"
                                        StepIconComponent={ColorlibTimelineBulletIcon}
                                        StepIconProps={bullet} >{bullet.text}</StepLabel>
                                ))}
                            </div>
                        </Step>
                    ))}
                </Stepper>
            </div>
        );
    }
};

export {
    TimelineVertical
};