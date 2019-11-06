import React, { Component } from 'react';

//import material UI components
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
// import Chip from '@material-ui/core/Chip';
// import { CarouselCards } from '../components/CarouselCards';

//import css
import '../css/Page.css';
import '../css/Content.css';
import '../css/Home.css';
import '../css/Chip.css';
import '../css/Card.css';
import '../css/Process.css';

//import custom components
import Header from '../components/HeaderHome';
import SectionHeaderTitle from '../components/SectionHeaderTitle';
import Feedback from '../components/Feedback';
import Footer from '../components/Footer';
import FooterMobile from '../components/FooterMobile';
// import { ProductSearch } from '../components/Search';

// import { suggestions, trends } from '../utils/searchutils';
import { activeprocesses } from '../utils/processutils';



//import svg assets
import { ProductIcons } from '../assets/prod-icons';

class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      title: '',
      description: '',
      whatsnew: [],
      chips: [],
      solutions: [],
      tags: [],
      compact: false,
      sticky: 500,
      windowWidth: 0,
      windowHeight: 0,
      smallWindow: false
    };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }



  componentDidMount() {
    window.scrollTo(0, 0);
    document.title = 'SAP Product Roadmap';
    fetch("./data/home.json")
      .then(res => res.json())
      .then(
        (result) => {
          result.solutions.forEach(solution => {
            solution.disable = activeprocesses.includes(solution.title) ? false : true;
          });
          this.setState({
            title: result.title,
            description: result.description,
            whatsnew: result.whatsnew,
            chips: result.chips,
            solutions: result.solutions,
            products: result.products
          })
        },
        (error) => {
          console.log(error);
        }
      )

          
    window.addEventListener('scroll', this.controlHeader, true);
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.controlHeader);
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    this.setState({ windowWidth: window.innerWidth, windowHeight: window.innerHeight, smallWindow: window.innerWidth < 770 });
  }

  controlHeader = () => {
    if (window.pageYOffset > this.state.sticky) {
      this.setState({ compact: true });
    } else {
      this.setState({ compact: false });
    }
  }

  handleClick = chip => {
    this.setState({
      tags: chip.tags
    });
  }

  navigateToProcess = item => {
    window.location.href = '/process/' + item.icon
  }

  navigateToProduct = item => {
    window.location.href = '/product/' + item.icon
  }

  renderIcon = icon => {
    return ProductIcons[0][icon];
  }

  render() {
    const { title, description, tags, products, solutions, compact} = this.state;

    return (
      <div className={"page-container" + (this.state.smallWindow ? " page-container-small" : "")}>
        <Header title={title} description={description} compact={compact} smallWindow={this.state.smallWindow} />
        <Feedback />
        <div className="left-side-bg"></div>
        <div className={"content-container" + (this.state.smallWindow ? " content-container-small" : "")}>

          {/* Solution Section */}
          <div className="mainsection">

            {/* Explore by Products Section*/}
            <SectionHeaderTitle title="Explore by Products" smallWindow={this.state.smallWindow} firstSection={true} leftAligned={true}/>
            <div className="body">

              {products ? products.map(item => (
                <Card key={item.title} className={"default-card product-card product-active product-active-top "}>
                  <CardActionArea disabled={false} onClick={() => this.navigateToProduct(item)} >
                    <CardContent className="content">
                      <div className="icon-container">
                        <div className="icon icon-products">
                          <img src={this.renderIcon(item.icon)} alt={item.title} />
                        </div>
                      </div>
                      <div className="title-container">
                        <div className="title">{item.title}</div>
                      </div>
                      <div className="body">{item.body}</div>
                    </CardContent>
                  </CardActionArea>
                </Card>
              )) : null}
            </div>

            {/* <div className="body">
              {chips.map(chip => (
                <Chip
                  key={chip.label}
                  label={chip.label}
                  tags={chip.tags}
                  className="chip"
                  onClick={() => this.handleClick(chip)}
                  variant="outlined"
                />
              ))}
            </div> */}
            {/* Explore By Business Processes Section*/}
            < SectionHeaderTitle title="Explore by Business Processes" smallWindow={this.state.smallWindow} firstSection={false} leftAligned={true}/>
            <div className="body">
              {solutions
                .filter(item => { return tags.length > 0 ? item.tags.some(r => tags.includes(r)) : item.tags })
                .sort((a, b) => {
                  return (a.disable === b.disable) ? 0 : a.disable ? 1 : -1;
                })
                .map(item => (
                  <Card key={item.title} className={"default-card product-card" + (item.disable ? " product-inactive" : " product-active")}>
                    <CardActionArea disabled={item.disable} onClick={() => this.navigateToProcess(item)}>
                      <CardContent className="content">
                        <div className="icon-container">
                          <div className="icon">
                            <img src={this.renderIcon(item.icon)} alt={item.title}></img>
                          </div>
                          {item.disable ?
                            <div className="coming-soon-root">
                              <span>
                                COMING SOON
                            </span>
                            </div>
                            : null}

                        </div>
                        <div className="title-container">
                          <div className="title">{item.title}</div>
                        </div>
                        <div className="body">{item.body}</div>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                ))}
            </div>
          </div>

        </div>
        {this.state.smallWindow ? <FooterMobile /> : <Footer />}
      </div>
    )
  }
}

export default Home;
