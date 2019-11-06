import React, { Component } from 'react';

//import material ui components
import { CarouselCards } from '../components/CarouselCards';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

//import css
import '../css/Page.css';
import '../css/Content.css';

//import custom components
import Header from '../components/HeaderHome';
import Feedback from '../components/Feedback';
import PlannedReleases from '../components/PlannedReleases';
import Footer from '../components/Footer';
import FooterMobile from '../components/FooterMobile';
import { TimelineVertical } from '../components/TimelineVertical';
import { TimelineCurve } from '../components/TimelineCurve';

import { productlabels } from '../utils/processutils';

//import product svg
import { ProductIcons } from '../assets/prod-icons';
import { ProductImages } from '../assets/product-images';

class Products extends Component {

  constructor(props) {
    super(props);
    this.state = {
      title: '',
      description: '',
      template: 'product',
      whatsnew: [],
      releases: [],
      timelineTitle: '',
      timeline: [],
      windowWidth: 0,
      windowHeight: 0,
      smallWindow: false,
      product: this.props.match.params.product,
      subproduct: this.props.match.params.subproduct || null,
      tabValue: 0
    };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  componentDidMount() {
    fetch("/data/products/" + this.state.product + ".json")
      .then(res => res.json())
      .then(
        (result) => {

          this.setState({
            title: result.title,
            description: result.description,
            whatsnew: result.whatsnew,
            releases: result.releases,
            timelineTitle: result.timelineTitle,
            timeline: result.timeline,
            tabValue: !result.timeline ? 1 : 0,
          }, function () {
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
    let title = this.state.title === "" ? productlabels[0][this.state.product] : this.state.title;
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

  handleTabChange = (event, newValue) => {
    this.setState({ tabValue: newValue });
  }

  render() {
    const { title, description, whatsnew, releases, template, product, subproduct, timeline, tabValue, windowWidth } = this.state;
    return (
      <div className={"page-container" + (this.state.smallWindow ? " page-container-small" : "")}>
        <Header title={title} description={description} image={this.renderImage(product)} compact={true} smallWindow={this.state.smallWindow} type="sub-page" pageType={"product"} windowWidth={this.state.windowWidth} product={this.state.product} />
        <Feedback />
        <div className="right-side-bg"></div>
        <div className={"content-container" + (this.state.smallWindow ? " content-container-small" : "")}>
          <div className="process-content">
            <Tabs className="roadmap-process-tabs roadmap-process-tab-titles" value={tabValue} onChange={this.handleTabChange} aria-label="Process flow and release highlights" orientation="vertical">
              <Tab label="Release Highlights" disabled={timeline ? false : true} icon={<div className={"tab-icon" + (tabValue === 0 ? " tab-icon-highlights-active" : " tab-icon-highlights-inactive")}>{<img src={(tabValue === 0 ? ProductIcons[0]["highlightsOnstate"] : ProductIcons[0]["highlightsOffstate"])} alt="Release Highlights"/>}</div>} />
              <Tab label="What's Happening" disabled={whatsnew ? false : true} icon={<div className={"tab-icon" + (tabValue === 1 ? " tab-icon-happening-active" : " tab-icon-happening-inactive")}>{<img src={(tabValue === 1 ? ProductIcons[0]["happeningOnstate"] : ProductIcons[0]["happeningOffstate"])} alt="What's Happening"/>}</div>} />
            </Tabs>
            <div className="tab-content">
              {timeline && timeline.length > 0 && tabValue === 0 ?
                timeline.length > 4 || windowWidth < 1200 ? <TimelineVertical timeline={timeline} smallWindow={this.state.smallWindow} /> :
                  <TimelineCurve timeline={timeline} pageType={"product"} title={title} /> : null}

              {this.state.tabValue === 1 ? <div className="content-horizontal content">
                <CarouselCards slides={whatsnew} windowWidth={windowWidth} smallWindow={this.state.smallWindow} />
              </div> : null}
            </div>
          </div>
          <PlannedReleases releases={releases} type={template} cardfilter={product} subfilter={subproduct} placeholder="Travel Expenses" smallWindow={this.state.smallWindow} endpoint={product}/>
        </div>

        {/* {timeline && timeline.length > 0 ? <SectionHeaderTitle title={timelineTitle} smallWindow={this.state.smallWindow} leftAligned={false} /> : null} */}



        {this.state.smallWindow ? <FooterMobile /> : <Footer />}
      </div>
    )
  }
}

export default Products;
