import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Send, ChevronLeft } from "lucide-react-native";
import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Replace with your server URL
const SOCKET_URL = "http://localhost:5000"; 
const API_URL = "http://localhost:5000";

export default function ChatScreen() {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const socketRef = useRef<any>(null);
  const flatListRef = useRef<any>(null);

  useEffect(() => {
    const setupSocket = async () => {
      const token = await AsyncStorage.getItem("userToken");
      const currentUser = JSON.parse(await AsyncStorage.getItem("user") || "{}");
      const currentUserId = currentUser.id || "3"; // Default for demo

      // Fetch Chat History
      try {
        const response = await fetch(`${API_URL}/chat/history/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await response.json();
        if (result.success) {
          setMessages(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      }

      // Initialize Socket
      const socket = io(SOCKET_URL);
      socketRef.current = socket;

      // Join a unique room for this private chat
      const roomId = [currentUserId, userId].sort().join("-");
      socket.emit("join_room", roomId);

      socket.on("receive_message", (message: any) => {
        setMessages((prev) => [...prev, message]);
      });

      return () => {
        socket.disconnect();
      };
    };

    setupSocket();
  }, [userId]);

  const sendMessage = async () => {
    if (inputText.trim() === "" || !socketRef.current) return;

    const token = await AsyncStorage.getItem("userToken");
    const currentUser = JSON.parse(await AsyncStorage.getItem("user") || "{}");
    const currentUserId = currentUser.id || "3";
    
    const roomId = [currentUserId, userId].sort().join("-");
    const messageData = {
      senderId: currentUserId,
      receiverId: userId,
      content: inputText,
      createdAt: new Date().toISOString(),
    };

    // Emit to socket
    socketRef.current.emit("send_message", {
      roomId,
      message: messageData,
    });

    // Save to database
    try {
      await fetch(`${API_URL}/chat/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: userId,
          content: inputText,
        }),
      });
    } catch (error) {
      console.error("Failed to save message:", error);
    }

    setInputText("");
  };

  const renderItem = ({ item }: { item: any }) => {
    const isMe = item.senderId === "3"; // Hardcoded for demo/Mock
    return (
      <View
        className={`max-w-[80%] p-3 m-2 rounded-2xl ${
          isMe ? "bg-[#29a38b] self-end rounded-tr-none" : "bg-white self-start rounded-tl-none border border-[#e2e4e9]"
        }`}
      >
        <Text className={`${isMe ? "text-white" : "text-[#1a1c23]"}`}>{item.content}</Text>
        <Text className={`text-[10px] mt-1 ${isMe ? "text-[#e5efea]" : "text-[#737a8d]"}`}>
          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#faf9f4]">
      {/* Header */}
      <View className="flex-row items-center p-4 bg-white border-b border-[#e2e4e9]">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ChevronLeft size={24} color="#1a1c23" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#1a1c23]">Chat</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        className="flex-1 p-2"
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View className="flex-row items-center p-4 bg-white border-t border-[#e2e4e9]">
          <TextInput
            className="flex-1 bg-[#f5f7f9] p-3 rounded-2xl text-[#1a1c23] mr-3"
            placeholder="Type a message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            onPress={sendMessage}
            className="bg-[#29a38b] p-3 rounded-full"
          >
            <Send size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
