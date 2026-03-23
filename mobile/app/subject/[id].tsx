import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, BookOpen, CheckCircle, Circle, Play } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";

export default function SubjectSyllabus() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); 

  // Authentic WAEC/JAMB Standard Syllabus Data
  const syllabusData = {
    Mathematics: {
      mastery: 45,
      chapters: [
        { title: "Number Bases & Fractions", duration: "1 week", completed: true },
        { title: "Indices, Logarithms & Surds", duration: "2 weeks", completed: true },
        { title: "Sets, Relations & Functions", duration: "2 weeks", completed: true },
        { title: "Polynomials & Quadratic Equations", duration: "3 weeks", completed: false },
        { title: "Matrices & Determinants", duration: "1 week", completed: false },
        { title: "Coordinate Geometry", duration: "2 weeks", completed: false },
        { title: "Trigonometry", duration: "2 weeks", completed: false },
        { title: "Calculus (Differentiation & Integration)", duration: "4 weeks", completed: false },
        { title: "Statistics & Probability", duration: "2 weeks", completed: false }
      ]
    },
    Physics: {
      mastery: 72,
      chapters: [
        { title: "Measurements, Units & Dimensions", duration: "1 week", completed: true },
        { title: "Kinematics (Motion in 1D & 2D)", duration: "2 weeks", completed: true },
        { title: "Dynamics (Newton's Laws & Friction)", duration: "2 weeks", completed: true },
        { title: "Work, Energy & Power", duration: "1 week", completed: true },
        { title: "Heat & Thermodynamics", duration: "3 weeks", completed: false },
        { title: "Waves, Sound & Optics", duration: "4 weeks", completed: false },
        { title: "Electrostatics & Capacitors", duration: "2 weeks", completed: false },
        { title: "Electromagnetic Induction", duration: "2 weeks", completed: false },
        { title: "Modern Physics & Radioactivity", duration: "2 weeks", completed: false }
      ]
    },
    English: {
      mastery: 88,
      chapters: [
        { title: "Comprehension & Summary", duration: "Ongoing", completed: true },
        { title: "Lexis: Synonyms & Antonyms", duration: "Ongoing", completed: true },
        { title: "Oral English: Vowels & Consonants", duration: "2 weeks", completed: true },
        { title: "Oral English: Syllabic Stress & Intonation", duration: "2 weeks", completed: true },
        { title: "Grammar: Concord & Tenses", duration: "3 weeks", completed: false },
        { title: "Grammar: Phrases & Clauses", duration: "2 weeks", completed: false },
        { title: "Literature: Poetry & Prose Analysis", duration: "4 weeks", completed: false }
      ]
    },
    Chemistry: {
      mastery: 55,
      chapters: [
        { title: "Particulate Nature of Matter & Atomic Structure", duration: "2 weeks", completed: true },
        { title: "Periodic Table & Periodicity", duration: "1 week", completed: true },
        { title: "Chemical Bonding", duration: "2 weeks", completed: true },
        { title: "Stoichiometry & Chemical Equations", duration: "3 weeks", completed: false },
        { title: "States of Matter (Gas Laws)", duration: "2 weeks", completed: false },
        { title: "Acids, Bases & Salts", duration: "2 weeks", completed: false },
        { title: "Chemical Kinetics & Equilibrium", duration: "3 weeks", completed: false },
        { title: "Electrochemistry & Redox Reactions", duration: "2 weeks", completed: false },
        { title: "Organic Chemistry", duration: "5 weeks", completed: false }
      ]
    }
  };

  const subjectName = typeof id === 'string' ? id : "Mathematics";
  const data = syllabusData[subjectName as keyof typeof syllabusData] || syllabusData["Mathematics"];

  return (
    <SafeAreaView className="flex-1 bg-[#faf9f4]" edges={['top']}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center border-b border-[#e2e4e9] bg-white">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-[#f1f2f4] mr-4"
        >
          <ArrowLeft size={20} color="#1a1c23" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#1a1c23]">{subjectName} Syllabus</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        
        {/* Progress Overview Card */}
        <View className="bg-[#29a38b] rounded-3xl p-6 shadow-sm mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-white/80 font-medium text-sm tracking-wide uppercase">Current Mastery</Text>
              <Text className="text-white font-bold text-4xl mt-1">{data.mastery}%</Text>
            </View>
            <View className="h-14 w-14 rounded-full bg-white/20 items-center justify-center">
              <BookOpen size={28} color="white" />
            </View>
          </View>

          <View className="h-2 w-full rounded-full bg-white/20 overflow-hidden mb-5">
            <View 
              className="h-full rounded-full bg-[#fcd34d]" 
              style={{ width: `${data.mastery}%` }}
            />
          </View>

          <TouchableOpacity 
            onPress={() => router.push("/(tabs)/ai-tutor")}
            className="flex-row items-center justify-center bg-white rounded-xl py-3 shadow-sm"
          >
            <Play size={16} color="#29a38b" className="mr-2" />
            <Text className="font-bold text-[#29a38b]">Resume Learning with AI</Text>
          </TouchableOpacity>
        </View>

        {/* Topics List */}
        <Text className="text-xl font-bold tracking-tight text-[#1a1c23] mb-4">Topics Covered</Text>
        
        <View className="bg-white rounded-3xl border border-[#e2e4e9] p-2 shadow-sm">
          {data.chapters.map((chapter, index) => (
            <View key={index}>
              <TouchableOpacity className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center flex-1 pr-4">
                  {chapter.completed ? (
                    <CheckCircle size={24} color="#29a38b" />
                  ) : (
                    <Circle size={24} color="#cbd5e1" />
                  )}
                  <View className="ml-4 flex-1">
                    <Text className={`text-base font-semibold ${chapter.completed ? 'text-[#1a1c23]' : 'text-[#4a4f5c]'}`}>
                      {chapter.title}
                    </Text>
                    <Text className="text-xs text-[#737a8d] mt-1">{chapter.duration}</Text>
                  </View>
                </View>
                {!chapter.completed && (
                  <View className="bg-[#e5efea] px-3 py-1 rounded-full">
                    <Text className="text-xs font-bold text-[#29a38b]">Study</Text>
                  </View>
                )}
              </TouchableOpacity>
              
              {/* Separator line */}
              {index < data.chapters.length - 1 && (
                <View className="h-[1px] w-full bg-[#f1f2f4]" />
              )}
            </View>
          ))}
        </View>

      </ScrollView>

    </SafeAreaView>
  );
}
