import React, { Component } from 'react';

//import MaterialUI Components
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import MinIcon from '@material-ui/icons/Minimize';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Collapse from '@material-ui/core/Collapse';

//import custom components
import SubForm from '../components/SubForm';

//import css
import '../css/ReleaseForm.css';

class ReleaseForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      title: '',
      count: 0,
      expandable: this.props.expandable,
      status: this.props.status,
      data: [],
      icon: this.props.icon || AddIcon,
      btnclass: this.props.iconclass || "addButton"
    }
  };

  componentDidMount() {
    this.setState({
      title: this.props.title,
      count: this.props.count,
      expandable: this.props.expandable,
      status: this.props.status,
      data: this.props.data
    })
  }

  componentDidUpdate(prevProps) {
    let status = this.state.status;
    let icon = this.state.icon;
    let iconclass = this.state.iconclass;
    if (prevProps.status !== this.props.status) {
      status = this.props.status;
    }
    if (prevProps.icon !== this.props.icon && this.props.icon) {
      icon = this.props.icon;
    }
    if (prevProps.icon !== this.props.iconclass && this.props.iconclass) {
      iconclass = this.props.iconclass;

    }
    if (status !== this.state.status || icon !== this.state.icon || iconclass !== this.state.iconclass) {
      this.setState(prevState => ({
        ...prevState,
        status: status,
        icon: icon,
        iconclass: iconclass
      }))
    }

  }


  handleExpandClick = () => {
    this.setState({
      status: !this.state.status,
      icon: this.state.status === true ? AddIcon : MinIcon,
      btnclass: this.state.status === true ? "addButton" : "subButton"
    })
  }

  handleCheck = field => {
    console.log('field*:', field)
    console.log('this.state.data', this.state.data)
    const data = this.state.data.map(item => {
      if (item.key === field.key) {
        item.checked = !item.checked
        this.props.manageTagArray(item.checked, item.key);
      }
      return item
    })

    this.setState({ data: data });
  }

  render() {
    const { title, expandable, status, data, btnclass } = this.state;
    const BtnIcon = this.state.icon;
    return (
      <div className={"pr-form-container" + (data.length === 0 ? " pr-container-hidden" : "")}>
        <div className="pr-form-header">
          {expandable ? <div className="pr-form-title title-expandable" onClick={this.handleExpandClick}>{title}</div> : <div className="pr-form-title">{title}</div>}
          {expandable ? <IconButton className={btnclass} disableFocusRipple={true} disableRipple={true} onClick={this.handleExpandClick}><BtnIcon fontSize="large" /></IconButton> : null}
        </div>
        <Collapse className="checkMarkGroup" in={status} timeout="auto" unmountOnExit>
          <FormGroup>
            {data.map(item => {
              if (item.children.length > 0) {
                return <SubForm key={item.key} label={item.label} data={item} manageTagArray={this.props.manageTagArray} icon={item.icon} iconclass={item.iconclass} />
              } else {
                return <FormControlLabel
                  className="checkInput"
                  key={item.key}
                  control={<Checkbox onChange={() => this.handleCheck(item)} checked={item.checked} disableFocusRipple={true} disableRipple={true} value={item.key} />}
                  label={item.label + " (" + item.count + ")"} />
              }
            })}
          </FormGroup>
        </Collapse>


      </div>
    )
  }
}

export default ReleaseForm;