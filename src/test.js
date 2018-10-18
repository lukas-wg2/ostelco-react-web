import React from 'react';
import {CardElement, Elements, injectStripe, StripeProvider} from "react-stripe-elements";
import {Button, ControlLabel, FormGroup} from "react-bootstrap";
import {branch, compose, renderComponent, withProps, withState} from "recompose";
import {withCreditCardsFromServer, withRequestHeaders} from "./enhancers";

class _CardForm extends React.Component {
  render() {
    return (
      <div>
        <CardListContainer card={this.props.card} />
        <form>
          <FormGroup>
            <ControlLabel>Card details</ControlLabel>
            <CardElement />
          </FormGroup>
          <Button onClick={() => this.props.stripe.createSource({ type: 'card' }).then(payload => {
            console.log(payload)
            fetch(`${process.env.REACT_APP_API_BASE}/paymentSources?sourceId=${payload.source.id}`, {
              method: 'POST',
              headers: this.props.requestHeaders,
            }).then(response => {
              console.log(response)
              if (response.ok) {
                alert('Success');
                this.props.setCard(payload['source']);
                this.props.setAddNewClickedCard(false);
              } else {
                alert('Failed')
              }
            }).catch(err => {
              console.log(err);
              alert('Failed')
            })
            console.log(payload)
          })}>Save</Button>
        </form>
      </div>
    )
  }
}

const CardList = (props) => {
  const { cards, setAddNewClickedCard } = props;
  console.log('card list...', cards);
  // Filter out undefined values (they shouldn't be there, and should def be fixed from somewhere else...)
  return (
    <div>
      { cards.filter(card => card).map(card => {
        const { exp_month, exp_year, last4 } = card.details && card.details.typeData || card.card;
        return <div key={card.id}>{ exp_month } / { exp_year } - { last4 } </div>
      })}
      <br />
      <button onClick={() => setAddNewClickedCard(true)}>Change Card</button>
    </div>
  )
};

const CardListContainer = compose(
  withCreditCardsFromServer,
  branch(({ result }) => result === null, renderComponent(() => <div>Loading</div>)),
  withProps(({ result, ...props, addNewCardClicked }) => {
    console.log('card list contaainer', props, result, !!props.card, result.success && result.data);
    return {
      cards: props.card && [props.card] || result.success && result.data && [result.data[0]] || [],
      ...props,
      showCardList: addNewCardClicked || result.data.length > 0
    }
  }),
  branch(({ cards }) => cards.filter(card => card).length === 0, renderComponent(() => <div>You have no cards. Add one with the form below.</div>))
)(CardList);

const CardForm = compose(
  injectStripe,
  withRequestHeaders,
  withState('addNewCardClicked', 'setAddNewClickedCard', false),
  withState('card', 'setCard', null),
  withProps(({ result, ...props, addNewCardClicked }) => {
    console.log('heihei stuff hapened', props);
    return {
      cards: [],
      ...props
    }
  }),
)(_CardForm);

class Checkout extends React.Component {
  render() {
    return (
      <div className="Checkout">
        <h1>Payment Information</h1>
        <Elements>
          <CardForm />
        </Elements>
      </div>
    )
  }
}
const CheckoutFormContainer = () => {
  return (
    <StripeProvider apiKey={process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY}>
      <Checkout />
    </StripeProvider>
  )
}

export default CheckoutFormContainer;