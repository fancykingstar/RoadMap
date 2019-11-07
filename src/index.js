import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom';
import { Route, BrowserRouter as Router } from 'react-router-dom'
import './css/index.css';
// import Home from './templates/Home';
// import Process from './templates/Process';
// import Product from './templates/Product';
// import Integration from './templates/Integration';
// import Search from './templates/SearchResults';

const Home = lazy(() => import('./templates/Home'))
const Process = lazy(() => import('./templates/Process'))
const Product = lazy(() => import('./templates/Product'))
const Integration = lazy(() => import('./templates/Integration'))
const Search = lazy(() => import('./templates/SearchResults'))

const routing = (
  <Suspense fallback={<div>Loading...</div>} >
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
  </Suspense>
)

ReactDOM.render(routing, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA

