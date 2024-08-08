import React, { useState } from "react";
import { getMessaging, getToken } from "firebase/messaging";
import { Auth } from "../firebase"; // Import Auth instance from your firebase.js file
import Layout from "@/components/Layout";

//auth from firebase .js
let messaging;
if (typeof window !== "undefined") {
  messaging = getMessaging();
}

const NotificationSender = () => {
  const [notificationMessage, setNotificationMessage] = useState("");

  // Function to handle sending notifications
  const sendNotification = async () => {
    try {
      const token = await getToken(messaging);
      if (token) {
        // Send the notification to the token
        await fetch("https://fcm.googleapis.com/fcm/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "key=YOUR_SERVER_KEY",
          },
          body: JSON.stringify({
            to: token,
            notification: {
              title: "Your notification title",
              body: notificationMessage,
            },
          }),
        });
        console.log("Notification sent successfully!");
      } else {
        console.error("No registration token available.");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  return (
    <div>
      <Layout>
        <h2 className="text-2xl font-bold mb-4">Send Notification</h2>
        <textarea
          value={notificationMessage}
          onChange={(e) => setNotificationMessage(e.target.value)}
          placeholder="Enter your notification message"
          rows={4}
          cols={50}
          className="border border-gray-300 rounded p-2 mb-4"
        />
        <button
          onClick={sendNotification}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Send Notification
        </button>
      </Layout>
    </div>
  );
};

export default NotificationSender;
