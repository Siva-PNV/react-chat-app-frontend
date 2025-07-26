import "./App.css";
import io from "socket.io-client";
import { useState } from "react";
import Chat from "./Chat";

const socket = io.connect("https://react-chat-app-backend-alae.onrender.com");
// const socket = io.connect("http://localhost:3001");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", room);
      setShowChat(true);
      // Store user and room in localStorage
      localStorage.setItem("chat_username", username);
      localStorage.setItem("chat_room", room);
    }
  };

  // Restore user/room if available and emit join_room
  useState(() => {
    const savedUser = localStorage.getItem("chat_username");
    const savedRoom = localStorage.getItem("chat_room");
    if (savedUser && savedRoom) {
      setUsername(savedUser);
      setRoom(savedRoom);
      setShowChat(true);
      socket.emit("join_room", savedRoom);
    }
  }, []);

  const leaveRoom = () => {
    socket.emit("leave_room", room);
    setShowChat(false);
    setUsername("");
    setRoom("");
    localStorage.removeItem("chat_username");
    localStorage.removeItem("chat_room");
  };

  return (
    <div className="App">
      {!showChat ? (
        <div className="joinChatContainer">
          <h3>Join A Chat</h3>
          <input
            type="text"
            placeholder="John..."
            onChange={(event) => {
              setUsername(event.target.value);
            }}
          />
          <input
            type="text"
            placeholder="Room ID..."
            onChange={(event) => {
              setRoom(event.target.value);
            }}
          />
          <button onClick={joinRoom}>Join A Room</button>
        </div>
      ) : (
        <Chat socket={socket} username={username} room={room} onLeave={leaveRoom} />
      )}
    </div>
  );
}

export default App;
