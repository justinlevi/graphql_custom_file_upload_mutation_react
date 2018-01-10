import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class Thumbnails extends Component {
  static propTypes = {
    render: PropTypes.func.isRequired,
  }

  state = {
    
  };

  render() {
    return (
      <div className={"cell"}>
        {this.props.render()}
      </div>
    )
  }
}
