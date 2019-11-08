
import React, { Component } from 'react';
import Fuse from 'fuse.js';

//import material UI components
// import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import MinIcon from '@material-ui/icons/Minimize';
import Grid from '@material-ui/core/Grid';
import { datamonths } from '../utils/searchutils';
//import css
import '../css/PR-Container.css'
import '../css/Card.css';
import '../css/Content.css';
import '../css/SearchResults.css';

//import product svg
import { ProductImages } from '../assets/product-images';

import { SiteSearch } from '../components/Search';

//import custom components
import Header from '../components/HeaderHome';
import Feedback from '../components/Feedback';
import ReleaseCard from '../components/ReleaseCard';
import ResultCard from '../components/ResultCard';
import Pagination from '../components/Pagination';
import Footer from '../components/Footer';
import FooterMobile from '../components/FooterMobile';
import ReleaseForm from '../components/ReleaseForm';

import { suggestions, trends } from '../utils/searchutils';
import { finished } from 'stream';

function isString (value) {
    return typeof value === 'string' || value instanceof String;
}


// import sort from '../assets/images/sort-icon.svg';

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
            pagination: false
        };
        this.scrollToTop = this.scrollToTop.bind(this);
        this.handleUserResult = this.handleUserResult.bind(this);
        this.paginate = this.paginate.bind(this);
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
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
        let queryURL = '';
        let searchType = ''

        const baseURL = 'https://roadmap-srv-dev.cfapps.sap.hana.ondemand.com'
        queryURL = `${baseURL}/odata/v4/roadmap/Roadmap?ProductSearch&$skip=0&$orderby=date asc&$expand=products,futureplans,toIntegration,toProcess,toSubProcess`;

        //fetch('https://roadmap-srv-dev.cfapps.sap.hana.ondemand.com/odata/v4/roadmap/Roadmap?ProductSearch&$skip=0&$orderby=date%20asc&$expand=products,futureplans')
        fetch(queryURL)
        .then(res =>{
            let response =  res.json()
            return response
        })
            .then(
                ({value}) => {
                    let results = value.filter((result) => result.date.length > 1);


                    for (var i = 0; i < results.length; i++) {
                        let result = results[i], chips = [], tags = [];
                        let datevalue = new Date(result.date);
                        result.date = datevalue.setDate(datevalue.getDate() + 1); // fallback for misformatted date-data
                        result.numericdate = datevalue.getTime() / 1000.0;
                        result.displaydate = datamonths[0][datevalue.getMonth()] + " " + datevalue.getFullYear();
                        result.futureplans = this.manageDates(result.futureplans);
                        // set tags
                        if (result.process && result.process.length > 1 && !chips.includes(result.process)) {;
                          /* Exception Keys */
                          if (result.process === "designtooperate") {
                            result.process = "d2o";
                          }
                          tags.push(result.process);
                          chips.push({
                            category: 'process',
                            key: result.toProcess.lkey,
                            label: result.toProcess.label
                          })
                        }

                        if (result.toIntegration && result.integration.length > 1 && !chips.includes(result.integration)) {
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

                        // industry parsing needs refactoring -- data shape for industry field is ambiguous
                        if (result.industry && result.industry.length > 1 && !chips.includes(result.industry)) {
                          /* */
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
                            if (!chips.includes(product) && product && product.length > 1) {
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

                    let cleanedProdProc = []
                    fetch("/data/search-pageData.json")
                    .then(function(response) {return response.json()})
                    .then(function(result){
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
                    let uniqueResult = new Array()
                    results.forEach(item =>{
                        if(!uniqueTitles.has(item.title)){
                            uniqueTitles.add(item.title)
                            uniqueResult.push(item)
                        }
                    })
                    this.setState({
                        results: uniqueResult,
                        prodProc: cleanedProdProc

                    }, () => fetch("/data/rform.json")
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
                    )
                    //this.cleanData(result.value)
                    this.filterResultData(uniqueResult, cleanedProdProc);
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

    updateWindowDimensions() {
        this.setState({ windowWidth: window.innerWidth, windowHeight: window.innerHeight, smallWindow: window.innerWidth < 770 });
    }

    scrollToTop = () => {
        window.scrollTo({top: 200, behavior: 'smooth'});
    }

    filterFormResults = () => {
        let cardfilter = this.state.cardfilter;
        let releases = this.state.results;
        let forms = this.state.forms;
        let subfilter = this.state.subfilter;
        let releasetags = [];

        //get tags from release data
        releases.forEach(release => {
            if (release.tags.includes(cardfilter)) {
                //console.log(release.tags)
                release.tags.map(tags =>{
                    releasetags.concat(tags.tag)
                })
            }
            //console.log(release)
        })

        forms.forEach(form => {
            form.icon = null;
            form.iconclass = null;
            for (let i = form.fields.length; i--;) {
                form.fields[i].indeterminate = false;
                form.fields[i].icon = null;
                form.fields[i].iconclass = null;
                if (subfilter && cardfilter === form.fields[i].key) {
                    form.fields[i].indeterminate = true;
                    form.fields[i].status = true;
                }
                form.fields[i].count = 0;
                form.fields[i].count = this.getOccurrence(releases, form.fields[i].key);
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
        array.forEach((item) => {
            item.tags.forEach((v) => (v === value && count++));
        });

        return count;
    }

    async filterResultData(results, prodProc) {
        let filterall = 0, filterprocess = 0, filterproducts = 0, filterfeatures = 0, filteredresults = [], productresults = [], processresults = [], pagination = false, pages = 0;
        //Fuse should be abstarcted into a different function to prevent recreating it every time. Create Fuse object once and set in state
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
            var options = {
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
            var searchParams = results
        }

        console.log(options)
        const fuse = new Fuse(searchParams, options);
        this.setState({searchhandler: fuse});
        var searchresults = fuse.search(this.state.result);

        searchresults.forEach(result => {
            if (result.date) {
                let datevalue = new Date(result.date);
                result.numericdate = datevalue.getTime() / 1000.0;
                result.displaydate = datamonths[0][datevalue.getMonth()] + " " + datevalue.getFullYear();
                //  let datearr = result.date.split(" ");
                //result.numericdate = Number(months[0][datearr[0]] + datearr[1]);
            } else {
                result.numericdate = 0;
            }

            //check to see if result is a product card
            if (result.type === "product") {
                productresults.push(result);
            }

            //check to see if result is a  process card
            if (result.type === "process") {
                processresults.push(result);
            }

            // if (result.chips) {
            //     result.chips.forEach(chip => {
            //         if (chip.category === "process") {
            //             processresults.push(result);
            //         }
            //         if (chip.category === "product") {
            //             productresults.push(result);
            //         }
            //     })
            // }

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

        //console.log(filteredresults)

        filteredresults.map(
            form => {

                // The current format of the backend service no longer matches the form in whihc the release cards were made in\
                // To do so the items were delimeted be \r\n so we split on those field however that caused inconsistent arrays:
                //      \r\n\r\n creates empty list items with dashes so we remove them for consistency
                //      \* is a proxy for dashes so we remove them for consistency
                //      \• is a worse proxy for dashes so we remove them for consistency
                //      All empty list items are removed from the release card and all items get a dash as the whole array doesnt have dashes as default behavior

                //console.log(form)
                if(form.type == null || form.type === undefined || form.type.length == 0){
                    if(isString(form.businessvalues)){
                        form.businessvalues = form.businessvalues.replace(/\*/gi, "").replace(/\•/gi, "\r\n").replace(/\r\n\r\n/gi, "\r\n").replace(/\r\n/gi,"")
                    }
                    if(isString(form.featuredetails)){
                        form.featuredetails = form.featuredetails.replace(/\*/gi, "").replace(/\•/gi, "\r\n").replace(/\r\n\r\n/gi, "\r\n").replace(/\r\n/gi,"")
                    }

                    form.futureplans.map(detail =>{
                        if(isString(detail.detail)){
                            detail.detail = detail.detail.replace(/\*/gi, "").replace(/\•/gi, "\r\n").replace(/\r\n\r\n/gi, "\r\n").replace(/\r\n/gi,"")
                        }
                        if(detail.detail.length == 1){
                            if(detail.detail[0] == ""){
                                detail.detail = []
                            }
                        }
                    })

                    if (form.businessvalues.length == 1) {
                        if (form.businessvalues[0] == ""){
                            form.businessvalues = []
                        }
                    }

                    if (form.featuredetails.length == 1) {
                        if (form.featuredetails[0] == ""){
                            form.featuredetails = []
                        }
                    }
            }


            });
        //console.log(filteredresults)
        this.setState({
            filteredresults: filteredresults,
            productresults: productresults,
            processresults: processresults,
            pages: 0,
            pagination: false,
            initialitem: 0,
            lastitem: 10
        }, () => {
            this.setState({
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
        });
    }

    manageTagArray = (state, key) => {
        let tags, pagination = false, pages = 0;
        tags = this.state.tags;
        //console.log(tags)
        if (state) {
            tags.push(key);
        } else if (key) {
            let index = tags.indexOf(key);
            tags.splice(index, 1);
        }
        this.setState({ tags: tags });

        let filterReleases = this.state.results;

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

        if (filterReleases.length > 10) {
            pagination = true;
            pages = Math.ceil(filterReleases.length / this.state.maxperpage);
        }

        this.setState({
            filteredresults: filterReleases,
            pages: 0,
            pagination: false,
            initialitem: 0,
            lastitem: 10
        }, () => {
            this.setState({
                filteredresults: filterReleases,
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
                // Loops again if release[key] is an array.
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
                //console.log(this.state.prodProc)
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
            filteredresults: this.state.results,
            pages: 0,
            pagination: false,
            initialitem: 0,
            lastitem: 10
        }, () => {
            this.setState({
                forms: forms,
                tags: [],
                pages: Math.ceil(this.state.results.length / this.state.maxperpage),
                pagination: this.state.results.length > 10,
                filteredresults: this.state.results,
                initialitem: 0,
                lastitem: 10,
            });
        });
    }

    render() {
        const { result, forms, sorting, filteredresults, filterall, filterprocesses, filterproducts, filterfeatures, initialitem, lastitem, pagination, focus, searchhandler } = this.state;
        //console.log(filteredresults)
        //console.log(this.state.forms)
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
                      <Grid item xs={9}>
                        <div className="search-content-container results">
                            {
                                filteredresults
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
                      </Grid>
                    </Grid>

                    {/* <div className="search-content-container util-container pr-sort-container">
                                <img src={sort} alt="sort" />
                                <span className="pr-sort-label">SORT BY: </span>
                                <Select native className="pr-sort-select" value={sorting} onChange={e => this.onSortingChange(e.target.value)}>
                                    <option value="date">DATE</option>
                                    <option value="title">TITLE</option>
                                </Select>
                            </div> */}

{/*
                    <div className="search-results-filter-container">
                        <div className="search-results-filtering">
                            {this.state.forms.map(form => (
                                <ReleaseForm key={form.id} title={form.title} expandable={form.expandable} status={form.state} data={form.fields} count={form.count} manageTagArray={this.manageTagArray} icon={form.icon} iconclass={form.iconclass} />
                            ))}
                            <Button className="clearButton" onClick={this.clearForms} disableFocusRipple={true} disableRipple={true}>CLEAR ALL FILTERS</Button>
                        </div>

                        <div className="search-results-container-right-side">

                            <div className="search-content-container results">
                                {
                                    filteredresults
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
                            {
                                pagination
                                    ? <Pagination pages={this.state.pages} paginate={this.paginate} scrollToTop={this.scrollToTop} />
                                    : null
                            }
                        </div>

                    </div>
                    */}
                    <div className="disclaimer">
                        The information above is
                        for informational purposes and delivery timelines may change and projected functionality may not be released see SAP <a href="/">Legal Disclaimer</a>).

                        </div>
                </div>
                {this.state.smallWindow ? <FooterMobile /> : <Footer />}
            </div>
        )
    }
}

export default SearchResults
