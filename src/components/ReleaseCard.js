import React, { useState } from 'react';

//import material ui components
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Collapse from '@material-ui/core/Collapse';

//import svg icons
import edit from '../assets/images/edit.svg';
// import download from '../assets/images/download.svg';
// import like from '../assets/images/like.svg';
import uparrow from '../assets/images/up-arrow.svg';
import downarrow from '../assets/images/down-arrow.svg';
import star from '../assets/images/star.svg';

//import custom component
import  { DetailContainer, StepContainer } from '../components/Containers';

//import css
import '../css/Chip.css';

const tagKeyMatchTable = [{
  from: 'totalworkforcemanagement',
  to: 'twm'
}, {
  from: 'c/4hana',
  to: 'c4hana'
}];

function handleTagClick(tag) {
  console.log("**TAG: ",tag, "\n");
  if (tag.category === "process" || tag.category === "product" || tag.category === "integration") {
    let tagKey = tag.key;
    tagKeyMatchTable.forEach(row => tagKey = row.from === tagKey ? row.to : tagKey);

    window.location.href = `/${tag.category}/${tagKey}`;
  }
  if (tag.category === "subprocess" || tag.category === "subproduct") {
    window.location.href = "/" + tag.category.substring(3) + "/" + (tag["parentKey"] === "totalworkforcemanagement" ? "twm" : tag["parentKey"]) + "/" + tag.key;
  }
}

function addPeriod(content) {
  content = content.trim()
  if (content.substr(-1) === "."){
      return content
  }
  return content + "."
}

export default function ReleaseCard(props) {
  const [state, setState] = useState({
    _id: props._id,
    title: props.title,
    date: props.date,
    relevance: props.relevance || 0,
    description: addPeriod(props.description),
    chips: props.chips,
    businessvalues: props.values,
    featuredetails: props.details,
    futureplans: props.futureplans,
    status: false,
    likes: props.likes,
    icon: downarrow,
    staging: props.staging
  });

  const handleCollapseableSection = () => {
    setState(prev => ({
      ...prev,
      status: !prev.status,
      icon: prev.status === true ? downarrow : uparrow
    }))
  }

  const handleArrowCollapseableSection = e => {
    setState(prev => ({
      ...prev,
      status: !prev.status,
      icon: prev.status === true ? downarrow : uparrow
    }))
    e.stopPropagation();
  }

  const increaseLikeCount = e => {
    setState(prev => ({
      ...prev,
      likes : prev.likes + 1
    }))
    fetch("https://roadmap-api.cfapps.us10.hana.ondemand.com/api/like?id=" + props._id);
    e.stopPropagation();
  }

  // const downloadInformation = e => {
  //   console.log('download pdf');
  //   e.stopPropagation();
  // }

  const editReleaseCard = e => {
    window.location = 'https://roadmap-staging.cfapps.us10.hana.ondemand.com/update?id='+ state._id;
    e.stopPropagation();
  }

  const handleContentSection = e => {
    e.stopPropagation();
  }

  return (
    <Card className={"default-card release-card" + (props.smallWindow ? " release-card-small" : "")} onClick={() => handleCollapseableSection()}>
      <CardContent className="content">
          <div className="pr-toolbar">
            <div className="date-container">
                <div className="date-bar"></div>
                <div className="date">{state.date}</div>
            </div>


            <div className="action-container">
              <Button className="actionButton" disableFocusRipple={true} disableRipple={true} onClick={increaseLikeCount}><img src={star} alt="add to favorite" /></Button>

            </div>

          </div>
          <div className="release-title">{state.title}</div>
          <div className="release-actionbar">
            <div className="release-description">{state.description}</div>
            <div className="release-trigger"><img onClick={handleArrowCollapseableSection} alt="collapse

            " src={state.icon} /></div>
          </div>
          <div className="release-tag-container">
            <div className="TagTitle">TAGS:</div>
            {state.chips && state.chips.length ? state.chips.map(chip => (
              <Chip
                key={chip.key}
                label={chip.label.replace("SAP", "")}
                className={"release-chip " + (props.smallWindow ? " release-chip-small" : "")}
                onClick={() => handleTagClick(chip)}
              />
            )) : null}
            </div>
            <Collapse in={state.status} timeout="auto" unmountOnExit>
              <div className={"collapse-container" + (props.smallWindow ? " collapse-container-small" : "")} onClick={handleContentSection}>
                <div className={"details-left" +  (props.smallWindow ? " details-left-small" : "") + ((state.futureplans && state.futureplans.length > 0) ? "" : " single-column")}>
                  { (state.businessvalues && state.businessvalues.length > 0)
                  ? <DetailContainer fullwidth={(state.futureplans && state.futureplans.length > 0) ? false : true} title="business values" details={state.businessvalues} />
                  : null
                  }
                  {(state.featuredetails && state.featuredetails.length > 0)
                  ? <DetailContainer fullwidth={(state.futureplans && state.futureplans.length > 0) ? false : true} title="feature details" details={state.featuredetails} />
                  : null
                  }

                </div>
                {state.futureplans.length > 0
                ?   <div className="details-right">
                      <StepContainer title="future planned capabilities" steps={state.futureplans} businessvalues={state.businessvalues} featuredetails={state.featuredetails} />
                    </div>
                 : null
                }

              </div>

           </Collapse>
      </CardContent>
    </Card>
  )
}
