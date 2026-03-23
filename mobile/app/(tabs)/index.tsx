import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BookOpen,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Brain,
  Sparkles,
  Quote,
} from "lucide-react-native";
import { router } from "expo-router";

export default function Dashboard() {
  const [dailyMotivations, setDailyMotivations] = useState<string[]>([]);
  const [loadingMotivations, setLoadingMotivations] = useState(true);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const response = await fetch("https://api.quotable.io/quotes/random?tags=education,learning,knowledge&limit=2");
        const data = await response.json();
        if (data && data.length >= 2) {
          setDailyMotivations([data[0].content, data[1].content]);
        } else {
            throw new Error("Invalid format");
        }
      } catch {
        // Fallback gracefully to high-quality educational quotes if API is ever offline
        setDailyMotivations([
          "Education is the most powerful weapon which you can use to change the world.",
          "The beautiful thing about learning is that no one can take it away from you."
        ]);
      } finally {
        setLoadingMotivations(false);
      }
    };
    fetchQuotes();
  }, []);

  // Mock data for subjects and difficulty scores
  const subjects = [
    { id: 1, name: "Mathematics", score: 45, icon: "🔢" },
    { id: 2, name: "Physics", score: 72, icon: "⚡" },
    { id: 3, name: "English", score: 88, icon: "📚" },
    { id: 4, name: "Chemistry", score: 55, icon: "🧪" },
  ];

  // Helper function to determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80)
      return {
        bg: "bg-[#e5efea]",
        text: "text-[#29a38b]",
        border: "border-[#29a38b]",
      };
    if (score >= 60)
      return {
        bg: "bg-yellow-50",
        text: "text-yellow-600",
        border: "border-yellow-400",
      };
    return { bg: "bg-red-50", text: "text-red-500", border: "border-red-400" };
  };

  return (
    <SafeAreaView className="flex-1 bg-[#fefffe]">
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        {/* Header */}
        <View className="mb-8 flex-row items-center justify-between">
          <View>
            <Text className="text-xl font-medium text-[#737a8d]">
              Hello, John
            </Text>
            <Text className="text-3xl font-bold tracking-tight text-[#1a1c23]">
              Welcome Back
            </Text>
          </View>
          <View className="h-12 w-12 items-center justify-center rounded-full bg-[#e5efea]">
            <UserAvatar />
          </View>
        </View>

        {/* Daily Motivation (Premium Layout) */}
        <View className="mb-8 overflow-hidden rounded-[32px] bg-[#1a1c23] p-6 shadow-xl relative">
          {/* Faint Background Quote Icon for uniqueness */}
          <View className="absolute -right-6 -top-4 opacity-[0.05]">
            <Quote size={140} color="#ffffff" />
          </View>

          <View className="flex-row items-center justify-between mb-5">
            <View className="flex-row items-center gap-2 bg-[#fcd34d]/15 px-3 py-1.5 rounded-full">
              <Sparkles size={16} color="#fcd34d" />
              <Text className="text-[#fcd34d] font-bold text-xs tracking-widest uppercase">
                Daily Inspiration
              </Text>
            </View>
          </View>

          {loadingMotivations ? (
            <View className="py-8 items-center justify-center">
              <ActivityIndicator color="#fcd34d" size="large" />
            </View>
          ) : (
            <View className="gap-5">
              <View>
                <Text className="text-white text-xl font-medium leading-8 tracking-wide">
                  &quot;{dailyMotivations[0]}&quot;
                </Text>
              </View>

              <View className="bg-white/10 rounded-2xl p-4 border border-white/5">
                <Text className="text-white/80 text-sm font-medium leading-5 italic">
                  &quot;{dailyMotivations[1]}&quot;
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* AI Recommendation Card */}
        <View className="mb-8 rounded-2xl bg-[#29a38b] p-6 shadow-sm">
          <View className="flex-row items-center gap-2 mb-3">
            <Brain size={24} color="#fefffe" />
            <Text className="text-lg font-bold text-[#fefffe]">
              AI Study Plan
            </Text>
          </View>
          <Text className="text-base text-white/90 leading-6 mb-4">
            Focus on <Text className="font-bold text-white">Mathematics</Text>{" "}
            and <Text className="font-bold text-white">Chemistry</Text>. These
            are your weakest subjects right now.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/ai-tutor")}
            className="self-start rounded-xl bg-white px-5 py-2.5"
          >
            <Text className="font-semibold text-[#29a38b]">
              Start Voice Lesson
            </Text>
          </TouchableOpacity>
        </View>

        {/* Subjects Grid */}
        <Text className="text-xl font-bold tracking-tight text-[#1a1c23] mb-4">
          Subject Difficulty
        </Text>

        <View className="">
          <View className="flex-row flex-wrap justify-between gap-y-4">
            {subjects.map((subject) => {
              let barColor = "bg-red-500";
              if (subject.score >= 80) barColor = "bg-[#29a38b]";
              else if (subject.score >= 60) barColor = "bg-yellow-500";

              return (
                <TouchableOpacity
                  key={subject.id}
                  onPress={() => router.push(`/subject/${subject.name}` as any)}
                  className="w-[48%] rounded-2xl border border-[#e2e4e9] bg-white p-4 shadow-sm"
                >
                  <Text className="text-3xl mb-2">{subject.icon}</Text>
                  <Text className="text-sm font-bold text-[#1a1c23] mb-1">
                    {subject.name}
                  </Text>

                  <View className="flex-row items-center justify-between mt-1 mb-2">
                    <Text className="text-xs font-semibold text-[#737a8d]">
                      {subject.score}% Mastery
                    </Text>
                  </View>

                  {/* Subtle Progress bar */}
                  <View className="h-1.5 w-full rounded-full bg-[#f1f2f4] overflow-hidden">
                    <View
                      className={`h-full rounded-full ${barColor}`}
                      style={{ width: `${subject.score}%` }}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        {/* Recent Activity */}
        <View className="mt-8">
          <Text className="text-xl font-bold tracking-tight text-[#1a1c23] mb-4">
            Recent Activity
          </Text>
          <View className="rounded-2xl border border-[#e2e4e9] bg-[#fefffe] p-4">
            <ActivityItem
              title="Completed 50 MCQs in Physics"
              time="2 hours ago"
            />
            <View className="my-3 h-[1px] w-full bg-[#e2e4e9]" />
            <ActivityItem
              title="Voice Lesson: Algebra basics"
              time="Yesterday"
            />
            <View className="my-3 h-[1px] w-full bg-[#e2e4e9]" />
            <ActivityItem
              title="Your score improved by 15%!"
              time="2 days ago"
              isHighlight
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const UserAvatar = () => (
  <Text className="text-lg font-bold text-[#29a38b]">JD</Text>
);

const ActivityItem = ({
  title,
  time,
  isHighlight = false,
}: {
  title: string;
  time: string;
  isHighlight?: boolean;
}) => (
  <View className="flex-row items-center gap-3">
    <View
      className={`h-10 w-10 items-center justify-center rounded-full ${isHighlight ? "bg-yellow-100" : "bg-[#faf9f4]"}`}
    >
      {isHighlight ? (
        <TrendingUp size={20} color="#eab308" />
      ) : (
        <BookOpen size={20} color="#737a8d" />
      )}
    </View>
    <View>
      <Text className="text-base font-semibold text-[#1a1c23]">{title}</Text>
      <Text className="text-sm text-[#737a8d]">{time}</Text>
    </View>
  </View>
);
