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
  render() {
//    const ExportIcon = this.props.icon;
    return (
      <button
        className={"btn roadmap-custom-button custombtn btn-default " + this.props.className}
        onClick={this.props.handleClick}>
        <img src={exportIcon} alt="export" />
        {this.props.label}
      </button>
    );
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
    const SearchIcon = this.props.icon;
    const show = this.state.show;
    return (
      <button
        className={"btn custom-button " +  (show ? "iconbtn-show" : "iconbtn") + " btn-default"}
        onClick={this.props.handleClick}><SearchIcon fontSize="large" />
      </button>
    );
  }
};

export {
  Button,
  IconButton,
  CustomButton
};