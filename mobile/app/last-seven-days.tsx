import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Flame, Brain, Shield, ChevronLeft, Zap, Target } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function LastSevenDays() {
  const router = useRouter();

  const highYieldTopics = [
    { subject: 'Mathematics', topic: 'Integration by Parts', frequency: 'Seen 8x', prediction: '95% Likely' },
    { subject: 'English', topic: 'Concord & Tense', frequency: 'Seen 12x', prediction: '100% Likely' },
    { subject: 'Physics', topic: 'Radioactivity', frequency: 'Seen 6x', prediction: '88% Likely' },
    { subject: 'Chemistry', topic: 'Redox Reactions', frequency: 'Seen 9x', prediction: '92% Likely' }
  ];

  const handleShareResult = async () => {
    try {
      await Share.share({
        message: "I'm using PrepGenX 'Last 7 Days' Mode to crush JAMB! 83% Ready. Get it now! 🔥",
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#2c0d0d]">
      {/* Header */}
      <View className="px-6 py-8 bg-[#3d1212] border-b border-white/5 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 bg-white/10 rounded-full items-center justify-center">
           <ChevronLeft size={24} color="white" />
        </TouchableOpacity>
        <View className="items-center">
          <Text className="text-white/40 text-[10px] font-black uppercase tracking-[3px] mb-1">Viral Mode</Text>
          <Text className="text-2xl font-black text-white tracking-tighter uppercase italic">LAST 7 DAYS</Text>
        </View>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-6 pt-8" showsVerticalScrollIndicator={false}>
        {/* High Stakes Banner */}
        <Animated.View entering={FadeInDown.duration(600)} className="bg-red-600 p-6 rounded-[32px] border-2 border-red-400 mb-8 shadow-2xl shadow-red-600/50">
           <View className="flex-row items-center gap-3 mb-4">
              <Flame size={24} color="white" />
              <Text className="text-xl font-black text-white">Result Machine Active</Text>
           </View>
           <Text className="text-white/90 font-medium leading-5 mb-6">
             We have filtered 1,200 topics down to the <Text className="text-white font-black underline">Top 20</Text> that will determine your score this week.
           </Text>
           <View className="bg-white/20 h-1.5 w-full rounded-full overflow-hidden">
               <View className="h-full bg-white w-full" />
           </View>
        </Animated.View>

        <Text className="text-white/40 text-[10px] font-black uppercase tracking-[3px] mb-6">High-Yield Priority</Text>

        {highYieldTopics.map((item, idx) => (
           <Animated.View 
             key={idx} 
             entering={FadeInDown.delay(idx * 100)}
             className="bg-[#3d1212] p-5 rounded-3xl mb-4 border border-white/5 flex-row items-center justify-between"
           >
              <View className="flex-row items-center gap-4">
                 <View className="h-12 w-12 bg-red-600/20 rounded-2xl items-center justify-center border border-red-600/30">
                    <Target size={24} color="#f87171" />
                 </View>
                 <View>
                    <Text className="text-white font-black text-lg">{item.topic}</Text>
                    <Text className="text-red-400 font-bold text-xs uppercase tracking-widest">{item.subject}</Text>
                 </View>
              </View>
              <View className="items-end">
                 <Text className="text-white font-black text-[10px] uppercase tracking-widest">{item.frequency}</Text>
                 <Text className="text-green-400 font-black text-xs">{item.prediction}</Text>
              </View>
           </Animated.View>
        ))}

        {/* Action: Quick Study AI */}
        <TouchableOpacity 
          onPress={() => router.push('/(tabs)/ai-tutor')}
          className="bg-white p-6 rounded-[32px] mt-8 mb-4 items-center flex-row justify-center gap-3"
        >
           <Brain size={24} color="#2c0d0d" />
           <Text className="text-[#2c0d0d] font-black text-lg uppercase tracking-tight">Rapid AI Drill</Text>
        </TouchableOpacity>

        {/* Viral Share */}
        <TouchableOpacity 
          onPress={handleShareResult}
          className="border border-white/20 p-5 rounded-[32px] mb-12 items-center flex-row justify-center gap-3"
        >
           <Zap size={20} color="white" />
           <Text className="text-white font-black text-sm uppercase tracking-widest">Share My Readiness</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Footer Disclaimer */}
      <View className="px-10 pb-12 items-center">
         <View className="flex-row items-center gap-2 mb-2">
            <Shield size={12} color="#f87171" />
            <Text className="text-red-400/60 font-black text-[8px] uppercase tracking-widest text-center">Score Guarantee Prediction Engine</Text>
         </View>
         <Text className="text-white/20 text-[6px] uppercase tracking-widest text-center">BASED ON 10 YEARS OF HISTORICAL DATA & PATTERN ANALYSIS</Text>
      </View>
    </SafeAreaView>
  );
}
