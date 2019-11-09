import React, { Component } from 'react';
import { HashLink as Link } from 'react-router-hash-link';
import ReactHtmlParser from 'react-html-parser';
import Snackbar from '@material-ui/core/Snackbar';
import Menu from '../components/Menu';
import { SearchBar } from '../components/Search';
import HeaderBarMobile from '../components/HeaderBarMobile';
import { ProductIcons } from '../assets/prod-icons';
import { ProductSearch } from '../components/Search';
import { suggestions, trends } from '../utils/searchutils';
import { activeprocesses } from '../utils/processutils';
import { baseURL } from '../utils/links';
import { MultiRoadmap } from '../components/MultiRoadmap';
import Popover from '@material-ui/core/Popover';
import '../css/HeaderHome.css';
import '../css/Menu.css';
import '../css/ReleaseForm.css';
import info from '../assets/images/info.svg';
import logo from '../assets/images/sap-logo.svg';
import favIcon from '../assets/images/home-favorites.svg';
import compactFavIcon from '../assets/images/compact-favorites.svg';
import clipMask from '../assets/images/clippingMask.svg';
import Fuse from 'fuse.js';

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
      isInfoOpen: false,
      anchorEl: null,
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
    const queryURL = `${baseURL}?ProductSearch&$skip=0&$orderby=date asc&$expand=products,futureplans`
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
                var uniqueResult = [];
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
              this.filterResultData(uniqueResult, cleanedProdProc);
              },
              (error) => {
                  console.log(error);
              }
          );

    if (this.props.pageType && (this.props.pageType === "process" || this.props.pageType === "products")) {
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
        }, (error) => console.log(error))

    }
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
        options = {
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
    }
    else{
        searchParams = results
    }
    const fuse = new Fuse(searchParams, options);
    this.setState({searchhandler: fuse});
    var searchresults = fuse.search(this.state.result);
 
    this.setState({
        filteredresults: searchresults,
        productresults: productresults,
        processresults: processresults
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
        <div className="header-divided-container" style={{ overflow: 'hidden' }}>
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
              <HeaderBarMobile products={products} processes={processes} compact={compact} />
              :
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
          {title && pageType ? this.renderInfoModal() : null}
        </Popover>
      </div>
    );
  }
}

export default Header;
