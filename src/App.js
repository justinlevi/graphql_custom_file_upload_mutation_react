import React, {Component} from 'react';

import axios from 'axios';
import Querystring from 'query-string';
import { ApolloLink, concat } from 'apollo-link';
import { createUploadLink } from "./apollo-upload-client-custom";
import { ApolloClient } from 'apollo-client';
import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';
import { ApolloProvider } from 'react-apollo';

import introspectionQueryResultData from './fragmentTypes.json';

import UploadComponent from './components/UploadComponent';

const URL = 'http://contenta.loc';
const CONSUMER_CREDENTIALS = {
  grant_type: 'password',
  client_id: '8588a78d-46db-44b0-a175-af74f9511691',
  client_secret: 'test',
  username: 'test',
  password: 'test'
};

function initializeCsrfToken(){
  axios.get(URL + '/session/token')
    .then(response => {
      sessionStorage.setItem('csrfToken', response.data);
    })
    .catch((error) => {
      console.log('error ' + error);
    });
};

function initializeOauthToken(){
  axios.post(URL + '/oauth/token', Querystring.stringify(CONSUMER_CREDENTIALS))
    .then(response => {
      sessionStorage.setItem('authorization', response.data.access_token);
    })
    .catch((error) => {
      console.log('error ' + error);
    });
};

if(!sessionStorage.getItem('csrfToken') ){
  initializeCsrfToken();
}

if(!sessionStorage.getItem('authorization') || sessionStorage.getItem('authorization') === 'undefined'){
  initializeOauthToken();
}

export class App extends Component {

  constructor(props) {
      super(props);

      this.state = {
        client: "",
        progress: 0
      };
  }

  componentWillMount(){
    const authMiddleware = new ApolloLink((operation, forward) => {
      // add the authorization to the headers
      let oAuthToken = `Bearer ${sessionStorage.getItem('authorization')}`;
      let csrfToken = `${sessionStorage.getItem('csrfToken')}`;
      operation.setContext( context => ({
          headers: {
            authorization: oAuthToken || null,
            'X-CSRF-Token': csrfToken || null, 
          }
        }));
      return forward(operation);
    })

    const xhrFetcher = (url, opts={}, onProgress = progressHandler) => {
      return new Promise( (res, rej)=>{
          var xhr = new XMLHttpRequest();
          xhr.open(opts.method || 'get', url);
          for (var k in opts.headers||{})
              xhr.setRequestHeader(k, opts.headers[k]);
          xhr.onload = e => res(e.target); // e.target only exists on the completion event - this bypasses the ProgressEvent from triggering the promise
          xhr.onerror = rej;
          if (xhr.upload && onProgress)
              xhr.upload.onprogress = onProgress; // event.loaded / event.total * 100 ; //event.lengthComputable
          xhr.send(opts.body);
      });
    }

    const progressHandler = (e) => {
      if (e.lengthComputable) {
        var percentComplete = (e.loaded / e.total) * 100;

        this.setState({progress: percentComplete});

        console.log("Upload ", Math.round(percentComplete) + "% complete.");
      }
    }
  

    const uploadLink = createUploadLink(
      {
        uri: URL.concat('/graphql?XDEBUG_SESSION_START=PHPSTORM'),
        fetch: xhrFetcher
      }
    );

    const fragmentMatcher = new IntrospectionFragmentMatcher({ introspectionQueryResultData});

    const client = new ApolloClient({
      // link: createUploadLink({ uri: process.env.API_URI })
      link: concat(authMiddleware, uploadLink),
      cache: new InMemoryCache({fragmentMatcher}),
    });

    this.setState({client: client});
  }

  render() {

    return (
      <ApolloProvider client={this.state.client}>
        <UploadComponent progress={this.state.progress} />
      </ApolloProvider>
    )
  }
}

export default App
