// pages/firebaseDatabase.js

import React from "react";
import { app } from "../firebase.js";
import { getDatabase } from "firebase/database";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  // ...
  // The value of `databaseURL` depends on the location of the database
  databaseURL: "https://four-app-e3366-default-rtdb.firebaseio.com/",
};

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

const FirebaseDatabase = () => {
  return <div>{/* You can add any JSX here if needed */}</div>;
};

// Export the component as the default export
export default FirebaseDatabase;
