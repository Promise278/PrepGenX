import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Animated,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  RotateCw,
  User
} from "lucide-react-native";
import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SOCKET_URL = "http://localhost:5000";

export default function CallScreen() {
  const { userId, name } = useLocalSearchParams();
  const router = useRouter();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState("Calling...");
  const socketRef = useRef<any>(null);
  
  // Animation for pulsing
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (callStatus === "Calling...") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 2,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [callStatus, pulseAnim]);

  useEffect(() => {
    const setupCall = async () => {
      const currentUser = JSON.parse(await AsyncStorage.getItem("user") || "{}");
      const socket = io(SOCKET_URL);
      socketRef.current = socket;

      // Broadcast call
      socket.emit("call_user", {
        userToCall: userId,
        from: currentUser.id || "3",
        name: currentUser.name || "John D.",
        signalData: {}, // Placeholder for WebRTC signal
      });

      socket.on("call_accepted", () => {
        setCallStatus("Connected");
      });

      socket.on("call_declined", () => {
        setCallStatus("Declined");
        setTimeout(() => router.back(), 2000);
      });

      socket.on("call_ended", () => {
        setCallStatus("Ended");
        setTimeout(() => router.back(), 2000);
      });

      return () => {
        socket.disconnect();
      };
    };

    setupCall();
  }, [userId, router]);

  const endCall = () => {
    socketRef.current?.emit("end_call");
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#0d1f1a" }]} />

      {/* Main View (Simulated Video) */}
      <View style={styles.videoContainer}>
        {isVideoOff ? (
          <View style={styles.placeholderContainer}>
             <View style={styles.avatarLarge}>
               <User size={80} color="#737a8d" />
             </View>
             <Text style={styles.placeholderText}>{name}</Text>
          </View>
        ) : (
          <View style={styles.simulatedVideo}>
             {/* Pulsing effect for calling */}
             {callStatus === "Calling..." && (
                <Animated.View
                  style={[
                    styles.pulse,
                    {
                      transform: [{ scale: pulseAnim }],
                      opacity: pulseAnim.interpolate({
                        inputRange: [1, 2],
                        outputRange: [0.6, 0],
                      }),
                    },
                  ]}
                />
             )}
             <View style={styles.avatarLarge}>
                <User size={80} color="#29a38b" />
             </View>
          </View>
        )}

        {/* Small Self View Overlay */}
        <View style={styles.selfVideo}>
           <User size={24} color="white" />
        </View>
      </View>

      {/* Header Info */}
      <View style={styles.header}>
        <Text style={styles.nameText}>{name}</Text>
        <Text style={styles.statusText}>{callStatus}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          onPress={() => setIsMuted(!isMuted)}
          style={[styles.controlButton, isMuted && styles.controlButtonActive]}
        >
          {isMuted ? <MicOff size={28} color="white" /> : <Mic size={28} color="white" />}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={endCall}
          style={[styles.controlButton, styles.endCallButton]}
        >
          <PhoneOff size={32} color="white" />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setIsVideoOff(!isVideoOff)}
          style={[styles.controlButton, isVideoOff && styles.controlButtonActive]}
        >
          {isVideoOff ? <VideoOff size={28} color="white" /> : <VideoIcon size={28} color="white" />}
        </TouchableOpacity>
      </View>

      {/* Top Controls */}
      <TouchableOpacity style={styles.topControl}>
        <RotateCw size={24} color="white" />
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1c23",
  },
  header: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  nameText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  statusText: {
    color: "#e5efea",
    fontSize: 16,
    marginTop: 4,
  },
  videoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  simulatedVideo: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1c23",
  },
  placeholderContainer: {
    alignItems: "center",
  },
  placeholderText: {
    color: "white",
    fontSize: 20,
    marginTop: 16,
  },
  avatarLarge: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#2d3436",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#29a38b",
  },
  selfVideo: {
    position: "absolute",
    bottom: 140,
    right: 20,
    width: 100,
    height: 150,
    borderRadius: 12,
    backgroundColor: "#3d4446",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  controlsContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 15,
  },
  controlButtonActive: {
    backgroundColor: "#ff4757",
  },
  endCallButton: {
    width: 75,
    height: 75,
    borderRadius: 40,
    backgroundColor: "#ff4757",
  },
  topControl: {
    position: "absolute",
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  pulse: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "#29a38b",
    zIndex: -1,
  }
});
