import React, { Component } from 'react';

import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

const submitFile = gql`
  mutation uploadFile($input: FileInput!) {
    uploadFile(input: $input)
  }
`;

// const submitFile = gql`
//   mutation($input: FileInput!) {
//     uploadFile(input: $input){
//       entity{
//         ...on FileFile {
//           url
//         }
//       }
//     }
//   }
// `;

class App extends Component {

  constructor(props){
    super(props);

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(target){
    this.props.mutate({ 
        variables: { 
          input : {
            file: target.files[0]
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
          onChange={({ target }) => {
            target.validity.valid && this.handleChange(target)
            }
          }
        />
    )
  }

}

export default graphql(submitFile)(App);