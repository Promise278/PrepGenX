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
import { BookOpen, Mail, Lock, User, Eye, EyeOff } from "lucide-react-native";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { StatusBar } from "expo-status-bar";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
    if (!fullname || !username || !email || !parentEmail || !password) {
      Toast.show({
        type: 'error',
        text1: 'Missing fields',
        text2: 'Please fill in all fields.',
      });
      return;
    }
    setLoading(true);

    try {
      const { API_URL } = require("../../utils/api");
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullname, username, email, parentEmail, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to register");
      }

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Account created successfully!',
      });
      router.push("/signin/page");
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#faf9f4]">
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          className="px-6 pt-4 pb-4"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="items-center mb-6 mt-2">
            {/* Logo Icon */}
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-[#29a38b] shadow-md">
              <BookOpen size={36} color="white" />
            </View>
            <Text className="text-3xl font-bold tracking-tight text-foreground">
              PrepGenx
            </Text>
            <Text className="mt-1 max-w-xs text-center text-[#737a8d] text-base">
              Your AI-powered study companion.
            </Text>
          </View>

          {/* Card */}
          <View className="rounded-3xl p-5 border border-[#e9e8ed] bg-white shadow-sm gap-y-3">
            <Text className="text-xl font-extrabold mb-4">
              Create account
            </Text>

            {/* fullname */}
            <View className="flex-row items-center rounded-xl border border-[#e9e8ed] bg-[#faf9f4] px-3 mb-3">
              <User size={18} color="#737a8d" />
              <TextInput
                placeholder="Full Name"
                value={fullname}
                onChangeText={setFullname}
                autoCapitalize="none"
                className="flex-1 py-3 px-3"
              />
            </View>

            {/* username */}
            <View className="flex-row items-center rounded-xl border border-[#e9e8ed] bg-[#faf9f4] px-3 mb-3">
              <User size={18} color="#737a8d" />
              <TextInput
                placeholder="User Name"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                className="flex-1 py-3 px-3"
              />
            </View>

            {/* Email */}
            <View className="flex-row items-center rounded-xl border border-[#e9e8ed] bg-[#faf9f4] px-3 mb-3">
              <Mail size={18} color="#737a8d" />
              <TextInput
                placeholder="Email address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                className="flex-1 py-3 px-3"
              />
            </View>

            {/* Parent Email */}
            <View className="flex-row items-center rounded-xl border border-[#e9e8ed] bg-[#faf9f4] px-3 mb-3">
              <Mail size={18} color="#737a8d" />
              <TextInput
                placeholder="Parent's Email Address"
                value={parentEmail}
                onChangeText={setParentEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                className="flex-1 py-3 px-3"
              />
            </View>

            {/* Password */}
            <View className="flex-row items-center rounded-xl border border-[#e9e8ed] bg-[#faf9f4] px-3 mb-5">
              <Lock size={18} color="#737a8d" />
              <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                className="flex-1 py-3 px-3"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-2">
                {showPassword ? <EyeOff size={18} color="#737a8d" /> : <Eye size={18} color="#737a8d" />}
              </TouchableOpacity>
            </View>

            {/* Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              className="rounded-xl py-3.5 flex-row items-center justify-center bg-[#29a38b] shadow-md"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-base text-white font-bold mr-2">
                    Create Account
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color={"white"} />
                </>
              )}
            </TouchableOpacity>

            {/* Switch */}
            <View className="flex-row justify-center mt-5">
              <Text className="text-[#4a4f5c]">
                Already have an account?
              </Text>
              <TouchableOpacity onPress={() => router.push("/signin/page")}>
                <Text className="font-bold text-[#29a38b] ml-1">
                  Sign in
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Signup;
