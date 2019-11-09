import React, { Component } from 'react';

//import css
import '../css/Button.css';

//import asset
import exportIcon from '../assets/images/export.svg';

class Button extends Component {
  render() {
    return (
      <button
        className={"btn stdbtn btn-default " + this.props.className}
        onClick={this.props.handleClick}>
        {this.props.label}
      </button>
    );
  }
};

class CustomButton extends Component {
  constructor(props) {
    super(props);

    this.state = {
      width: 0,
      height: 0
    };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  render() {
    return (
      <>
        {
          this.state.width >= 960 ? <button
            className={"btn roadmap-custom-button custombtn btn-default " + this.props.className}
            onClick={this.props.handleClick}
          >
            <img src={exportIcon} alt="export" />
            {this.props.label}
          </button> : <button
            className={"btn roadmap-custom-button custombtn btn-default " + this.props.className}
            onClick={this.props.handleClick} style={{transform: "translateY(23px)", marginRight: '20px', padding: '10px 12px', borderRadius: '50px'}}>
            <img src={exportIcon} alt="export" style={{padding: 0}}/>
          </button>
        }
      </>
    )
  }
};

class IconButton extends Component {

  constructor(props) {
    super(props);

    this.state = {
      show: ""
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.show !== this.props.show) {
      this.setState({
        show: this.props.show
      });
    }
  }


  render() {
    // const SearchIcon = this.props.icon;
    // const show = this.state.show;
    return (
      <button
        className={"btn custom-button iconbtn btn-default"
          //  + (show ? "iconbtn-show" : "iconbtn") + " btn-default"
        }
        onClick={this.props.handleClick}>
        <span>
          Search
          </span>
        {/* <SearchIcon fontSize="large" /> */}
      </button>
    );
  }
};

export {
  Button,
  IconButton,
  CustomButton
};