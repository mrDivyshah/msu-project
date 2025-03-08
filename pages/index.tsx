import { useState, useEffect, useRef } from "react";
import SideBar from "./sidebar";
import ConfessionForm from "./components/ConfessionForm";
import { io, Socket } from "socket.io-client";
import { Trash2 } from "lucide-react";

type Message = {
  message: string;
  senderUUID: string;
  receiverUUID: string;
  timestamp: string;
};
type User = { userId: string; name: string };

const API_URL = `http://localhost:5000`;

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isTabActive, setIsTabActive] = useState(true);
  const [previousChats, setPreviousChats] = useState<{
    [key: string]: boolean;
  }>({});
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabActive(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission().catch((err) =>
        console.warn("Notification permission denied:", err)
      );
    }
  }, []);
  // myy ---------------

  const [timeLeft, setTimeLeft] = useState<{ [key: number]: string }>({});

  // Function to calculate remaining time
  const calculateTimeLeft = (timestamp: string) => {
    const messageTime = new Date(timestamp).getTime();
    const expiryTime = messageTime + 24 * 60 * 60 * 1000; // 24 hours in ms
    const currentTime = new Date().getTime();
    const remainingTime = expiryTime - currentTime;

    if (remainingTime <= 0) return "Expired";

    const hours = Math.floor(remainingTime / (1000 * 60 * 60));
    const minutes = Math.floor(
      (remainingTime % (1000 * 60 * 60)) / (1000 * 60)
    );
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  // Use effect to update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(
        messages.reduce((acc, msg, index) => {
          acc[index] = calculateTimeLeft(msg.timestamp);
          return acc;
        }, {} as { [key: number]: string })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [messages]);

  // Delete expired messages automatically
  useEffect(() => {
    setMessages((prevMessages) =>
      prevMessages.filter(
        (msg) => calculateTimeLeft(msg.timestamp) !== "Expired"
      )
    );
  }, [timeLeft]);

  // myy ---------------

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load user from localStorage & connect WebSocket
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const uuid = localStorage.getItem("uuid") || "";

    if (storedUser && uuid) {
      let userData: User;
      try {
        userData = JSON.parse(storedUser);
      } catch {
        userData = { name: storedUser, userId: uuid };
      }
      setUser(userData);

      const newSocket = io(API_URL, { transports: ["websocket"] });

      newSocket.on("connect", () => {
        console.log("WebSocket connected");
        newSocket.emit("register", { username: userData.name, uuid });
      });

      newSocket.on("receiveMessage", (msg) => {
        console.log("Received Message:", msg);
        setMessages((prev) => [...prev, msg]); // Add new messages at the end

        if (audioRef.current) {
          audioRef.current.volume = 1.0; // Ensure it's not muted
          audioRef.current.muted = false;
          audioRef.current.currentTime = 0; // Restart audio
          audioRef.current
            .play()
            .catch((err) => console.warn("Audio playback blocked:", err));
        }

        // Show browser notification if tab is inactive
        if (!isTabActive && Notification.permission === "granted") {
          new Notification("New Message", {
            body: msg.message,
            icon: "/favicon.ico",
          });
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        console.log("WebSocket disconnected");
      };
    }
  }, [isTabActive]);

  // Fetch messages when a user is selected
  useEffect(() => {
    if (!user || !selectedUser) {
      setMessages([]);
      return;
    }

    if (previousChats[selectedUser.userId]) {
      alert("Chat one time read.");
      setMessages([]); // Clear messages when reloading
      return;
    }

    const fetchMessages = async () => {
      setMessages([]); // Ensure messages are reset before fetching
      if (!user || !selectedUser) return;
      try {
        const res = await fetch(`${API_URL}/messages/${user.userId}`);
        if (!res.ok) throw new Error("Failed to fetch messages");
        const fetchedMessages: Message[] = await res.json();

        setMessages(
          fetchedMessages.filter(
            (msg) =>
              (msg.senderUUID === selectedUser.userId &&
                msg.receiverUUID === user.userId) ||
              (msg.senderUUID === user.userId &&
                msg.receiverUUID === selectedUser.userId)
          )
        );

        setPreviousChats((prev) => ({ ...prev, [selectedUser.userId]: true }));
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, [selectedUser]);

  // Send a new message
  const addMessage = (message: string) => {
    if (!socket || !user || !selectedUser) return;

    const newMessage: Message = {
      senderUUID: user.userId,
      receiverUUID: selectedUser.userId,
      message,
      timestamp: new Date().toISOString(),
    };

    console.log("Sending Message:", newMessage);
    socket.emit("sendMessage", newMessage);

    // Append new message to the end
    setMessages((prev) => [...prev, newMessage]);
  };

  // Delete message function
  const deleteMessage = (index: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this message?"
    );
    if (confirmDelete) {
      setMessages((prev) => prev.filter((_, i) => i !== index)); // Remove from UI
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <SideBar selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <audio
              ref={audioRef}
              src="/sounds/receive.mp3"
              preload="auto"
            ></audio>
            <div className="bg-gray-800 p-4 flex items-center shadow-lg">
              <h2 className="text-xl font-bold">{selectedUser.name}</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, index) => {
                const isMyMessage = msg.senderUUID === user?.userId;
                return (
                  <div
                    key={index}
                    className={`flex flex-col group relative ${
                      isMyMessage ? "items-end" : "items-start"
                    }`}
                  >
                    <div className="relative flex items-center">
                      <div>
                        <div
                          className={`p-3 rounded-lg max-w-xs relative ${
                            isMyMessage
                              ? "bg-indigo-500 text-white text-right ml-auto"
                              : "bg-gray-700 text-left"
                          }`}
                        >
                          {msg.message}
                        </div>
                        <div className="text-xs text-gray-300 mt-1 text-right">
                          {/* {formatTimestamp(msg.timestamp)} */}
                          {timeLeft[index] || "Calculating..."}
                        </div>
                      </div>
                      {isMyMessage && (
                        <button
                          className="ml-2 hidden group-hover:flex bg-gray-600 p-1 rounded-full"
                          onClick={() => deleteMessage(index)}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef}></div>
            </div>

            <div className="p-4">
              <ConfessionForm onSubmit={addMessage} />
            </div>
          </>
        ) : (
          <h2 className="text-2xl font-semibold text-center mt-20">
            Select a user to start chatting
          </h2>
        )}
      </div>
    </div>
  );
}
