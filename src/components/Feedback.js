import React, { Component } from 'react'

//import custom components

//import css
import '../css/Feedback.css';

class Feedback extends Component {

  constructor(props) {
      super(props)

      this.state = {
        collapsed: true
      }
      this.handleFeedbackPanel = this.handleFeedbackPanel.bind(this);
      this.handleOutsideClick = this.handleOutsideClick.bind(this);
    }

     handleOutsideClick(e) {
       // ignore clicks on the component itself
       if (this.node.contains(e.target)) {
         return;
       }

       this.handleFeedbackPanel();
     }

    handleFeedbackPanel = () => {
      const { collapsed } = this.state;
      if (collapsed) {
        //attach/remove event handler
        window.addEventListener('click', this.handleOutsideClick, false);
      } else {
        window.removeEventListener('click', this.handleOutsideClick, false);
      }
      this.setState({ collapsed: !this.state.collapsed});
    }

    toQualtrics = (e) => {
       e.stopPropagation();
      console.log("navigate to Qualtrics");
    }
  
  render() {
    

    return (
      // <div className={"feedback-container " + ( collapsed ? "container-collapsed" : "container-expanded")} onClick={() => this.handleFeedbackPanel()}  ref={node => { this.node = node; }}>
      //   { collapsed
      //     ? <div className="collapsed-title">feedback</div>
      //     : <div className="feedback-content">
      //         <div className="feedback-title">Don't see what you're looking for?</div>
      //         <div className="feedback-body">Let us know how we can help your business to run better!</div>
      //         <Button handleClick={this.toQualtrics} label="Talk To Us" />
      //     </div>  
      //   }           
      // </div>
      <div></div>
    )
  }
}

export default Feedback

