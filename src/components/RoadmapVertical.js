import React, { } from 'react';

//import material ui components
import Popover from '@material-ui/core/Popover';
import ReactSVG from 'react-svg'

//import css
import '../css/RoadmapVertical.css';

//import svg assets
import { ProductIcons } from '../assets/prod-icons';

const defaultContent = {
    title: "", content: [{ header: "", body: "" }]
};

export function RoadmapVertical(props) {
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

    function renderIcon(icon) {
        return ProductIcons[0][icon];
    }

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover-roadmap' : undefined;

    return (
        <div className="roadmap-timeline-vertical roadmap-vertical">
            {props.roadmap.map(item => (
                <div className="vertical-roadmap-step" onClick={(e) => handleStepClick(e, item)}>
                    <ReactSVG src={renderIcon(item.icon)} />
                    <div>{item.label}</div>
                </div>
            ))}
            <Popover
                className="roadmap-stepper-popover"
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <div className="content">
                    <div className="title-container">
                        <div className="title-bar"></div>
                        <div className="title">{selectedContent.title}</div>
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
};