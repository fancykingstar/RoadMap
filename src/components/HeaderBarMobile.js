import React, { Component } from 'react';

//material ui
import MenuItem from '@material-ui/core/MenuItem'
import UIMenu from '@material-ui/core/Menu';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';

// Icons
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CloseIcon from '@material-ui/icons/Close';
import MenuIcon from '@material-ui/icons/Menu';



//import custom components
import { SearchBar } from '../components/Search';

import { suggestions, trends } from '../utils/searchutils';

//import css
import '../css/HeaderHome.css';
import '../css/Menu.css';

//import assets
import logo from '../assets/images/sap-logo.svg';

class HeaderBarMobile extends Component {

    constructor(props) {
        super(props);
        this.state = {
            compact: props.compact,
            processes: props.processes,
            products: props.products,
            anchorElem: undefined,
            openMenu: false,
            processStatusMenuOpen: false,
            productStatusMenuOpen: false,
            processIcon: ExpandMoreIcon,
            processBtnclass: "addButton",
            productIcon: ExpandMoreIcon,
            productBtnclass: "addButton"
        };
    }

    componentDidMount() {
        this.setState({
          compact: this.props.compact,
          processes: this.props.processes,
          products: this.props.products
        });
      }

    componentDidUpdate(prevProps) {
        if (prevProps.compact !== this.props.compact) {
            this.setState({
                compact: this.props.compact
            });
        }

        if (prevProps.processes !== this.props.processes) {
            this.setState({
                processes: this.props.processes
            });
        }

        if (prevProps.products !== this.props.products) {
            this.setState({
                products: this.props.products
            });
        }
    }

    handleHamburgerClick = event => {
        this.setState({
            anchorElem: event.currentTarget,
            openMenu: true
        });
    }

    handleClose = () => {
        this.setState({
            anchorElem: null,
            openMenu: false
        });
    }

    handleExpandClick = (menuType) => {
        if (menuType === "process") {
            this.setState({
                processStatusMenuOpen: !this.state.processStatusMenuOpen,
                processIcon: this.state.processStatusMenuOpen === true ? ExpandMoreIcon : ExpandLessIcon,
                processBtnclass: this.state.processStatusMenuOpen === true ? "addButton" : "subButton"
            });
        } else {
            this.setState({
                productStatusMenuOpen: !this.state.productStatusMenuOpen,
                productIcon: this.state.productStatusMenuOpen === true ? ExpandMoreIcon : ExpandLessIcon,
                productBtnclass: this.state.productStatusMenuOpen === true ? "addButton" : "subButton"
            });
        }

    }

    selectItem(stateKey, route) {
        if (stateKey === "") {
            window.location.href = "/";
        } else {
            window.location.href = "/" + route + "/" + stateKey;
        }
    }

    render() {
        const { processes, products, compact, resultspage, resulthandler } = this.state;
        const ProcessBtnIcon = this.state.processIcon;
        const ProductBtnIcon = this.state.productIcon;
        return (
            <div className="header-mobile">
                <IconButton
                    aria-controls="long-menu"
                    aria-haspopup="true"
                    className="hamburger-menu-button"
                    color="inherit"
                    aria-label="menu"
                    onClick={this.handleHamburgerClick} >
                    <MenuIcon />
                </IconButton>
                <UIMenu
                    id="long-menu"
                    anchorEl={this.state.anchorElem}
                    className="head-mobile-menu"
                    open={this.state.openMenu}
                    onClose={this.handleClose}
                    PaperProps={{
                        style: {
                            height: '100%',
                            width: '100%',
                            top: '0px',
                            left: '0px',
                            maxWidth: '100%',
                            maxHeight: '100%'
                        },
                    }}
                >
                    <div className={"header-container header-container-compact-mobile"}>
                        <div className={"header-content-container header-content-container-small"}>
                            <div className="header-mobile">
                                <IconButton
                                    aria-controls="long-menu"
                                    aria-haspopup="true"
                                    className="hamburger-menu-button"
                                    color="inherit"
                                    aria-label="menu"
                                    onClick={this.handleClose} >
                                    <CloseIcon />
                                </IconButton>
                                <div className="logo-wrapper">
                                    <a href="http://www.sap.com/index.html" title="SAP">
                                        <img src={logo} alt="SAP"></img>
                                    </a>
                                </div>
                                <SearchBar resultspage={resultspage} resulthandler={resulthandler} suggestions={suggestions} trends={trends} compact={compact} />
                            </div>
                        </div>
                    </div>
                    <MenuItem onClick={() => this.selectItem("", "")}>
                        <li className="menu-title" key="home" onClick={() => this.selectItem("", "")}>Home</li>
                    </MenuItem>
                    <div className="collapse-section">
                        <div className="pr-form-header" onClick={() => this.handleExpandClick("process")}>
                            <div className="menu-title title-expandable">Processes</div>
                            <IconButton className={this.state.processBtnClass} onClick={() => this.handleExpandClick("process")}>
                                <ProcessBtnIcon fontSize="large" />
                            </IconButton>
                        </div>
                        <Collapse in={this.state.processStatusMenuOpen} timeout="auto" unmountOnExit>
                            {processes.map((item) => (
                                <MenuItem className="sub-menu-title" key={item.id} onClick={() => this.selectItem(item.key, "process")}>{item.title}</MenuItem>
                            ))}

                        </Collapse>
                    </div>
                    <div className="collapse-section">
                        <div className="pr-form-header" onClick={() => this.handleExpandClick("product")}>
                            <div className="menu-title title-expandable">Products</div>
                            <IconButton className={this.state.productBtnClass} onClick={() => this.handleExpandClick("product")}>
                                <ProductBtnIcon fontSize="large" />
                            </IconButton>
                        </div>
                        <Collapse in={this.state.productStatusMenuOpen} timeout="auto" unmountOnExit>
                            {products.map((item) => (
                                <MenuItem className="sub-menu-title" key={item.id} onClick={() => this.selectItem(item.key, "product")}>{item.title}</MenuItem>
                            ))}

                        </Collapse>

                    </div>
                </UIMenu>
                <div className="logo-wrapper">
                    <a href="http://www.sap.com/index.html" title="SAP">
                        <img src={logo} alt="SAP"></img>
                    </a>
                </div>
                <SearchBar resultspage={resultspage} resulthandler={resulthandler} suggestions={suggestions} trends={trends} compact={compact} />
            </div>

        );
    }
}

export default HeaderBarMobile;
