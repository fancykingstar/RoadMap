import React, { Component } from 'react';

//import material ui components
import { CarouselCards } from '../components/CarouselCards';

//import css
import '../css/Page.css';
import '../css/Content.css';

//import custom components
import Header from '../components/HeaderHome';
import Feedback from '../components/Feedback';
import PlannedReleases from '../components/PlannedReleases';
import Footer from '../components/Footer';
import FooterMobile from '../components/FooterMobile';
import SectionHeaderTitle from '../components/SectionHeaderTitle';
import { TimelineVertical } from '../components/TimelineVertical';
import { TimelineCurve } from '../components/TimelineCurve';

import { processlabels } from '../utils/processutils';

//import product svg
import { ProductImages } from '../assets/product-images';

class Integration extends Component {

  constructor(props) {
    super(props);
    this.state = {
      title: '',
      description: '',
      template: 'integration',
      whatsnew: [],
      releases: [],
      timelineTitle: '',
      timeline: [],
      windowWidth: 0,
      windowHeight: 0,
      smallWindow: false,
      integration: this.props.match.params.integration,
      subintegration: this.props.match.params.subintegration || null
    };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  componentDidMount() {
    fetch("/data/ingegration/" + this.state.integration + ".json")
      .then(res => res.json())
      .then(
        (result) => {

          this.setState({
            title: result.title,
            description: result.description,
            whatsnew: result.whatsnew,
            releases: result.releases,
            timelineTitle: result.timelineTitle,
            timeline: result.timeline
          }, function() {
            this.checkTitle();

          })
        },
        (error) => {
          console.log(error);
          this.checkTitle();
        }
      )
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.controlHeader);
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  checkTitle = () => {
    let title = this.state.title === "" ? processlabels[0][this.state.integration] : this.state.title;
    if (title !== this.state.title) {

      this.setState(prevState => ({
        ...prevState,
        title: title
      }));
    }
    document.title = title;
  }

  updateWindowDimensions() {
    this.setState({ windowWidth: window.innerWidth, windowHeight: window.innerHeight, smallWindow: window.innerWidth < 770 });
  }

  renderImage = image => {
    let img = ProductImages[0][image];
    img = img === undefined ? ProductImages[0]["default"] : img;
    return img;
  }

  render() {
    const { title, description, whatsnew, releases, template, integration, subintegration, timelineTitle, timeline } = this.state;
    return (
      <div className={"page-container" + (this.state.smallWindow ? " page-container-small" : "")}>
        <Header title={title} description={description} image={this.renderImage(integration)} compact={true} smallWindow={this.state.smallWindow} type="sub-page" />
        <Feedback />
        <div className="right-side-bg"></div>
        <div className={"content-container" + (this.state.smallWindow ? " content-container-small" : "")}>
        {whatsnew &&  whatsnew.length > 0 ? <SectionHeaderTitle title="What's New" smallWindow={this.state.smallWindow} leftAligned={true} /> : null }
        {whatsnew &&  whatsnew.length > 0 ?
          <div className="content-horizontal content">
            <CarouselCards slides={whatsnew} windowWidth={this.state.windowWidth} smallWindow={this.state.smallWindow} />
          </div>
          : null
          }
          { timeline && timeline.length > 0 ? <SectionHeaderTitle title={timelineTitle} smallWindow={this.state.smallWindow} leftAligned={false} /> : null}
          { timeline && timeline.length > 0 ?
          timeline.length > 4 || this.state.windowWidth < 1200 ? <TimelineVertical timeline={timeline} smallWindow={this.state.smallWindow} /> :
          <TimelineCurve timeline={timeline} /> : null}
          <PlannedReleases releases={releases} type={template} cardfilter={integration} subfilter={subintegration} placeholder="Travel Expenses" smallWindow={this.state.smallWindow} />
        </div>

        {this.state.smallWindow ? <FooterMobile/> : <Footer/>}
      </div>
    )
  }
}

export default Integration;
