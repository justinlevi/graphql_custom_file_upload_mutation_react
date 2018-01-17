import React, {Component} from 'react';
//import axios from 'axios';
import Dropzone from 'react-dropzone';

import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import './UploadComponent.css';

const initialState = {
    images: [],
    imageNames: [],
    maxWidth: 400,
    maxHeight: 225,
    uploading: false
};

class UploadComponent extends Component {

  constructor(props) {
      super(props);

      this.state = initialState;
  }

  onDrop = (files) => {

    this.props.query({ 
        variables: { 
          input : {
            filenames: files
          } 
        }
      }
    ).then(response => {
      console.log(response)

      // // now do a PUT request to the pre-signed URL
      // axios.put(response.data, files[0]).then((response) => {
      //   this.setState({
      //     statusCode: response.status,
      //   });
      // });
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
query signedUploadUrl($input: SignedUploadInput!) {
  signedUploadURL(input:$input)
}
`;

export default graphql(getSignedUrls, { input: '' })(observer(UploadComponent));