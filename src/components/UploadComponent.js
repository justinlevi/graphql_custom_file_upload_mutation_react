import React, {Component} from 'react';
import PropTypes from 'prop-types'
import axios from 'axios';
import Dropzone from 'react-dropzone';

import Thumbnails from './Thumbnails';
import { readFile, b64toBlob } from './ImageHelpers';

import gql from 'graphql-tag';
import { withApollo } from 'react-apollo';

import './UploadComponent.css';

const initialState = {
  fileNames: [],
  files: [],
  thumbnails: [],
  statusCode: [],
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

      this.handleFileSelect = this.handleFileSelect.bind(this);  
      this.handleUpload = this.handleUpload.bind(this); 
      this.handleDelete = this.handleDelete.bind(this); 
  }

  handleUpload() {

    this.setState({ uploading: true });

    const variables = {
      "input": {"fileNames": this.state.fileNames}
    };

    this.props.client.query({ query: getSignedUrls, variables: variables})
    .then(response => {
      const len = response.data.signedUploadURL.length;
      for (var i = 0; i < len; i++) {
        let url = response.data.signedUploadURL[i];
        // // now do a PUT request to the pre-signed URL
        axios.put(url, this.state.files[i]).then((response) => {
          this.setState({
            statusCode: [...this.state.files, response.status],
          });
        }).catch((error) => {
          console.log('error ' + error);
        });
      }
    }).catch((error) => {
      console.log('error ' + error);
    });
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

      this.createThumbnail(file);
      fileNames.push(file.name);
    }

    this.setState({
      fileNames: [...this.state.fileNames, fileNames],
      files: [...this.state.files, files]
    });
  };

  createThumbnail(file) {
    const { maxWidth, maxHeight } = this.state;
    readFile(file, maxWidth, maxHeight, (resizeDataUrl) => {
      this.setState({
          thumbnails: [...this.state.thumbnails, resizeDataUrl]
      });
    });
  }

  handleFileSelect(event) {
    event.stopPropagation();
    event.preventDefault();

    // FileList object.
    let files = undefined;
    if (event.hasOwnProperty("dataTransfer") && event.dataTransfer.files !==  undefined){
      files = event.dataTransfer.files
    }else{
      files = event.target.files;
    }

    let fileNames = [];
    const len = files.length;
    for (var i = 0; i < len; i++) {
      let file = files[i];
      // Only process image files.
      if (!file.type.match('image.*')) {
        continue;
      }

      this.createThumbnail(file);
      fileNames.push(file.name);
    }

    this.setState({
      fileNames: [...this.state.fileNames, fileNames],
      files: [...this.state.files, files]
    });
  }

  handleDelete(index){
    let newFileArray = this.state.files;
    let newThumbnailArray = this.state.thumbnails;
    let newFileNameArray = this.state.fileNames;

    newFileArray.splice(index,1);
    newFileNameArray.splice(index,1);
    newThumbnailArray.splice(index,1);

    this.setState({
      files: newFileArray,
      fileNames: newFileNameArray,
      thumbnails: newThumbnailArray
    })
  }

  divStyle(){
    return {
      width: Math.round(this.props.progress) + '%'
    }
  }

  progressStyle() {
    return {
      display: this.state.uploading ? "block" : "none"
    }
  }

  render() {
    return (
      <div className="uploadComponentContainer">
        <Dropzone onDrop={this.onDrop} id="dropZone" className="dropZone">
          <p>Drop your files here or click to select one.</p>
        </Dropzone>
        <div className="browseContainer">
          <input type="file" required multiple
            onChange={(event) => {this.handleFileSelect(event) }}
          />
        </div>


        { this.state.files.length > 0 ? <button className={"btn btn-primary"} onClick={this.handleUpload}>UPLOAD files</button>: null }

        <output id="list" className="container">
          <div className={"grid"}>
            {
              this.state.thumbnails.map((image, i) => { 
                return <Thumbnails key={i} handleDelete = {this.handleDelete} index={i} render={ () => (
                  <figure>
                    <img alt={""} src={image} className={"responsive-image"}/>
                  </figure>
                )} /> 
              })
            }
          </div>
        </output>
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