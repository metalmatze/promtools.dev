import React from 'react';
import { BrowserRouter as Router, Link, Redirect, Route, Switch } from 'react-router-dom';
import './App.css';
import Alerts from "./pages/Alerts";
import { Container, Navbar } from 'react-bootstrap'

const App = () => (
  <Router>
    <Navbar expand="md" bg="primary" variant="dark">
      <Container>
        <Link to="/">
          <Navbar.Brand>PromTools.dev</Navbar.Brand>
        </Link>
      </Container>
    </Navbar>
    <Switch>
      <Route exact={true} path="/">
        <Redirect to="/alerts/errors"/>
      </Route>
      <Route path="/alerts">
        <Alerts/>
      </Route>
    </Switch>
  </Router>
);

export default App;
