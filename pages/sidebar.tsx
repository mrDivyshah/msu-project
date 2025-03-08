import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { io, Socket } from "socket.io-client";
import { Search, User, LogOut, ChevronLeft, ChevronRight } from "lucide-react";

type User = { userId: string; name: string };

type SideBarProps = {
  selectedUser: User | null;
  setSelectedUser: (user: User) => void;
};

const API_URL = "http://localhost:5000"; // Backend API

export default function SideBar({
  selectedUser,
  setSelectedUser,
}: SideBarProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState("Guest");
  const [search, setSearch] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [uuid, setUuid] = useState("");

  // Fetch user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user") || "";
    const uuid = localStorage.getItem("uuid");

    if (storedUser.trim() !== "") {
      setUsername(storedUser);

      const newSocket = io(API_URL, { transports: ["websocket"] });

      newSocket.on("connect", () => {
        console.log("✅ WebSocket connected");
        newSocket.emit("register", { username: storedUser, uuid: uuid });
      });

      newSocket.on("updateOnlineUsers", (onlineUsers) => {
        const formattedUsers = onlineUsers.map(
          (user: { username: string; uuid: string }) => ({
            userId: user.uuid,
            name: user.username,
          })
        );

        setUsers(formattedUsers);
        setUuid(uuid || "");
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        console.log("WebSocket disconnected");
      };
    }
  }, []);

  // Search filter
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div
      className={`h-screen bg-gray-800 text-white flex flex-col transition-all ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div style={{ display: "none" }}>{socket?.active}</div>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!isCollapsed && <h2 className="text-lg font-bold">Chat</h2>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-700 rounded"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center bg-gray-800 p-2 rounded-lg">
          <Search size={20} className="text-gray-400" />
          {!isCollapsed && (
            <input
              type="text"
              placeholder="Search user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ml-2 bg-transparent outline-none w-full text-white"
            />
          )}
        </div>
      </div>

      {/* User List */}
      <ul className="flex-1 overflow-y-auto p-2">
        {filteredUsers.length > 0 ? (
          filteredUsers
            .filter((u) => uuid !== u.userId) // Exclude current user
            .map((u) => (
              <li
                key={u.userId}
                className={`flex items-center p-3 rounded cursor-pointer mb-2 transition-all ${
                  selectedUser?.userId === u.userId
                    ? "bg-indigo-500"
                    : "hover:bg-gray-800"
                }`}
                onClick={() => setSelectedUser(u)}
              >
                <User size={20} className="text-white" />
                {!isCollapsed && <span className="ml-3">{u.name}</span>}
              </li>
            ))
        ) : (
          <p className="text-gray-400 text-center">No users found</p>
        )}
      </ul>

      {/* Profile & Logout */}
      <div className="p-4 border-t border-gray-700 flex items-center">
        <User size={32} className="text-indigo-400" />
        {!isCollapsed && (
          <div className="ml-3">
            <p className="text-sm font-semibold">{username}</p>
            <button
              onClick={handleLogout}
              className="text-xs text-red-400 hover:text-red-500 flex items-center mt-1"
            >
              <LogOut size={16} className="mr-1" /> Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
