import React, { Component } from 'react';
import {branch, compose, lifecycle, mapProps, renderComponent, withProps, withState} from 'recompose';
import * as yup from 'yup';
import {withFormik} from "formik";
import {FormGroup, HelpBlock, FormControl, ControlLabel, Button} from "react-bootstrap";
import jwt_decode from 'jwt-decode';
import Callback from "../Callback/Callback";


const RegistrationFormSchema = yup.object().shape({
  firstname: yup.string().required(),
  surname: yup.string().required(),
  dateofbirth: yup.date().required(),
  address: yup.string().required(),
  email: yup.string().email().required()
});

const withAuthState = compose(
  withProps(() => {
    const token = localStorage.getItem('access_token');
    const decodedToken = jwt_decode(token);
    const profile = {
      email: decodedToken['https://ostelco/email']
    }
    return ({
      token, decodedToken, profile
    })
  })
);

const withRequestHeaders = compose(
  withAuthState,
  withProps(props => {
    const { token } = props;
    return ({
      requestHeaders: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
  })
)

const RegistrationForm = (props) => {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, profileExists } = props;

  const fields = [{
    type: "text",
    name: "firstname"
  }, {
    typ: "text",
    name: "surname"
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

const RegistrationFormContainer = compose(
  withRequestHeaders,
  withFormik(
    {
      mapPropsToValues: ({ email, name, address }) => {
        const nameArray = (name || '').split(' ')
        return {
          firstname: nameArray.slice(0, nameArray.length - 1).join(' '),
          surname: nameArray.slice(nameArray.length - 1).join(' '),
          dateofbirth: '',
          address,
          email
        }
      },
      validationSchema : RegistrationFormSchema,
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
        const { profileExists, requestHeaders } = props;

        console.log('profileExists', profileExists, values, requestHeaders)

        fetch('https://api.dev.ostelco.org/profile', {
          method: profileExists ? 'PUT' : 'POST',
          headers: requestHeaders,
          body: JSON.stringify({
            email: values.email,
            name: `${values.firstname} ${values.surname}`,
            address: values.address
          })
        }).then(response => {
          if (response.status == 200 || response.status == 201) {
            return response
          } else {
            return response.json().then(response => {
              throw response
            })
          }
        })
          .then(response => response.json())
          .then(response => {
          console.log('------------------------');
          console.log(response)
            setSubmitting(false)
            alert('success');
        }).catch(response => {
          console.log('*************************');
          console.log(response)
          setSubmitting(false)
          alert(response);
        })
      }
    })
)(RegistrationForm)


class Home extends Component {
  render() {
    const { profile, profileExists } = this.props;
    console.log('profile exists: ', profileExists)
    return (
      <div className="container">
        <RegistrationFormContainer {...profile} profileExists={profileExists} />
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

const Error = props => {
  const { message } = props;
  return (
    <h4>{message}</h4>
  )
}

const withProfileFromServer = compose(
  withRequestHeaders,
  mapProps(props => ({ ...props, result: null, message: null })),
  lifecycle(({
    componentDidMount() {
      const { token, profile, requestHeaders } = this.props;
      console.log('async request', this.props);
      fetch('https://api.dev.ostelco.org/profile', {
        method: 'GET',
        headers: requestHeaders
      }).then((response) => response.json())
        .then(response => {
          try {
            if (response.email) {
              console.log('-------------------')
              console.log('got profile', response)
              return response
            } else {
              throw {
                code: 999,
                message: response
              }
            }
          } catch (err) {
            throw {
              code: 999,
              message: response
            }
          }
        }).then((response)=> {
          this.setState({ result: { success: true, data: {...profile, ...response }}})
      }).catch((err) => {
        this.setState({ result: { success: false, data: err }})
      })
    }
  })),
  branch(({ result }) => !result, renderComponent(Callback))
);

export default compose(
  branch(({ auth }) => !auth.isAuthenticated(), renderComponent(LoginMessage)),
  withAuthState,
  withProfileFromServer,
  mapProps(({ result, profile }) => {
    console.log('result', result, 'profile', profile)
    if (result.success) {
      return ({ profile: result.data, profileExists: true })
    } else {
      console.log('failed to fetch profile or profile not found', result.data)
      return ({ profile, profileExists: false })
    }
  })
)(Home)
