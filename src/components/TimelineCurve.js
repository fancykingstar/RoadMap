import React, { Component } from 'react';

//import material ui components
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import { makeStyles } from '@material-ui/core/styles';
import ReactSVG from 'react-svg'

//import css
import '../css/TimelineCurve.css';
import '../css/Timeline.css';

//import svg assets
import { ProductIcons } from '../assets/prod-icons';

const useColorlibTimelineIconStyles = makeStyles({
    root: {
        zIndex: 1,
        height: 32,
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

class TimelineCurve extends Component {
    componentDidUpdate(prevProps) {
        if(prevProps !== this.props) {
            console.log("punk curve", this.props);
        }
    }
    render() {
        return (
            <div className={"timeline-curve" + (this.props.pageType && this.props.pageType === "product" ? " product-curve" : " process-curve") + (this.props.title &&this.props.title.length < 16 ? " offset-top" : "")}>
                <ReactSVG src={renderIcon("timelineCurve")} />
                <div className={"timeline-curve-steps-container timeline-curve-steps-container-" + this.props.timeline.length}>
                    {this.props.timeline.map(item => (
                        <Step key={item.id}>
                            <StepLabel className={"roadmap-step-label timeline-curve-step-label timeline-curve-step-label-" + this.props.timeline.length}
                                StepIconComponent={ColorlibTimelineIcon}
                                StepIconProps={item}>
                                <div className="roadmap-timeline-content">
                                    <label className="roadmap-timeline-label timeline-curve-label">{item.label}</label>
                                    {item.bullets.map(bullet => (
                                        <div key={bullet.id} className="roadmap-bullet-content">
                                            <img className="roadmap-bullet-image" src={renderIcon("blueBullet")} alt=""></img>
                                            <label className="roadmap-timeline-bullet-label">
                                                {bullet.text}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </StepLabel>
                        </Step>
                    ))}
                </div>
            </div>
        );
    }
};

export {
    TimelineCurve
};