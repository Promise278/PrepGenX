import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BookOpen, Mail, Lock } from "lucide-react-native";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { StatusBar } from "expo-status-bar";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // const handleSubmit = async () => {
  //   if (!email || !password) {
  //     Toast.show({
  //       type: 'error',
  //       text1: 'Missing fields',
  //       text2: 'Please enter both email and password.',
  //     });
  //     return;
  //   }
  //   setLoading(true);

  //   try {
  //     const apiUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";
  //     const response = await fetch(`${apiUrl}/api/auth/login`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ email, password }),
  //     });

  //     const data = await response.json();

  //     if (!response.ok) {
  //       throw new Error(data.message || data.error || "Failed to login");
  //     }

  //     Toast.show({
  //       type: 'success',
  //       text1: 'Welcome back!',
  //       text2: 'Redirecting to your dashboard...',
  //     });
  //     router.replace("/(tabs)"); // Redirects to the main dashboard tab
  //   } catch (error: any) {
  //     Toast.show({
  //       type: 'error',
  //       text1: 'Login Failed',
  //       text2: error.message,
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <SafeAreaView className="flex-1 bg-[#faf9f4]">
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          className="px-6 pt-20 pb-10"
        >
          {/* Header */}
          <View className="items-center mb-10">
            {/* Logo Icon */}
            <View className="mb-6 h-24 w-24 items-center justify-center rounded-3xl bg-[#29a38b] shadow-lg">
              <BookOpen size={52} color="white" />
            </View>
            <Text className="mt-3 text-4xl font-medium tracking-tight text-foreground">
              PrepGenx
            </Text>
            <Text className="mt-3 max-w-xs text-center text-[#737a8d] text-lg">
              Your AI-powered study companion.
            </Text>
          </View>

          {/* Card */}
          <View className="rounded-3xl p-6 border border-[#e9e8ed] bg-white">
            <Text className="text-xl font-extrabold mb-6">
              Welcome Back
            </Text>

            {/* Email */}
            <View className="flex-row items-center rounded-xl border border-[#e9e8ed] bg-[#faf9f4] px-3 mb-4">
              <Mail size={18} />
              <TextInput
                placeholder="Email address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                className="flex-1 py-4 px-5"
              />
            </View>

            {/* Password */}
            <View className="flex-row items-center rounded-xl border border-[#e9e8ed] bg-[#faf9f4] px-3 mb-6">
              <Lock size={18} />
              <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                className="flex-1 py-4 px-5"
              />
            </View>

            {/* Button */}
            <TouchableOpacity
              onPress={() => router.push("/(tabs)")}
              disabled={loading}
              className="rounded-xl py-4 flex-row items-center justify-center bg-[#29a38b]"
            >
              {loading ? (
                <ActivityIndicator />
              ) : (
                <>
                  <Text className="text-md text-white font-semibold mr-2">
                    Sign In
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color={"white"} />
                </>
              )}
            </TouchableOpacity>

            {/* Switch */}
            <View className="flex-row justify-center mt-6">
              <Text>
                Dont have an account?
              </Text>
              <TouchableOpacity onPress={() => router.push("/signup/page")}>
                <Text className="font-semibold text-[#29a38b] ml-1">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Signin;