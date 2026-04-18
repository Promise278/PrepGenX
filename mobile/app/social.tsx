import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Swords, Trophy, ChevronRight, Brain, Sparkles } from 'lucide-react-native';
import { fetchWithAuth } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function SocialScreen() {
  const { friendId, name } = useLocalSearchParams();
  const router = useRouter();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [myId, setMyId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;
        setMyId(user?.id);

        const subRes = await fetchWithAuth("/exams/subjects");
        const subData = await subRes.json();
        if (subData.success) {
          setSubjects(subData.subjects);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSendChallenge = async (subjectId: string, subjectName: string) => {
    if (!friendId || !myId) return;

    setCreating(true);
    try {
      const res = await fetchWithAuth("/social/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengerId: myId,
          challengedId: friendId,
          subjectId: subjectId,
          topic: `Mixed ${subjectName} Finals`
        })
      });

      const data = await res.json();
      if (data.success) {
        Alert.alert("Challenge Sent!", `You've challenged ${name} to a ${subjectName} battle. 50 bonus points if you win!`);
        router.back();
      } else {
        Alert.alert("Failed", "Could not send challenge. Try again.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Network error.");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
     return <View className="flex-1 bg-[#0d1f1a] items-center justify-center"><ActivityIndicator color="#29a38b" size="large" /></View>;
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0d1f1a]">
      {/* Header */}
      <View className="px-6 py-8 bg-[#162c26] rounded-b-[40px] items-center border-b border-white/5 shadow-2xl">
        <View className="h-16 w-16 bg-[#29a38b]/20 rounded-full items-center justify-center mb-4 border border-[#29a38b]/30">
           <Swords size={32} color="#29a38b" />
        </View>
        <Text className="text-2xl font-black text-white uppercase tracking-tighter">Challenge Friend</Text>
        <Text className="text-[#29a38b] font-bold text-sm mt-1 uppercase tracking-widest">{name}</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-8" showsVerticalScrollIndicator={false}>
        <Text className="text-white/40 text-[10px] font-black uppercase tracking-[3px] mb-6">Select Battle Ground</Text>
        
        {subjects.map((sub, idx) => (
          <TouchableOpacity 
            key={sub.id || idx}
            onPress={() => handleSendChallenge(sub.id, sub.name)}
            disabled={creating}
            className="bg-[#162c26] mb-4 p-5 rounded-3xl border border-white/5 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-4">
              <View className="h-12 w-12 bg-[#0d1f1a] rounded-2xl items-center justify-center border border-white/10">
                 <Brain size={24} color="#29a38b" />
              </View>
              <View>
                <Text className="text-white font-bold text-lg">{sub.name}</Text>
                <Text className="text-white/40 text-xs">Standard Exam Mode</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#29a38b" />
          </TouchableOpacity>
        ))}

        <View className="bg-[#29a38b]/10 p-6 rounded-[32px] border border-[#29a38b]/30 mt-8 mb-12">
           <View className="flex-row items-center gap-3 mb-4">
              <Sparkles size={20} color="#29a38b" />
              <Text className="text-lg font-black text-white">Winner&apos;s Reward</Text>
           </View>
           <Text className="text-white/70 leading-6 mb-4 font-medium">
             Win this challenge to earn <Text className="text-[#29a38b] font-black">+50 bonus points</Text> and move up the national leaderboard.
           </Text>
           <View className="flex-row items-center gap-2">
              <Trophy size={16} color="#fcd34d" />
              <Text className="text-[#fcd34d] font-black uppercase tracking-widest text-[10px]">Outcome Driven Excellence</Text>
           </View>
        </View>
      </ScrollView>

      {creating && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center">
           <ActivityIndicator size="large" color="#29a38b" />
           <Text className="text-white font-bold mt-4">Drafting Challenge...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}
