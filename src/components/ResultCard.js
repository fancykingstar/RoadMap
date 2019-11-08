import React, { useState } from 'react';

//import material ui components
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

//import svg assets
import { ProductIcons } from '../assets/prod-icons';

// function handleTagClick(tag) {
//     if (tag.category === "process" || tag.category === "product") {
//       window.location.href = "/" + tag.category + "/" + tag.key
//     }
//   }

 
export default function ResultCard(props) {
    const [state] = useState({
        title: props.title,
        relevance: props.relevance || 0,
        description: props.description,
        icon: props.icon,
        type: props.type,
        smallWindow: props.smallWindow
    });

    const handleNavigation = (type, destination) => {
        let path = type === "process" ? "process" : "product";
        window.location = "/" + path + "/" + destination;
    }

    const renderIcon = icon => {
      return ProductIcons[0][icon];
    }
  
  return (
    <Card className={"default-card release-card detail-card" + (state.smallWindow ? " release-card-small" : "")} onClick={(e) => handleNavigation(state.type, state.icon)}>
      <CardContent className="content">
          <div className="pr-toolbar">
            <div className="icon-container">
                <div className= {"icon " + (state.type==="product" ? "result-icon-products": "result-icon-process")}>
                <img src={renderIcon(state.icon)} alt={state.title}></img></div>
            </div>
            <div className="action-container">
                <div className="card-type">{state.type}</div>
            </div>
          </div>
          <div className="page-result-title">{state.title}</div>
          <div className="release-actionbar">
              <div className="release-description">{state.description}</div> 
          </div>
      </CardContent>
    </Card>
  )
}


