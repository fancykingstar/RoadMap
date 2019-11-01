import React, { Component } from 'react';

import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import MinIcon from '@material-ui/icons/Minimize';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Collapse from '@material-ui/core/Collapse';

class SubForm extends Component {

	constructor(props) {
		super(props);

		this.state = {
			label: this.props.label,
			data: this.props.data,
			icon: this.props.icon || AddIcon,
			btnclass: this.props.iconclass || "addButton"
		}
	};

	componentDidMount() {
		this.checkChildNodes(this.props.data);
	}

	checkChildNodes = data => {
		let children = data.children;
		children.forEach(child => {
			if (child.checked) {
				this.props.manageTagArray(child.checked, child.key);
			}
		})
	}

	handleExpandClick = field => {
		let data = this.state.data;
		if (data.indeterminate) {
			data.status = true;
			data.indeterminate = false;
		} else {
			data.status = !data.status;

		}
		this.setState({
			icon: data.status === false ? AddIcon : MinIcon,
			btnclass: data.status === false ? "addButton" : "subButton"
		});
		this.handleCheck(field);
	}

	checkChildren = (array) => {
		var count = 0;
		array.forEach((v) => (v.checked === true && count++));
		return count;
	}

	handleCheck = field => {
		let data = this.state.data;

		if (data.key === field.key) {
			data.checked = !data.checked;
			data.indeterminate = false;
			data.children.forEach(child => {
				if (!child.checked && data.checked) {
					child.checked = true;
					this.props.manageTagArray(child.checked, child.key);
				} else if (child.checked && data.checked) {

				} else {
					child.checked = !child.checked;
					this.props.manageTagArray(child.checked, child.key);
				}
			})
			this.props.manageTagArray(data.checked, data.key);
		}
		else {
			data.children.map(child => {
				if (child.key === field.key) {
					child.checked = !child.checked;
					if (!child.checked && data.checked) {
						data.checked = !data.checked;
						data.indeterminate = true;
						this.props.manageTagArray(child.checked, child.key);
					}
					if (!data.checked) {
						let check = this.checkChildren(data.children);
						if (check === data.children.length) {
							data.indeterminate = false;
							data.checked = true;
							this.props.manageTagArray(data.checked, data.key);
						}
					}
					this.props.manageTagArray(child.checked, child.key);
				}
				return null;
			})
		}

		this.setState({
			data: data
		});
	}

	render() {
		const { label, data, btnclass } = this.state;
		const BtnIcon = this.state.icon;
		return (
			<div className={"pr-subform-container" + (data.count === 0 ? " pr-container-hidden" : "")}>
				<div className="pr-form-header">
					<FormControlLabel
						className="checkInput"
						control={<Checkbox onChange={() => this.handleExpandClick(data)} checked={data.checked} indeterminate={data.indeterminate} disableFocusRipple={true} disableRipple={true} value={data.key} />}
						label={label + " (" + data.count + ")"} />
					<IconButton className={btnclass} disableFocusRipple={true} disableRipple={true} onClick={this.handleExpandClick}><BtnIcon fontSize="large" /></IconButton>
				</div>
				<Collapse className="checkMarkGroup" in={data.status} timeout="auto" unmountOnExit>
					<FormGroup>
						{data.children.map(item => (
							<FormControlLabel
								className={"checkInput" + (item.count === 0 ? " checkInput-hidden" : "")}
								key={item.key}
								control={<Checkbox onChange={() => this.handleCheck(item)} checked={item.checked} disableFocusRipple={true} disableRipple={true} value={item.key} />}
								label={item.label + " (" + item.count + ")"} />
						))}
					</FormGroup>
				</Collapse>
			</div>
		)
	}

}

export default SubForm;