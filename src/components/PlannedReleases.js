import React, { Component } from 'react';
import axios from 'axios';
import download from 'downloadjs'
import SearchIcon from '@material-ui/icons/SearchOutlined';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import MinIcon from '@material-ui/icons/Minimize';
import Chip from '@material-ui/core/Chip';
import Grid from '@material-ui/core/Grid';
import { CustomButton } from '../components/Button';
import ReleaseForm from './ReleaseForm';
import ReleaseCard from './ReleaseCard';
import SectionHeaderTitle from '../components/SectionHeaderTitle';
import Pagination from '../components/Pagination';
import { productlabels } from '../utils/processutils';
import { datamonths } from '../utils/searchutils';
import { baseURL } from '../utils/links';
import DeleteTag from '../assets/images/close-x.svg'
import '../css/PR-Container.css';
import '../css/Chip.css';

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
      cardfilter: this.props.cardfilter === 'twm' ? 'totalworkforcemanagement' : this.props.cardfilter,
      subfilter: this.props.subfilter,
      placeholder: this.props.placeholder,
      sorting: 'date',
      initialitem: 0,
      lastitem: 10,
      maxperpage: 10,
      pages: 0,
      pagination: false,
      selectedDates: [],
      quarterDateTags: {},
      keyLabelMap: {},
      showToast: false,
      width: 0,
      height: 0,
      searchKey: ''
    };
    this.paginationRef = React.createRef();
    this.paginate = this.paginate.bind(this);
    this.scrollToTop = this.scrollToTop.bind(this);
    this.manageTagArray = this.manageTagArray.bind(this);
    this.filterFormResults = this.filterFormResults.bind(this);
    this.handleExportClick = this.handleExportClick.bind(this);
    this.handleDeleteTagClick = this.handleDeleteTagClick.bind(this);
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
    const { type, cardfilter } = this.state;

    let querySubstr = '';
    if (type && type === 'product') {
      querySubstr = productlabels[0][this.state.cardfilter]
        .split(' ')[1] || ''
    } else {
      querySubstr = this.state.cardfilter || '';
    }

    let searchType = type === 'product' ?
      'productSearch'
      : (type === 'process' ? 'process' : type === 'integration' ? 'integration' : '');
    let queryURL = `${baseURL}?$filter=contains(${searchType},'${querySubstr}')&$skip=0&$orderby=date asc&$expand=products,futureplans,subProducts,toIntegration,toProcess,toSubProcess`;

    fetch(queryURL)
      .then(res => {
        let response = res.json();
        return response;
      })
      .then(({ value }) => {
        let results = value.filter((result) => result.date && result.date.length > 1), keyLabelMap = {}, productParentKey;
        for (var i = 0; i < results.length; i++) {
          let result = results[i], chips = [], tags = [];
          if (!result.businessvalues) { result.businessvalues = []; }
          if (!result.featuredetails) { result.featuredetails = []; }
          let datevalue = new Date(result.date);
          result.date = datevalue.setDate(datevalue.getDate() + 1);
          result.numericdate = datevalue.getTime() / 1000.0;
          result.displaydate = datamonths[0][datevalue.getMonth()] + " " + datevalue.getFullYear();
          result.futureplans = this.manageDates(result.futureplans);

          if (result.process && result.toProcess && result.process.length > 1 && !chips.includes(result.process)) {
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

          if (result.integration && result.integration.length > 1 && !chips.includes(result.integration)) {
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


          if (result.subProcess && result.toSubProcess && result.subProcess.length > 1 && !chips.includes(result.subProcess) && (result.subProcess.substr(0, result.subProcess.indexOf(' ') !== "ERROR"))) {
            if (!keyLabelMap[result.toSubProcess.lkey]) {
              keyLabelMap[result.toSubProcess.lkey] = result.toSubProcess.label
            }
            tags.push(result.subProcess);
            chips.push({
              category: 'subprocess',
              key: result.toSubProcess.lkey,
              label: result.toSubProcess.label,
              parentKey: result.toSubProcess.process_lkey
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
            result.products.forEach(({ product }, i) => {
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

        this.setState({
          releases: results,
          filterreleases: results,
          pages: results.length > 10 ? Math.ceil(value.length / this.state.maxperpage) : 0,
          pagination: results.length > 10 ? true : false,
        }, function () {
          fetch("/data/rform.json")
            .then(res => res.json())
            .then((result) => {
                let releaseDatesTemplate = this.getReleaseDateFormFields(results);

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
        })
      }, (error) => {
        console.log(error);
      })
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

  onSearchInputChanged = (e) => this.setState({ searchKey: e.target.value }, this.manageTagArray)

  manageDates = (array) => {
    if (array) {
      array.forEach(item => {
        let itemvalue = new Date(item.date);
        itemvalue.setDate(itemvalue.getDate() + 1);
        item.numericdate = itemvalue.getTime() / 1000.0;
        item.displaydate = datamonths[0][itemvalue.getMonth()] + " " + itemvalue.getFullYear();
      })
    }
    return array;
  }

  getOccurrence = (array, value) => {
    var count = 0;
    array.forEach((v) => {
      (v === value && count++)
    });
    return count;
  }

  filterFormResults = () => {
    let cardfilter = this.state.cardfilter;
    let releases = this.state.releases;
    let forms = this.state.forms;
    let subfilter = this.state.subfilter;
    let releasetags = [];

    releases.forEach(release => {
      if (release.tags.includes(cardfilter)) {
        releasetags = releasetags.concat(release.tags);
      }
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
          form.fields[i].children[v].count = this.getOccurrence(releasetags, form.fields[i].children[v].key);
          form.fields[i].children[v].count = form.fields[i].children[v].count === null ? 0 : form.fields[i].children[v].count;
        }
      }
    })
    this.setState(prevstate => ({
      ...prevstate,
      forms: forms
    }),
    )
  }


  manageTagArray = (state, key) => {
    let tags, pagination = false, pages = 0, { quarterDateTags, selectedDates, searchKey } = this.state;
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

    if (state && !tags.includes(key)) {
      tags.push(key);
    } else if (key) {
      let index = tags.indexOf(key);
      tags.splice(index, 1);
    }
    this.setState({ tags: tags },);

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

        const includedInChips = release.chips.filter(chip => chip.label.toLowerCase().indexOf(searchKey.toLowerCase()) !== -1).length > 0;
        const includedInTitle = release.title.toLowerCase().indexOf(searchKey.toLowerCase()) !== -1;
        const includedInDesc = release.description.toLowerCase().indexOf(searchKey.toLowerCase()) !== -1;

        return includedInChips || includedInTitle || includedInDesc;
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
    })
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

  multiPropsFilter = (releases, tags) => {
    if (tags.length === 0) {
      return releases;
    }
    let currentTags = tags;
    let filterArray = [];
    filterArray = releases.filter(({ tags }) => {
      const rtags = tags.join(' ')
      return currentTags.some((tag) => rtags.indexOf(tag) !== -1)
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
      lastitem: 10,
      selectedDates: []
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
    let params = []
    this.state.filterreleases.map(release => (
      params = params.concat({id: release.id})
    ));

    axios.post(`../srv_api/excel/exportList/`,JSON.stringify(params), {
      headers: {'Content-Type': 'application/json'},
      responseType: 'blob',
    })
      .then(response => {
        const content = response.headers['content-type'];
      download(response.data, "SAP-roadmap-"+ Date.now() + ".xlsx", content)
      })
      .catch(function (error) {
        console.log(error);
      })
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

  scrollToTop = () => {
    window.scrollTo({ top: this.paginationRef.current.offsetTop - 66.521, behavior: 'smooth' });
  }

  render() {
    const { forms, placeholder, sorting, tags, selectedDates, keyLabelMap, searchKey, filterreleases } = this.state;
    let tabIndex = 1;

    const allSelectedTags = selectedDates.concat(tags);
    const windowWidth = this.state.width;
    return (
      <div className={"pr-section"+ (this.props.smallWindow ? " pr-section-small" : "")} ref={this.paginationRef}>
        <SectionHeaderTitle title={"Planned Releases"} smallWindow={this.props.smallWindow} leftAligned={false} />
        <Grid container spacing={1} className={"pr-body" + (this.props.smallWindow ? " pr-body-small" : "")}>
          <Grid item md={3} xs={12}>
            {
              windowWidth < 960 ?
                <div className="pr-results"><div className="pr-search-container">
                  <div className="pr-search-icon">
                    <SearchIcon fontSize="large" />
                  </div>
                  <input className="search-input" type="text" placeholder={placeholder} onChange={this.onSearchInputChanged} value={searchKey} />
                </div></div> : ""
            }
            <div className="pr-navigation">
              { windowWidth < 960 ? <CustomButton handleClick={this.handleExportClick} label="Export" /> : "" }
              {forms.map(form => {
                if (typeof form.count == "number") {
                  return <ReleaseForm key={form.id} title={form.title} expandable={form.expandable} status={form.state} data={form.fields} count={form.count} manageTagArray={this.manageTagArray} icon={form.icon} iconclass={form.iconclass} />
                }
                return null;
              })}
              <Button className="clearButton" onClick={this.clearForms} disableFocusRipple={true} disableRipple={true}>CLEAR ALL FILTERS</Button>
            </div>
          </Grid>
          <Grid item md={9} xs={12} className={"pr-results-container" + (this.props.smallWindow ? " pr-results-container-small" : "")}>
            <div className={"pr-results" + (this.props.smallWindow ? " pr-results-small" : "")}>
              {
                windowWidth >= 960 ?
                <div className={"pr-search-container" + (this.props.smallWindow ? " pr-search-container-small" : "")}>
                  <div className="pr-search-icon">
                    <SearchIcon fontSize="large" />
                  </div>
                  <input className="search-input" type="text" placeholder={placeholder} onChange={this.onSearchInputChanged} value={searchKey} />
                </div> : ""
              }
              <div className={"pr-card-container" + (this.props.smallWindow ? " pr-card-container-small" : "")}>
                <div className="pr-sort-container">
                  <div className="pr-filter-tag-container">
                    {allSelectedTags.length > 0 ?
                      allSelectedTags.map(filterTag => (
                        <Chip variant="outlined" clickable="false" label={keyLabelMap[filterTag] ? keyLabelMap[filterTag].replace("SAP", "").trim(): keyLabelMap[filterTag]} lkey={filterTag} deleteIcon={<img src={DeleteTag} alt={filterTag} />} onDelete={this.handleDeleteTagClick} tabIndex={tabIndex++} />
                      ))
                      : null}
                  </div>
                  {allSelectedTags.length > 0 ? <Chip className="clear-all-filters" variant="outlined" clickable="false" onClick={this.clearForms} label="Clear All Filters" /> : null}
                  { windowWidth >= 960 ? <CustomButton handleClick={this.handleExportClick} label="Export" /> : "" }
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
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default PlannedReleases;
