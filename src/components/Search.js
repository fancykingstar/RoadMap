import React, { Component } from 'react'
import PropTypes from 'prop-types';
import ProdSearchIcon from '@material-ui/icons/SearchOutlined';

//import css
import '../css/SearchBar.css';

//import assets
import SearchIcon from '../assets/images/search-icon.svg';
import Result from '../assets/images/search-result.svg';
import Trend from '../assets/images/trend-arrow.svg';

//import custom components
import { IconButton } from '../components/Button';

//import utilities
import { onChange, onKeyDown, selectSearch, trendSearch, suggestionSearch } from '../utils/searchutils';


class SearchBar extends Component {

  static propTypes = {
    suggestions: PropTypes.instanceOf(Array)
  };

   static defaultProps = {
     suggestions: []
   };


  constructor(props) {
      super(props)

      this.state = {
        searchOpen: false,
        compact: this.props.compact,
        trends: this.props.trends,
        // The active selection's index
        activeSuggestion: 0,
        // The suggestions that match the user's input
        filteredSuggestions: [],
        // Whether or not the suggestion list is shown
        showSuggestions: false,
        // What the user has entered
        userInput: "",
        resultspage: this.props.resultspage || false,
        resulthandler: this.props.resulthandler || false
      }
      this.openSearch = this.openSearch.bind(this);
      this.handleOutsideClick = this.handleOutsideClick.bind(this);
      //console.log(props)
    }

    componentDidUpdate(prevProps) {
      //console.log(this.props.compact)
      if (prevProps.compact !== this.props.compact) {
        this.setState({
          compact: this.props.compact
        });
      }
    }

    openSearch = () => {
      const { searchOpen } = this.state;
      if (!searchOpen) {
        //attach/remove event handler
        window.addEventListener('click', this.handleOutsideClick, false);
      } else {
        window.removeEventListener('click', this.handleOutsideClick, false);
      }
      this.setState(prevState =>({
          searchOpen: !prevState.searchOpen
      }))
    }

    handleOutsideClick(e) {
      // ignore clicks on the component itself
      try {
        if (this.node.contains(e.target)) {
          return;
        }
      } catch(e){
        console.log(e);
      }


      this.openSearch();
    }




  render() {
    const { compact, searchOpen, activeSuggestion, filteredSuggestions, showSuggestions, userInput, trends } = this.state;

    let suggestionsListComponent;

    if (showSuggestions && userInput) {
      if (filteredSuggestions.length) {
        suggestionsListComponent = (
          <ul className="suggestions">
            {filteredSuggestions.map((suggestion, index) => {
              let className;

              // Flag the active suggestion with a class
              if (index === activeSuggestion) {
                className = "suggestion-active";
              }

              return (
                <li className={className} key={suggestion} onClick={() => suggestionSearch(this, {suggestion})}>
                  <img src={Result} alt="result"></img><span className="label">{suggestion}</span>
                </li>
              );
            })}
          </ul>
        );
      } else {
        suggestionsListComponent = (
          <div></div>
        );
      }
    }

    return (
      <div className="search-container" ref={node => { this.node = node; }}>
          <div className={"search-icon " + (compact ? "compactsearch" : "defaultsearch")} onClick={() => this.openSearch()}></div>
          {searchOpen && <div className="search-box">
            <div className="search-content">
              <div className="searchArea">
                <input type="text" onChange={(e) => onChange(e, this.props, this)} onKeyDown={(e) => onKeyDown(e, this.state, this)} value={userInput} className="search-input"></input>
                <img className="magnifying-glass" alt="Search" src={SearchIcon} />
               </div>
              {suggestionsListComponent}
              <div className="trending-content">
                <div className="trending-title">TRENDING NOW</div>
                {trends.map(trend => (
                  <div className="trend" key={trend} onClick={() => trendSearch(this, {trend})}>
                    <img src={Trend} alt="trend"></img><span className="label">{trend}</span>
                  </div>
                ))}
               </div>
            </div>
          </div>
          }
      </div>
    )
  }
}

class SiteSearch extends Component {

   constructor(props) {
     super(props);

      this.state = {
        trends: this.props.trends,
        // The active selection's index
        activeSuggestion: 0,
        // The suggestions that match the user's input
        filteredSuggestions: [],
        // Whether or not the suggestion list is shown
        showSuggestions: false,
        // What the user has entered
        userInput: "start",
        inputvalue: this.props.value || "",
        placeholder: this.props.placeholder,
        resultspage: this.props.resultspage || false,
        resulthandler: this.props.resulthandler || false,
        isHomePage: this.props.isHomePage
      }
      this.openSearch = this.openSearch.bind(this);
      this.handleOutsideClick = this.handleOutsideClick.bind(this);
     }

     componentDidUpdate(prevProps, prevState) {
       if (this.props.value) {
      if (prevState.inputvalue !== this.props.value) {
          this.setState(prevState => ({
            ...prevState,
            inputvalue: this.props.value
          }));
      }
    }
    // if (prevState.showSuggestions !== this.props.showresults) {
    //   console.log(this.props)
    //   this.setState(prevState => ({
    //     ...prevState,
    //     showSuggestions: this.props.showresults
    //   }));
    // }
    }

    openSearch = () => {
      const { showSuggestions } = this.state;
      if (!showSuggestions) {
        //attach/remove event handler
        this.setState(prevState =>({
          ...prevState,
          showSuggestions: !prevState.showSuggestions
      }))
        window.addEventListener('click', this.handleOutsideClick, false);
      } else {
        window.removeEventListener('click', this.handleOutsideClick, false);
        this.setState(prevState =>({
          ...prevState,
          showSuggestions: !prevState.showSuggestions
      }))
      }

    }

    handleOutsideClick(e) {
      // ignore clicks on the component itself
      if(this.node != null && this.node !== undefined){
        if (this.node.contains(e.target)) {
          return;
        }
      }
      this.openSearch();
    }



  render() {
        const { activeSuggestion, filteredSuggestions, showSuggestions, userInput, trends, placeholder, inputvalue, } = this.state;

         let prodsuggestionsListComponent;
         let input = userInput === "start" ? inputvalue : userInput;

      if (showSuggestions) {
            if (filteredSuggestions.length && userInput) {
              prodsuggestionsListComponent = (
               <div className="product-suggestions-container">
                <ul className="product-suggestions">
                  {filteredSuggestions.map((suggestion, index) => {
                    let className;

                    // Flag the active suggestion with a class
                    if (index === activeSuggestion) {
                      className = "product-suggestion-active";
                    }

                    return (
                      <li className={className} key={suggestion} onClick={() => selectSearch(this, {suggestion})}>
                        <img src={Result} alt="result"></img><span className="label">{suggestion}</span>
                      </li>
                    );
                  })}
                </ul>
                < div className = "product-trending trending-content" >
                  <div className="trending-title">TRENDING NOW</div>
                  {trends.map(trend => (
                    <div className="trend" key={trend} onClick={() => selectSearch(this, {trend})}>
                        <img src={Trend} alt="trend"></img><span className="label">{trend}</span>
                    </div>
                  ))}
                 </div>
               </div>
              );
            } else {
              prodsuggestionsListComponent = (
                <div className="product-suggestions-container">
                  <div className="product-trending trending-content">
                  <div className="trending-title">TRENDING NOW</div>
                  {trends.map(trend => (
                    <div className="trend" key={trend} onClick={() => selectSearch(this, {trend})}>
                        <img src={Trend} alt="trend"></img><span className="label">{trend}</span>
                    </div>
                  ))}
                 </div>
              </div>
              );
            }
    }

    return (
      <div className={"product-search-container"} ref={node => { this.node = node; }}>
        <div className="product-body product-search">
            <input className={ showSuggestions ? "product-search-input-show" : "product-search-input" } type="text" placeholder={placeholder}  onFocus={() => this.openSearch()} onChange={(e) => onChange(e, this.props, this)} onKeyDown={(e) => onKeyDown(e, this.state, this)} value={input} />
          <IconButton icon={ProdSearchIcon} show={showSuggestions} handleClick={() => {
              selectSearch(this, {inputvalue})
            }} />
        </div>
        {prodsuggestionsListComponent}
      </div>
    )
  }
}

class ProductSearch extends Component {

  constructor(props) {
    super(props);

     this.state = {
       trends: this.props.trends,
       // The active selection's index
       activeSuggestion: 0,
       // The suggestions that match the user's input
       filteredSuggestions: [],
       // Whether or not the suggestion list is shown
       showSuggestions: false,
       // What the user has entered
       userInput: "",
       inputvalue: this.props.value || "",
       placeholder: this.props.placeholder,
       resultspage: this.props.resultspage || false,
       resulthandler: this.props.resulthandler || false
     }
      this.openSearch = this.openSearch.bind(this);
      this.handleOutsideClick = this.handleOutsideClick.bind(this);
    }

    openSearch = () => {
      const { showSuggestions } = this.state;
      if (!showSuggestions) {
        //attach/remove event handler
        this.setState(prevState =>({
          ...prevState,
          showSuggestions: !prevState.showSuggestions
      }))
        window.addEventListener('click', this.handleOutsideClick, false);
      } else {
        window.removeEventListener('click', this.handleOutsideClick, false);
        this.setState(prevState =>({
          ...prevState,
          showSuggestions: !prevState.showSuggestions
      }))
      }

    }

    handleOutsideClick(e) {
      // ignore clicks on the component itself
      if (this.node.contains(e.target)) {
        return;
      }

      this.openSearch();
    }



 render() {
       const { activeSuggestion, filteredSuggestions, showSuggestions, userInput, trends, placeholder, inputvalue} = this.state;

        let prodsuggestionsListComponent;
        let input = inputvalue.length > 0 ? inputvalue : userInput;

     if (showSuggestions) {
           if (filteredSuggestions.length) {
             prodsuggestionsListComponent = (
              <div className="product-suggestions-container">
               <ul className="product-suggestions">
                 {filteredSuggestions.map((suggestion, index) => {
                   let className;

                   // Flag the active suggestion with a class
                   if (index === activeSuggestion) {
                     className = "product-suggestion-active";
                   }

                   return (
                     <li className={className} key={suggestion} onClick={() => suggestionSearch(this, {suggestion})}>
                       <img src={Result} alt="result"></img><span className="label">{suggestion}</span>
                     </li>
                   );
                 })}
               </ul>
               < div className = "product-trending trending-content" >
                 <div className="trending-title">TRENDING NOW</div>
                 {trends.map(trend => (
                   <div className="trend" key={trend} onClick={() => selectSearch(this, {trend})}>
                       <img src={Trend} alt="trend"></img><span className="label">{trend}</span>
                   </div>
                 ))}
                </div>
              </div>
             );
           } else {
             prodsuggestionsListComponent = (
               <div className="product-suggestions-container">
                 <div className="product-trending trending-content">
                 <div className="trending-title">TRENDING NOW</div>
                 {trends.map(trend => (
                   <div className="trend" key={trend} onClick={() => selectSearch(this, {trend})}>
                       <img src={Trend} alt="trend"></img><span className="label">{trend}</span>
                   </div>
                 ))}
                </div>
             </div>
             );
           }
   }

   return (
     
     <div className={"product-search-container" + (this.props.isHomePage ? " home-page" : "")} ref={node => { this.node = node; }}>
       <div className="product-body product-search">
           <input className={ showSuggestions ? "product-search-input-show" : "product-search-input" } type="text" placeholder={placeholder}  onFocus={() => this.openSearch()} onChange={(e) => onChange(e, this.props, this)} onKeyDown={(e) => onKeyDown(e, this.state, this)} value={input} />
         <IconButton icon={ProdSearchIcon} show={showSuggestions} handleClick={() => {
              selectSearch(this, {"inputvalue": input})
              }} />
       </div>
       {prodsuggestionsListComponent}
     </div>
   )
 }
}

export { SearchBar, ProductSearch, SiteSearch }
