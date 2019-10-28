import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import { Route, BrowserRouter as Router } from 'react-router-dom'
import Home from './templates/Home';
import Process from './templates/Process';
import Product from './templates/Product';
import Integration from './templates/Integration';
import Search from './templates/SearchResults';

const routing = (
  <Router>
    <div>
      <Route exact path="/" component={Home} />
      <Route exact path="/process/:process" component={Process} />
      <Route exact path="/product/:product" component={Product} />
      <Route exact path="/integration/:integration" component={Integration} />
      <Route exact path="/process/:process/:subprocess" component={Process} />
      <Route exact path="/product/:product/:subproduct" component={Product} />
      <Route exact path="/search/:result" component={Search} />
    </div>
  </Router>
)

ReactDOM.render(routing, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA

