import React, { Component } from 'react';
import '../css/MultiRoadmap.css';
import { Roadmap } from '../components/Roadmap';

var topItems = [];
var bottomItems = [];

function calculateLines(roadmap) {
    topItems = [];
    bottomItems = [];
    if (roadmap.length >= 6) {
        const roadmapsHalfCount = Math.floor(roadmap.length / 2);
        for (var i = 0; i < roadmapsHalfCount; i++) {
            topItems.push(roadmap[i]);
        }

        for (i = roadmap.length - 1; i >= roadmapsHalfCount; i--) {
            bottomItems.push(roadmap[i]);
        }
    }
}

class MultiRoadmap extends Component {
    render() {
        if (this.props.roadmap.length < 8) {
            return (<Roadmap roadmap={this.props.roadmap} hideArrows={this.props.hideArrows}/>)
        }

        calculateLines(this.props.roadmap);

        return (
            <div className="roadmap-multi">
                <Roadmap roadmap={topItems} nodash={true} multiLine={true}/>
                <Roadmap roadmap={bottomItems} nodash={true} reverseDirection={true}  multiLine={true}/>
                <div className="roadmap-multi-lines"/>
            </div>
        );
    }
};

export {
    MultiRoadmap
};