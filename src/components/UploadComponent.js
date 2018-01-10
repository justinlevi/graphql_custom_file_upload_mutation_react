import React, {Component} from 'react';

import gql from 'graphql-tag';
import {graphql} from 'react-apollo';

import Thumbnails from './Thumbnails';

import './UploadComponent.css';

const submitFile = gql `
mutation fileUpload($input: FileUploadInput!) {
    fileUpload(input: $input){
        ...on File {
            uri
        }
    }
}
`;

function readFile(file, maxWidth, maxHeight, fn) {
  var reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function (event) {
      var dataUrl = event.target.result;

      var image = new Image();
      image.src = dataUrl;
      image.onload = () => {
          var resizedDataUrl = resizeImage(image, maxWidth, maxHeight, 0.7);
          fn(resizedDataUrl);
      };
  }
}

function resizeImage(image, maxWidth, maxHeight, quality) {
  var canvas = document.createElement('canvas');

  var width = image.width;
  var height = image.height;

  if (width > height) {
      if (width > maxWidth) {
          height = Math.round(height * maxWidth / width);
          width = maxWidth;
      }
  } else {
      if (height > maxHeight) {
          width = Math.round(width * maxHeight / height);
          height = maxHeight;
      }
  }

  canvas.width = width;
  canvas.height = height;

  var ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}

class UploadComponent extends Component {

    state = {
        images: [],
        maxWidth: 100,
        maxHeight: 100
    };

    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);  
        this.handleFileSelect = this.handleFileSelect.bind(this);  
        this.handleDragOver = this.handleDragOver.bind(this); 
    }

    handleChange = (target) => {
        this.props.mutate({
            variables: {
                file: target.files,
                input: {
                    name: target.files[0].name
                }
            }
        })
        .then(response => {
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
        
            
        
        const len = files.length;
        for (var i = 0; i < len; i++) {
            let file = files[i];
            // Only process image files.
            if (!file.type.match('image.*')) {
                continue;
            }

            const { maxWidth, maxHeight } = this.state;
            readFile(file, maxWidth, maxHeight, (resizeDataUrl) => {
                var { images } = this.state;
                images.push(resizeDataUrl)
                this.setState({
                    images: images
                });
            });
        }
    }
    
    handleDragOver(event) {
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    }
    
    // Setup the dnd listeners.
    //   var dropZone = document.getElementById('drop_zone');
    //   dropZone.addEventListener('dragover', handleDragOver, false);
    //   dropZone.addEventListener('drop', handleFileSelect, false);

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
                <output id="list" className="container">
                    <div className={"grid"}>
                        {
                            this.state.images.map((image, i) => { 
                                return <Thumbnails key={i} render={ () => (
                                    <img alt={""} src={image} className={"responsive-image"}/>
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