import React from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Trophy, Medal, Crown, Swords } from "lucide-react-native";
import { useRouter } from "expo-router";
import { fetchWithAuth } from "../../utils/api";

export default function Leaderboard() {
  const router = useRouter();
  const [students, setStudents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [myId, setMyId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const [lbRes, meRes] = await Promise.all([
          fetchWithAuth("/auth/leaderboard"), // Use fetchWithAuth for consistency
          fetchWithAuth("/auth/me")
        ]);
        
        const lbData = await lbRes.json();
        const meData = await meRes.json();
        
        if (lbData.success) {
          setStudents(lbData.data);
        }
        if (meData.success) {
          setMyId(meData.data.id);
        }
      } catch (e) {
        console.error("Leaderboard error:", e);
      } finally {
        setLoading(false);
      }
    };
    loadLeaderboard();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#0d1f1a]">
      {/* Header */}
      <View className="px-6 pt-10 pb-8 bg-[#162c26] rounded-b-[40px] shadow-2xl items-center border-b border-white/5">
        <View className="h-20 w-20 bg-[#29a38b]/10 rounded-full items-center justify-center mb-4 border border-[#29a38b]/20">
          <Trophy size={40} color="#fcd34d" />
        </View>
        <Text className="text-3xl font-black text-white mb-2 tracking-tighter uppercase">Elite Rankings</Text>
        <Text className="text-[#29a38b] font-bold tracking-[2px] uppercase text-[10px] mb-4">
          Nigeria National Standings
        </Text>
      </View>

      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="py-20 items-center justify-center">
             <ActivityIndicator color="#29a38b" size="large" />
          </View>
        ) : (
          students.map((student, idx) => {
            const isMe = student.id === myId;
            let rankColor = "#737a8d";
            let Icon = null;
            
            if (idx === 0) { rankColor = "#fcd34d"; Icon = Crown; }
            else if (idx === 1) { rankColor = "#e2e4e9"; Icon = Medal; }
            else if (idx === 2) { rankColor = "#b45309"; Icon = Medal; }

            return (
              <View 
                key={student.id} 
                className={`flex-row items-center p-5 mb-4 rounded-[28px] border ${isMe ? 'border-[#29a38b] bg-[#29a38b]/10' : 'border-white/5 bg-[#162c26]'}`}
              >
                <View className="w-10 items-center justify-center">
                  {Icon ? <Icon size={24} color={rankColor} /> : <Text className="text-lg font-black text-white/30">#{idx + 1}</Text>}
                </View>
                
                <View className="ml-4 flex-1">
                  <Text className={`text-lg font-bold ${isMe ? 'text-[#29a38b]' : 'text-white'}`} numberOfLines={1}>
                    {student.fullname}
                  </Text>
                  <Text className="text-xs font-bold text-white/40 uppercase tracking-widest">{isMe ? "You are here" : `Elite Candidate`}</Text>
                </View>

                <View className="items-end mr-4">
                  <Text className="text-lg font-black text-[#29a38b] tracking-tighter">{student.points}</Text>
                  <Text className="text-[10px] font-black text-white/30 uppercase tracking-[2px]">pts</Text>
                </View>

                {!isMe && (
                  <TouchableOpacity 
                    onPress={() => router.push(`/social?friendId=${student.id}&name=${encodeURIComponent(student.fullname)}` as any)}
                    className="bg-[#29a38b] h-10 w-10 rounded-full items-center justify-center shadow-lg shadow-[#29a38b]/40"
                  >
                    <Swords size={20} color="white" />
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
