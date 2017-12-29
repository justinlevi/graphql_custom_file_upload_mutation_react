import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import axios from 'axios';
import Querystring from 'query-string';
import { ApolloLink, concat } from 'apollo-link';
import { createUploadLink } from "apollo-upload-client/lib/main";
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider } from 'react-apollo';

const URL = 'http://contenta.loc';
const CONSUMER_CREDENTIALS = {
  grant_type: 'password',
  client_id: '90f0c0b1-ec7f-47de-a649-454a96e238ab',
  client_secret: 'test1123',
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

if(!sessionStorage.getItem('authorization')){
  initializeOauthToken();
}

const authMiddleware = new ApolloLink((operation, forward) => {
  // add the authorization to the headers
  let oAuthToken = `Bearer ${sessionStorage.getItem('authorization')}`;
  let csrfToken = `${sessionStorage.getItem('csrfToken')}`;
  operation.setContext( context => ({
      headers: {
        authorization: oAuthToken || null,
        'X-CSRF-Token': csrfToken || null 
      }
    }));
  return forward(operation);
})

// const httpLink = new HttpLink({
//   uri: URL.concat('/graphql?XDEBUG_SESSION_START=PHPSTORM'),
// });

const uploadLink = createUploadLink({uri: URL.concat('/graphql?XDEBUG_SESSION_START=PHPSTORM'),});

const client = new ApolloClient({
  // link: createUploadLink({ uri: process.env.API_URI })
  link: concat(authMiddleware, uploadLink),
  cache: new InMemoryCache(),
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>, document.getElementById('root'));
registerServiceWorker();
