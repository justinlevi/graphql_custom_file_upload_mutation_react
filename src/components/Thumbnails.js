import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class Thumbnails extends Component {
  static propTypes = {
    index: PropTypes.number.isRequired,
    handleDelete: PropTypes.func.isRequired,
    render: PropTypes.func.isRequired
  }

  state = {
    
  };

  render() {
    return (
      <div className={"cell"} data-index={this.props.index}>
        {this.props.render()}
        <a className="delete" onClick={() => this.props.handleDelete(this.props.index)}></a>
      </div>
    )
  }
}
