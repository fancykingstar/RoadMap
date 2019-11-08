import React, { Component } from 'react';
import { HashLink as Link } from 'react-router-hash-link';
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';

//import custom components
import Snackbar from '@material-ui/core/Snackbar';
import Menu from '../components/Menu';
import { SearchBar } from '../components/Search';
import HeaderBarMobile from '../components/HeaderBarMobile';
// import BulletList from '../components/BulletList'; // open to deprecation from app
import { ProductIcons } from '../assets/prod-icons';

import { ProductSearch } from '../components/Search';
import { suggestions, trends } from '../utils/searchutils';
import { activeprocesses } from '../utils/processutils';
import { MultiRoadmap } from '../components/MultiRoadmap';
import { RoadmapVertical } from '../components/RoadmapVertical';
import Popover from '@material-ui/core/Popover';

//import css
import '../css/HeaderHome.css';
import '../css/Menu.css';
import '../css/ReleaseForm.css';

//import assets
import info from '../assets/images/info.svg';
// import notificationBell from '../assets/images/notification-bell.svg';
import logo from '../assets/images/sap-logo.svg';
import accountIcon from '../assets/images/home-account.svg';
import compactAccountIcon from '../assets/images/compact-account.svg';
import favIcon from '../assets/images/home-favorites.svg';
import compactFavIcon from '../assets/images/compact-favorites.svg';
import clipMask from '../assets/images/clippingMask.svg';
import Fuse from 'fuse.js';
const staging = false;

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
      pageType: undefined,
      headerimage: '',
      /* Info Popover Properties */
      isInfoOpen: false,
      anchorEl: null,
      /*Info Popover End */
      resultspage: this.props.resultspage || false,
      resulthandler: this.props.resulthandler || false,
      searchhandler: null
    };
    this.anchorEl = React.createRef();
    this.handleAccountClick = this.handleAccountClick.bind(this);
    this.renderProcessHeaderContainers = this.renderProcessHeaderContainers.bind(this);
    this.renderProductHeaderContainers = this.renderProductHeaderContainers.bind(this);
    this.renderInfoModal = this.renderInfoModal.bind(this);
    this.handleInfoEnter = this.handleInfoEnter.bind(this);
    this.handleInfoLeave = this.handleInfoLeave.bind(this);
  }

  componentDidMount() {
    const baseURL = 'https://roadmap-srv-dev.cfapps.sap.hana.ondemand.com'
    const queryURL = `${baseURL}/odata/v4/roadmap/Roadmap?ProductSearch&$skip=0&$orderby=date asc&$expand=products,futureplans`
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
      fetch(queryURL)
      .then(res => res.json())
          .then(
              (result) => {
                let cleanedProdProc = []
                fetch("/data/search-pageData.json")
                .then(function(response) {return response.json()})
                .then(function(result){
                        for (var item of result.products.concat(result.process)){
                            item.description = item.body
                            cleanedProdProc.push(item)
                        }
                    },
                    (error) => {
                    console.log(error);
                    }
                )

                var uniqueTitles = new Set()
                var uniqueResult = new Array()
                result.value.forEach(item =>{
                    if(!uniqueTitles.has(item.title)){
                        uniqueTitles.add(item.title)
                        uniqueResult.push(item)
                    }
                })
              
                this.setState({
                    results: uniqueResult,
                    prodProc: cleanedProdProc

                })
              //this.cleanData(result.value)
              this.filterResultData(uniqueResult, cleanedProdProc);
              },
              (error) => {
                  console.log(error);
              }
          );
        
    /* DEVELOPMENT ONLY */
    if (this.props.pageType && (this.props.pageType === "process" || this.props.pageType === "products")) {
      console.log('pageType:', this.props.pageType);
      const pathString = this.props.pageType === "process" ? `processes/${this.props.process}` : `products/${this.props.product}`;
      fetch(`/data/${pathString}.json`)
        .then(res => res.json())
        .then((result) => {
          result.description.forEach(({ title, items }) => {
            if (typeof title === "string" && title === "Products") {
              this.setState({
                productTitles: items
              })
            } else if (typeof title === "string" && title === "Innovation topics") {
              this.setState({
                innovationTopics: items
              })
            }
          })
        }, (error) => console.log("Failure fetching data", error, pathString))

    }
    /* DEVELOPMENT ONLY */
    this.setState({
      description: this.props.description,
      title: this.props.title || "",
      compact: this.props.compact,
      headerimage: this.props.image,
      roadmap: this.props.roadmap,
      process: this.props.process,
      product: this.props.product,
      pageType: this.props.pageType
    })
  }

  filterResultData(results, prodProc) {
    let productresults = [], processresults = []
    //Fuse should be abstarcted into a different function to prevent recreating it every time. Create Fuse object once and set in state
    var options = {
        shouldSort: true,
        keys : [{
            name: "title",
            weight : 0.9    
        },
        {
            name: "description",
            weight: 0.1
        }]
    }

    function DIFF(a,b){
      return new Set([...a].filter(x => !b.has(x)))
  }

    function ADD_KEYS(jsons, keys, default_value=null){
        for (var key of keys){
            for (var json of jsons){
                json[key] = default_value
            }
        }
    }

    if(prodProc != null && prodProc !== undefined && prodProc.length > 0){
        var road_keys = new Set(Object.keys(results[0]))
        var prodProc_keys = new Set(Object.keys(prodProc[0]))
        var prodProc_need = DIFF(road_keys, prodProc_keys)
        var road_need = DIFF(prodProc_keys, road_keys)
        ADD_KEYS(results, road_need)
        ADD_KEYS(results, ["key"], "")
        ADD_KEYS(prodProc, prodProc_need)
        var searchParams = results.concat(prodProc)
        var options = {
            shouldSort: true,
            keys : [{
                name: "title",
                weight : 0.5    
            },
            {
                name: "key",
                weight : 0.4
            },
            {
                name: "description",
                weight: 0.1
            }]
        }
        console.log(searchParams)
    }        
    else{
        var searchParams = results
    }


    const fuse = new Fuse(searchParams, options);
    this.setState({searchhandler: fuse});
    var searchresults = fuse.search(this.state.result);
    // searchresults.forEach(result => {

    //     if (result.date) {
    //         let datevalue = new Date(result.date);
    //         result.numericdate = datevalue.getTime() / 1000.0;
    //         result.displaydate = datamonths[0][datevalue.getMonth()] + " " + datevalue.getFullYear();
    //         //  let datearr = result.date.split(" ");
    //         //result.numericdate = Number(months[0][datearr[0]] + datearr[1]);
    //     } else {
    //         result.numericdate = 0;
    //     }

    //     //check to see if result is a product card
    //     if (result.type === "product") {
    //         productresults.push(result);
    //     }

    //     //check to see if result is a  process card
    //     if (result.type === "process") {
    //         processresults.push(result);
    //     }

    //     // if (result.chips) {
    //     //     result.chips.forEach(chip => {
    //     //         if (chip.category === "process") {
    //     //             processresults.push(result);
    //     //         }
    //     //         if (chip.category === "product") {
    //     //             productresults.push(result);
    //     //         }
    //     //     })
    //     // }

    //     filterall += 1;
    //     filteredresults.push(result);
    // })
    // const prodset = new Set();
    // const procset = new Set();

    // productresults = productresults.filter(el => {
    //     const duplicate = prodset.has(el.title);
    //     prodset.add(el.title);
    //     return !duplicate;
    // });
    // processresults = processresults.filter(el => {
    //     const duplicate = procset.has(el.title);
    //     procset.add(el.title);
    //     return !duplicate;
    // });

    // filterprocess = processresults.length;
    // filterproducts = productresults.length;

    // if (filteredresults.length > 10) {
    //     pagination = true;
    //     pages = Math.ceil(filteredresults.length / this.state.maxperpage);
    // }

    //console.log(filteredresults)


     //   });
    //console.log(filteredresults)
    this.setState({
        filteredresults: searchresults,
        productresults: productresults,
        processresults: processresults
        // pages: 0,
        // pagination: false,
        // initialitem: 0,
        // lastitem: 10
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

  handleInfoEnter = (e) => {
    this.setState({ isInfoOpen: true })
  }

  handleInfoLeave = (e) => {
    this.setState({ isInfoOpen: false })
  }

  renderInfoModal = () => {
    if (this.state.productTitles && this.state.innovationTopics) {
      const { productTitles, innovationTopics, title } = this.state
      return (
        <div className="title-process-container">
          <div className="content">
            <div className="title-container">
              <div className="title-bar"></div>
              <div className="title">Products</div>
            </div>
            {productTitles.map(({ label }, i) => (
              <div key={title + " " + i} className="roadmap-item">
                <img className="item-bullet" src={ProductIcons[0]["blueBullet"]} alt="" />
                <label className="item-label">{label}</label>
              </div>
            ))}
          </div>
          <div className="content">
            <div className="title-container">
              <div className="title-bar"></div>
              <div className="title">Innovation Topics</div>
            </div>
            {innovationTopics.map(({ label }, i) => (
              <div key={title + " " + i} className="roadmap-item">
                <img className="item-bullet" src={ProductIcons[0]["blueBullet"]} alt="" />
                <label className="item-label">{label}</label>
              </div>
            ))}
          </div>
        </div>
      )
    } else if (this.state.description) {
      const topics = this.state.description[1]["items"],
        { title } = this.state;
      return (
        <div className="content">
          <div className="title-container">
            <div className="title-bar"></div>
            <div className="title">Innovation Topics</div>
          </div>
          {
            // Map over contents
            topics.map(({ label }, i) => (
              <div key={title + " " + i} className="roadmap-item">
                <img className="item-bullet" src={ProductIcons[0]["blueBullet"]} alt="" />
                <label className="item-label">{label}</label>
              </div>
            ))
          }
        </div>
      )
    }
  }


  renderProcessHeaderContainers = () => {
    const { title, compact, headerimage, roadmap } = this.state;
    if (title) {
      return (
        <div className="header-divided-container">
          <div className={"header-left-container process-header" + (this.props.smallWindow ? " hidden" : "")}>
            {compact ? <img src={headerimage} alt={title} /> : null}
          </div>
          <div className="header-right-container process-header">
            <div className={"title title-" + (compact ? "compact" : "default")
              + (this.props.smallWindow ? " title-small" : "")
              + (!this.props.smallWindow && title.length > 20 ? " title-long" : "")}
            >{title}
              <img src={info} alt="info"
                style={{
                  position: this.props.windowWidth < 816 ? "relative" : "absolute",
                  paddingLeft: 13 + "px",
                  paddingTop: 21 + "px",
                }}
                ref={this.anchorEl}
                onMouseEnter={this.handleInfoEnter}
                onMouseLeave={this.handleInfoLeave}

                aria-owns={this.state.isInfoOpen ? "simple-popover" : undefined}
                aria-haspopup="true"
              />
            </div>
            <div className="header-roadmap-container">
              {
                roadmap && roadmap.length > 0 ? <MultiRoadmap roadmap={roadmap} hideArrows={this.state.process === "twm"} /> : null
              }
            </div>
          </div>
        </div>
      )
    }
  }

  renderProductHeaderContainers = () => {
    const { title, description, compact, type, headerimage, searchhandler } = this.state;
    if (title) {
      // console.log('title:', title, 'type:', type, 'desc:', description);
      return (
        <div className={"header-divided-container" + (title && title === "product roadmaps" ? " home-header" : " product-header"
        )}>
          <div className={"header-left-container" + (title && title === "product roadmaps" ? " home-header" : " product-header"
          )}>
            <div className={"title title-" + (compact ? "compact" : "default") + (title && title === "product roadmaps" ? " home-title" : " product-header")
              + (this.props.smallWindow ? " title-small" : "")
              + (!this.props.smallWindow && title.length > 20 ? " title-long" : "")}>{title ? title : ""}
              {
                title && title !== "product roadmaps" && (this.state.description && this.state.description[1]["items"].length > 0) ? <img src={info} alt="info" style={{
                  position: this.props.windowWidth < 816 ? "relative" : "absolute",
                  paddingLeft: 13 + "px",
                  paddingTop: this.props.windowWidth < 816 ? 5 + "px" : 21 + "px"
                }}
                ref={this.anchorEl}
                onMouseEnter={this.handleInfoEnter}
                onMouseLeave={this.handleInfoLeave}

                aria-owns={this.state.isInfoOpen ? "simple-popover" : undefined}
                aria-haspopup="true" /> : null
              }
  
            </div>
            <div className={"description-" + (compact ? "compact" : "default")
              + (this.props.smallWindow ? " description-small" : " description")
              + (title === "product roadmaps" ? " home-header-description" : "")
            }>
              <div className="header-bullet-description-container">
              </div>
  
              {
                type === 'sub-page' ? (description ? ReactHtmlParser(description[0]["descriptions"]) : null) :
                  <ProductSearch placeholder="Search for topics, products, or industries" suggestions={suggestions} trends={trends} searchhandler={searchhandler} isHomePage={title && title === "product roadmaps"} />
              }
  
            </div>
            {compact ? null : <div className="button-container">
  
            </div>}
          </div>
          {this.props.smallWindow ? null : <div className="header-right-container product-header">
            {compact ? <img src={headerimage} alt={title} /> : null}
          </div>}
          {this.props.smallWindow || compact ? null : <img src={clipMask} alt="mask" />}
        </div>
  
      )
    }
  }
  render() {
    const { processes, products, compact, type, resultspage, resulthandler, pageType, searchhandler, title } = this.state;
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
                <SearchBar resultspage={resultspage} resulthandler={resulthandler} suggestions={suggestions} trends={trends} compact={compact} searchhandler={searchhandler}/>
                {/*
                  // TODO: Notification Bell
                <img className="header-notification-bell" alt="bell" src={compact ? notificationBell : null } /> */}
                <img className="header-user-account" alt="account" src={compact ? compactFavIcon : favIcon}
                  onMouseOver={e => (e.currentTarget.src = compact ? favIcon : compactFavIcon)}
                  onMouseOut={e => (e.currentTarget.src = compact ? compactFavIcon : favIcon)}
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
                  message={<span className="toast-messages" id="message-id">My Favorites Feature Coming Soon</span>}
                />
              </div>
            }
          </div>
        </div>
        <div className={"header-content" + (compact ? " header-content-compact" : "")
          + (this.props.smallWindow ? " header-content-small" : "")
          + (type === "search" ? " header-content-none" : "")} >
          {title && pageType === "process" ?
            this.renderProcessHeaderContainers() // Process Header
            :
            this.renderProductHeaderContainers() // Product Header
          }
        </div>
        {/* Temporary className -- staged for fix process=multi product=single*/}
        <Popover
          style={{ pointerEvents: 'none', }}
          className={`roadmap-stepper-popover info-` + (this.state.productTitles && this.state.innovationTopics ? "multi" : "single")}
          id={"simple-popover"}
          open={this.state.isInfoOpen}
          anchorEl={this.anchorEl.current}
          onClose={this.handleInfoClick}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          disableRestoreFocus
        >


          {
            // TODO:
            title && pageType ? this.renderInfoModal() : null
          }
        </Popover>
      </div>
    );
  }
}

export default Header;
