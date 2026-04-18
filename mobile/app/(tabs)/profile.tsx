import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Switch, Modal, Alert, TextInput, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Settings, LogOut, Shield, ChevronRight, Bell, BookOpen, Clock, Flame, TrendingUp } from "lucide-react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerForPushNotificationsAsync, scheduleDailyStudyReminder } from "../../utils/notifications";
import { fetchWithAuth } from "../../utils/api";

export default function Profile() {
  const router = useRouter();
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [studyHour, setStudyHour] = useState(18); // Default 6:00 PM
  const [studyMinute, setStudyMinute] = useState(0); // Default :00
  const [showParentModal, setShowParentModal] = useState(false);
  const [parentEmailInput, setParentEmailInput] = useState("");
  const [linkedParent, setLinkedParent] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetchWithAuth("/auth/me");
        const data = await response.json();
        if (data.success) {
          setProfileData(data.data);
          if (data.data.parentEmail) {
            setLinkedParent(data.data.parentEmail);
          }
        }
      } catch (e) {
        console.error("Failed to load profile", e);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleToggleReminder = async (val: boolean) => {
    setReminderEnabled(val);
    if (val) {
      await registerForPushNotificationsAsync();
      await scheduleDailyStudyReminder(studyHour, studyMinute);
      Alert.alert("Alarm Activated", `Your daily study push notification is scheduled for ${formatAmPm(studyHour, studyMinute)}.`);
    }
  };

  const handleTimeSelect = async (hour: number, minute: number) => {
    setStudyHour(hour);
    setStudyMinute(minute);
    setShowTimePicker(false);
    if (reminderEnabled) {
      await scheduleDailyStudyReminder(hour, minute);
      Alert.alert("Time Updated", `Daily study alarm moved to ${formatAmPm(hour, minute)}.`);
    }
  };

  const handleConnectParent = async () => {
    if (!parentEmailInput.trim()) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }
    
    setIsLinking(true);
    try {
      const response = await fetchWithAuth("/parent/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentEmail: parentEmailInput.trim() }),
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        setLinkedParent(data.parentEmail);
        setShowParentModal(false);
        setParentEmailInput("");
        Alert.alert("Success", "Parent email connected successfully.");
      } else {
        Alert.alert("Error", data.message || "Failed to connect parent email.");
      }
    } catch {
      Alert.alert("Error", "Network error occurred.");
    } finally {
      setIsLinking(false);
    }
  };

  const formatAmPm = (h: number, m: number) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    const minStr = m < 10 ? `0${m}` : m;
    return `${hour12}:${minStr} ${ampm}`;
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userToken");
    router.replace("/signin/page");
  };

  const getInitials = (name: string) => {
    if (!name) return "ST";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0d1f1a] justify-center items-center">
        <ActivityIndicator size="large" color="#29a38b" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0d1f1a]">
      {/* Header with Premium Aesthetic */}
      <View className="p-8 bg-[#162c26] rounded-b-[48px] shadow-2xl items-center pt-14 pb-10 relative overflow-hidden border-b border-white/5">
        {/* Decorative subtle circles in background */}
        <View className="absolute top-[-20] right-[-30] w-48 h-48 rounded-full bg-[#29a38b]/5" />
        <View className="absolute bottom-[-10] left-[-40] w-40 h-40 rounded-full bg-[#29a38b]/5" />
        
        <View className="h-28 w-28 rounded-full bg-[#0d1f1a] border-4 border-[#29a38b]/20 items-center justify-center shadow-2xl mb-5 relative">
          <Text className="text-4xl font-extrabold text-white">{getInitials(profileData?.fullname)}</Text>
          <View className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-[#29a38b] border-2 border-[#0d1f1a]" />
        </View>
        <Text className="text-3xl font-black text-white mb-1 tracking-tighter uppercase">{profileData?.fullname || 'Scholar'}</Text>
        <Text className="text-[#29a38b] font-bold text-xs uppercase tracking-[3px] mb-6">{profileData?.classLevel || 'Candidate'} • {profileData?.examType || 'Elite'}</Text>
        
        <View className="flex-row gap-5 w-full justify-center">
          <View className="bg-white/5 rounded-2xl px-5 py-3 items-center flex-1 max-w-[140px] border border-white/5">
            <Text className="text-white text-2xl font-black mb-0.5">{profileData?.points?.toLocaleString() || '0'}</Text>
            <Text className="text-white/40 text-[10px] font-black uppercase tracking-[2px]">Points</Text>
          </View>
          <View className="bg-white/5 rounded-2xl px-5 py-3 items-center flex-1 max-w-[140px] border border-white/5">
            <Text className="text-white text-2xl font-black mb-0.5">{profileData?.examsTaken || '0'}</Text>
            <Text className="text-white/40 text-[10px] font-black uppercase tracking-[2px]">Exams</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 p-6" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* Progress & Journey Section */}
        <Text className="text-xl font-black text-white mb-4 tracking-tighter uppercase">Your Journey</Text>
        
        <View className="flex-row gap-4 mb-8">
          <View className="flex-1 bg-[#162c26] rounded-[28px] p-5 border border-white/5 shadow-sm items-center">
            <View className="h-12 w-12 rounded-full bg-[#0d1f1a] items-center justify-center mb-4">
              <Flame size={24} color="#f97316" />
            </View>
            <Text className="text-3xl font-black text-white mb-1">{profileData?.streak || '0'}</Text>
            <Text className="text-[10px] text-white/40 font-black uppercase tracking-[2px]">Streak</Text>
          </View>
          
          <View className="flex-1 bg-[#162c26] rounded-[28px] p-5 border border-white/5 shadow-sm items-center">
            <View className="h-12 w-12 rounded-full bg-[#0d1f1a] items-center justify-center mb-4">
              <TrendingUp size={24} color="#29a38b" />
            </View>
            <Text className="text-3xl font-black text-white mb-1">{profileData?.progress ? `${profileData.progress}%` : '0%'}</Text>
            <Text className="text-[10px] text-white/40 font-black uppercase tracking-[2px]">Progress</Text>
          </View>
        </View>

        {/* Parent Portal Section (Premium) */}
        {linkedParent && (
          <View className="bg-[#29a38b] rounded-[32px] p-6 mb-8 shadow-xl shadow-[#29a38b]/20">
            <View className="flex-row items-center gap-4 mb-4">
              <View className="bg-white/20 p-3 rounded-full">
                <Shield size={24} color="white" />
              </View>
              <View>
                <Text className="text-white font-black text-lg">Parent Portal Active</Text>
                <Text className="text-white/80 text-xs">Linked to {linkedParent}</Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => Alert.alert("Parent Dashboard", `Share this link with your parent: http://localhost:5000/parent/dashboard/${profileData?.id}`)} 
              className="bg-white/10 border border-white/20 rounded-2xl py-3 items-center"
            >
              <Text className="text-white font-bold text-sm">View Report Link</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text className="text-xl font-black text-white mb-4 tracking-tighter uppercase">Areas to Improve</Text>
        <View className="bg-[#162c26] rounded-[32px] border border-white/5 p-6 mb-8 shadow-sm">
          {(!profileData?.weaknesses || profileData.weaknesses.length === 0) ? (
            <View className="items-center py-4">
              <Text className="text-[#29a38b] font-bold text-center text-lg">🌟 You have no recorded weaknesses!</Text>
              <Text className="text-sm text-[#737a8d] text-center mt-2">Keep up the great work learning.</Text>
            </View>
          ) : (
            profileData.weaknesses.map((w: any, idx: number) => {
              const bgClass = w.severity === 'high' ? 'bg-red-500' : w.severity === 'moderate' ? 'bg-amber-500' : 'bg-green-500';
              const textClass = w.severity === 'high' ? 'text-red-500' : w.severity === 'moderate' ? 'text-amber-500' : 'text-green-500';
              const softBgClass = w.severity === 'high' ? 'bg-red-50' : w.severity === 'moderate' ? 'bg-amber-50' : 'bg-green-50';
              const message = w.severity === 'high' ? 'Needs immediate attention' : w.severity === 'moderate' ? 'Showing some improvement' : 'Looking solid';
              
              return (
                <View key={w.id || idx} className={idx < profileData.weaknesses.length - 1 ? "mb-6" : ""}>
                  <View className="flex-row justify-between items-end mb-3">
                    <Text className="text-base font-bold text-[#4a4f5c] max-w-[70%]">{w.subject?.name || 'Subject'} - {w.topic || 'General'}</Text>
                    <View className={`${softBgClass} px-2 py-1 rounded-lg`}>
                      <Text className={`text-sm font-black ${textClass}`}>{w.score}%</Text>
                    </View>
                  </View>
                  <View className="w-full h-3 bg-[#f1f2f4] rounded-full overflow-hidden">
                    <View className={`h-full ${bgClass} rounded-full shadow-sm`} style={{ width: `${Math.max(w.score, 5)}%` }} />
                  </View>
                  <Text className="text-xs text-[#737a8d] font-medium mt-2">{message}</Text>
                </View>
              );
            })
          )}
        </View>

        {/* Settings Links */}
        <Text className="text-xl font-black text-white mb-4 tracking-tighter uppercase">Account</Text>
        
        <View className="bg-[#162c26] rounded-[32px] border border-white/5 p-2 mb-8 shadow-sm">
          <ProfileLink icon={<BookOpen size={22} color="#29a38b" />} title="My Target Exams" subtitle="JAMB, WAEC" dark />
          <View className="h-[1px] w-[85%] bg-white/5 self-end" />
          <ProfileLink 
            icon={<Shield size={22} color="#29a38b" />} 
            title="Parent Connectivity" 
            subtitle={linkedParent ? `Linked: ${linkedParent}` : "Not linked. Tap to connect."}
            onPress={() => setShowParentModal(true)}
            dark
          />
        </View>

        <Text className="text-xl font-black text-white mb-4 tracking-tighter uppercase">Study Habits</Text>

        {/* Daily Study Alarm Notification Card */}
        <View className="bg-[#162c26] rounded-[32px] border border-white/5 p-5 mb-8 shadow-sm">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-4">
              <View className="h-12 w-12 rounded-full bg-[#0d1f1a] items-center justify-center border border-[#29a38b]/20">
                <Bell size={24} color="#29a38b" />
              </View>
              <View>
                <Text className="text-lg font-bold text-white">Daily Study Alarm</Text>
                <Text className="text-sm font-medium text-white/40 uppercase tracking-widest text-[10px]">Push notification reminder</Text>
              </View>
            </View>
            <Switch 
              value={reminderEnabled} 
              onValueChange={handleToggleReminder}
              trackColor={{ false: "#0d1f1a", true: "#29a38b" }}
              thumbColor="white"
            />
          </View>

          {reminderEnabled && (
            <TouchableOpacity 
              onPress={() => setShowTimePicker(true)}
              className="flex-row items-center justify-between bg-[#0d1f1a] p-4 rounded-2xl border border-white/10 mt-3"
            >
              <View className="flex-row items-center gap-3">
                <Clock size={20} color="#29a38b" />
                <Text className="font-bold text-white text-base">Scheduled Time</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="font-extrabold text-[#29a38b] text-base">{formatAmPm(studyHour, studyMinute)}</Text>
                <ChevronRight size={18} color="#29a38b" />
              </View>
            </TouchableOpacity>
          )}
        </View>

        <Text className="text-xl font-black text-white mb-4 tracking-tighter uppercase">Systems</Text>
        
        <View className="bg-[#162c26] rounded-[32px] border border-white/5 p-2 mb-8 shadow-sm">
          <ProfileLink icon={<Settings size={22} color="#29a38b" />} title="Preferences" />
          <View className="h-[1px] w-[85%] bg-white/5 self-end" />
          <TouchableOpacity 
            onPress={handleLogout}
            className="flex-row items-center justify-between p-5"
          >
            <View className="flex-row items-center gap-4">
              <View className="h-12 w-12 rounded-full bg-red-500/10 items-center justify-center border border-red-500/20">
                <LogOut size={22} color="#ef4444" />
              </View>
              <Text className="text-lg font-bold text-red-500">Log Out</Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Time Picker Modal */}
      <Modal visible={showTimePicker} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white w-full rounded-t-[48px] p-8 shadow-2xl max-h-[85%] border-t border-white/20">
            <View className="w-16 h-1.5 bg-[#e2e4e9] self-center rounded-full mb-8" />
            <Text className="text-2xl font-black text-[#1a1c23] mb-8 text-center tracking-tight">Select Study Time</Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-xs font-black text-[#737a8d] uppercase tracking-widest mb-4 px-2">Hour</Text>
              <View className="flex-row flex-wrap gap-3 mb-8 justify-center">
                {Array.from({ length: 24 }).map((_, h) => (
                  <TouchableOpacity 
                    key={h}
                    onPress={() => setStudyHour(h)}
                    activeOpacity={0.7}
                    className={`h-14 w-14 items-center justify-center rounded-2xl border-2 ${studyHour === h ? 'bg-[#29a38b] border-[#29a38b] shadow-md shadow-[#29a38b]/30' : 'bg-[#faf9f4] border-[#f1f2f4]'}`}
                  >
                    <Text className={`font-black text-lg ${studyHour === h ? 'text-white' : 'text-[#4a4f5c]'}`}>{h % 12 || 12}</Text>
                    <Text className={`text-[9px] font-bold ${studyHour === h ? 'text-white/90' : 'text-[#737a8d]'}`}>{h >= 12 ? 'PM' : 'AM'}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="text-xs font-black text-[#737a8d] uppercase tracking-widest mb-4 px-2">Minute</Text>
              <View className="flex-row flex-wrap gap-3 mb-10 justify-center">
                {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                  <TouchableOpacity 
                    key={m}
                    onPress={() => setStudyMinute(m)}
                    activeOpacity={0.7}
                    className={`h-14 w-14 items-center justify-center rounded-2xl border-2 ${studyMinute === m ? 'bg-[#29a38b] border-[#29a38b] shadow-md shadow-[#29a38b]/30' : 'bg-[#faf9f4] border-[#f1f2f4]'}`}
                  >
                    <Text className={`font-black text-lg ${studyMinute === m ? 'text-white' : 'text-[#4a4f5c]'}`}>{m < 10 ? `0${m}` : m}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => handleTimeSelect(studyHour, studyMinute)} 
                className="bg-[#29a38b] py-5 rounded-[24px] items-center shadow-lg shadow-[#29a38b]/30 mb-4"
              >
                <Text className="text-white font-extrabold text-lg tracking-wide">Save Selection</Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.6} onPress={() => setShowTimePicker(false)} className="py-4 items-center mb-8">
                <Text className="font-bold text-[#737a8d] text-base">Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Parent Connectivity Modal */}
      <Modal visible={showParentModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white w-full rounded-t-[48px] p-8 shadow-2xl border-t border-white/20">
            <View className="w-16 h-1.5 bg-[#e2e4e9] self-center rounded-full mb-8" />
            <Text className="text-2xl font-black text-[#1a1c23] mb-3 text-center tracking-tight">Connect Parent</Text>
            <Text className="text-base text-[#737a8d] font-medium mb-8 text-center px-4 leading-relaxed">
              Link your parent&apos;s email so they can receive updates on your progress and areas to improve.
            </Text>
            
            <View className="bg-[#faf9f4] border-2 border-[#f1f2f4] rounded-[24px] px-5 py-4 mb-8 focus-within:border-[#29a38b]/50 transition-colors">
              <Text className="text-xs font-black text-[#737a8d] uppercase tracking-wider mb-2">Parent&apos;s Email</Text>
              <TextInput
                value={parentEmailInput}
                onChangeText={setParentEmailInput}
                placeholder="parent@example.com"
                placeholderTextColor="#cbd5e1"
                keyboardType="email-address"
                autoCapitalize="none"
                className="text-lg font-bold text-[#1a1c23] p-0"
              />
            </View>

            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={handleConnectParent} 
              disabled={isLinking}
              className={`py-5 rounded-[24px] items-center mb-4 ${isLinking ? 'bg-[#29a38b]/70' : 'bg-[#29a38b] shadow-lg shadow-[#29a38b]/30'}`}
            >
              {isLinking ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-extrabold text-lg tracking-wide">Connect Email</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.6} onPress={() => setShowParentModal(false)} className="py-4 items-center mb-8">
              <Text className="font-bold text-[#737a8d] text-base">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const ProfileLink = ({ icon, title, subtitle, onPress, dark }: { icon: React.ReactNode, title: string, subtitle?: string, onPress?: () => void, dark?: boolean }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7} className="flex-row items-center justify-between p-5">
    <View className="flex-row items-center gap-4">
      <View className="h-12 w-12 rounded-full bg-[#0d1f1a] items-center justify-center border border-white/5">
        {icon}
      </View>
      <View>
        <Text className={`text-lg font-bold ${dark ? 'text-white' : 'text-[#1a1c23]'}`}>{title}</Text>
        {subtitle && <Text className={`text-sm font-medium ${dark ? 'text-white/40' : 'text-[#737a8d]'} mt-0.5`}>{subtitle}</Text>}
      </View>
    </View>
    <ChevronRight size={22} color={dark ? "#29a38b" : "#cbd5e1"} />
  </TouchableOpacity>
);
