

# Get Started

## Install necessary dependencies
```bash
npm install -g create-react-app
yarn
```

## Start the development server
```bash
yarn start
```

# Deploy to firebase hosting

https://redotters-experimental.firebaseapp.com

```
yarn build
firebase deploy --only=hosting
```

# Environment
env variables can be found in `.env`
Here you can change:
- stripe publishable key
- api url
- auth0 callback url

# Features
- login with google through auth0
- create / update user profiles
- add credit card and set it as default
- see the credit card that was added last

What's not possible (yet)
- list all credit cards
- remove credit card
- see current balance
- list products
- purchase product
