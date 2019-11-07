import React from 'react';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import ReactSVG from 'react-svg'

//import svg assets
import { ProductIcons } from '../assets/prod-icons';

//import css
import '../css/RoadmapVertical.css';

const useStyles = makeStyles(theme => ({
  popover: {
    pointerEvents: 'none',
  },
  paper: {
    padding: theme.spacing(1),
  },
}));

const defaultContent = {
    title: "", content: [{ header: "", body: "" }]
};


export function RoadmapVertical(props) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
    const [selectedContent, setSelectedContent] = React.useState(defaultContent);

  const handlePopoverOpen = (event, item) => {
    const target = event.currentTarget;
    setTimeout(() => {
      setAnchorEl(target);
    }, 100);

    event.currentTarget.classList.add("roadmap-stepper-icon-color");
    var selectedContent = item.moreDetails ? item.moreDetails : defaultContent;
    selectedContent.title = item.label;
    setSelectedContent(selectedContent);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    if (anchorEl) {
        anchorEl.classList.remove("roadmap-stepper-icon-color");
    }
  };

  function renderIcon(icon) {
    return ProductIcons[0][icon];
  }
  const open = Boolean(anchorEl);

  return (
    <div className="roadmap-timeline-vertical roadmap-vertical">
      
      {props.roadmap.map((item, index) => (
        <div 
          className="vertical-roadmap-step" 
          key={index} 
          aria-owns={open ? 'simple-popover-roadmap' : undefined}
          aria-haspopup="true"
          onMouseEnter={(e) => handlePopoverOpen(e, item)}
          onMouseLeave={handlePopoverClose}
        >
          <ReactSVG src={renderIcon(item.icon)} />
          <div>{item.label}</div>
        </div>
      ))}
      <Popover
        id="simple-popover-roadmap"
        className={`${classes.popover} roadmap-stepper-popover`}
        classes={{
          paper: classes.paper,
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <div className="content">
          <div className="title-container">
            <div className="title-bar"></div>
            <div className="title">{selectedContent.title}</div>
          </div>
          {selectedContent.content.map(content => (
            <div key={content.item + "-" + selectedContent.title} className="roadmap-item">
                <img className="item-bullet" src={renderIcon("roundBullet")} alt=""></img>
                <label className="item-label">{content.item}</label>
            </div>
          ))}
        </div>
      </Popover>
    </div>
  );
}