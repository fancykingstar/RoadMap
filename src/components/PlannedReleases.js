import React, { Component } from 'react';

//import material UI components
import SearchIcon from '@material-ui/icons/SearchOutlined';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import MinIcon from '@material-ui/icons/Minimize';
import Chip from '@material-ui/core/Chip';

//import css
import '../css/PR-Container.css';
import '../css/Chip.css';

//import custom components
import { CustomButton } from '../components/Button';
import ReleaseForm from './ReleaseForm';
import ReleaseCard from './ReleaseCard';
import SectionHeaderTitle from '../components/SectionHeaderTitle';
import Pagination from '../components/Pagination';

import { datamonths } from '../utils/searchutils';

import DeleteTag from '../assets/images/close-x.svg'
const staging = false;
class PlannedReleases extends Component {

  constructor(props) {
    super(props);
    this.state = {
      forms: [],
      releases: [],
      filterreleases: [],
      statustags: [],
      tags: [],
      type: this.props.type,
      cardfilter: this.props.cardfilter,
      subfilter: this.props.subfilter,
      placeholder: this.props.placeholder,
      endpoint: this.props.endpoint === 'twm' ? 'totalworkforcemanagement' : this.props.endpoint,
      sorting: 'date',
      initialitem: 0,
      lastitem: 10,
      maxperpage: 10,
      pages: 0,
      pagination: false,
      selectedDates: [],
      dateTags: [],
      quarterDateTags: {},
      keyLabelMap: {},
      showToast: false,

      searchKey: ''
    };
    this.paginationRef = React.createRef();
    this.paginate = this.paginate.bind(this);
    this.scrollToTop = this.scrollToTop.bind(this);
    this.manageTagArray = this.manageTagArray.bind(this);
    this.filterFormResults = this.filterFormResults.bind(this);
    this.handleExportClick = this.handleExportClick.bind(this);
    this.handleDeleteTagClick = this.handleDeleteTagClick.bind(this);
  }


  componentDidMount() {
    const { type, cardfilter } = this.state;
    const baseURL = staging ? window.location.origin : 'https://roadmap-srv-dev.cfapps.sap.hana.ondemand.com'

    let querySubstr = '';
    if (type && type === 'product') {
      if (cardfilter === 'c4hana') {
        querySubstr = 'C/4HANA';
      } else if (cardfilter === 'successfactors') {
        querySubstr = 'SuccessFactors';
      } else {
        querySubstr = this.state.cardfilter.charAt(0).toUpperCase() + this.state.cardfilter.slice(1); 
      }
    } else {
      querySubstr = this.state.cardfilter.replace(/\s/g, "%20");
    }


    let queryURL = '';
    let searchType = type === 'product' 
      ? 'productSearch' 
      : (type === 'process' ? 'process' : '');

    if (staging) {
      queryURL = `${baseURL}/srv_api/odata/v4/roadmap/Roadmap?$filter=contains(${searchType},'${querySubstr}')&$skip=0&$orderby=date asc&$expand=products,futureplans`;
    } else {
      queryURL = `${baseURL}/odata/v4/roadmap/Roadmap?$filter=contains(${searchType},'${querySubstr}')&$skip=0&$orderby=date asc&$expand=products,futureplans`;
    }

    console.log('query:', queryURL, 'pageType:', this.state.type, 'cardfilter:', this.state.cardfilter);
    fetch(queryURL)
      .then(res => {
        let response = res.json();
        return response;
      })
      .then(({ value }) => {
        let results = value.filter((result) => result.date.length > 1);
        for (var i = 0; i < results.length; i++) {
          let result = results[i], chips = [], tags = [];
          // parseData
          if (!result.businessvalues) { result.businessvalues = []; }
          if (!result.featuredetails) { result.featuredetails = []; }
          let datevalue = new Date(result.date);
          result.date = datevalue.setDate(datevalue.getDate() + 1); // fallback for misformatted date-data
          result.numericdate = datevalue.getTime() / 1000.0;
          result.displaydate = datamonths[0][datevalue.getMonth()] + " " + datevalue.getFullYear();
          result.futureplans = this.manageDates(result.futureplans);
          // set tags
          if (result.process.length > 1 && !chips.includes(result.process)) {
            const processKey = result.process.toLowerCase().replace(/\s/g, "");
            /* Exception Keys */
            if (processKey === "designtooperate") {
              processKey = "d2o";
            }
            tags.push(processKey);
            chips.push({
              category: 'process',
              key: processKey,
              label: result.process.trim()
            })
          }

          if (result.integration.length > 1 && !chips.includes(result.integration)) {
            const integrationKey = result.integration.toLowerCase().replace(/\s/g, "");
            tags.push(integrationKey);
            chips.push({
              category: 'integration',
              key: integrationKey,
              label: result.integration.trim()
            })
          }

          if (result.industry.length > 1 && !chips.includes(result.industry)) {
            const industryKey = result.industry.toLowerCase().replace(/\s/g, "");
            if (industryKey === "retail/hospitality") {
              industryKey = "retail";
            } else if (industryKey === "publicsector/government") {
              industryKey = "publicsector"
            }

            tags.push(industryKey);
            chips.push({
              category: 'industry',
              key: industryKey,
              label: result.industry.trim()
            })
          }
          if (result.products.length) {
            result.products.forEach(({ product }) => {
              const productKey = product.toLowerCase().replace(/(sap)|\s/g, "")
              if (!chips.includes(product) && product.length > 1) {
                tags.push(productKey);
                chips.push({
                  category: "product",
                  key: productKey,
                  label: product.trim()
                })
              }
            })
          }
          result.chips = chips;
          result.tags = tags;
        }


        // Establish quarterDates
        let sortDates = [];
        if (results && results.releases) {
          let tempDates = {};
          results.forEach(release => {
            const quarterDate = this.getQuarter(new Date(release.date));
            if (!tempDates.hasOwnProperty(quarterDate)) {
              sortDates.push({ numericDate: release.date, displayDate: quarterDate });
              tempDates[quarterDate] = quarterDate;
            }
          });
          this.setState({
            quarterDateTags: tempDates
          })
        }

        this.setState({
          releases: results,
          filterreleases: results,
          pages: results.length > 10 ? Math.ceil(value.length / this.state.maxperpage) : 0,
          pagination: results.length > 10 ? true : false,
          dateTags: sortDates
        }, function () {
          fetch("/data/rform.json")
            .then(res => res.json())
            .then(
              (result) => {
                let keyLabelMap = {};
                result.forms.forEach(({ fields }) => {
                  fields.forEach(({ key, label }) => {
                    if (!keyLabelMap[key]) {
                      keyLabelMap[key] = label;
                    }
                  })
                })
                this.setState({
                  forms: result.forms.filter(form => (this.props.type !== 'process' ?
                    form.title !== 'Subprocesses'
                    : (form.title !== 'Subprocesses' && form.title !== 'Processes') || form.parent === this.props.cardfilter
                  )),
                  keyLabelMap: keyLabelMap
                }, function () {
                  this.filterFormResults();
                })
              }, (error) => { console.log(error); }
            )
        })
      }, (error) => {
        console.log(error);
      })
  }

  onSearchInputChanged = (e) => this.setState({ searchKey: e.target.value }, this.manageTagArray)

  manageDates = (array) => {
    array.forEach(item => {
      let itemvalue = new Date(item.date);
      itemvalue.setDate(itemvalue.getDate() + 1);
      item.numericdate = itemvalue.getTime() / 1000.0;
      item.displaydate = datamonths[0][itemvalue.getMonth()] + " " + itemvalue.getFullYear();
    })
    return array;
  }

  getOccurrence = (array, value) => {
    var count = 0;
    array.forEach((v) => {
      (v.includes(value) && count++)
    });
    return count;
  }

  filterFormResults = () => {
    let cardfilter = this.state.endpoint;
    let releases = this.state.releases;
    let forms = this.state.forms;
    let subfilter = this.state.subfilter;
    let releasetags = [];

    //get tags from release data
    releases.forEach(release => {
      // console.log(release.tags, 'cf:', cardfilter);
      if (release.tags.includes(cardfilter)) {
        releasetags = releasetags.concat(release.tags);
        // console.log('endpoint:', cardfilter, release.tags.indexOf(cardfilter));
        // console.log('releasetaggerinos:', releasetags);
      }
    })

    forms.forEach(form => {
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
          form.fields[i].children[v].count = this.getOccurrence(releasetags, form.fields[i].children[v].key);
          form.fields[i].children[v].count = form.fields[i].children[v].count === null ? 0 : form.fields[i].children[v].count;
        }
      }
    })
    this.setState(prevstate => ({
      ...prevstate,
      forms: forms
    }))
  }


  manageTagArray = (state, key) => {
    let tags, pagination = false, pages = 0, { quarterDateTags, selectedDates, searchKey } = this.state;
    tags = this.state.tags;

    console.log('tagkey:', key)
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
        console.log("selectedDates:", this.state.selectedDates)
        this.manageTagArray();
      })
      return;
    }
    // if state and key are passed in
    if (state && !tags.includes(key)) {
      tags.push(key);
    } else if (key) {
      let index = tags.indexOf(key);
      tags.splice(index, 1);
    }
    this.setState({ tags: tags }, () => console.log(this.state.tags));

    let filterReleases = this.state.releases;
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

      filterReleases = this.multiPropsFilter(filterReleases, tagCollection);
    });

    if (this.state.selectedDates.length !== 0) {
      filterReleases = this.quarterDateChipFilter(filterReleases);
    }

    if (searchKey) {
      filterReleases = filterReleases.filter(release => {
        return release.chips.filter(chip => chip.label.toLowerCase().indexOf(searchKey.toLowerCase()) != -1).length > 0;
      })
    }
    
    if (filterReleases.length > 10) {
      pagination = true;
      pages = Math.ceil(filterReleases.length / this.state.maxperpage);
    }

    this.setState({
      filterreleases: filterReleases,
      pages: 0,
      pagination: false,
      initialitem: 0,
      lastitem: 10
    }, () => {
      // console.log("&filterreleases:", this.state.filterreleases)
      this.setState({
        filterreleases: filterReleases,
        pages: pages,
        pagination: pagination
      });
    });
  }

  quarterDateChipFilter = (releases) => {
    return releases.filter(release => {
      const date = this.getQuarter(new Date(release.date));
      return this.state.selectedDates.includes(date)
      // return date === this.state.selectedDate;
    })
  }

  getQuarter = (date) => {
    const month = date.getMonth() + 1;
    const quarter = (Math.ceil(month / 3));
    const year = date.getFullYear();
    return "Q" + quarter.toString() + " " + year.toString();
  }

  multiPropsFilter = (releases, tags) => {
    if (tags.length === 0) {
      return releases;
    }
    let currentTags = tags;
    let filterArray = [];
    filterArray = releases.filter(({ tags }) => {
      const rtags = tags.join(' ')
      return currentTags.every((tag) => rtags.indexOf(tag) !== -1)
    })
    return filterArray;
  };


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
      filterreleases: this.state.releases,
      pages: 0,
      pagination: false,
      initialitem: 0,
      lastitem: 10
    }, () => {
      this.setState({
        forms: forms,
        tags: [],
        statustags: [],
        pages: Math.ceil(this.state.releases.length / this.state.maxperpage),
        pagination: this.state.releases.length > 10,
        filterreleases: this.state.releases,
        initialitem: 0,
        lastitem: 10,
      });
    });
  }

  paginate(value) {
    let initialitem = this.state.maxperpage * value;
    let lastitem = this.state.maxperpage * (value + 1);

    this.setState({
      initialitem: initialitem,
      lastitem: lastitem
    });
  }

  onSortingChange = (value) => {
    this.setState({ sorting: value });
  }


  handleExportClick = () => {
    const showToast = !this.state.showToast;
    this.setState({ showToast: showToast });
  }

  handleDeleteTagClick = (event) => {
    // console.log("delete", event.currentTarget.alt, this.state.tags)

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

  scrollToTop = () => {
    window.scrollTo(0, this.paginationRef.current.offsetTop - 66.521);
  }

  render() {
    const { forms, placeholder, sorting, tags, keyLabelMap, searchKey, filterreleases } = this.state;
    let tabIndex = 1;

    return (
      <div className="pr-section" ref={this.paginationRef}>
        <SectionHeaderTitle title={"Planned Releases"} smallWindow={this.props.smallWindow} leftAligned={false} />
        <div className={"pr-body" + (this.props.smallWindow ? " pr-body-small" : "")}>
          <div className="pr-navigation">
            {forms.map(form => {
              if (typeof form.count == "number") {
                return <ReleaseForm key={form.id} title={form.title} expandable={form.expandable} status={form.state} data={form.fields} count={form.count} manageTagArray={this.manageTagArray} icon={form.icon} iconclass={form.iconclass} />
              }
              return null;
            })}
            <Button className="clearButton" onClick={this.clearForms} disableFocusRipple={true} disableRipple={true}>CLEAR ALL FILTERS</Button>
          </div>
          <div className={"pr-results" + (this.props.smallWindow ? " pr-results-small" : "")}>
            <div className={"pr-search-container" + (this.props.smallWindow ? " pr-search-container-small" : "")}>
              <div className="pr-search-icon">
                <SearchIcon fontSize="large" />
              </div>
              <input className="search-input" type="text" placeholder={placeholder} onChange={this.onSearchInputChanged} value={searchKey} />
            </div>
            <div className="pr-card-container">
              <div className="pr-sort-container">
                {/* <img src={sort} alt="sort" />
                <div className="pr-sort-label">SORT BY: </div>
                <Select native className="pr-sort-select" value={sorting} onChange={e => this.onSortingChange(e.target.value)}>
                  <option value="date">DATE</option>
                  <option value="title">TITLE</option>
                </Select> */}
                {/* <div>
                  <Chip onClick={this.handleDateChipClick} className="pr-selected-filter-chip" variant="outlined" clickable="true" label="All"></Chip>
                  {dateTags.sort((a, b) => {
                    return a.numericDate - b.numericDate;
                  }).map(dateTag => (
                    <Chip onClick={this.handleDateChipClick} variant="outlined" clickable="true" label={dateTag.displayDate} tabindex={tabIndex++}></Chip>
                  ))}
                </div> */}
                {/* Conditional for if a filtered option exists, then render Clear All Filters button*/}
                <div className="pr-filter-tag-container">
                  {tags.length > 0 ?
                    tags.map(filterTag => (
                      <Chip variant="outlined" clickable="false" label={keyLabelMap[filterTag]} lkey={filterTag} deleteIcon={<img src={DeleteTag} alt={filterTag} />} onDelete={this.handleDeleteTagClick} tabIndex={tabIndex++} />
                    ))
                    : null}
                </div>
                {tags.length > 0 ? <Chip className="clear-all-filters" variant="outlined" clickable="false" onClick={this.clearForms} label="Clear All Filters" /> : null}
                <CustomButton handleClick={this.handleExportClick} label="Export" />
                <Snackbar
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                  }}
                  className="toast-window"
                  open={this.state.showToast}
                  onClose={this.handleExportClick}
                  autoHideDuration={6000}
                  message={<span className="toast-messages" id="message-id">Export Feature Coming Soon</span>}
                />

              </div>
            </div>
            {
              filterreleases
                .sort((a, b) => {
                  if (sorting === "title") {
                    return a.title > b.title ? 1 : a.title < b.title ? -1 : 0;
                  }

                  return a.numericdate - b.numericdate;
                })
                .slice(this.state.initialitem, this.state.lastitem)
                .map(release => (
                  <ReleaseCard
                    key={release.id}
                    _id={release.id}
                    title={release.title}
                    date={release.displaydate}
                    description={release.description}
                    likes={release.likes}
                    chips={release.chips}
                    values={release.businessvalues}
                    details={release.featuredetails}
                    futureplans={release.futureplans}
                    smallWindow={this.props.smallWindow}
                    staging={staging} />
                ))
            }
            {
              this.state.pagination
                ? <Pagination pages={this.state.pages} paginate={this.paginate} scrollToTop={this.scrollToTop} />
                : null
            }
            <div className="disclaimer">
              The information above is for informational purposes and delivery timelines may change and projected functionality may not be released see SAP <a href="https://www.sap.com/about/legal/impressum.html">Legal Disclaimer</a>.
              </div>
          </div>
        </div>
      </div>
    )
  }
}

export default PlannedReleases;