import React, { Component } from 'react';
import {branch, compose, renderComponent } from 'recompose';
import * as yup from 'yup';
import {withFormik} from "formik";
import {FormGroup, HelpBlock, FormControl, ControlLabel, Button} from "react-bootstrap";
import jwt_decode from 'jwt-decode';


const RegistrationFormSchema = yup.object().shape({
  firstname: yup.string().required(),
  surename: yup.string().required(),
  dateofbirth: yup.date().required(),
  address: yup.string().required(),
  email: yup.string().email().required()
});

const RegistrationForm = (props) => {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting } = props;

  const fields = [{
    type: "text",
    name: "firstname"
  }, {
    typ: "text",
    name: "surename"
  }, {
    type: "date",
    name: 'dateofbirth'
  }, {
    type: "text",
    name: "address"
  }, {
    type: "email",
    name: "email"
  }].map(({ type, name }) => {

    const isErrorState = touched[name] && errors[name];
    let validationState = null;
    if (isErrorState) validationState = "error";
    return (
      <FormGroup key={name} validationState={validationState}>
        <ControlLabel>{name}</ControlLabel>{' '}
        <FormControl type={type} name={name} onChange={handleChange} onBlur={handleBlur} value={values[name]} />
        {isErrorState && <HelpBlock>{errors[name]}</HelpBlock>}
      </FormGroup>
    )
  });

  return (
    <form onSubmit={handleSubmit}>
      {fields}
      <Button type="submit" disabled={isSubmitting}>
        Submit
      </Button>
    </form>
  )
}

const RegistrationFormContainer = withFormik(
  {
    mapPropsToValues: ({ email }) => ({ firstname: '', surename: '', dateofbirth: '', address: '', email }),
    validationSchema: RegistrationFormSchema,
    handleSubmit: (
      values,
        {
          props,
          setSubmitting,
          setErrors
        }
    ) => {
      // On success
      // On Error
      // setErrors(...)
      setTimeout(() => {
        setSubmitting(false)
      }, 500)
    }
  })(RegistrationForm);


class Home extends Component {
  render() {
    const token = jwt_decode(localStorage.getItem('access_token'));
    return (
      <div className="container">
        <RegistrationFormContainer email={token['https://ostelco/email']} />
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
