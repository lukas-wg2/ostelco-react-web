import {branch, compose, lifecycle, mapProps, renderComponent, withProps} from "recompose";
import jwt_decode from "jwt-decode";
import Callback from "./Callback/Callback";

export const withAuthState = compose(
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

export const withRequestHeaders = compose(
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

export const withCreditCardsFromServer = compose(
  withRequestHeaders,
  mapProps(props => ({ ...props, result: null, message: null })),
  lifecycle(({
    componentDidMount() {
      const { requestHeaders } = this.props;
      fetch(`${process.env.REACT_APP_API_BASE}/paymentSources`, {
        method: 'GET',
        headers: this.props.requestHeaders,
      }).then(response => {
        if (response.ok) {
          return response.json()
          // alert('Success');
        } else {
          const error = new Error(response.statusText);
          error.response = response;
          throw error
        }
      }).then(response => {
        return response
      })
        .catch(err => {
        console.log(err);
      })
        .then((response)=> {
          console.log('payment sources', response);
          this.setState({ result: { success: true, data: response }}) //.filter(r => r['details'] && r['details']['accountType'] == 'card')}})
        })
        .catch((err) => {
          this.setState({ result: { success: false, data: err }})
        })
    }
  })),
  branch(({ result }) => !result, renderComponent(Callback))
);