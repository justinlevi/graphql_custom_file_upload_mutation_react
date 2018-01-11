import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class Thumbnails extends Component {
  static propTypes = {
    index: PropTypes.number.isRequired,
    render: PropTypes.func.isRequired
  }

  state = {
    
  };

  render() {
    return (
      <div className={"cell"} data-index={this.props.index}>
        <div className="delete-image" onClick={() => this.props.handleClose(this.props.index)}>X</div>
        {this.props.render()}
      </div>
    )
  }
}
