import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Trophy, Medal, Crown, MessageSquare } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function Leaderboard() {
  const router = useRouter();
  const students = [
    { id: 1, name: "Emmanuel O.", points: 4500, school: "King's College" },
    { id: 2, name: "Aisha F.", points: 4320, school: "Queens College" },
    { id: 3, name: "John D. (You)", points: 4100, school: "Loyola Jesuit" },
    { id: 4, name: "Chinedu M.", points: 3950, school: "Atlantic Hall" },
    { id: 5, name: "Grace B.", points: 3800, school: "Day Waterman" },
  ];

  const myIndex = students.findIndex(s => s.id === 3);

  return (
    <SafeAreaView className="flex-1 bg-[#faf9f4]">
      {/* Header */}
      <View className="p-6 pt-10 bg-[#29a38b] rounded-b-3xl shadow-sm items-center">
        <Trophy size={48} color="#fcd34d" className="mb-4" />
        <Text className="text-3xl font-bold text-white mb-2">Global Leaderboard</Text>
        <Text className="text-[#e5efea] text-center px-4 mb-4">
          Compete with students across Nigeria to earn badges and unlock achievements!
        </Text>
      </View>

      <ScrollView className="flex-1 p-6 pt-8">
        {students.map((student, idx) => {
          const isMe = student.id === 3;
          const isHigher = idx < myIndex;
          let rankColor = "#737a8d";
          let Icon = null;
          
          if (idx === 0) { rankColor = "#eab308"; Icon = Crown; }
          else if (idx === 1) { rankColor = "#9ca3af"; Icon = Medal; }
          else if (idx === 2) { rankColor = "#b45309"; Icon = Medal; }

          return (
            <View 
              key={student.id} 
              className={`flex-row items-center p-4 mb-4 rounded-2xl border ${isMe ? 'border-[#29a38b] bg-[#e5efea]' : 'border-[#e2e4e9] bg-white'}`}
            >
              <View className="w-10 items-center justify-center">
                {Icon ? <Icon size={24} color={rankColor} /> : <Text className="text-lg font-bold text-[#737a8d]">#{idx + 1}</Text>}
              </View>
              
              <View className="ml-4 flex-1">
                <Text className={`text-lg font-bold ${isMe ? 'text-[#29a38b]' : 'text-[#1a1c23]'}`}>{student.name}</Text>
                <Text className="text-sm text-[#737a8d]">{student.school}</Text>
              </View>

              <View className="items-end mr-4">
                <Text className="text-lg font-bold text-[#29a38b]">{student.points}</Text>
                <Text className="text-xs font-semibold text-[#737a8d]">pts</Text>
              </View>

              {isHigher && (
                <TouchableOpacity 
                  onPress={() => router.push(`/chat/${student.id}`)}
                  className="bg-[#29a38b] p-2 rounded-full"
                >
                  <MessageSquare size={20} color="white" />
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
