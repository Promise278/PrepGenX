import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Switch, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Settings, LogOut, Shield, ChevronRight, Bell, BookOpen, Clock } from "lucide-react-native";
import { useRouter } from "expo-router";
import { registerForPushNotificationsAsync, scheduleDailyStudyReminder } from "../../utils/notifications";

export default function Profile() {
  const router = useRouter();
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [studyHour, setStudyHour] = useState(18); // Default 6:00 PM
  const [studyMinute, setStudyMinute] = useState(0); // Default :00

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

  const formatAmPm = (h: number, m: number) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    const minStr = m < 10 ? `0${m}` : m;
    return `${hour12}:${minStr} ${ampm}`;
  };

  const handleLogout = () => {
    // In a real app, clear tokens here
    router.replace("/signin/page");
  };

  return (
    <SafeAreaView className="flex-1 bg-[#faf9f4]">
      {/* Header */}
      <View className="p-6 bg-[#29a38b] rounded-b-[40px] shadow-md items-center pt-10">
        <View className="h-24 w-24 rounded-full bg-white border-4 border-[#e5efea] items-center justify-center shadow-lg mb-4">
          <Text className="text-3xl font-bold text-[#29a38b]">JD</Text>
        </View>
        <Text className="text-2xl font-bold text-white mb-1">John Doe</Text>
        <Text className="text-[#e5efea] font-medium mb-4">SS3 Student • Science</Text>
        
        <View className="flex-row gap-4">
          <View className="bg-white/20 rounded-xl px-4 py-2 items-center">
            <Text className="text-white text-lg font-bold">4,100</Text>
            <Text className="text-[#e5efea] text-xs">Points</Text>
          </View>
          <View className="bg-white/20 rounded-xl px-4 py-2 items-center">
            <Text className="text-white text-lg font-bold">12</Text>
            <Text className="text-[#e5efea] text-xs">Exams</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 p-6" contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Settings Links */}
        <Text className="text-lg font-bold text-[#1a1c23] mb-4">Account</Text>
        
        <View className="bg-white rounded-3xl border border-[#e2e4e9] p-2 mb-6 shadow-sm">
          <ProfileLink icon={<BookOpen size={20} color="#737a8d" />} title="My Target Exams" subtitle="JAMB, WAEC" />
          <View className="h-[1px] w-full bg-[#f1f2f4]" />
          <ProfileLink icon={<Shield size={20} color="#737a8d" />} title="Parent Connectivity" subtitle="Linked to Jane Doe" />
        </View>

        <Text className="text-lg font-bold text-[#1a1c23] mb-4">Study Habits</Text>

        {/* Daily Study Alarm Notification Card */}
        <View className="bg-white rounded-3xl border border-[#e2e4e9] p-4 mb-6 shadow-sm">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-4">
              <View className="h-10 w-10 rounded-full bg-[#e5efea] items-center justify-center border border-[#29a38b]/20">
                <Bell size={20} color="#29a38b" />
              </View>
              <View>
                <Text className="text-base font-bold text-[#1a1c23]">Daily Study Alarm</Text>
                <Text className="text-sm text-[#737a8d]">Push notification reminder</Text>
              </View>
            </View>
            <Switch 
              value={reminderEnabled} 
              onValueChange={handleToggleReminder}
              trackColor={{ false: "#e2e4e9", true: "#29a38b" }}
            />
          </View>

          {reminderEnabled && (
            <TouchableOpacity 
              onPress={() => setShowTimePicker(true)}
              className="flex-row items-center justify-between bg-[#faf9f4] p-4 rounded-2xl border border-[#e2e4e9]"
            >
              <View className="flex-row items-center gap-3">
                <Clock size={18} color="#737a8d" />
                <Text className="font-semibold text-[#4a4f5c]">Scheduled Time</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="font-bold text-[#29a38b]">{formatAmPm(studyHour, studyMinute)}</Text>
                <ChevronRight size={16} color="#cbd5e1" />
              </View>
            </TouchableOpacity>
          )}
        </View>

        <Text className="text-lg font-bold text-[#1a1c23] mb-4">Systems</Text>
        
        <View className="bg-white rounded-3xl border border-[#e2e4e9] p-2 mb-6 shadow-sm">
          <ProfileLink icon={<Settings size={20} color="#737a8d" />} title="Preferences" />
          <View className="h-[1px] w-full bg-[#f1f2f4]" />
          <TouchableOpacity 
            onPress={handleLogout}
            className="flex-row items-center justify-between p-4"
          >
            <View className="flex-row items-center gap-4">
              <View className="h-10 w-10 rounded-full bg-red-50 items-center justify-center">
                <LogOut size={20} color="#ef4444" />
              </View>
              <Text className="text-base font-semibold text-red-500">Log Out</Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Time Picker Modal */}
      <Modal visible={showTimePicker} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white w-full rounded-t-[40px] p-6 shadow-xl max-h-[80%]">
            <View className="w-12 h-1 bg-[#e2e4e9] self-center rounded-full mb-6" />
            <Text className="text-xl font-bold text-[#1a1c23] mb-6 text-center">Select Study Time</Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-sm font-bold text-[#737a8d] uppercase tracking-widest mb-3 px-2">Hour</Text>
              <View className="flex-row flex-wrap gap-2 mb-6 justify-center">
                {Array.from({ length: 24 }).map((_, h) => (
                  <TouchableOpacity 
                    key={h}
                    onPress={() => setStudyHour(h)}
                    className={`h-11 w-11 items-center justify-center rounded-xl border ${studyHour === h ? 'bg-[#29a38b] border-[#29a38b]' : 'bg-[#faf9f4] border-[#e2e4e9]'}`}
                  >
                    <Text className={`font-bold ${studyHour === h ? 'text-white' : 'text-[#4a4f5c]'}`}>{h % 12 || 12}</Text>
                    <Text className={`text-[8px] ${studyHour === h ? 'text-white/80' : 'text-[#737a8d]'}`}>{h >= 12 ? 'PM' : 'AM'}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="text-sm font-bold text-[#737a8d] uppercase tracking-widest mb-3 px-2">Minute</Text>
              <View className="flex-row flex-wrap gap-2 mb-8 justify-center">
                {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                  <TouchableOpacity 
                    key={m}
                    onPress={() => setStudyMinute(m)}
                    className={`h-11 w-11 items-center justify-center rounded-xl border ${studyMinute === m ? 'bg-[#29a38b] border-[#29a38b]' : 'bg-[#faf9f4] border-[#e2e4e9]'}`}
                  >
                    <Text className={`font-bold ${studyMinute === m ? 'text-white' : 'text-[#4a4f5c]'}`}>{m < 10 ? `0${m}` : m}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity 
                onPress={() => handleTimeSelect(studyHour, studyMinute)} 
                className="bg-[#29a38b] py-4 rounded-2xl items-center shadow-md mb-3"
              >
                <Text className="text-white font-bold text-lg">Save Selection</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowTimePicker(false)} className="py-2 items-center mb-6">
                <Text className="font-bold text-[#737a8d]">Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const ProfileLink = ({ icon, title, subtitle }: { icon: React.ReactNode, title: string, subtitle?: string }) => (
  <TouchableOpacity className="flex-row items-center justify-between p-4">
    <View className="flex-row items-center gap-4">
      <View className="h-10 w-10 rounded-full bg-[#faf9f4] items-center justify-center border border-[#e2e4e9]">
        {icon}
      </View>
      <View>
        <Text className="text-base font-semibold text-[#1a1c23]">{title}</Text>
        {subtitle && <Text className="text-sm text-[#737a8d]">{subtitle}</Text>}
      </View>
    </View>
    <ChevronRight size={20} color="#cbd5e1" />
  </TouchableOpacity>
);
