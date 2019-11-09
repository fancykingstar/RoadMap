import React, { Component } from 'react';
import Fuse from 'fuse.js';
import Button from '@material-ui/core/Button';
import MinIcon from '@material-ui/icons/Minimize';
import Grid from '@material-ui/core/Grid';
import Chip from '@material-ui/core/Chip';
import DeleteTag from '../assets/images/close-x.svg'
import { datamonths } from '../utils/searchutils';
import { baseURL } from '../utils/links';
import '../css/PR-Container.css'
import '../css/Card.css';
import '../css/Content.css';
import '../css/SearchResults.css';
import { SiteSearch } from '../components/Search';
import Header from '../components/HeaderHome';
import Feedback from '../components/Feedback';
import ReleaseCard from '../components/ReleaseCard';
import ResultCard from '../components/ResultCard';
import Footer from '../components/Footer';
import FooterMobile from '../components/FooterMobile';
import ReleaseForm from '../components/ReleaseForm';
import { suggestions, trends } from '../utils/searchutils';

function isString (value) {
  return typeof value === 'string' || value instanceof String;
}

class SearchResults extends Component {
  constructor(props) {
    super(props)
    this.state = {
      title: '',
      result: props.match.params.result,
      sorting: 'relevance',
      results: [],
      forms: [],
      tags: [],
      prodProc: [],
      filteredresults: [],
      allfilteredresults: [],
      productresults: [],
      processresults: [],
      filterall: 0,
      filterprocesses: 0,
      filterproducts: 0,
      filterfeatures: 0,
      windowWidth: 0,
      windowHeight: 0,
      smallWindow: false,
      initialitem: 0,
      lastitem: 10,
      maxperpage: 10,
      pages: 0,
      pagination: false,
      keyLabelMap: {},
      selectedDates: [],
      quarterDateTags: {},
      tagfilteredresults: []
    };
    this.scrollToTop = this.scrollToTop.bind(this);
    this.handleUserResult = this.handleUserResult.bind(this);
    this.paginate = this.paginate.bind(this);
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    this.handleExportClick = this.handleExportClick.bind(this);
    this.handleDeleteTagClick = this.handleDeleteTagClick.bind(this);
  }
  manageDates = (array) => {
    array.forEach(item => {
    let itemvalue = new Date(item.date);
    itemvalue.setDate(itemvalue.getDate() + 1);
    item.numericdate = itemvalue.getTime() / 1000.0;
    item.displaydate = datamonths[0][itemvalue.getMonth()] + " " + itemvalue.getFullYear();
    })
    return array;
  }

  componentDidMount() {
    document.title = 'Search Results';
    let queryURL = `${baseURL}?ProductSearch&$skip=0&$orderby=date asc&$expand=products,futureplans,toIntegration,toProcess,toSubProcess`;

    fetch(queryURL)
    .then(res =>{
      let response =  res.json()
      return response
    })
      .then(async ({value}) => {
        let results = value.filter((result) => (result.date && result.date.length > 1)),keyLabelMap = {},productParentKey;


        for (var i = 0; i < results.length; i++) {
          let result = results[i], chips = [], tags = [];
          let datevalue = new Date(result.date);
          result.date = datevalue.setDate(datevalue.getDate() + 1); // fallback for misformatted date-data
          result.numericdate = datevalue.getTime() / 1000.0;
          result.displaydate = datamonths[0][datevalue.getMonth()] + " " + datevalue.getFullYear();
          result.futureplans = this.manageDates(result.futureplans);


          if (result.process && result.process.length > 1 && !chips.includes(result.process)) {;
            if (result.process === "designtooperate") {
              result.process = "d2o";
            }
            if (!keyLabelMap[result.toProcess.lkey]) {
              keyLabelMap[result.toProcess.lkey] = result.toProcess.label
            }

            tags.push(result.process);
            chips.push({
              category: 'process',
              key: result.toProcess.lkey,
              label: result.toProcess.label
            })
          }

          if (result.toIntegration && result.integration.length > 1 && !chips.includes(result.integration)) {
            if (!keyLabelMap[result.toIntegration.lkey]) {
              keyLabelMap[result.toIntegration.lkey] = result.toIntegration.label
            }
            tags.push(result.integration);
            chips.push({
              category: 'integration',
              key: result.toIntegration.lkey,
              label: result.toIntegration.label
            })
          }

          if (result.toSubProcess && result.subProcess.length > 1 && !chips.includes(result.subProcess)) {
            tags.push(result.subProcess);
            chips.push({
              category: 'subprocess',
              key: result.toSubProcess.lkey,
              label: result.toSubProcess.label
            })
          }

          if (result.industry && result.industry.length > 1 && !chips.includes(result.industry)) {
            var industryKey = result.industry.toLowerCase().replace(/\s/g, ""),
                  industryLabel = result.industry.trim();
            if (industryKey === "retail/hospitality") {
              industryKey = "retail";
            } else if (industryKey === "publicsector/government") {
              industryKey = "publicsector"
            }
            if (!keyLabelMap[industryKey]) {
              keyLabelMap[industryKey] = industryLabel
            }
            tags.push(industryKey);
              chips.push({
              category: 'industry',
              key: industryKey,
              label: industryLabel
            })
          }

          if (result.products.length) {
            result.products.forEach(({ product }) => {
            var productKey = product.toLowerCase().replace(/\/|(sap)|\s/g, ""),
              productLabel = product.trim();
              if (i === 0) productParentKey = productKey;
              if (!chips.includes(product) && product && product.length > 1) {
                if (!keyLabelMap[productKey]) {
                  keyLabelMap[productKey] = productLabel
                }
                tags.push(productKey);
                  chips.push({
                    category: "product",
                    key: productKey,
                    label: productLabel
                  })
                }
              })
            }

           if (result.subProducts && result.subProducts.length) {
            result.subProducts.forEach(({ subproduct }) => {
              var subProductKey = subproduct.toLowerCase().replace(/\/|(sap)|\s/g, ""),
                subProductLabel = subproduct.trim()
              if (!chips.includes(subproduct) && subproduct && subproduct.length > 1) {
                if (!keyLabelMap[subProductKey]) {
                  keyLabelMap[subProductKey] = subProductLabel
                }
                tags.push(subProductKey);

                chips = chips.filter( ({key, label}) => key !== subProductKey && label !== subProductLabel)
                chips.push({
                  category: "subproduct",
                  key: subProductKey,
                  label: subProductLabel,
                  parentKey: productParentKey
                })
              }
            })
          }
            result.chips = chips;
            result.tags = tags;
          }

        let cleanedProdProc = []
        fetch("/data/search-pageData.json")
        .then(function(response) {return response.json()})
        .then((result) => {
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
        let uniqueResult = [];
        results.forEach(item =>{
          if(!uniqueTitles.has(item.title)){
            uniqueTitles.add(item.title)
            uniqueResult.push(item)
          }
        })

        await this.filterResultData(uniqueResult, cleanedProdProc);

        this.setState({
          results: uniqueResult,
          prodProc: cleanedProdProc

        }, () => fetch("/data/rform.json")
          .then(res => res.json())
          .then((result) => {
            let releaseDatesTemplate = this.getReleaseDateFormFields(this.state.filteredresults);

            if (releaseDatesTemplate.count > 0)
              result.forms.unshift(releaseDatesTemplate);

            releaseDatesTemplate.fields.forEach(date => keyLabelMap[date.label] = date.label);
            this.setState({
              forms: result.forms
                .filter(form => (this.props.type !== 'process' ?
                form.title !== 'Subprocesses'
                : (form.title !== 'Subprocesses' && form.title !== 'Processes') || form.parent === this.props.cardfilter
                ))
              ,keyLabelMap: keyLabelMap
            }, function () {
              this.filterFormResults();
            })
          }, (error) => { console.log(error); }
          )
        )
      },
      (error) => {
        console.log(error);
      }
    );

    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  getReleaseDateFormFields = (results) => {
    let sortDates = [];
    if (results && Array.isArray(results)) {
      let tempDates = {};
      results.forEach(release => {
        const quarterDate = this.getQuarter(new Date(release.date));
        if (!quarterDate) {
          return ;
        }
        if (!tempDates.hasOwnProperty(quarterDate)) {
          sortDates.push({ numericDate: release.date, displayDate: quarterDate, count: 1});
          tempDates[quarterDate] = quarterDate;
        } else {
          const sortDateTagIndex = sortDates.findIndex(date => date.displayDate === quarterDate);
          if (sortDateTagIndex !== -1) {
            sortDates[sortDateTagIndex].count ++;
          }
        }
      });
      sortDates.sort((s1, s2) => s1.numericDate - s2.numericdate);

      tempDates = {};
      sortDates.forEach(date => tempDates[date.displayDate] = date.displayDate);

      this.setState({
        quarterDateTags: tempDates,
        sortQuarterDates: sortDates,
      })
    }


    let fields = sortDates.map(qDateTag => {
      return {
        "label": qDateTag.displayDate,
        "checked": false,
        "key": qDateTag.displayDate,
        "status": false,
        "children": [],
        count: qDateTag.count
      }
    });

    return {
      "id": 0, "expandable": true, "state": false, "title": "Release Dates",
      "fields": fields,
      count: sortDates.reduce((q1, q2) => q1 += q2.count, 0)
    };

  }

  getQuarter = (date) => {
    if (!date || Number.isNaN(date.getTime())) {
      return null;
    }
    const month = date.getMonth() + 1;
    const quarter = (Math.ceil(month / 3));
    const year = date.getFullYear();


    return "Q" + quarter.toString() + " " + year.toString();
  }

  updateWindowDimensions() {
    this.setState({ windowWidth: window.innerWidth, windowHeight: window.innerHeight, smallWindow: window.innerWidth < 770 });
  }

  scrollToTop = () => {
    window.scrollTo({top: 200, behavior: 'smooth'});
  }

  filterFormResults = () => {
    let cardfilter = this.state.cardfilter;
    let releases = this.state.filteredresults;

    let forms = this.state.forms;
    let subfilter = this.state.subfilter;
    let releasetags = [];

    releases.forEach(release => {
        releasetags = releasetags.concat(release.tags);
    })

    forms.forEach(form => {
      if (form.title === 'Release Dates') {
        return;
      }
      form.icon = null;
      form.iconclass = null;
      form.count = 0;
      for (let i = form.fields.length; i--;) {
        form.fields[i].indeterminate = false;
        form.fields[i].icon = null;
        form.fields[i].iconclass = null;
        if (subfilter && cardfilter === form.fields[i].key) {
          form.fields[i].indeterminate = true;
          form.fields[i].status = true;
        }
        form.fields[i].count = 0;
        let occurences = this.getOccurrence(releasetags, form.fields[i].key);
        form.fields[i].count = occurences;
        form.count += occurences;
        form.fields[i].count = form.fields[i].count === null ? 0 : form.fields[i].count;
        for (let v = form.fields[i].children.length; v--;) {
          form.fields[i].children[v].count = 0;
          if (subfilter) {
            form.fields[i].children[v].checked = form.fields[i].children[v].key === subfilter ? true : false;
            form.fields[i].icon = MinIcon;
            form.fields[i].iconclass = "subButton";
            form.state = true;
            form.icon = MinIcon;
            form.iconclass = "subButton";
          }

          form.fields[i].children[v].count = this.getOccurrence(releases, form.fields[i].children[v].key);
          form.fields[i].children[v].count = form.fields[i].children[v].count === null ? 0 : form.fields[i].children[v].count;
        }
      }
    })
    this.setState(prevstate => ({
      ...prevstate,
      forms: forms
    }))
  }

  getOccurrence = (array, value) => {
    var count = 0;
    array.forEach((v) => {
    (v === value && count++);

    });
    return count;
  }

  async filterResultData(results, prodProc) {
    let filterall = 0, filterprocess = 0, filterproducts = 0, filterfeatures = 0, filteredresults = [], productresults = [], processresults = [], pagination = false, pages = 0;
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
      searchParams = results;
    }
    const fuse = new Fuse(searchParams, options);
    this.setState({searchhandler: fuse});
    var searchresults = fuse.search(this.state.result);

    searchresults.forEach(result => {
      if (result.date) {
        let datevalue = new Date(result.date);
        result.numericdate = datevalue.getTime() / 1000.0;
        result.displaydate = datamonths[0][datevalue.getMonth()] + " " + datevalue.getFullYear();
      } else {
        result.numericdate = 0;
      }

      if (result.type === "product") {
        productresults.push(result);
      }

      if (result.type === "process") {
        processresults.push(result);
      }

      filterall += 1;
      filteredresults.push(result);
    })

    const prodset = new Set();
    const procset = new Set();

    productresults = productresults.filter(el => {
      const duplicate = prodset.has(el.title);
      prodset.add(el.title);
      return !duplicate;
    });
    processresults = processresults.filter(el => {
      const duplicate = procset.has(el.title);
      procset.add(el.title);
      return !duplicate;
    });

    filterprocess = processresults.length;
    filterproducts = productresults.length;

    if (filteredresults.length > 10) {
      pagination = true;
      pages = Math.ceil(filteredresults.length / this.state.maxperpage);
    }


    filteredresults.map(
      form => {
        if(form.type === null || form.type === undefined || form.type.length == 0){
          if(isString(form.businessvalues)){
            form.businessvalues = form.businessvalues.replace(/\*/gi, "").replace(/\•/gi, "\r\n").replace(/\r\n\r\n/gi, "\r\n").replace(/\r\n/gi,"")
          }
          if(isString(form.featuredetails)){
            form.featuredetails = form.featuredetails.replace(/\*/gi, "").replace(/\•/gi, "\r\n").replace(/\r\n\r\n/gi, "\r\n").replace(/\r\n/gi,"")
          }
          if (form.futureplans && form.futureplans.length>0) {
            form.futureplans.map(detail =>{
              if(isString(detail.detail)){
                detail.detail = detail.detail.replace(/\*/gi, "").replace(/\•/gi, "\r\n").replace(/\r\n\r\n/gi, "\r\n").replace(/\r\n/gi,"")
              }
              if(detail.detail && detail.detail.length === 1){
                if(detail.detail[0] === ""){
                  detail.detail = []
                }
              }
            })
          }


          if (form.businessvalues && form.businessvalues.length === 1) {
            if (form.businessvalues[0] === ""){
              form.businessvalues = []
            }
          }

          if (form.featuredetails && form.featuredetails.length === 1) {
            if (form.featuredetails[0] === ""){
              form.featuredetails = []
            }
          }
      }
      return form;
      });

    await this.setState({
      filteredresults: filteredresults,
      tagfilteredresults: filteredresults,
      productresults: productresults,
      processresults: processresults,
      pages: 0,
      pagination: false,
      initialitem: 0,
      lastitem: 10
    });

    await this.setState({
      allfilteredresults: filteredresults,
      filteredresults: filteredresults,
      productresults: productresults,
      processresults: processresults,
      filterall: filterall,
      filterprocesses: filterprocess,
      filterproducts: filterproducts,
      filterfeatures: filterfeatures,
      pagination: pagination,
      pages: pages,
      initialitem: 0,
      lastitem: 10,
      focus: 'all',
    });
  }

  handleExportClick = () => {
    const showToast = !this.state.showToast;
    this.setState({ showToast: showToast });
  }

  handleDeleteTagClick = (event) => {
    let tag = event.currentTarget.alt;
    let forms = this.state.forms.map(form => {
    form.fields.map(field => {
      if (field.key === tag) {
      field.checked = false;
      }
      return field;
    })
    return form;
    })
    this.setState({
      forms: forms
    }, () => this.manageTagArray(false, tag))
  }

  quarterDateChipFilter = (releases) => {
    return releases.filter(release => {
      const date = this.getQuarter(new Date(release.date));
      return this.state.selectedDates.includes(date)
    })
  }

  manageTagArray = (state, key) => {
    let tags, pagination = false, pages = 0, { quarterDateTags, selectedDates } = this.state;
    tags = this.state.tags;
    if (quarterDateTags[key]) {
      let index = selectedDates.indexOf(key);
      if (index === -1) {
        selectedDates.push(key);
      } else {
        selectedDates.splice(index, 1);
      }
      this.setState({
        selectedDates: selectedDates !== this.state.selectedDates ? selectedDates : this.state.selectedDates
      }, () => {
        this.manageTagArray();
      })
      return;
    }

    if (state) {
      tags.push(key);
    } else if (key) {
      let index = tags.indexOf(key);
      tags.splice(index, 1);
    }
    this.setState({ tags: tags });

    let filterReleases = this.state.filteredresults;

    this.state.forms.forEach(form => {
      let tagCollection = [];
      form.fields.forEach(field => {
        tags.forEach(tag => {
          if (field.key === tag) {
            tagCollection.push(tag);
          } else if (field.children.length > 0) {
            field.children.forEach(childField => {
              if (childField.key === tag) {
                tagCollection.push(tag);
              }
            });
          }
        });
      });

      if (tagCollection.length > 0) {
        filterReleases = this.multiPropsFilter(filterReleases, tagCollection);
      }
    });

    if (this.state.selectedDates.length !== 0) {
      filterReleases = this.quarterDateChipFilter(filterReleases);
    }

    if (filterReleases.length > 10) {
      pagination = true;
      pages = Math.ceil(filterReleases.length / this.state.maxperpage);
    }

    this.setState({
      tagfilteredresults: filterReleases,
      pages: 0,
      pagination: false,
      initialitem: 0,
      lastitem: 10
    }, () => {
      this.setState({
        tagfilteredresults: filterReleases,
        pages: pages,
        pagination: pagination
      });
    });
  }

  multiPropsFilter = (releases, tags) => {
    let currentags = tags && tags.length > 0 ? tags : [""];

    const filters = {
      tags: currentags
    };

    const filterKeys = Object.keys(filters);
    return releases.filter(release => {
      return filterKeys.every(key => {
        if (!filters[key].length) return true;
        if (Array.isArray(release[key])) {
          return release[key].some(keyEle => filters[key].includes(keyEle));
        }
        return filters[key].includes(release[key]);
      });
    });
  };

  onSortingChange(value) {
    this.setState({
      sorting: value
    })
  }

  paginate(value) {
    let initialitem = this.state.maxperpage * value;
    let lastitem = this.state.maxperpage * (value + 1);

    this.setState({
      initialitem: initialitem,
      lastitem: lastitem
    });
  }

  handleUserResult(value) {
    this.setState(prevstate => ({
      ...prevstate,
      result: value
    }),
      function () {
        window.history.pushState(null, null, "/search/" + value);
        this.filterResultData(this.state.results,this.state.prodProc);
      }
    )
  }



  handleSelectFilter(e, filter) {
    let filteredResults = this.state.allfilteredresults, focus = "all", pages = 0;
    switch (filter) {
      case "processes":
        filteredResults = this.state.processresults;
        focus = 'processes';
        break;
      case "products":
        filteredResults = this.state.productresults;
        focus = 'products';
        break;
      case "features":
        filteredResults = [];
        focus = 'features';
        break;
      default:
        filteredResults = this.state.allfilteredresults;
        focus = 'all';
    }

    pages = Math.ceil(filteredResults.length / this.state.maxperpage);

    this.setState({
      filteredresults: filteredResults,
      focus: focus,
      pages: 0,
      pagination: false,
      initialitem: 0,
      lastitem: 10
    }, () => {
      this.setState({
        filteredresults: filteredResults,
        focus: focus,
        pages: pages,
        pagination: pages > 10,
        initialitem: 0,
        lastitem: 10
      });
    });
  }

  clearForms = () => {
    const forms = this.state.forms.map(form => {
      form.fields.map(field => {
        field.checked = false;
        if (field.children.length > 0) {
          field.children.forEach(childField => {
            childField.checked = false;
          })
        }
        return field;
      })
      return form;
    });

    this.setState({
      tagfilteredresults: this.state.filteredresults,
      pages: 0,
      pagination: false,
      initialitem: 0,
      lastitem: 10
    }, () => {
      this.setState({
        forms: forms,
        tags: [],
        selectedDates: [],
        pages: Math.ceil(this.state.results.length / this.state.maxperpage),
        pagination: this.state.results.length > 10,
        initialitem: 0,
        lastitem: 10,
      });
    });
  }

  render() {
    const { result, forms, sorting, initialitem, lastitem, focus, searchhandler,tags, keyLabelMap, selectedDates, tagfilteredresults} = this.state;
    const allSelectedTags = selectedDates.concat(tags);
    let tabIndex = 1;
    return (
      <div className={"page-container" + (this.state.smallWindow ? " page-container-small" : "")}>
        <Header compact={true} type="search" smallWindow={this.state.smallWindow} resultspage={true} resulthandler={this.handleUserResult} />
        <Feedback />
        <div className={"content-container" + (this.state.smallWindow ? " content-container-small" : "")}>
          <div className="search-page-container">
            <SiteSearch resultspage={true} resulthandler={this.handleUserResult} value={result} suggestions={suggestions} trends={trends} searchhandler={searchhandler}/>
          </div>

          <div className="search-content-container-topics util-container">
            <div className={"filterlink" + (focus === "all" ? " filterselection" : "")} onClick={(e) => this.handleSelectFilter(e, "all")}></div>
          </div>
          <Grid container spacing={1} className="pr-body">
            <Grid item xs={3}>
            <div className="pr-navigation">
              {forms.map(form => {
              if (typeof form.count == "number") {
                return <ReleaseForm key={form.id} title={form.title} expandable={form.expandable} status={form.state} data={form.fields} count={form.count} manageTagArray={this.manageTagArray} icon={form.icon} iconclass={form.iconclass} />
              }
              return null;
              })}
              <Button className="clearButton" onClick={this.clearForms} disableFocusRipple={true} disableRipple={true}>CLEAR ALL FILTERS</Button>
            </div>
            </Grid>
            <Grid item xs={9} className="search-list-container">
            <div className="pr-sort-container">
            <div className="pr-filter-tag-container">
              {allSelectedTags.length > 0 ?
                allSelectedTags.map(filterTag => (
                  <Chip variant="outlined" clickable="false" label={keyLabelMap[filterTag] ? keyLabelMap[filterTag].replace("SAP", "").trim(): keyLabelMap[filterTag]} lkey={filterTag} deleteIcon={<img src={DeleteTag} alt={filterTag} />} onDelete={this.handleDeleteTagClick} tabIndex={tabIndex++} />
                ))
                : null
              }
            </div>
            {allSelectedTags.length > 0 ? <Chip className="clear-all-filters" variant="outlined" clickable="false" onClick={this.clearForms} label="Clear All Filters" /> : null}
            </div>
            <div className="search-content-container results">
              {
                tagfilteredresults
                  .sort((a, b) => {
                    if (sorting === "relevance") {
                      return a.relevance - b.relevance;
                    }
                    if (sorting === "title") {
                      return a.title > b.title ? 1 : a.title < b.title ? -1 : 0;
                    }

                    return a.numericdate - b.numericdate;
                  })
                  .slice(initialitem, lastitem)
                  .map(result => {
                    if (!result.type) {
                      return <ReleaseCard key={result.title + result._id}
                        _id={result._id}
                        title={result.title}
                        relevance={result.relevance}
                        date={result.displaydate}
                        description={result.description}
                        likes={result.likes}
                        chips={result.chips}
                        values={result.businessvalues}
                        details={result.featuredetails}
                        futureplans={result.futureplans}
                        smallWindow={this.props.smallWindow} />

                    }
                    else if (result.type === "product" || result.type === "process") {
                      return <ResultCard key={result.title}
                        title={result.title}
                        relevance={result.relevance}
                        icon={result.icon}
                        type={result.type}
                        description={result.description} />
                    }
                    return null;
                  })
              }
            </div>
            <div className="disclaimer">
              The information above is
              for informational purposes and delivery timelines may change and projected functionality may not be released see SAP <a href="/">Legal Disclaimer</a>).
            </div>
            </Grid>
          </Grid>
        </div>
        {this.state.smallWindow ? <FooterMobile /> : <Footer />}
      </div>
    )
  }
}

export default SearchResults
