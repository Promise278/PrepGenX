import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, ChevronRight, Brain } from 'lucide-react-native';
import { fetchWithAuth } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function StudyPlanScreen() {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(0);

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;
        if (!user) return;

        const res = await fetchWithAuth(`/study-plan/${user.id}`);
        const data = await res.json();
        if (data.success) {
          setPlan(data.studyPlan.planData);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadPlan();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-[#0d1f1a] items-center justify-center">
        <ActivityIndicator color="#29a38b" size="large" />
      </View>
    );
  }

  if (!plan) {
    return (
      <SafeAreaView className="flex-1 bg-[#0d1f1a] px-6 justify-center">
        <View className="items-center">
          <Calendar size={64} color="#737a8d" className="mb-6 opacity-20" />
          <Text className="text-white text-2xl font-bold text-center mb-4">No Study Plan Active</Text>
          <Text className="text-[#737a8d] text-center mb-10 leading-6">
            Take a diagnostic test to generate your personalized AI-driven study roadmap.
          </Text>
          <TouchableOpacity 
            className="w-full bg-[#29a38b] py-5 rounded-2xl items-center"
            onPress={() => router.push('/mock-exam')}
          >
             <Text className="text-white font-bold text-lg">Take Diagnostic Test</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentWeek = plan.weeklyPlans[selectedWeek];

  return (
    <SafeAreaView className="flex-1 bg-[#0d1f1a]">
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-white/5 bg-[#162c26]">
        <View>
          <Text className="text-sm font-bold text-[#29a38b] uppercase tracking-widest">AI Roadmap</Text>
          <Text className="text-2xl font-black text-white">Study Plan</Text>
        </View>
        <TouchableOpacity className="h-10 w-10 bg-white/5 rounded-full items-center justify-center">
           <Brain size={20} color="#29a38b" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        {/* Weekly Tabs */}
        <View className="flex-row gap-3 mb-8">
          {plan.weeklyPlans.map((w: any, idx: number) => (
            <TouchableOpacity 
              key={idx}
              onPress={() => setSelectedWeek(idx)}
              className={`px-4 py-2 rounded-full border ${selectedWeek === idx ? 'bg-[#29a38b] border-[#29a38b]' : 'bg-transparent border-white/10'}`}
            >
              <Text className={`font-bold ${selectedWeek === idx ? 'text-white' : 'text-[#737a8d]'}`}>Week {w.week}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Weekly Focus */}
        <View className="bg-[#162c26] p-6 rounded-3xl border border-white/5 mb-8">
          <Text className="text-[#29a38b] text-[10px] font-black uppercase tracking-widest mb-2">Weekly Goal</Text>
          <Text className="text-white text-lg font-bold leading-7">
            {currentWeek.focus}
          </Text>
        </View>

        {/* Daily Tasks */}
        <Text className="text-white text-xl font-black mb-6 uppercase tracking-tighter">Your Schedule</Text>
        
        {currentWeek.dailyTasks.map((task: any, idx: number) => (
          <View key={idx} className="mb-4 flex-row">
            <View className="items-center mr-4">
               <View className="h-10 w-10 rounded-full bg-[#162c26] border border-white/10 items-center justify-center">
                  <Text className="text-white font-bold">{task.day}</Text>
               </View>
               {idx !== currentWeek.dailyTasks.length - 1 && <View className="w-[1px] flex-1 bg-white/10 my-1" />}
            </View>
            <TouchableOpacity className="flex-1 bg-[#162c26] p-5 rounded-2xl border border-white/5 flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <Text className="text-white font-bold text-base mb-1">{task.task}</Text>
                <Text className="text-[#737a8d] text-xs">Practice: {task.practice}</Text>
              </View>
              <ChevronRight size={18} color="#29a38b" />
            </TouchableOpacity>
          </View>
        ))}

        <View className="h-20" />
      </ScrollView>

      {/* Static Summary Footer */}
      <View className="px-6 py-6 border-t border-white/5 bg-[#162c26]">
        <Text className="text-[#737a8d] text-xs font-medium mb-1">Overall Guidance</Text>
        <Text className="text-white text-sm font-medium leading-5" numberOfLines={2}>
          {plan.summary}
        </Text>
      </View>
    </SafeAreaView>
  );
}
