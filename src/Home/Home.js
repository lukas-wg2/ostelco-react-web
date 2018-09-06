import React, { Component } from 'react';
import {branch, compose, renderComponent} from 'recompose';

class Home extends Component {
  render() {
    return (
      <div className="container">
        <h4>
          You are logged in!
        </h4>
      </div>
    );
  }
}

const LoginMessage = props => {
  const { auth } = props;
  return (
    <h4>
      You are not logged in! Please{' '}
      <a
        style={{ cursor: 'pointer' }}
        onClick={() => auth.login()}
      >
        Log In
      </a>
      {' '}to continue.
    </h4>
  )
}

export default compose(
  branch(({ auth }) => !auth.isAuthenticated(), renderComponent(LoginMessage))
)(Home)
