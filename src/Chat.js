import React, { useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import ScrollToBottom from "react-scroll-to-bottom";
import "./chat.css";

function Chat({ socket, username, room, onLeave }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  // const SECRET_KEY = "my_secret_key_123"; // For demo only, use env vars in production
  const SECRET_KEY = process.env.REACT_APP_SECRET_KEY;

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const encryptedMessage = CryptoJS.AES.encrypt(currentMessage, SECRET_KEY).toString();
      const messageData = {
        room: room,
        author: username,
        message: encryptedMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  useEffect(() => {
    // Listen for new messages
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });

    // Listen for previous messages when joining a room
    socket.on("previous_messages", (messages) => {
      setMessageList(messages);
    });

    // Clean up listeners on unmount
    return () => {
      socket.off("receive_message");
      socket.off("previous_messages");
    };
  }, [socket]);

  return (
    <div className="chat-window" style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
      <div className="chat-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 2rem", height: "60px", background: "#263238" }}>
        <p style={{ color: "#fff", fontSize: "1.5rem", margin: 0 }}>Chat</p>
        <button onClick={onLeave} style={{ background: "#e53935", color: "#fff", border: "none", borderRadius: "4px", padding: "5px 10px", cursor: "pointer" }}>Leave</button>
      </div>
      <div style={{marginInlineStart:"25vw"}}>
      <div className="chat-body" style={{width:"50vw", flex: 1,  height: "80vh"}}>
        <ScrollToBottom className="message-container" style={{ height: "100%" }}>
          {messageList.map((messageContent, idx) => {
            return (
              <div
                className={`message message-animate`}
                id={username === messageContent.author ? "you" : "other"}
                key={idx}
              >
                <div>
                  <div className="message-content">
                    <p>{(() => {
                      try {
                        return CryptoJS.AES.decrypt(messageContent.message, SECRET_KEY).toString(CryptoJS.enc.Utf8) || "";
                      } catch {
                        return "";
                      }
                    })()}</p>
                  </div>
                  <div className="message-meta">
                    <p id="time">{messageContent.time}</p>
                  {messageContent.author === username ? (
                    <p id="author">{"You"}</p>
                  ) : <p id="author">{messageContent.author}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollToBottom>
      </div>
      <div style={{width:"50vw", height: "60px", display: "flex", alignItems: "center", background: "#f5f5f5" }}>
        <input
          type="text"
          value={currentMessage}
          placeholder="Message..."
          style={{ flex: 1, height: "40px", fontSize: "1rem", marginRight: "1rem", borderRadius: "5px", border: "1px solid #43a047", padding: "0 10px" }}
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyPress={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        />
        <button onClick={sendMessage} style={{ height: "40px", width: "50px", borderRadius: "5px", background: "#43a047", color: "#fff", border: "none", fontSize: "1.2rem", cursor: "pointer" }}>&#9658;</button>
      </div>
      </div>
    </div>
  );
}

export default Chat;
