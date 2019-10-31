import React, { Component } from 'react';

//import css
import '../css/SectionHeaderTitle.css';

class SectionHeaderTitle extends Component {
	render() {
		return (
			<div className={"section-title-container" + (this.props.leftAligned ? " left-aligned-section-header" : "")}>
				<div className={"title section-header-content"
					+ (this.props.leftAligned ? " left-aligned-section-header" : "") 
					+ (this.props.smallWindow ? " section-header-small" : "")}>{this.props.title}</div>
			</div>
		);
	}
}

export default SectionHeaderTitle;