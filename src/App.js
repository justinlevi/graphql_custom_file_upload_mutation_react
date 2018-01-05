import React, { Component } from 'react';

import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

const submitFile = gql`
  mutation fileUpload($input: FileUploadInput!) {
    fileUpload(input: $input){
      ...on File {
        uri
      }
    }
  }
`;

class App extends Component {

  constructor(props){
    super(props);

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(target){
    this.props.mutate({
        
        variables: {
          file: target.files, 
          input : {
            name: target.files[0].name
          } 
        }
      }
    ).then(response => {
      console.log(response)
    })
  }

  render = () => {
    return ( 
        <input
          type="file"
          required
          multiple
          onChange={({ target }) => {
            target.validity.valid && this.handleChange(target)
            }
          }
        />
    )
  }

}

export default graphql(submitFile)(App);