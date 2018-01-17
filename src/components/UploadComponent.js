import React, {Component} from 'react';
import PropTypes from 'prop-types'
import axios from 'axios';
import Dropzone from 'react-dropzone';

import gql from 'graphql-tag';
import { withApollo } from 'react-apollo';

import './UploadComponent.css';

const initialState = {
  input: {
    filenames: []
  },
  images: [],
  imageNames: [],
  maxWidth: 400,
  maxHeight: 225,
  uploading: false
};

class UploadComponent extends Component {

  static propTypes = {
    input: PropTypes.object
  }

  constructor(props) {
      super(props);

      this.state = initialState;
      this.onDrop = this.onDrop.bind(this);
  }

  onDrop = (files) => {

    let fileNames = [];
    const len = files.length;
    for (var i = 0; i < len; i++) {
      let file = files[i];
      // Only process image files.
      if (!file.type.match('image.*')) {
        continue;
      }

      fileNames.push(file.name);
    }

    const variables = {
      "input": {"fileNames": fileNames}
    };

    this.props.client.query(
      { 
        query: getSignedUrls,
        variables: variables
      }
    ).then(response => {

      const len = response.data.signedUploadURL.length;
      for (var i = 0; i < len; i++) {
        let url = response.data.signedUploadURL[i];
        // // now do a PUT request to the pre-signed URL
        axios.put(url, files[i]).then((response) => {
          this.setState({
            statusCode: response.status,
          });
        }).catch((error) => {
          console.log('error ' + error);
        });
      }

    }).catch((error) => {
      console.log('error ' + error);
    });
  };

  render() {
    return (
      <div className="uploadComponentContainer">
        <Dropzone onDrop={this.onDrop}>
          <p>Drop your files here or click to select one.</p>
        </Dropzone>
      </div>
    )
  }
}

const getSignedUrls = gql `
query signedUploadURL ($input: SignedUploadInput!) {
  signedUploadURL(input:$input)
}
`;

export default withApollo(UploadComponent);