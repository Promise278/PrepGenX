import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BookOpen,
  TrendingUp,
  AlertTriangle,
  Brain,
  Sparkles,
  Settings,
  Activity,
  Calendar,
  X,
  Shield,
  Flame,
  ChevronRight,
} from "lucide-react-native";
import { router } from "expo-router";
import { fetchWithAuth } from "../../utils/api";
import Animated, { FadeInDown } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Dashboard() {
  const [profileData, setProfileData] = useState<any>(null);
  const [highWeakness, setHighWeakness] = useState<{subject: string, topic: string} | null>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [showTestMenu, setShowTestMenu] = useState(false);
  const [examStatus, setExamStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;
        
        const [meRes, subRes, actRes, statusRes] = await Promise.all([
          fetchWithAuth("/auth/me").catch(() => ({ json: () => ({ success: false }) })),
          fetchWithAuth("/exams/subjects").catch(() => ({ json: () => ({ success: false }) })),
          fetchWithAuth("/auth/activity").catch(() => ({ json: () => ({ success: false }) })),
          user?.id ? fetchWithAuth(`/exams/status/${user.id}`).catch(() => ({ json: () => ({ success: false }) })) : Promise.resolve({ json: () => ({ success: false }) })
        ]);
        
        const meData = await (meRes as any).json();
        const subData = await (subRes as any).json();
        const actData = await (actRes as any).json();
        const statData = await (statusRes as any).json();

        if (meData.success && meData.data) {
          setProfileData(meData.data);
          const w = meData.data.weaknesses;
          if (w && w.length > 0 && w[0].score < 40) {
            setHighWeakness({ subject: w[0].subject?.name || "General", topic: w[0].topic || "Fundamentals" });
          }
        }
        
        if (actData.success) {
          setActivities(actData.data);
        }

        if (statData.success) {
          setExamStatus(statData);
        }

        if (subData.success && subData.subjects) {
          const mapped = subData.subjects.map((s: any) => {
            let icon = "🔢";
            if (s.name.toLowerCase().includes("physic")) icon="⚡";
            if (s.name.toLowerCase().includes("english")) icon="📚";
            if (s.name.toLowerCase().includes("chem")) icon="🧪";
            if (s.name.toLowerCase().includes("bio")) icon="🌿";
            
            return {
              id: s.id,
              name: s.name,
              score: s.avgScore || Math.floor(Math.random() * 40) + 40,
              icon: icon
            };
          });
          setSubjects(mapped);
        }
      } catch (e) {
        console.error("Failed to load dashboard data", e);
      } finally {
        setLoadingSubjects(false);
        setLoadingActivities(false);
        setLoadingStatus(false);
      }
    };
    loadData();
  }, []);

  const daysRemaining = examStatus?.daysLeft || 30;
  const urgencyLevel = daysRemaining > 20 ? 'calm' : daysRemaining > 7 ? 'warning' : 'danger';
  const moodColors = {
    calm: '#0d1f1a',
    warning: '#1f140d',
    danger: '#2c0d0d'
  };

  if (highWeakness) {
    return (
      <SafeAreaView className="flex-1 bg-[#0d1f1a] justify-center px-6">
        <Animated.View entering={FadeInDown.duration(600)} className="items-center mb-8">
          <View className="w-24 h-24 bg-red-500/20 rounded-full items-center justify-center mb-6 border border-red-500/30">
            <AlertTriangle size={48} color="#ef4444" />
          </View>
          <Text className="text-4xl font-black text-white text-center mb-3 tracking-tighter">
            Wait right there.
          </Text>
          <Text className="text-red-400 text-lg font-bold text-center mb-4 uppercase tracking-[4px]">
            Critical Weakness
          </Text>
          <Text className="text-white/70 text-center text-lg leading-7 mb-10 px-4">
            PrepGenX AI has detected a gap in <Text className="text-white font-black underline">{highWeakness.subject}</Text> ({highWeakness.topic}). Mastery is required to proceed.
          </Text>
          
          <TouchableOpacity 
            onPress={() => {
              setHighWeakness(null); 
              router.push("/(tabs)/ai-tutor");
            }} 
            activeOpacity={0.9}
            className="w-full bg-red-500 rounded-[24px] py-5 flex-row justify-center items-center shadow-2xl shadow-red-500/40"
          >
            <Brain color="white" size={24} />
            <Text className="text-white text-xl font-black ml-3">Fix Now with AI</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: "#faf9f4" }}>
      <ScrollView 
        contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View className="mb-8 flex-row items-center justify-between">
          <View>
            <Text className="text-black text-[12px] font-black uppercase tracking-[3px] mb-1">Hello, John</Text>
            <Text className="text-3xl font-black text-[#0e3127] tracking-tighter uppercase">Welcome Back</Text>
          </View>
          <TouchableOpacity 
            onLongPress={() => setShowTestMenu(true)}
            onPress={() => router.push('/(tabs)/profile')}
            className="h-14 w-14 rounded-full bg-[#dff0eb] text-[#6be7c6] border border-white/5 items-center justify-center overflow-hidden shadow-sm"
          >
            <UserAvatar name={profileData?.fullname} />
          </TouchableOpacity>
        </View>

        {/* JAMB Readiness Meter (Result Machine) */}
        {!loadingStatus && (
          <View className="mb-8 flex-row items-center gap-6">
            <View className="h-32 w-32 items-center justify-center relative">
              <View className="absolute inset-0 rounded-full border-[10px] border-[#e2e7e6]" />
              <View className="absolute inset-0 rounded-full border-[10px] border-[#29a38b]" style={{ borderRightColor: 'transparent', borderBottomColor: 'transparent', transform: [{ rotate: '45deg' }] }} />
              <View className="items-center">
                <Text className="text-3xl font-black text-black">{Math.round(subjects.reduce((a, b) => a + b.score, 0) / (subjects.length || 1))}%</Text>
                <Text className="text-[8px] font-black text-black uppercase tracking-widest">Ready</Text>
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-black font-black text-lg mb-1">JAMB Readiness</Text>
              <Text className="text-black text-xs leading-4 mb-3">
                 {Math.round(subjects.reduce((a, b) => a + b.score, 0) / (subjects.length || 1)) > 80 
                  ? "Elite status! Just polish your weak topics to hit 300+." 
                  : "Keep grinding! You're closing the gap on your target score."}
              </Text>
              <TouchableOpacity className="bg-[#29a38b]/20 py-2 rounded-xl items-center border border-[#29a38b]/30">
                 <Text className="text-[#29a38b] font-bold text-xs">Analyze Gap</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Score Guarantee Hook (Result Machine) */}
        <View className="mb-8 bg-[#29a38b] p-6 rounded-[36px] shadow-xl shadow-[#29a38b]/30 overflow-hidden relative">
          <View className="absolute top-[-20] right-[-20] bg-white/10 h-32 w-32 rounded-full" />
          <View className="flex-row items-center gap-3 mb-3">
             <Shield size={16} color="white" />
             <Text className="text-white font-black uppercase tracking-widest text-[10px]">Score Guarantee Engine</Text>
          </View>
          <Text className="text-white text-2xl font-black leading-7 mb-4">
             Follow your path to reach your target (+15% Improvement)
          </Text>
          <View className="h-1 w-full bg-white/20 rounded-full mb-4">
             <View className="h-full bg-white w-3/4 rounded-full" />
          </View>
          <Text className="text-white/80 font-bold text-[10px] uppercase tracking-widest">Predictive outcome: 268 / 400</Text>
        </View>

        {/* "LAST 7 DAYS" Viral Mode Button */}
        <TouchableOpacity 
          onPress={() => router.push('/last-seven-days' as any)}
          activeOpacity={0.8}
          className="mb-8 bg-red-600 p-5 rounded-[28px] border border-red-400 flex-row items-center justify-between shadow-xl shadow-red-600/30"
        >
          <View className="flex-row items-center gap-4">
             <View className="h-12 w-12 bg-white/10 rounded-2xl items-center justify-center">
                <Flame size={24} color="white" />
             </View>
             <View>
                <Text className="text-white font-black text-lg uppercase tracking-tighter">LAST 7 DAYS MODE</Text>
                <Text className="text-white/70 text-[10px] font-black uppercase tracking-widest">High-Yield Questions Only</Text>
             </View>
          </View>
          <ChevronRight size={20} color="white" />
        </TouchableOpacity>

        {/* Original Exam Countdown Details (Mini) */}
        {!loadingStatus && examStatus && (
          <View className="mb-8 bg-[#162c26] p-6 rounded-3xl border border-white/5">
             <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white/40 text-[10px] font-black uppercase tracking-widest">Exam Urgency</Text>
                <Text className="text-red-400 font-bold text-xs">{examStatus.daysLeft} Days Left</Text>
             </View>
             <TouchableOpacity 
              onPress={() => router.push('/study-plan' as any)}
              className="bg-white/5 py-4 rounded-2xl items-center flex-row justify-center gap-2 border border-white/10"
            >
              <Calendar size={18} color="#29a38b" />
              <Text className="text-white font-black uppercase tracking-widest text-xs">Full Study Roadmap</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Subjects Grid */}
        <Text className="text-xl font-black tracking-tighter text-black mb-6">
          Subject Difficulty
        </Text>

        <View>
          {loadingSubjects ? (
            <ActivityIndicator color="#29a38b" size="large" />
          ) : (
            <View className="flex-row flex-wrap justify-between gap-y-4">
              {subjects.map((subject, index) => (
                <View 
                  key={subject.id}
                  className="w-[48%]"
                >
                  <TouchableOpacity
                    onPress={() => router.push(`/subject/${subject.name}` as any)}
                    activeOpacity={0.7}
                    className="rounded-[28px] border border-white/5 bg-[#162c26] p-5"
                  >
                    <View className="h-10 w-10 items-center justify-center rounded-2xl bg-[#0d1f1a] mb-4">
                      <Text className="text-2xl">{subject.icon}</Text>
                    </View>
                    <Text className="text-sm font-black text-white mb-2 tracking-tight">
                      {subject.name}
                    </Text>
                    <View className="h-1.5 w-full rounded-full bg-[#0d1f1a] overflow-hidden">
                      <View
                        className="h-full rounded-full bg-[#29a38b]"
                        style={{ width: `${subject.score}%` }}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* AI Advisor Mini */}
        <TouchableOpacity 
          onPress={() => router.push("/(tabs)/ai-tutor")}
          className="mt-10 bg-[#162c26] rounded-3xl p-6 border border-white/5 flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-4">
            <View className="bg-[#29a38b]/20 p-3 rounded-full">
              <Sparkles size={20} color="#29a38b" />
            </View>
            <View>
              <Text className="text-white font-black text-lg">AI Tutor Session</Text>
              <Text className="text-white/40 text-xs text-brand-emerald">Fix weaknesses instantly</Text>
            </View>
          </View>
          <ChevronRight size={24} color="#737a8d" />
        </TouchableOpacity>

        {/* Recent Activity */}
        <View className="mt-12">
          <Text className="text-2xl font-black tracking-tighter text-black mb-6">
            Live Activity
          </Text>
          <View className="rounded-[32px] border border-white/5 bg-[#162c26] p-2 shadow-sm">
            {loadingActivities ? (
              <ActivityIndicator color="#29a38b" className="py-8" />
            ) : activities.length > 0 ? (
              activities.map((act, idx) => (
                <View key={act.id}>
                  <ActivityItem
                    title={`Mastered ${act.score}% in ${act.Subject?.name || 'Session'}`}
                    time={new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    isLast={idx === activities.length - 1}
                  />
                </View>
              ))
            ) : (
              <View className="items-center py-10">
                <Activity size={32} color="#737a8d" className="mb-3 opacity-20" />
                <Text className="text-white/40 font-medium">No recent activity detected.</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Development Test Menu */}
      <Modal visible={showTestMenu} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <Animated.View entering={FadeInDown} className="bg-white rounded-t-[40px] p-8 pb-12 shadow-2xl">
            <View className="flex-row justify-between items-center mb-8">
              <View className="flex-row items-center gap-3">
                <Settings color="#1a1c23" size={24} />
                <Text className="text-2xl font-black text-surface">TEST CONSOLE</Text>
              </View>
              <TouchableOpacity onPress={() => setShowTestMenu(false)} className="p-2 bg-background rounded-full">
                <X color="#1a1c23" size={20} />
              </TouchableOpacity>
            </View>
            
            <View className="gap-4">
              <TestMenuItem 
                icon={<AlertTriangle size={20} color="#ef4444" />} 
                title="Trigger Critical Weakness" 
                onPress={() => {
                  setHighWeakness({ subject: "Mathematics", topic: "Complex Integrals" });
                  setShowTestMenu(false);
                }}
              />
              <TestMenuItem 
                icon={<Activity size={20} color="#29a38b" />} 
                title="Reset Session Data" 
                onPress={() => {
                  setActivities([]);
                  setShowTestMenu(false);
                }}
              />
              <TestMenuItem 
                icon={<Brain size={20} color="#818cf8" />} 
                title="Simulate AI Success" 
                onPress={() => setShowTestMenu(false)}
              />
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const UserAvatar = ({ name }: { name?: string }) => {
  const initials = name ? name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : 'GS';
  return <Text className="text-lg font-black text-primary tracking-tighter">{initials}</Text>;
};

const TestMenuItem = ({ icon, title, onPress }: { icon: any, title: string, onPress: () => void }) => (
  <TouchableOpacity 
    onPress={onPress}
    className="flex-row items-center gap-4 bg-background p-5 rounded-2xl border border-muted/5"
  >
    {icon}
    <Text className="text-surface font-bold text-lg">{title}</Text>
  </TouchableOpacity>
);

const ActivityItem = ({
  title,
  time,
  isHighlight = false,
  isLast = false
}: {
  title: string;
  time: string;
  isHighlight?: boolean;
  isLast?: boolean;
}) => (
  <View className={`flex-row items-center gap-4 p-4 ${!isLast ? 'border-b border-muted/5' : ''}`}>
    <View
      className={`h-12 w-12 items-center justify-center rounded-full ${isHighlight ? "bg-secondary/10" : "bg-background"}`}
    >
      {isHighlight ? (
        <TrendingUp size={22} color="#fcd34d" />
      ) : (
        <BookOpen size={22} color="#737a8d" />
      )}
    </View>
    <View className="flex-1">
      <Text className="text-base font-bold text-surface tracking-tight" numberOfLines={1}>{title}</Text>
      <Text className="text-xs font-semibold text-muted uppercase tracking-widest">{time}</Text>
    </View>
  </View>
);
