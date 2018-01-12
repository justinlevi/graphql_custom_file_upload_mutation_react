import React, {Component} from 'react';

import gql from 'graphql-tag';
import {graphql} from 'react-apollo';

import Thumbnails from './Thumbnails';
import { readFile, b64toBlob } from './ImageHelpers';

import './UploadComponent.css';

const submitFile = gql `
mutation fileUpload($input: FileUploadInput!) {
  fileUpload(input: $input){
    ...on MediaImage {
      fieldImage {
        derivative(style:medium) {
          url
        }
      }
    }
  }
}
`;

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

      this.handleFileSelect = this.handleFileSelect.bind(this);  
      this.handleDragOver = this.handleDragOver.bind(this); 
      this.handleUpload = this.handleUpload.bind(this); 
  }

  handleUpload() {

    this.setState({ uploading: true });
        
    let files = [];
    this.state.images.map((image, i) => { 
      let block = image.split(";");
      let contentType = block[0].split(":")[1];
      let realData = block[1].split(",")[1];
      let blob = b64toBlob(realData,contentType,2048);
      let file = new File( [blob] ,this.state.imageNames[i],{type: 'image/jpg'});
      files.push(file);
      return file;
    });

    this.props.mutate({
      variables: {
        file: files,
        input: {
          name: 'FILE UPLOAD'
        }
      }
    })
    .then(response => {
      this.setState(initialState);
      console.log(response)
    })
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

    let imageNames = [];
    const len = files.length;
    for (var i = 0; i < len; i++) {
      let file = files[i];
      // Only process image files.
      if (!file.type.match('image.*')) {
        continue;
      }

      imageNames.push(file.name);

      const { maxWidth, maxHeight } = this.state;
      readFile(file, maxWidth, maxHeight, (resizeDataUrl) => {
        this.setState({
            images: [...this.state.images, resizeDataUrl]
        });
      });
    }

    this.setState({
      imageNames: [...this.state.imageNames, ...imageNames]
    })
  }
  
  handleDragOver(event) {
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  }

  handleClose(index){
    let newImageArray = this.state.images;
    let newImageNameArray = this.state.imageNames;

    newImageArray.splice(index,1);
    newImageNameArray.splice(index,1);
    this.setState({
      images: newImageArray,
      imageNames: newImageNameArray
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
        <div id="dropZone" className="dropZone" 
          onDragOver={(event) => { this.handleDragOver(event)}}
          onDrop={(event) => { this.handleFileSelect(event)}}>Drop files here
        </div>
        <div className="browseContainer">
          <input type="file" required multiple
            onChange={(event) => {this.handleFileSelect(event) }}
          />
        </div>


        { this.state.images.length > 0 ? <button className={"btn btn-primary"} onClick={this.handleUpload}>UPLOAD IMAGES</button>: null }
        

        <div id="myProgress" style={ this.progressStyle() }>
          <div id="myBar" style={this.divStyle()}></div>
        </div>
        <div style={ this.progressStyle() }>{Math.round(this.props.progress) + "%"}</div>



        <output id="list" className="container">
          <div className={"grid"}>
            {
              this.state.images.map((image, i) => { 
                return <Thumbnails key={i} handleClose = {this.handleClose} index={i} render={ () => (
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

export default graphql(submitFile)(UploadComponent);