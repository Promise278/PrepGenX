import "./global.css"
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { BookOpen, Brain, MessageSquare, Sparkles, ArrowRight, CheckCircle } from "lucide-react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';

const highlights = [
  { icon: BookOpen, text: "Structured study topics" },
  { icon: Brain, text: "AI-powered explanations" },
  { icon: MessageSquare, text: "Interactive chat lessons" },
  { icon: CheckCircle, text: "Track your progress" },
];

const Landing = () => {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        if (hasLaunched === 'true') {
          // If the user has seen this or registered already, skip to login
          router.replace("/signin/page");
        } else {
          setIsChecking(false);
        }
      } catch (error) {
        setIsChecking(false);
      }
    };
    
    checkFirstLaunch();
  }, [router]);

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem('hasLaunched', 'true');
      router.push("/signup/page");
    } catch (e) {
      router.push("/signup/page");
    }
  };

  if (isChecking) {
    return (
      <View className="flex-1 bg-[#faf9f4] items-center justify-center">
        <ActivityIndicator size="large" color="#29a38b" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#faf9f4]">
      <View className="flex-1 justify-between px-6 pt-10 pb-8">

        {/* Hero Section */}
        <View className="flex-1 items-center justify-center">

          {/* Logo Icon */}
          <View className="mb-6 h-24 w-24 items-center justify-center rounded-3xl bg-[#29a38b] shadow-lg">
            <BookOpen size={52} color="white" />
          </View>

          {/* Badge */}
          <View className="mb-2 flex-row items-center gap-1.5 rounded-full bg-[#e5efea] px-4 py-2">
            <Sparkles size={16} color={"#2ea291"} />
            <Text className="text-sm font-semibold text-[#2ea291]">
              AI-Powered Learning
            </Text>
          </View>

          {/* Title */}
          <Text className="mt-3 text-5xl font-medium tracking-tight text-[#1a1c23]">
            PrepGenx
          </Text>

          {/* Subtitle */}
          <Text className="mt-3 max-w-xs text-center text-[#737a8d] text-lg">
            Your smart study companion. Master any subject with AI-guided lessons and interactive chat.
          </Text>

          {/* Highlights */}
          <View className="mt-8 w-full max-w-sm flex-row flex-wrap justify-between">
            {highlights.map((h, i) => {
              const Icon = h.icon;
              return (
                <View
                  key={h.text}
                  className="mb-3 w-[49%] h-22 flex-row items-center gap-1 rounded-xl border border-[#e2e4e9] bg-[#fefffe] p-4"
                >
                  <Icon size={16} color={"#29a38b"} />
                  <Text className="text-xs text-center font-medium text-[#1a1c23]">
                    {h.text}
                  </Text>
                </View>
              );
            })}
          </View>

        </View>

        {/* CTA Section */}
        <View>
          <TouchableOpacity
            onPress={handleGetStarted}
            className="flex-row items-center justify-center gap-2 rounded-xl bg-[#29a38b] py-4 shadow-sm active:opacity-80"
          >
            <Text className="text-lg font-semibold text-[#fefffe]">
              Get Started
            </Text>
            <ArrowRight size={18} color="white" />
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
};

export default Landing;