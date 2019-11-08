import React, { Component } from 'react';

//import css
import '../css/Process.css';
import '../css/Page.css';
import '../css/Content.css';

//import custom components
import Header from '../components/HeaderHome';
// import SectionHeaderTitle from '../components/SectionHeaderTitle';
import Feedback from '../components/Feedback';
import PlannedReleases from '../components/PlannedReleases';
import Footer from '../components/Footer';
import FooterMobile from '../components/FooterMobile';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import withWidth from '@material-ui/core/withWidth';


//import svg assets
import { TimelineVertical } from '../components/TimelineVertical';
import { TimelineCurve } from '../components/TimelineCurve';
import { CarouselCards } from '../components/CarouselCards';

//import product svg
import { ProductIcons } from '../assets/prod-icons';
import { ProcessImages } from '../assets/process-images';


class Process extends Component {

  constructor(props) {
    super(props);
    this.state = {
      title: "",
      description: "",
      whatsnew: [],
      roadmap: [],
      roadmapTitle: "",
      timelineTitle: "",
      timeline: [],
      releases: [],
      template: 'process',
      windowWidth: 0,
      windowHeight: 0,
      smallWindow: false,
      tabValue: 0,
      process: this.props.match.params.process,
      subprocess: this.props.match.params.subprocess || null
    };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  componentDidMount() {
    fetch("/data/processes/" + this.state.process + ".json")
      .then(res => res.json())
      .then(
        (result) => {
          document.title = result.title;
          this.setState({
            title: result.title,
            description: result.description,
            whatsnew: result.whatsnew,
            roadmap: result.roadmap,
            roadmapTitle: result.roadmapTitle,
            timelineTitle: result.timelineTitle,
            timeline: result.timeline,
            releases: result.releases
          })
        },
        (error) => {
          console.log(error);
        }
      );

    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    this.setState({ windowWidth: window.innerWidth, windowHeight: window.innerHeight, smallWindow: window.innerWidth < 770 });
  }

  renderImage = image => {
    return ProcessImages[0][image];
  }

  handleTabChange = (event, newValue) => {
    this.setState({ tabValue: newValue });
  }



  render() {
    const { title, description, whatsnew, tabValue, roadmap, timeline, releases, template, process, subprocess } = this.state;
    return (
      <div className={"page-container" + (this.state.smallWindow ? " page-container-small" : "")}>
        {roadmap.length > 0 ? <Header title={title} description={description} image={this.renderImage(process)} compact={true} smallWindow={this.state.smallWindow} roadmap={roadmap} windowWidth={this.state.windowWidth} process={this.state.process} pageType={"process"} type="sub-page" /> : null}
        <Feedback />
        <div className="right-side-bg"></div>
        <div className={"content-container" + (this.state.smallWindow ? " content-container-small" : "")}>
          {/* roadmap, timeline and What's new tab group */}
          <div className="process-content">
            <Tabs className="roadmap-process-tabs roadmap-process-tab-titles" value={tabValue} onChange={this.handleTabChange} aria-label="Process flow and release highlights" orientation="vertical">
              <Tab label="Release Highlights" disabled={timeline ? false : true} icon={<div className={"tab-icon" + (tabValue === 0 ? " tab-icon-highlights-active" : " tab-icon-highlights-inactive")}>{<img src={(tabValue === 0 ? ProductIcons[0]["highlightsOnstate"] : ProductIcons[0]["highlightsOffstate"])} alt="Release Highlights"/>}</div>} />
              <Tab label="What's Happening" disabled={whatsnew ? false : true} icon={<div className={"tab-icon" + (tabValue === 1 ? " tab-icon-happening-active" : " tab-icon-happening-inactive")}>{<img src={(tabValue === 1 ? ProductIcons[0]["happeningOnstate"] : ProductIcons[0]["happeningOffstate"]) } alt="What's Happening" />}</div>} />
              {}
            </Tabs>
            <div className="tab-content">
              {this.state.tabValue === 0 ? (timeline.length > 4 || this.state.windowWidth < 1200 ?
                <TimelineVertical timeline={timeline} smallWindow={this.state.smallWindow} /> :
                <TimelineCurve timeline={timeline} pageType={"process"} title={title} />) : undefined}

              {this.state.tabValue === 1 ? <div className="content-horizontal content">
                <CarouselCards slides={whatsnew} windowWidth={this.state.windowWidth} smallWindow={this.state.smallWindow} />
              </div> : null}
            </div>
          </div>
          {/* roadmap */}
          {/* <SectionHeaderTitle title={roadmapTitle} smallWindow={this.state.smallWindow} leftAligned={false} /> */}
          {/* {this.state.tabValue === 0 ? (this.state.windowWidth < 1200 ? <RoadmapVertical roadmap={roadmap} /> :
            <MultiRoadmap roadmap={roadmap} hideArrows={this.state.process === "twm"} />) : undefined} */}

          {/* timeline */}
          {/* <SectionHeaderTitle title={timelineTitle} smallWindow={this.state.smallWindow} leftAligned={false} /> */}
          {/* {this.state.tabValue === 0 ? (timeline.length > 4 || this.state.windowWidth < 1200 ?
            <TimelineVertical timeline={timeline} smallWindow={this.state.smallWindow} /> :
            <TimelineCurve timeline={timeline} />) : undefined} */}


          {/* planned releases */}
          {title ? <PlannedReleases releases={releases} type={template} cardfilter={process} subfilter={subprocess} placeholder="Onboarding" smallWindow={this.state.smallWindow} /> : null}


          {/* cards carousel */}
          {/* <SectionHeaderTitle title="Additional Resources" smallWindow={this.state.smallWindow} firstSection={false} /> */}
          {/* <div className={"title section-header-whats-new" + (this.state.smallWindow ? " section-header-small" : "")}>What's New</div> */}
          {/* <div className="content-horizontal content">
            <CarouselCards slides={whatsnew} windowWidth={this.state.windowWidth} smallWindow={this.state.smallWindow} />
          </div> */}
        </div>

        {this.state.smallWindow ? <FooterMobile /> : <Footer />}
      </div>
    )
  }
}

export default withWidth()(Process)
