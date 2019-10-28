import React, { } from 'react';

//import material ui components
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import StepConnector from '@material-ui/core/StepConnector';
import Popover from '@material-ui/core/Popover';
import ReactSVG from 'react-svg'

//import css
import '../css/Roadmap.css';

//import svg assets
import { ProductIcons } from '../assets/prod-icons';

const defaultContent = {
    title: "", content: [{ header: "", body: "" }]
};

const ConnectorStyle = withStyles({
    line: {
        borderColor: '#b1b1b1',
        borderTopStyle: "dashed",
        borderWidth: "2px"
    },
})(StepConnector);

const ConnectorStyleNoDash = withStyles({
    line: {
        borderTopStyle: "none"
    },
})(StepConnector);

const useColorlibStepIconStyles = makeStyles({
    root: {
        zIndex: 1,
        height: 56,
        display: 'flex',
        alignItems: 'flex-end',
        flexDirection: "row"
    }
});

export function Roadmap(props) {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [selectedContent, setSelectedContent] = React.useState(defaultContent);

    function handleStepClick(event, item) {
        setAnchorEl(event.currentTarget);
        event.currentTarget.classList.add("roadmap-stepper-icon-color");
        var selectedContent = item.moreDetails ? item.moreDetails : defaultContent;
        selectedContent.title = item.label;
        setSelectedContent(selectedContent);
    }

    function handleClose() {
        if (anchorEl) {
            anchorEl.classList.remove("roadmap-stepper-icon-color");
        }
        setAnchorEl(null);
        setSelectedContent(defaultContent);
    }

    function ColorlibStepIcon(props) {
        const classes = useColorlibStepIconStyles();
        if(props.item.isFirst || props.hideArrows) {
            return (<div className={(props.multiLine ? "" : classes.root)}>
                <ReactSVG src={renderIcon(props.item.icon)} />
            </div>);
        }

        if (props.reverseDirection) {
            return (<div className={(props.multiLine ? "roadmap-svg-group" : classes.root)}>
                <ReactSVG src={renderIcon(props.item.icon)} />
                <ReactSVG className="roadmap-svg-icon" src={ProductIcons[0]["rightArrow"]} />
            </div>);
        }

        return (
            <div className={(props.multiLine ? "roadmap-svg-group" : classes.root)}>
                <ReactSVG className="roadmap-svg-icon" src={ProductIcons[0]["leftArrow"]} />
                <ReactSVG src={renderIcon(props.item.icon)} />
            </div>
        );
    }

    function renderIcon(icon) {
        return ProductIcons[0][icon];
    }

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    return (
        <div className={"roadmap-stepper " + (props.multiLine ? "" : "roadmap-stepper-single-line")}>
            <Stepper alternativeLabel nonLinear={true} connector={props.nodash ? <ConnectorStyleNoDash /> : <ConnectorStyle />} >
                {props.roadmap.map(item => (
                    <Step key={item.label}>
                        <StepLabel onClick={(e) => handleStepClick(e, item)}
                            className={"roadmap-stepper-label roadmap-stepper-label" 
                                + (props.reverseDirection ? "-left" : "-right")}
                            StepIconComponent={ColorlibStepIcon}
                            StepIconProps={{ "item": item, "reverseDirection": props.reverseDirection, 
                                            "multiLine": props.multiLine, "hideArrows": false}}>
                            {item.label}
                        </StepLabel>
                    </Step>
                ))}
            </Stepper>
            <Popover
                className="roadmap-stepper-popover"
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <div className="content">
                    <div className="title-container">
                        <div className="title-bar"></div>
                        <div className="title">Key Capabilities</div>
                    </div>
                    {selectedContent.content.map(content => (
                        <div key={content.item + "-" + selectedContent.title} className="roadmap-item">
                            <img className="item-bullet" src={renderIcon("triangleBulletOrange")} alt=""></img>
                            <label className="item-label">{content.item}</label>
                        </div>
                    ))}
                </div>
            </Popover>
        </div>
    );
}
