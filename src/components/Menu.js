import React, { Component } from 'react'

import Collapse from '@material-ui/core/Collapse';

//import assets
import downdefault from '../assets/images/menu-down-arrow-white.svg';
import updefault from '../assets/images/menu-up-arrow-white.svg';
import downcompact from '../assets/images/menu-down-arrow.svg';
import upcompact from '../assets/images/menu-up-arrow.svg';

class Menu extends Component{
  constructor(props){
    super(props)
    this.state = {
      listOpen: false,
      headerTitle: this.props.header,
      route: this.props.route,
      compact: this.props.compact
    }
    this.close = this.close.bind(this)
  }

  componentDidUpdate(prevProps){
    const { listOpen } = this.state
    setTimeout(() => {
      if(listOpen){
        window.addEventListener('click', this.close)
      }
      else{
        window.removeEventListener('click', this.close)
      }
    }, 0)
    if (prevProps.compact !== this.props.compact) {
      this.setState({
        compact: this.props.compact
      });
    }
  }

  componentWillUnmount(){
    window.removeEventListener('click', this.close)
  }

  close(timeOut){
    this.setState({
      listOpen: false
    })
  }

  selectItem(stateKey){
    window.location.href = "/" + this.state.route + "/" + stateKey;
  }

  toggleList(){
    this.setState(prevState => ({
      listOpen: !prevState.listOpen
    }))
  }

  render(){
    const{list} = this.props
    const{listOpen, headerTitle, compact} = this.state
    return(
      <div className="dd-wrapper">
        <div className="dd-header" onClick={() => this.toggleList()}>
          <div className={"dd-header-title-" + (compact ? "compact" : "default")}>{headerTitle}</div>
          {listOpen
            ? <span className={"dd-header-arrow"}><img src={(compact ? upcompact : updefault)} alt="uparrow"></img></span>
            : <span className={"dd-header-arrow"}><img src={(compact ? downcompact : downdefault)} alt="downarrow"></img></span>
          }
        </div>
        {listOpen && <ul className="dd-list" onClick={e => e.stopPropagation()}>
          {list
          .sort((a, b) => {
            return (a.state === b.state) ? 0: a.state ? -1 : 1;
          })
          .map((item)=> {
            const hasChildren = (item.children.length > 0)
            if (item.state) {
              return (
                  <div>
                    <li className="dd-list-item active" key={item.id} onClick={() => this.selectItem(item.key)}>{item.title}</li>
                    {hasChildren ? 
                            item["children"].map(subitem => (
                            <li className="dd-sublist-item dd-list-item active" key={subitem.id} onClick={() => this.selectItem(subitem.key)}>{subitem.title}</li>))                     
                    : null}
                  </div>
                    )} else {
              return <li className="dd-list-item inactive" key={item.id}>{item.title}</li>
            }
          })}
        </ul>}
      </div>
    )
  }
}

export default Menu