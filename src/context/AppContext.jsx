import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { showBrowserNotification, getLeadSourceIcon } from '../utils/notificationUtils';
import { formatMessageTime, groupMessagesByDate, formatDateLabel } from '../utils/dateUtils';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    userNumber: "",
    course: "",
    city: "",
  });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [unreadLeads, setUnreadLeads] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationSound, setNotificationSound] = useState(true);
  const [browserNotifications, setBrowserNotifications] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const messagesEndRef = useRef(null);
  const notificationRef = useRef(null);

  // Fetch users with useEffect
  const fetchUsers = async () => {
    try {
      const res = await fetch("https://nonveracious-conveniently-jacques.ngrok-free.dev/users", {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // WebSocket connection
  useEffect(() => {
    const socket = new WebSocket("wss://nonveracious-conveniently-jacques.ngrok-free.dev/ws");

    socket.onopen = () => console.log("✅ WebSocket connected");
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "new_user" && data.user) {
          setUsers((prev) => [data.user, ...prev]);
          setUnreadLeads(prev => {
            if (!prev.includes(data.user._id)) {
              return [data.user._id, ...prev];
            }
            return prev;
          });
          
          if (notificationSound) {
            playNotificationSound();
          }
          
          if (browserNotifications && data.user.userName) {
            showBrowserNotification("New Lead Received", {
              body: `${data.user.userName} - ${data.user.course || "User yet to start convo"}`,
              icon: "/favicon.ico",
            });
          }

        } else if (data.type === "update_user" && data.user) {
          setUsers((prev) =>
            prev.map((u) => (u._id === data.user._id ? data.user : u))
          );

        } else if (data.type === "delete_user" && data.userId) {
          setUsers((prev) => prev.filter((u) => u._id !== data.userId));
          setUnreadLeads(prev => prev.filter(id => id !== data.userId));

        } else if (data.type === "new_message") {
          const { userNumber, conversation, userName } = data;
          
          const normalizedConversation = {
            ...conversation,
            timestamp: conversation.timestamp && !isNaN(new Date(conversation.timestamp).getTime()) 
              ? conversation.timestamp 
              : new Date().toISOString()
          };
          
          setUsers((prevUsers) => {
            const updatedUsers = prevUsers.map((u) => {
              if (u.userNumber === userNumber) {
                const updatedConversations = [
                  ...(u.conversations || []),
                  normalizedConversation
                ];
                
                return {
                  ...u,
                  conversations: updatedConversations,
                  lastInteracted: normalizedConversation.timestamp
                };
              }
              return u;
            });
            
            return updatedUsers.sort(
              (a, b) => new Date(b.lastInteracted) - new Date(a.lastInteracted)
            );
          });
          
          if (selectedUser && selectedUser.userNumber === userNumber) {
            setSelectedUser(prev => {
              if (!prev) return prev;
              
              return {
                ...prev,
                conversations: [
                  ...(prev.conversations || []),
                  normalizedConversation
                ],
                lastInteracted: normalizedConversation.timestamp
              };
            });
          }

          if (!selectedUser || selectedUser.userNumber !== userNumber) {
            setUnreadLeads(prev => {
              if (!prev.includes(userNumber)) {
                return [userNumber, ...prev];
              }
              return prev;
            });

            if (notificationSound) {
              playNotificationSound();
            }

            if (browserNotifications) {
              showBrowserNotification("New Message Received", {
                body: `${userName || userNumber}: ${normalizedConversation.userMsg || "New chat message"}`,
              });
            }
          }
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    socket.onclose = () => console.log("❌ WebSocket disconnected");
    return () => socket.close();
  }, [notificationSound, browserNotifications, selectedUser]);

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log("Audio context not supported:", error);
    }
  };

  const handleAddUser = async () => {
  try {
    setErrorMessage(""); // clear any previous error

    const res = await fetch("http://localhost:3000/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        leadfrom: "Manual Entry",
      }),
    });

    const data = await res.json().catch(() => ({})); // handle JSON parse errors safely

    if (res.ok) {
      // ✅ Success
      setShowModal(false);
      setFormData({
        userName: "",
        userNumber: "",
        course: "",
        city: "",
      });
    } else {
      // ❌ Failure
      setErrorMessage(data?.message || "Failed to add user. Please try again.");
    }
  } catch (err) {
    console.error("Error adding user:", err);
    setErrorMessage("Server error. Please try again later.");
  }
};

  const markAsRead = (leadId) => {
    setUnreadLeads(prev => prev.filter(id => id !== leadId));
  };

  const markAllAsRead = () => {
    setUnreadLeads([]);
    setShowNotifications(false);
  };

  const handleDeleteLead = async () => {
    if (!leadToDelete) return;
    try {
      await fetch(`http://localhost:3000/${leadToDelete.userNumber}`, {
        method: "DELETE",
      });
      setUsers((prev) =>
        prev.filter((u) => u.userNumber !== leadToDelete.userNumber)
      );
      setUnreadLeads(prev => prev.filter(id => id !== leadToDelete._id));
      if (selectedUser?.userNumber === leadToDelete.userNumber) {
        setSelectedUser(null);
        if (window.innerWidth < 768) {
          setShowMobileSidebar(true);
        }
      }
    } catch (err) {
      console.error("Error deleting lead:", err);
    } finally {
      setShowDeleteConfirm(false);
      setLeadToDelete(null);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedUser]);

  useEffect(() => {
    if (selectedUser && window.innerWidth < 768) {
      setShowMobileSidebar(false);
    }
  }, [selectedUser]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const value = {
    users,
    activeTab,
    selectedUser,
    showModal,
    formData,
    startDate,
    endDate,
    showDeleteConfirm,
    leadToDelete,
    unreadLeads,
    showNotifications,
    notificationSound,
    browserNotifications,
    searchQuery,
    sortBy,
    showMobileSidebar,
    messagesEndRef,
    notificationRef,
    setActiveTab,
    setSelectedUser,
    setShowModal,
    setFormData,
    setStartDate,
    setEndDate,
    setShowDeleteConfirm,
    setLeadToDelete,
    setUnreadLeads,
    setShowNotifications,
    setNotificationSound,
    setBrowserNotifications,
    setSearchQuery,
    setSortBy,
    setShowMobileSidebar,
    fetchUsers,
    handleAddUser,
    errorMessage,
    setErrorMessage,
    markAsRead,
    markAllAsRead,
    handleDeleteLead,
    scrollToBottom
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};