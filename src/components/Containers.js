import React, { Component } from 'react';

//import material ui components
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

//import css
import '../css/Details.css';

//import svg assets
import { ProductIcons } from '../assets/prod-icons';

class DetailContainer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      title: '',
      details: [],
      fullwidth: false
    };
  }

  componentDidMount() {
    this.setState({
      title: this.props.title,
      details: this.props.details,
      fullwidth: this.props.fullwidth
    }, () => console.log('mountedDetails:', this.state.details));
  }


  render() {
    let { title, details, fullwidth } = this.state, level1, lineitems;
    if (typeof details === "string") {
      details = details.replace(/\*/g, "").split('\n')
      level1 = details.filter(detail => detail.substr(0, 1) === '-').length;
      lineitems = details.map((detail, index) =>
        <p className={'contentpoint ' + ((details.length > 1) ? ((level1 === 0) ? 'addBullet bullet'
          :
          ((detail.substr(0, 1) === '-') ? 'bullet' : '')) : '') + (detail.substr(0, 1) === '>' ? ' secondBullet addBullet' : '')} key={index}>{(detail.substr(0, 1) === '>') ? detail.substr(2) : detail}
        </p>);
    }

    return (
      <div className={"detail-container" + (fullwidth ? " single-column" : "")}>
        <div className="detail-title-container">
          <div className="detail-title-bar"></div>
          <div className="detail-title">{title}</div>
        </div>
        <div className="detail-body">
          {lineitems}</div>
      </div>
    )
  }
}

const useFutureTimelineIconStyles = makeStyles({
  root: {
    zIndex: 1,
    width: 27,
    height: 17,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
  }
});

function FutureTimelineIcon(item) {
  const classes = useFutureTimelineIconStyles();
  return (
    <div className={clsx(classes.root)}>
      <img src={renderIcon("StepIcon")} alt={item.date}></img>
    </div>
  );
}

function renderIcon(icon) {
  return ProductIcons[0][icon];
}

class StepContainer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      title: '',
      details: [],
      businessvalues: [],
      featuredetails: [],
      steps: []
    };
  }

  componentDidMount() {
    if (!this.state.businessvalues.length) {
      let businessvalues = this.props.businessvalues.replace(/\*/g, "").split('\n')
      console.log('*steps', this.props.steps);
      this.setState({
        title: this.props.title,
        details: this.props.details,
        businessvalues: businessvalues,
        featuredetails: this.props.featuredetails,
        steps: this.props.steps
      }, () => console.log(this.state));
    }
  }


  render() {
    const { title, steps, businessvalues, featuredetails } = this.state;
    return (
      <div className={"step-container" + ((businessvalues.length === 0 && featuredetails.length === 0) ? " full-screen" : "")}>
        <div className="step-title-container">
          <div className="step-title-bar"></div>
          <div className="step-title">{title}</div>
        </div>
        {steps && steps.length > 0 ?
          <Stepper orientation="vertical" className="futureStepper">
            {steps.map((item, index) => (
              <Step key={index} active={true}>
                <StepLabel StepIconComponent={FutureTimelineIcon} StepIconProps={item}>{item.displaydate}</StepLabel>
                <StepContent>{
                  typeof item.detail === "array" ?
                    item.detail.map(function (detail, index) {
                      const level1 = item.detail.filter(detail => detail.substr(0, 1) === '-').length;
                      return (
                        <p className={'contentpoint ' + ((item.detail.length > 1) ? ((level1 === 0) ? 'addBullet bullet' : ((detail.substr(0, 1) === '-') ? 'bullet' : '')) : '') + (detail.substr(0, 1) === '>' ? ' secondBullet addBullet' : '')} key={index}>{(detail.substr(0, 1) === '>') ? detail.substr(2) : detail}</p>
                      )
                    }) : typeof item.detail === "string" ?
                      <p className={"contentpoint " + (item.detail.includes("*") ? 'addBullet' : "")}>{item.detail.replace("*", "")}
                      </p> : null
                }</StepContent>
              </Step>
            ))}
          </Stepper>
          : null}
      </div>
    )
  }
}

export { DetailContainer, StepContainer }
