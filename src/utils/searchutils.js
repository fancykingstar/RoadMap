function isString (value) {
  return typeof value === 'string' || value instanceof String;
}

export const onChange = (e, props, ref) => {
  const { suggestions, searchhandler } = props;
  const userInput = e.currentTarget.value;

  var filteredSuggestions = []

  //console.log(ref)
  //var fuse = new Fuse(results, options);

  if(searchhandler != null && searchhandler !== undefined)
  {
    var searchresults = searchhandler.search(userInput);
    function extractTitle(result) {
      return result.title;
  }
    filteredSuggestions = searchresults.map(extractTitle).slice(0,5)
  }

  // // Filter our suggestions that don't contain the user's input
  // const filteredSuggestions = suggestions.filter(
  //   suggestion =>
  //     suggestion.toLowerCase().indexOf(userInput.toLowerCase()) > -1
  // );

  // console.log(filteredSuggestions)
  // console.log(suggestions)

  ref.setState({
    activeSuggestion: 0,
    filteredSuggestions,
    showSuggestions: true,
    userInput: e.currentTarget.value,
    inputvalue: e.currentTarget.value
  });
};

export const onClick = (e, ref) => {
  ref.setState({
    activeSuggestion: 0,
    filteredSuggestions: [],
    showSuggestions: false,
    userInput: e.currentTarget.innerText
  });
};

export const onKeyDown = (e, state, ref) => {
  const { activeSuggestion, filteredSuggestions } = state;
  // User pressed the enter key
  if (e.keyCode === 13) {
    ref.setState({
      activeSuggestion: 0,
      showSuggestions: false,
      userInput: "start",
      searchOpen: false
    });
    let inputvalue = e.target.value;
    if (state.resulthandler) {
      state.resulthandler(inputvalue);
    } else {
      window.location.href = "/search/" + inputvalue;
    }
  }
  // User pressed the up arrow
  
  else if (e.keyCode === 38) {
    if (activeSuggestion === 0) {
      return;
    }

    ref.setState({ activeSuggestion: activeSuggestion - 1 });
  }
  // User pressed the down arrow
  else if (e.keyCode === 40) {
    if (activeSuggestion - 1 === filteredSuggestions.length) {
      return;
    }

    ref.setState({ activeSuggestion: activeSuggestion + 1 });
  }
};


export const selectSearch = (ref, inputvalue) => {
  var retvalue = "";

  ref.setState({
   showSuggestions: false,
 }, () => {ref.setState({
   showSuggestions: false,
 })
  if (inputvalue.trend) {
   retvalue = inputvalue.trend;
  }
  if (inputvalue.suggestion) {
    retvalue = inputvalue.suggestion;
  } 
  if(isString(inputvalue.inputvalue)){
    retvalue = inputvalue.inputvalue;
  }
 if (ref.state.resulthandler) {
     ref.state.resulthandler(retvalue);
 } else {
   window.location.href = "/search/" + retvalue;
 }
 ref.setState(prevState =>
 ({
   ...prevState,
     userInput: "start",
     showSuggestions: !prevState.showSuggestions
 }))
});
}

export const trendSearch = (ref, inputvalue) => {
  if (ref.state.resulthandler) {
      ref.state.resulthandler(inputvalue.trend);
  } else {
    window.location.href = "/search/" + inputvalue.trend;
  }
}

export const suggestionSearch = (ref, inputvalue) => {
  if (ref.state.resulthandler) {
      ref.state.resulthandler(inputvalue.suggestion);
  } else {
    window.location.href = "/search/" + inputvalue.suggestion;
  }
}

export const datamonths = [{
  0 : "JAN",
  1 : "FEB",
  2 : "MAR",
  3 : "APR",
  4 : "MAY",
  5 : "JUN",
  6 : "JUL",
  7 : "AUG",
  8 : "SEP",
  9 : "OCT",
  10 : "NOV",
  11 : "DEC"
}];  


export  const months = [{
  "JAN" : 1,
  "FEB" : 2,
  "MAR" : 3,
  "APR" : 4,
  "MAY" : 5,
  "JUN" : 6,
  "JUL" : 7,
  "AUG" : 8,
  "SEP" : 9,
  "OCT" : 10,
  "NOV" : 11,
  "DEC" : 12,  
}]

export const suggestions = [
  "Master Data Service for Controlling Objects",
  "Master Data Service for Workforce (MDW)",
  "Harmonized User Experience for SAP C4HANA Cloud",
  "Integration between SAP C4HANA and SAP S4HANA",
  "SAP Marketing Cloud and SAP Commerce Cloud Integration",
  "Employee Experience improvement with Qualtrics",
  "Employee Experience management"
];

export const trends = [
  "analytics",
  "data warehouse cloud",
  "master data"
]