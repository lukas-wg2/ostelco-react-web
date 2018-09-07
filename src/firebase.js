import firebase from 'firebase';

function hashCode(s) {
  for(var i = 0, h = 0; i < s.length; i++)
    h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return h;
}


var config = {
  apiKey: "AIzaSyAIQbHRb0J_DJi0W_Gv7F3lc5p7puiIjmY",
  authDomain: "redotters-experimental.firebaseapp.com",
  databaseURL: "https://redotters-experimental.firebaseio.com",
  projectId: "redotters-experimental",
  storageBucket: "redotters-experimental.appspot.com",
  messagingSenderId: "210960527408"
};
const app = firebase.initializeApp(config);
const firestore = firebase.firestore()

export const setUser = (id, data) => {
  console.log('set user', hashCode(id), data);
  return firestore.doc(`users/${hashCode(id)}`).set(data)
}

export const getUser = id => {
  return firestore.doc(`users/${hashCode(id)}`).get()
}
