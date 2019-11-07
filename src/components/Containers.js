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
    });
  }


  render() {
    let { title, details, fullwidth } = this.state, level1, lineitems;
    if (typeof details === "string") {
      details = details.split('\n')
      level1 = details.filter(detail => detail.substr(0, 1) === '*').length;
      //console.log('level1', level1);
      lineitems = details.map((detail, index) => {
      if (!detail.length) { return; }
      return <p className={'contentpoint ' + ((details.length>1) ? ( (level1 === 0) ? 'addBullet bullet' : ((detail.substr(0,1) === '-') ? 'bullet' : '') ) : '') + (detail.substr(0,1)==='*' ? ' secondBullet addBullet' : '')} key={index}>{(detail.substr(0,1)==='*' )? detail.replace(/\*/gi, "") : detail}</p>});
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
    // if (!this.state.businessvalues.length) {
    //   let businessvalues = this.state.businessvalues.replace(/\*/g, "").split('\n')
    //   console.log(this.props)
      this.setState({
        title: this.props.title,
        details: this.props.details,
        businessvalues: this.state.businessvalues,
        featuredetails: this.props.featuredetails,
        steps: this.props.steps
      })
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
                        <p className={'contentpoint ' + ((item.detail.length > 1) ?
                          ((level1 === 0) ? 'addBullet bullet' : ((detail.substr(0, 1) === '-') ?
                            'bullet' : '')) : '') + (detail.substr(0, 1) === '*' ? ' secondBullet addBullet' : '')} key={index}>
                          {(detail.substr(0, 1) === '*') ? detail.replace("*", "") : detail}
                        </p>
                      )
                    }) : typeof item.detail === "string" ?
                      item.detail.includes('\n') ?
                        item.detail
                          .split('\n')
                          .map((str, i) => {
                            console.log(str);
                            console.log(item)
                            return (
                              <p className={'contentpoint' + ((str.length > 1 && (str[0] !== '-' && str[0] !== '*') ? ' addBullet bullet' :
                               str[0] === '-' ? ' bullet' : '' + str[0] === '*' ? ' secondBullet addBullet' : ''
                               ))} key={i}>
                                 {
                                  //  str.replace(/\*/gi, "")
                                  str.replace("*", "")
                                   }
                              </p>
                            )
                          })
                        : <p className={"contentpoint addBullet bullet"}>{item.detail}
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
