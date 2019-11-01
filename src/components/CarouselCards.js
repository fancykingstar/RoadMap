import React, { Component } from 'react';
import { Link } from 'react-router-dom';

//import material ui components
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { CarouselProvider, Slider, Slide, ButtonBack, ButtonNext } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';

//import css
import '../css/Carousel.css';
import '../css/Card.css';

//import svg assets
import { ProductIcons } from '../assets/prod-icons';

function renderIcon(icon) {
    return ProductIcons[0][icon];
}

const carouselWidthThreshold = 560;

class CarouselCards extends Component {
    render() {
        var count = -1;
        return (
            <CarouselProvider
                className={this.props.smallWindow ? "roadmap-slide-dimensions-small" : "roadmap-slide-dimensions"}
                visibleSlides={this.props.windowWidth > 1000 ? (this.props.windowWidth / carouselWidthThreshold) :
                    (this.props.windowWidth / (carouselWidthThreshold + 70))}
                naturalSlideWidth={this.props.smallWindow ? 300 : 134}
                naturalSlideHeight={150}
                lockOnWindowScroll={true}
                totalSlides={this.props.slides.length}
            >
                <div className="roadmap-carousel-content-container">
                    <Slider>
                        {this.props.slides.map(item => (
                            <Slide key={"slide-" + item.id} index={count++}>
                                <Card key={"card-" + item.id} className={"default-card static-card process-card" + (this.props.smallWindow ? " default-card-small" : "")}>
                                    <CardContent className="content">
                                        <div className="title-container">
                                            <div className="title-bar"></div>
                                            <div className="title">{item.title}</div>
                                        </div>
                                        <div className="header">{item.header}</div>
                                        <div className="body">{item.body}</div>
                                        {item.buttonLink.substr(0,4) === 'http' ? <a className="static__link" href={item.buttonLink} target='_blank'>{item.buttonText}</a>: <a href="#" className="static__link">{item.buttonText}</a>}
                                    </CardContent>
                                </Card>
                            </Slide>
                        ))}
                    </Slider>

                    <ButtonBack className="roadmap-carousel-back-button roadmap-carousel-button">
                        <img className="roadmap-chevron-image" src={renderIcon("leftChevron")} alt=""></img>
                    </ButtonBack>
                    {this.props.smallWindow ? null : <div className="roadmap-carousel-fade-back"></div>}
                    <ButtonNext className="roadmap-carousel-next-button roadmap-carousel-button">
                        <img className="roadmap-chevron-image" src={renderIcon("rightChevron")} alt=""></img>
                    </ButtonNext>
                    {this.props.smallWindow ? null : <div className="roadmap-carousel-fade-next"></div>}
                </div>
            </CarouselProvider>
        );
    }
};

export {
    CarouselCards
};
