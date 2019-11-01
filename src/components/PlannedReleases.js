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
      cardfilter: this.props.cardfilter === "twm" ? "totalworkforcemanagement" : this.props.cardfilter,
      subfilter: this.props.subfilter,
      placeholder: this.props.placeholder,
      sorting: 'date',
      initialitem: 0,
      lastitem: 10,
      maxperpage: 10,
      pages: 0,
      pagination: false,
      selectedDates: [],
      selectedDateElement: undefined,
      dateTags: [],
      quarterDateTags: {},
      showToast: false
    };
    this.paginationRef = React.createRef();
    this.paginate = this.paginate.bind(this);
    this.scrollToTop = this.scrollToTop.bind(this);
    this.manageTagArray = this.manageTagArray.bind(this);
    this.filterFormResults = this.filterFormResults.bind(this);
    // this.handleDateChipClick = this.handleDateChipClick.bind(this);
    this.handleExportClick = this.handleExportClick.bind(this);
    this.handleDeleteTagClick = this.handleDeleteTagClick.bind(this);
  }


  componentDidMount() {
    let pagination = false, pages = 0, sortDates = [];
    fetch(staging ? "https://roadmap-staging.cfapps.us10.hana.ondemand.com/releases/" + this.state.cardfilter : 
    "https://roadmap-api.cfapps.us10.hana.ondemand.com/api/releases/" + this.state.cardfilter)
      // fetch(staging ? "https://roadmap-staging.cfapps.us10.hana.ondemand.com/releases/" + this.state.cardfilter : "https://roadmap-api.cfapps.us10.hana.ondemand.com/api/releases/" + this.state.cardfilter)
      .then(res => res.json())
      .then(
        (result) => {
          result.releases.forEach(result => {
            if (!result.businessvalues) {
              result.businessvalues = [];
            }
            if (!result.featuredetails) {
              result.featuredetails = [];
            }
            let datevalue = new Date(result.date);
            result.date = datevalue.setDate(datevalue.getDate() + 1);
            result.numericdate = datevalue.getTime() / 1000.0;
            result.displaydate = datamonths[0][datevalue.getMonth()] + " " + datevalue.getFullYear();
            result.futureplans = this.manageDates(result.futureplans);
          });

          if (result.releases.length > 10) {
            pagination = true;
            pages = Math.ceil(result.releases.length / this.state.maxperpage);
          }

          // if (result && result.releases) {
          //   let tempDates = {};
          //   result.releases.forEach(release => {
          //     if (tempDates[release.numericdate] !== release.displaydate) {
          //       sortDates.push({ numericDate: release.numericdate, displayDate: release.displaydate });
          //       tempDates[release.numericdate] = release.displaydate;
          //     }
          //   });
          // }

          if (result && result.releases) {
            let tempDates = {};
            result.releases.forEach(release => {
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
            releases: result.releases,
            filterreleases: result.releases,
            pages: pages,
            pagination: pagination,
            dateTags: sortDates
          }, function () {
            fetch("/data/rform.json")
              .then(res => res.json())
              .then(
                (result) => {
                  this.setState({
                    forms: result.forms.filter(form => (this.props.type !== 'process' ?
                      form.title !== 'Subprocesses'
                      :
                      (form.title !== 'Subprocesses' && form.title !== 'Processes') || form.parent === this.props.cardfilter
                    )

                    ),
                  }, function () {
                    this.filterFormResults();
                  })
                },
                (error) => {
                  console.log(error);
                }
              )

          })
        },
        (error) => {
          console.log(error);
        }
      )
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

  getOccurrence = (array, value) => {
    var count = 0;
    array.forEach((v) => (v === value && count++));
    return count;
  }

  filterFormResults = () => {
    let cardfilter = this.state.cardfilter;
    let releases = this.state.releases;
    let forms = this.state.forms;
    let subfilter = this.state.subfilter;
    let releasetags = [];

    //get tags from release data
    releases.forEach(release => {
      if (release.tags.includes(cardfilter)) {
        releasetags = releasetags.concat(release.tags);
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
    let tags, pagination = false, pages = 0;
    tags = this.state.tags;
    /* Release Dates are tags with special functionality
      They must be able to render all possible results
      When all release dates are not selected
      If there are one or multiple release dates clicked,
      an AND relationship must exist for the case of multiple

      This must also rerender to the different processes a new occurence count
    */
    // if quarterDateTag-key is passed in
    if (this.state.quarterDateTags[key]) {
      let selectedDates = this.state.selectedDates, index = selectedDates.indexOf(key);
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
    this.setState({ tags: tags });

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
      // console.log("filterreleases:", this.state.filterreleases)
      this.setState({
        filterreleases: filterReleases,
        pages: pages,
        pagination: pagination
      });
    });
  }

  dateChipFilter = (releases) => {
    return releases.filter(release => {
      return release.displaydate === this.state.selectedDate;
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

    let currentags = tags;
    currentags = currentags.concat(this.state.statustags);
    currentags.push("");
    const filters = {
      tags: currentags
    };

    const filterKeys = Object.keys(filters);
    return releases.filter(release => {
      return filterKeys.every(key => {
        if (!filters[key].length) return true;
        // Loops again if release[key] is an array.
        if (Array.isArray(release[key])) {
          if (filters[key].length === 1) {
            return release[key].includes(this.state.cardfilter);
          } else {
            return release[key].some(keyEle => filters[key].includes(keyEle)) && release[key].includes(this.state.cardfilter);
          }
        }
        return filters[key].includes(release[key]);
      });
    });
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

    // if (this.state.selectedDateElement) {
    //   this.state.selectedDateElement.classList.remove('pr-selected-filter-chip');
    // }

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
        selectedDateElement: undefined,
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

  handleClick = (chip) => {
    this.setState({
      tags: chip.tags
    });
  }
  //release.tags.every(rt => !tags.includes(rt))

  // handleDateChipClick = (event) => {
  //   // console.log(event.currentTarget.textContent);
  //   if (this.state.selectedDateElement) {
  //     this.state.selectedDateElement.classList.remove('pr-selected-filter-chip');
  //   } else if (document.getElementsByClassName("pr-selected-filter-chip").length > 0) {
  //     document.getElementsByClassName("pr-selected-filter-chip")[0].classList.remove('pr-selected-filter-chip');
  //   }

  //   event.currentTarget.classList.add('pr-selected-filter-chip');

  //   this.setState({
  //     selectedDateElement: event.currentTarget,
  //     selectedDate: event.currentTarget.textContent
  //   }, () => this.manageTagArray());
  // }

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
    window.scrollTo(0, this.paginationRef.current.offsetTop - 77);
  }

  render() {
    const { forms, placeholder, sorting, tags } = this.state;
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
              <input className="search-input" type="text" placeholder={placeholder} />
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
                      <Chip variant="outlined" clickable="false" label={filterTag} deleteIcon={<img src={DeleteTag} alt={filterTag} />} onDelete={this.handleDeleteTagClick} tabindex={tabIndex++} />
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
              this.state.filterreleases
                .sort((a, b) => {
                  if (sorting === "title") {
                    return a.title > b.title ? 1 : a.title < b.title ? -1 : 0;
                  }

                  return a.numericdate - b.numericdate;
                })
                .slice(this.state.initialitem, this.state.lastitem)
                .map(release => (
                  <ReleaseCard
                    key={release._id}
                    _id={release._id}
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
                ))}
            {
              this.state.pagination
                ? <Pagination pages={this.state.pages} paginate={this.paginate} scrollToTop={this.scrollToTop}/>
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
