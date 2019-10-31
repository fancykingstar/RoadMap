import React, { Component } from 'react';
import { HashLink as Link } from 'react-router-hash-link';

//import custom components
import Snackbar from '@material-ui/core/Snackbar';
import Menu from '../components/Menu';
import { SearchBar } from '../components/Search';
import HeaderBarMobile from '../components/HeaderBarMobile';
import BulletList from '../components/BulletList';

import { ProductSearch } from '../components/Search';
import { suggestions, trends } from '../utils/searchutils';
import { activeprocesses } from '../utils/processutils';
import { MultiRoadmap } from '../components/MultiRoadmap';
import { RoadmapVertical } from '../components/RoadmapVertical';

//import css
import '../css/HeaderHome.css';
import '../css/Menu.css';

//import assets
import info from '../assets/images/info.svg';
import notificationBell from '../assets/images/notification-bell.svg';
import logo from '../assets/images/sap-logo.svg';
import accountIcon from '../assets/images/home-account.svg';
import compactAccountIcon from '../assets/images/compact-account.svg';

class Header extends Component {

  constructor(props) {
    super(props);
    this.state = {
      title: this.props.title || "",
      description: this.props.description,
      compact: this.props.compact,
      type: this.props.type || "regular",
      smallWindow: this.props.smallWindow,
      roadmap: undefined,
      processes: [],
      products: [],
      headerimage: '',
      resultspage: this.props.resultspage || false,
      resulthandler: this.props.resulthandler || false
    };
    this.handleAccountClick = this.handleAccountClick.bind(this);
    this.renderProcessHeaderContainers = this.renderProcessHeaderContainers.bind(this);
    this.renderProductHeaderContainers = this.renderProductHeaderContainers.bind(this);

  }

  componentDidMount() {
    fetch("/data/menushort.json")
      .then(res => res.json())
      .then(
        (result) => {
          result.processes.forEach(process => {
            process.state = activeprocesses.includes(process.title) ? true : false;
          })
          result.products.forEach(product => {
            product.state = true;
          })
          this.setState({
            processes: result.processes,
            products: result.products
          })
        },
        (error) => {
          console.log(error);
        }
      )
    this.setState({
      description: this.props.description,
      title: this.props.title || "",
      compact: this.props.compact,
      headerimage: this.props.image,
      roadmap: this.props.roadmap,
      process: this.props.process
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.description !== this.props.description) {
      this.setState({
        description: this.props.description
      });
    }
    if (prevProps.title !== this.props.title) {
      this.setState({
        title: this.props.title
      });
    }
    if (prevProps.compact !== this.props.compact) {
      this.setState({
        compact: this.props.compact
      });
    }
  }

  handleAccountClick = () => {
    const showToast = !this.state.showToast;
    this.setState({ showToast: showToast });
  }

  renderProcessHeaderContainers = () => {
    const { title, compact, headerimage, roadmap } = this.state;
    let border = "0px solid red";
    return (
      <div className="header-divided-container">
        <div className={"header-left-container header-process" + (this.props.smallWindow ? " hidden" : "")}>
          {compact ? <img src={headerimage} style={{ border: border, height: 393 + "px", width: 537.13 + "px"}} alt={title} /> : null}
        </div>
        <div className="header-right-container">
          <div className={"title title-" + (compact ? "compact" : "default")
            + (this.props.smallWindow ? " title-small" : "")
            + (!this.props.smallWindow && title.length > 20 ? " title-long" : "")}>{title}
              <img src={info} alt="info" style={ { position: this.props.windowWidth < 816 ? "relative":"absolute", paddingLeft: 13 + "px", paddingTop: 21 + "px"} }/>
          </div>
          <div className="header-roadmap-container">
          {/* {(this.state.smallWindow ? <RoadmapVertical roadmap={this.props.roadmap} /> :
            <MultiRoadmap roadmap={this.state.roadmap} hideArrows={this.props.process === "twm"} />) } */}
            { roadmap && roadmap.length > 0 ? this.props.windowWidth < 1400 ? <RoadmapVertical roadmap={roadmap} /> : <MultiRoadmap roadmap={roadmap} hideArrows={this.state.process === "twm"} /> : null}
          {/* {this.state.windowWidth < 1400 ? <RoadmapVertical roadmap={roadmap} /> : roadmap && roadmap.length > 0 ?
            <MultiRoadmap roadmap={roadmap} hideArrows={this.state.process === "twm"} /> : null } */}
              {/* <MultiRoadmap roadmap={roadmap} hideArrows={this.state.process === "twm"} /> */}
          </div>
        </div>
      </div>
    )
  }

  renderProductHeaderContainers = () => {
    const { title, description, compact, type, headerimage } = this.state;
    let border = "0px solid red";
    return (
      <div className="header-divided-container">
        <div className="header-left-container">
          <div className={"title title-" + (compact ? "compact" : "default")
            + (this.props.smallWindow ? " title-small" : "")
            + (!this.props.smallWindow && title.length > 20 ? " title-long" : "")}>{title}</div>
          <div className={"description-" + (compact ? "compact" : "default")
            + (this.props.smallWindow ? " description-small" : " description")}>
            <div className="header-bullet-description-container">
              {/* {type == 'sub-page' ? (description ? description.map(desc => (<BulletList description={desc} />)) : null) :
                <ProductSearch placeholder="Customer Experience Management" suggestions={suggestions} trends={trends} />
              } */}
              {description ? "Fill me with a description": null}
            </div>

          </div>
          {compact ? null : <div className="button-container">

          </div>}
        </div>
        {this.props.smallWindow ? null : <div className="header-right-container">
          {compact ? <img src={headerimage} style={{ border: border, height: 393 + "px", width: 537.13 + "px"}} alt={title} /> : null}
        </div>}
        {this.props.smallWindow || compact ? null : <svg width="100%" height="230"
          viewBox="0 0 1440 676" fill="none" xmlns="http://www.w3.org/2000/svg" overflow="visible">
          <defs>
            <clipPath id="clipping" clipPathUnits="objectBoundingBox"
              transform="scale(0.000694 0.001479)">
              <path fillRule="evenodd" clipRule="evenodd"
                d="M1440 380.254C1348.15 432.998 1055.79 586.784 831.346 547.605C580.501 503.817 323.196 477.945 0 675.098V0H1440V380.254Z" />
            </clipPath>
          </defs>
        </svg>}
      </div>

    )
  }
  render() {
    const { title, processes, products, compact, type, resultspage, resulthandler } = this.state;
    return (
      <div className={"page-header-default"
        + (type === "regular" ? " page-header-minheight" : "")
        + (compact ? "" : " page-home-header")
        + (this.props.smallWindow ? " page-header-default-small" : "")}>
        <div className={"header-container" + (compact ? " header-container-compact" : "")}>
          <div className={"header-content-container" + (this.props.smallWindow ? " header-content-container-small" : "")}>
            {this.props.smallWindow ?
              //
              // MOBILE
              //
              <HeaderBarMobile products={products} processes={processes} compact={compact} />
              :
              //
              // DESKTOP
              //
              <div className={"header-standard"}>
                <div className="logo-wrapper">
                  <a href="http://www.sap.com/index.html" title="SAP">
                    <img src={logo} alt="SAP"></img>
                  </a>
                </div>
                <nav className="menu-wrapper">
                  <ul className="menu list-unstyled">
                    <li className="menu__item">
                      <Link className={"menu__link link1 menu__link-" + (compact ? "compact" : "default")} to="/">Home</Link>
                    </li>
                    <li className="menu__item">
                      <Menu header="Processes" route="process" list={processes} compact={compact} />
                    </li>
                    <li className="menu__item">
                      <Menu header="Products" route="product" list={products} compact={compact} />
                    </li>
                  </ul>
                </nav>
                <SearchBar resultspage={resultspage} resulthandler={resulthandler} suggestions={suggestions} trends={trends} compact={compact} style={"width: 100%"} />
                {/* <img className="header-notification-bell" alt="bell" src={compact ? notificationBell : null } /> */}
                <img className="header-user-account" alt="account" src={compact ? compactAccountIcon : accountIcon}
                  onMouseOver={e => (e.currentTarget.src = compact ? accountIcon : compactAccountIcon)}
                  onMouseOut={e => (e.currentTarget.src = compact ? compactAccountIcon : accountIcon)}
                  onClick={this.handleAccountClick} />
                <Snackbar
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                  }}
                  className="toast-window"
                  open={this.state.showToast}
                  onClose={this.handleAccountClick}
                  autoHideDuration={6000}
                  message={<span className="toast-messages" id="message-id">User Account Feature Coming Soon</span>}
                />
              </div>
            }
          </div>
        </div>
        <div className={"header-content" + (compact ? " header-content-compact" : "")
          + (this.props.smallWindow ? " header-content-small" : "")
          + (type === "search" ? " header-content-none" : "")} >
          {(title === "Total Workforce Management" ||
            title === "Source to Pay" ||
            title === "Lead to Cash") ? 
            this.renderProcessHeaderContainers() // Processes Header
            : 
            this.renderProductHeaderContainers() // Products Header
          }
        </div>
      </div>
    );
  }
}

export default Header;
