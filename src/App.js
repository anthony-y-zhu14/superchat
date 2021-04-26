import React, { useState } from 'react';
import './App.css';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { Fab, Button, AppBar, Toolbar, Typography } from '@material-ui/core';

var firebaseConfig = {
  apiKey: "AIzaSyBOgLPwBnSvo_QWS1A9Vy5EX--HNqqzYI4",
  authDomain: "superchat-f5342.firebaseapp.com",
  projectId: "superchat-f5342",
  storageBucket: "superchat-f5342.appspot.com",
  messagingSenderId: "223158000999",
  appId: "1:223158000999:web:a59ed5a09dee36ebece3c2"
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const firestore = firebase.firestore();

export default function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar>
          {auth.currentUser && <Button color="inherit" onClick={()=>auth.signOut()}>Sign Out</Button>}
          {!auth.currentUser && <Typography variant="h6">Super Chat</Typography>}
        </Toolbar>
      </AppBar>
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  return(
    <>
      <Fab onClick={signInWithGoogle} color='primary' variant='extended'>Sign in with Google</Fab>
    </>
  )
}

function ChatRoom() {
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);
  const [messages] = useCollectionData(query, {idField: 'id'});
  const [formValue, setFormValue] = useState('');
  const sendMessage = async(e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });
    setFormValue('');
  }
  return (
    <>
    <div>
      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}/>)}
    </div>
    <form onSubmit={sendMessage}>
      <input value={formValue} onChange={(e) => setFormValue(e.target.value)}></input>
      <Button type="submit" variant='outlined' color='primary'>Send</Button>
    </form>
    </>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = (uid === auth.currentUser.uid) ? 'sent' : 'received';
  return (
    <div className={`message ${messageClass}`}>
        <img src={photoURL} alt='https://api.adorable.io/avatars/23/abott@adorable.png' />
        <p>{text}</p>
    </div>
  )
}