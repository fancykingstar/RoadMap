import React, { Component } from 'react';

//import css
import '../css/SectionHeaderTitle.css';

class SectionHeaderTitle extends Component {
	render() {
		return (
			<div className="section-title-container">
				<div className={"title section-header-content"
					// + (this.props.firstSection ? " section-header-whats-new" : " section-header centered-section-header")
					+ (this.props.smallWindow ? " section-header-small" : "")}>{this.props.title}</div>
				<div className="product-card title-right">
				</div>
			</div>
		);
	}
}

export default SectionHeaderTitle;