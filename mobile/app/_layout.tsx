import React, { useEffect, useState } from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { Slot, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { Phone, PhoneOff, User } from "lucide-react-native";
import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SOCKET_URL = "http://localhost:5000";

export default function RootLayout() {
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const setupSocket = async () => {
      const currentUser = JSON.parse(await AsyncStorage.getItem("user") || "{}");
      const socket = io(SOCKET_URL);

      socket.on("incoming_call", (data) => {
        // Only show if the call is for me
        if (data.userToCall === (currentUser.id || "3")) {
          setIncomingCall(data);
        }
      });

      socket.on("call_ended", () => {
        setIncomingCall(null);
      });

      return () => {
        socket.disconnect();
      };
    };

    setupSocket();
  }, []);

  const acceptCall = () => {
    const callData = incomingCall;
    setIncomingCall(null);
    const socket = io(SOCKET_URL);
    socket.emit("accept_call", { to: callData.from });
    router.push(`/call/${callData.from}?name=${encodeURIComponent(callData.name)}` as any);
  };

  const declineCall = () => {
    const callData = incomingCall;
    setIncomingCall(null);
    const socket = io(SOCKET_URL);
    socket.emit("decline_call", { to: callData.from });
  };

  return (
    <>
      <Slot />
      <Toast />

      {/* Incoming Call Modal */}
      <Modal
        visible={!!incomingCall}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContent}>
            <View style={styles.callerInfo}>
              <View style={styles.avatarCircle}>
                <User size={40} color="#29a38b" />
              </View>
              <Text style={styles.incomingText}>Incoming Video Call</Text>
              <Text style={styles.callerName}>{incomingCall?.name}</Text>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity 
                onPress={declineCall}
                style={[styles.actionButton, styles.declineButton]}
              >
                <PhoneOff size={28} color="white" />
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={acceptCall}
                style={[styles.actionButton, styles.acceptButton]}
              >
                <Phone size={28} color="white" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1a1c23",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    alignItems: "center",
  },
  callerInfo: {
    alignItems: "center",
    marginBottom: 40,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#2d3436",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#29a38b",
  },
  incomingText: {
    color: "#e5efea",
    fontSize: 16,
    marginBottom: 5,
  },
  callerName: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingBottom: 20,
  },
  actionButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
  },
  declineButton: {
    backgroundColor: "#ff4757",
  },
  acceptButton: {
    backgroundColor: "#29a38b",
  },
});