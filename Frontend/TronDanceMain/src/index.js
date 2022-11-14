import React from 'react'
import ReactDOM from 'react-dom'
import {Route, Router} from 'react-router-dom'
import history from './history'
import App from './app'
import PoseNet from './components/Camera'

ReactDOM.render(
  <Router history={history}>
    {/* <App /> */}
    <Route exact path="/" component={App} />  
    <Route path="/match" component={PoseNet} />  
  </Router>,
  document.getElementById('app')
)