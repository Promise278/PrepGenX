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
import { BookOpen, Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { StatusBar } from "expo-status-bar";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../utils/api";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Missing fields',
        text2: 'Please enter both email and password.',
      });
      return;
    }
    setLoading(true);

    try {
      // Use the actual API endpoint
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to login");
      }

      await AsyncStorage.setItem("userToken", data.token);

      Toast.show({
        type: 'success',
        text1: 'Welcome back!',
        text2: 'Redirecting to your dashboard...',
      });
      router.replace("/(tabs)");
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="dark" />
      
      {/* Dynamic Background Accents */}
      <View className="absolute top-[-50] right-[-50] w-[250] h-[250] rounded-full bg-primary/10" />
      <View className="absolute bottom-[-100] left-[-100] w-[300] h-[300] rounded-full bg-accent/5" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          className="px-6 pt-16 pb-10"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View 
            entering={FadeInUp.delay(200).duration(800)}
            className="items-center mb-10"
          >
            {/* Logo Icon */}
            <View className="mb-6 h-28 w-28 items-center justify-center rounded-[32px] bg-primary shadow-2xl shadow-primary/40">
              <BookOpen size={60} color="white" />
            </View>
            <Text className="text-5xl font-bold tracking-tighter text-surface">
              PrepGenx
            </Text>
            <Text className="mt-3 max-w-[280px] text-center text-muted text-lg font-medium leading-6">
              Your AI-powered study companion to ace your exams.
            </Text>
          </Animated.View>

          {/* Card */}
          <Animated.View 
            entering={FadeInDown.delay(400).duration(800)}
            className="rounded-brand-xl p-8 border border-white bg-white/60 shadow-2xl relative overflow-hidden"
          >
            <View className="absolute top-0 left-0 right-0 h-1 bg-primary/20" />
            <View className="items-center mb-8">
              <Text className="text-3xl font-bold text-surface">Welcome Back</Text>
              <Text className="text-muted text-base mt-2 text-center">Let&apos;s continue your journey</Text>
            </View>

            {/* Email */}
            <View className="flex-row items-center rounded-2xl border border-muted/10 bg-background px-4 mb-5 h-16">
              <Mail size={20} color="#737a8d" />
              <TextInput
                placeholder="Email address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor="#a3a3a3"
                className="flex-1 px-4 text-surface font-medium"
              />
            </View>

            {/* Password */}
            <View className="flex-row items-center rounded-2xl border border-muted/10 bg-background px-4 mb-8 h-16">
              <Lock size={20} color="#737a8d" />
              <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#a3a3a3"
                className="flex-1 px-4 text-surface font-medium"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-2">
                {showPassword ? <EyeOff size={20} color="#737a8d" /> : <Eye size={20} color="#737a8d" />}
              </TouchableOpacity>
            </View>

            {/* Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
              className="rounded-2xl h-16 flex-row items-center justify-center bg-primary shadow-lg shadow-primary/30"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-lg text-white font-bold mr-2">
                    Sign In
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color={"white"} />
                </>
              )}
            </TouchableOpacity>

            {/* Switch */}
            <View className="flex-row justify-center mt-8">
              <Text className="text-muted font-medium">
                New to PrepGenx?
              </Text>
              <TouchableOpacity onPress={() => router.push("/signup/page")}>
                <Text className="font-bold text-primary ml-2">
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
          
          {/* Footer Text */}
          <Animated.View 
            entering={FadeInDown.delay(600).duration(800)}
            className="mt-auto pt-10 items-center"
          >
            <Text className="text-muted/60 text-xs font-semibold uppercase tracking-widest">
              Secured by PrepGenx AI
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Signin;