import React, { Component } from 'react';
import { Navbar, Button, Nav } from 'react-bootstrap';
import './App.css';
import {StripeProvider} from "react-stripe-elements";

class App extends Component {
  goTo(route) {
    this.props.history.replace(`/${route}`)
  }

  login() {
    this.props.auth.login();
  }

  logout() {
    this.props.auth.logout();
  }

  render() {
    const { isAuthenticated } = this.props.auth;

    return (
        <div>
          <Navbar fluid>

              <Navbar.Brand>
                <a href="#">Red Otter - Registration Form</a>
              </Navbar.Brand>
            <Nav>
              <Button
                bsStyle="primary"
                className="btn-margin"
                onClick={this.goTo.bind(this, 'home')}
              >
                Home
              </Button>
              {
                !isAuthenticated() && (
                    <Button
                      id="qsLoginBtn"
                      bsStyle="primary"
                      className="btn-margin"
                      onClick={this.login.bind(this)}
                    >
                      Log In
                    </Button>
                  )
              }
              {
                isAuthenticated() && (
                    <Button
                      id="qsLogoutBtn"
                      bsStyle="primary"
                      className="btn-margin"
                      onClick={this.logout.bind(this)}
                    >
                      Log Out
                    </Button>
                  )
              }
            </Nav>
            <Navbar.Text className="justify-content-end">
                <small><b>{process.env.NODE_ENV}</b> mode.</small>
              </Navbar.Text>

          </Navbar>
          <div style={{ position: 'absolute', bottom: 15, right: 15 }}>
            <pre>{ JSON.stringify(process.env, null, 2) }</pre>
          </div>
        </div>
    );
  }
}

export default App;
