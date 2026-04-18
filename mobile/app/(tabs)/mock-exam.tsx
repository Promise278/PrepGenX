import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BookOpen, Clock, CheckCircle, XCircle, AlertCircle, ChevronRight, Award, ShieldAlert, ArrowLeft, ArrowRight } from "lucide-react-native";
import { useFocusEffect } from "expo-router";
import { fetchWithAuth } from "../../utils/api";

type ExamType = "JAMB" | "WAEC" | "NECO";

const AVAILABLE_SUBJECTS = [
  "Use of English", "Mathematics", "Physics", "Chemistry", "Biology", "Economics", "Government", "Literature"
];

const EXAM_STANDARDS = {
  JAMB: { 
    timeLimitSeconds: 7200, // 2 hours
    totalQuestions: 180, // English 60, + 3 others 40 each
    subjectsRequired: 4 
  },
  WAEC: { 
    timeLimitSeconds: 5400, // 1 hour 30 mins
    totalQuestions: 50, // Standard OBJ
    subjectsRequired: 1 
  },
  NECO: { 
    timeLimitSeconds: 5400, // 1 hour 30 mins
    totalQuestions: 60,
    subjectsRequired: 1 
  }
};

export default function MockExam() {
  const [examState, setExamState] = useState<'SELECTION' | 'SUBJECT_SELECTION' | 'IN_PROGRESS' | 'RESULTS' | 'REVIEW'>('SELECTION');
  const [selectedExamType, setSelectedExamType] = useState<ExamType | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [score, setScore] = useState(0);
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [timeSlabs, setTimeSlabs] = useState<number[]>([]); // To track time spent per question
  
  const [breakdown, setBreakdown] = useState<{ careless: number, gaps: string[] } | null>(null);
  const customTimeMinutes = null;

  const subjectScrollRef = useRef<ScrollView>(null);

  // Auto-Submit if user leaves the tab during an active exam (Anti-Cheating)
  useFocusEffect(
    useCallback(() => {
      return () => {
        if (examState === 'IN_PROGRESS') {
          handleAutoSubmit();
        }
      };
    }, [examState])
  );

  const handleAutoSubmit = () => {
    setTimerActive(false);
    setExamState('RESULTS');
  };

  const finishExam = useCallback(() => {
    setTimerActive(false);
    
    // Calculate Breakdown
    let carelessCount = 0;
    const gaps: Set<string> = new Set();

    questions.forEach((q, idx) => {
      const userAns = answers[idx];
      if (userAns !== null && userAns !== q.correctIdx) {
        // If they missed it and spent < 10 seconds or it's a "mastered" subject
        if (timeSlabs[idx] < 10) {
          carelessCount++;
        } else {
          gaps.add(`${q.subject}: ${q.topic || 'Fundamentals'}`);
        }
      }
    });

    setBreakdown({ careless: carelessCount, gaps: Array.from(gaps).slice(0, 3) });
    setExamState('RESULTS');
  }, [answers, questions, timeSlabs]);

  // Timer Effect
  useEffect(() => {
    let interval: any;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && examState === 'IN_PROGRESS') {
      finishExam();
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, examState, finishExam]);

  const selectExamType = (type: ExamType) => {
    setSelectedExamType(type);
    setSelectedSubjects([]);
    setExamState('SUBJECT_SELECTION');
  };

  const toggleSubject = (subject: string) => {
    if (!selectedExamType) return;
    const rules = EXAM_STANDARDS[selectedExamType];

    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(prev => prev.filter(s => s !== subject));
    } else {
      if (selectedSubjects.length < rules.subjectsRequired) {
        setSelectedSubjects(prev => [...prev, subject]);
      } else {
        Alert.alert("Maximum Limit Reached", `You can only select exactly ${rules.subjectsRequired} subject(s) for ${selectedExamType}.`);
      }
    }
  };

  const generateMockQuestions = async (totalQ: number, subjects: string[]) => {
    try {
      const res = await fetchWithAuth("/exams/mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjects, totalQuestions: totalQ })
      });
      const data = await res.json();
      if (data.success && data.questions) {
        return data.questions;
      }
      return [];
    } catch (error) {
       console.error("Failed to fetch mock exam", error);
       return [];
    }
  };

  const startExam = async () => {
    if (!selectedExamType) return;
    const rules = EXAM_STANDARDS[selectedExamType];

    if (selectedSubjects.length !== rules.subjectsRequired) {
      Alert.alert("Incomplete Selection", `Please select exactly ${rules.subjectsRequired} subject(s).`);
      return;
    }

    const generatedQs = await generateMockQuestions(rules.totalQuestions, selectedSubjects);
    
    if (generatedQs.length === 0) {
      Alert.alert("No Questions Found", "We couldn't generate a mock exam for the selected subjects. They may not have questions in the database yet.");
      return;
    }

    setQuestions(generatedQs);
    setAnswers(new Array(generatedQs.length).fill(null));
    setCurrentQuestionIdx(0);
    setScore(0);
    
    const finalTimeSeconds = customTimeMinutes ? customTimeMinutes * 60 : rules.timeLimitSeconds;
    setTimeLeft(finalTimeSeconds);
    
    setTimerActive(true);
    setExamState('IN_PROGRESS');
    setQuestionStartTime(Date.now());
    setTimeSlabs(new Array(generatedQs.length).fill(0));
  };

  const jumpToSubject = (subject: string) => {
    const firstIdx = questions.findIndex(q => q.subject === subject);
    if (firstIdx !== -1) {
      setCurrentQuestionIdx(firstIdx);
    }
  };

  const handleAnswer = (selectedIdx: number) => {
    const updatedAnswers = [...answers];
    const isCorrect = selectedIdx === questions[currentQuestionIdx].correctIdx;

    if (updatedAnswers[currentQuestionIdx] === null) {
      if (isCorrect) setScore(prev => prev + 1);
    } else {
      const previouslyCorrect = updatedAnswers[currentQuestionIdx] === questions[currentQuestionIdx].correctIdx;
      if (previouslyCorrect && !isCorrect) setScore(prev => prev - 1);
      if (!previouslyCorrect && isCorrect) setScore(prev => prev + 1);
    }

    updatedAnswers[currentQuestionIdx] = selectedIdx;
    setAnswers(updatedAnswers);

    // Record time spent on this question
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const updatedSlabs = [...timeSlabs];
    updatedSlabs[currentQuestionIdx] = (updatedSlabs[currentQuestionIdx] || 0) + timeSpent;
    setTimeSlabs(updatedSlabs);
    setQuestionStartTime(Date.now());

    // Auto next question
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    }
  };


  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}h ${m}m ${s}s`;
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // ------------------------------------------------------------------------------------------------ //
  // RENDER SELECTION STATE
  // ------------------------------------------------------------------------------------------------ //

  if (examState === 'SELECTION') {
    return (
      <SafeAreaView className="flex-1 bg-[#faf9f4]" edges={['top']}>
        <View className="px-6 py-6 border-b border-[#e2e4e9] bg-white shadow-sm">
          <Text className="text-sm font-medium text-[#737a8d] uppercase tracking-wider mb-1">Testing Center</Text>
          <Text className="text-3xl font-bold tracking-tight text-[#1a1c23]">Simulated Exams</Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
          {/* Awesome Anti-Cheat Warning */}
          <View className="bg-red-50 border border-red-200 rounded-3xl p-5 shadow-sm mb-6 flex-row items-start gap-4">
            <ShieldAlert size={28} color="#ef4444" />
            <View className="flex-1">
              <Text className="font-bold text-red-700 text-lg mb-1">Anti-Cheating Active</Text>
              <Text className="text-red-600/90 text-sm leading-5">
                Once an exam starts, leaving the PrepGenx app or switching tabs will <Text className="font-bold text-red-700">immediately auto-submit</Text> your exam for scoring.
              </Text>
            </View>
          </View>

          <Text className="text-base font-bold text-[#1a1c23] mb-4">Select Exam Standard</Text>

          {/* Exam Cards */}
          {(["JAMB", "WAEC", "NECO"] as ExamType[]).map(type => (
            <TouchableOpacity 
              key={type}
              onPress={() => selectExamType(type)}
              className="bg-white rounded-3xl border border-[#e2e4e9] p-5 shadow-sm mb-4 flex-row items-center"
            >
              <View className={`h-16 w-16 rounded-2xl items-center justify-center mr-4 ${type==='JAMB'? 'bg-green-50' : type==='WAEC'?'bg-blue-50':'bg-orange-50'}`}>
                <Text className={`font-extrabold text-xl ${type==='JAMB'?'text-green-700':type==='WAEC'?'text-blue-700':'text-orange-700'}`}>{type==='JAMB'?'CBT':type}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-[#1a1c23] mb-1">{type} Standard</Text>
                <Text className="text-sm text-[#737a8d]">{EXAM_STANDARDS[type].subjectsRequired} Subjects • {EXAM_STANDARDS[type].totalQuestions} Questions</Text>
              </View>
              <ChevronRight size={24} color="#cbd5e1" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ------------------------------------------------------------------------------------------------ //
  // RENDER SUBJECT SELECTION STATE
  // ------------------------------------------------------------------------------------------------ //

  if (examState === 'SUBJECT_SELECTION') {
    const rules = EXAM_STANDARDS[selectedExamType!];

    return (
      <SafeAreaView className="flex-1 bg-[#faf9f4]" edges={['top']}>
        <View className="px-6 py-6 border-b border-[#e2e4e9] bg-white shadow-sm flex-row items-center justify-between">
          <View>
            <Text className="text-sm font-medium text-[#737a8d] uppercase tracking-wider mb-1">{selectedExamType} Registration</Text>
            <Text className="text-2xl font-bold tracking-tight text-[#1a1c23]">Pick Subjects</Text>
          </View>
          <View className="bg-[#e5efea] px-4 py-2 rounded-xl">
            <Text className="font-bold text-[#29a38b]">{selectedSubjects.length} / {rules.subjectsRequired}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
          <Text className="text-base font-medium text-[#4a4f5c] mb-6">
            For the {selectedExamType} mock, you are strictly required to choose exactly <Text className="font-bold text-[#1a1c23]">{rules.subjectsRequired} subject(s)</Text>.
          </Text>

          <View className="flex-row flex-wrap justify-between gap-y-4">
            {AVAILABLE_SUBJECTS.map((subject) => {
              const isSelected = selectedSubjects.includes(subject);
              return (
                <TouchableOpacity
                  key={subject}
                  onPress={() => toggleSubject(subject)}
                  className={`w-[48%] rounded-2xl border-2 p-4 flex-row items-center justify-between shadow-sm ${
                    isSelected ? 'border-[#29a38b] bg-[#e5efea]' : 'border-[#e2e4e9] bg-white'
                  }`}
                >
                  <Text className={`font-bold ${isSelected ? 'text-[#29a38b]' : 'text-[#1a1c23]'}`}>
                    {subject}
                  </Text>
                  {isSelected && <CheckCircle size={18} color="#29a38b" />}
                </TouchableOpacity>
              );
            })}
          </View>

    
          <TouchableOpacity 
            onPress={startExam}
            disabled={selectedSubjects.length !== rules.subjectsRequired}
            className={`mt-10 mx-auto w-full rounded-2xl py-4 items-center shadow-md ${
              selectedSubjects.length === rules.subjectsRequired ? 'bg-[#29a38b]' : 'bg-[#e2e4e9]'
            }`}
          >
            <Text className={`text-lg font-bold ${selectedSubjects.length === rules.subjectsRequired ? 'text-white' : 'text-[#a0aabf]'}`}>
              Begin Exam
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setExamState('SELECTION')}
            className="mt-4 mx-auto py-3"
          >
            <Text className="font-semibold text-[#737a8d]">Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ------------------------------------------------------------------------------------------------ //
  // RENDER IN_PROGRESS STATE
  // ------------------------------------------------------------------------------------------------ //

  if (examState === 'IN_PROGRESS') {
    const q = questions[currentQuestionIdx];
    const currentSubj = q.subject;

    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
        {/* Exam Header */}
        <View className="px-6 py-3 flex-row items-center justify-between bg-[#1a1c23]">
          <View>
            <Text className="text-xs font-bold text-white/70 uppercase tracking-widest">{selectedExamType} EXAM</Text>
            <Text className="text-lg font-bold text-white">Q {currentQuestionIdx + 1} / {questions.length}</Text>
          </View>
          <View className="flex-row items-center bg-red-500/20 px-3 py-1.5 rounded-lg border border-red-500/30">
            <Clock size={16} color="#fca5a5" className="mr-2" />
            <Text className="font-bold text-red-300 text-base">{formatTime(timeLeft)}</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View className="w-full h-1 bg-[#2d313c]">
          <View 
            className="h-full bg-[#29a38b]" 
            style={{ width: `${((currentQuestionIdx) / questions.length) * 100}%` }} 
          />
        </View>

        {/* Subject Navigation Tabs */}
        <View className="bg-white border-b border-[#e2e4e9]">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
            ref={subjectScrollRef}
          >
            {selectedSubjects.map(subj => {
              const isActive = subj === currentSubj;
              
              // Find how many questions answered for this subject
              const subjQuestions = questions.map((q, i) => ({ q, idx: i })).filter(item => item.q.subject === subj);
              const answeredCount = subjQuestions.filter(item => answers[item.idx] !== null).length;
              const totalSubjQs = subjQuestions.length;

              return (
                <TouchableOpacity 
                  key={subj}
                  onPress={() => jumpToSubject(subj)}
                  className={`mr-3 px-4 py-2 rounded-full border flex-row items-center ${isActive ? 'bg-[#29a38b] border-[#29a38b]' : 'bg-[#f1f2f4] border-[#e2e4e9]'}`}
                >
                  <Text className={`font-bold mr-2 ${isActive ? 'text-white' : 'text-[#1a1c23]'}`}>{subj}</Text>
                  <View className={`px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-white'}`}>
                    <Text className={`text-xs font-bold ${isActive ? 'text-white' : 'text-[#737a8d]'}`}>{answeredCount}/{totalSubjQs}</Text>
                  </View>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>

        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
          <View className="mb-8">
            <Text className="text-sm font-bold tracking-widest text-[#29a38b] uppercase mb-2">{q.subject}</Text>
            <Text className="text-xl font-semibold text-[#1a1c23] leading-8">{q.question}</Text>
          </View>

          <View className="gap-3 mb-10">
            {q.options.map((opt: string, idx: number) => {
              const isSelected = answers[currentQuestionIdx] === idx;
              return (
                <TouchableOpacity 
                  key={idx}
                  onPress={() => handleAnswer(idx)}
                  className={`flex-row items-center border-2 rounded-2xl p-4 shadow-sm ${
                    isSelected ? 'border-[#29a38b] bg-[#e5efea]' : 'border-[#e2e4e9] bg-white'
                  }`}
                >
                  <View className={`h-8 w-8 rounded-full border items-center justify-center mr-4 ${
                    isSelected ? 'border-[#29a38b] bg-[#29a38b]' : 'border-[#cbd5e1] bg-[#faf9f4]'
                  }`}>
                    <Text className={`font-bold ${isSelected ? 'text-white' : 'text-[#737a8d]'}`}>{['A', 'B', 'C', 'D'][idx]}</Text>
                  </View>
                  <Text className={`text-lg font-medium flex-1 ${isSelected ? 'text-[#29a38b]' : 'text-[#1a1c23]'}`}>{opt}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
          
          <View className="flex-row justify-between w-full">
             <TouchableOpacity 
              onPress={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIdx === 0}
              className={`bg-[#f1f2f4] px-6 py-3 rounded-xl border border-[#e2e4e9] ${currentQuestionIdx === 0 ? 'opacity-50' : ''}`}
            >
              <Text className="font-bold text-[#4a4f5c]">Previous</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => finishExam()}
              className="bg-red-50 border border-red-200 px-6 py-3 rounded-xl flex-row items-center"
            >
              <Text className="font-bold text-red-600">Submit Exam</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ------------------------------------------------------------------------------------------------ //
  // RENDER RESULTS STATE
  // ------------------------------------------------------------------------------------------------ //
  
  if (examState === 'RESULTS') {
    const percentage = Math.round((score / questions.length) * 100) || 0;
    const passed = percentage >= 50;
    const isJamb = selectedExamType === "JAMB";

    return (
      <SafeAreaView className="flex-1 bg-[#faf9f4]" edges={['top']}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100, alignItems: 'center' }}>
          
          <View className="mt-8 mb-6 items-center">
            <View className={`h-28 w-28 rounded-full items-center justify-center mb-6 shadow-lg border-4 ${passed ? 'bg-[#29a38b] border-[#e5efea]' : 'bg-red-500 border-red-200'}`}>
              {passed ? <Award size={52} color="white" /> : <AlertCircle size={52} color="white" />}
            </View>
            <Text className="text-sm font-bold text-[#737a8d] uppercase tracking-widest mb-1">{selectedExamType} • FINAL RESULT</Text>
            
            {isJamb ? (
              <View className="items-center">
                <Text className="text-5xl font-extrabold text-[#1a1c23] mt-2 mb-1">
                  {Math.round((score / questions.length) * 400)} <Text className="text-xl text-[#737a8d]">/ 400</Text>
                </Text>
                <Text className="font-medium text-[#737a8d] mb-4">Official JAMB Marking Scheme</Text>
              </View>
            ) : (
              <View className="items-center">
                <Text className="text-5xl font-extrabold text-[#1a1c23] mt-2 mb-2">
                  {score} <Text className="text-xl text-[#737a8d]">/ {questions.length}</Text>
                </Text>
              </View>
            )}

            <Text className={`text-xl font-bold ${passed ? 'text-[#29a38b]' : 'text-red-500'}`}>
              {percentage}% — {passed ? 'Excellent Performance!' : 'Requires Intense Improvement'}
            </Text>
          </View>

          {/* Failure Breakdown Engine (Result Machine) */}
          {breakdown && (
            <View className="w-full bg-[#1a1c23] p-6 rounded-[32px] mb-8 shadow-xl">
               <Text className="text-white/40 text-[10px] font-black uppercase tracking-[3px] mb-4">Failure Breakdown Engine</Text>
               
               <View className="flex-row gap-4 mb-6">
                  <View className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <Text className="text-white font-black text-2xl mb-1">{breakdown.careless}</Text>
                    <Text className="text-white/60 text-[10px] font-black uppercase">Careless Mistakes</Text>
                  </View>
                  <View className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <Text className="text-white font-black text-2xl mb-1">{breakdown.gaps.length}+</Text>
                    <Text className="text-white/60 text-[10px] font-black uppercase">Conceptual Gaps</Text>
                  </View>
               </View>

               {breakdown.gaps.length > 0 && (
                 <View>
                    <Text className="text-red-400 font-bold text-xs uppercase mb-3">Priority Review Needed:</Text>
                    {breakdown.gaps.map((gap, i) => (
                      <View key={i} className="flex-row items-center gap-2 mb-2">
                        <ShieldAlert size={14} color="#f87171" />
                        <Text className="text-white/80 text-sm font-medium">{gap}</Text>
                      </View>
                    ))}
                 </View>
               )}
            </View>
          )}

          {/* New Review Answers Button */}
          <TouchableOpacity 
            onPress={() => {
              setCurrentQuestionIdx(0);
              setExamState('REVIEW');
            }}
            className="w-full bg-[#e5efea] border border-[#29a38b] rounded-2xl p-5 shadow-sm mb-6 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3">
              <BookOpen size={24} color="#29a38b" />
              <View>
                <Text className="text-lg font-bold text-[#1a1c23]">Review Options</Text>
                <Text className="text-sm text-[#4a4f5c]">See corrections & detailed steps</Text>
              </View>
            </View>
            <ChevronRight size={24} color="#29a38b" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setExamState('SELECTION')}
            className="w-full rounded-2xl bg-[#1a1c23] py-4 items-center shadow-md active:bg-[#2d313c]"
          >
            <Text className="text-white text-lg font-bold">Return to Main Menu</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    );
  }

  // ------------------------------------------------------------------------------------------------ //
  // RENDER REVIEW STATE
  // ------------------------------------------------------------------------------------------------ //
  
  if (examState === 'REVIEW') {
    const q = questions[currentQuestionIdx];
    const userChoice = answers[currentQuestionIdx];
    const isCorrect = userChoice === q.correctIdx;

    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
        {/* Review Header */}
        <View className="px-6 py-4 flex-row items-center justify-between bg-white border-b border-[#e2e4e9]">
          <View>
            <Text className="text-xs font-bold text-[#737a8d] uppercase tracking-widest">REVIEW MODE</Text>
            <Text className="text-lg font-bold text-[#1a1c23]">Q {currentQuestionIdx + 1} / {questions.length}</Text>
          </View>
          <TouchableOpacity onPress={() => setExamState('RESULTS')} className="bg-[#f1f2f4] px-4 py-2 rounded-lg">
            <Text className="font-bold text-[#1a1c23]">Close</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
          {/* Status Badge */}
          <View className={`self-start px-3 py-1.5 rounded-lg mb-4 flex-row items-center ${userChoice === null ? 'bg-gray-100' : isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
            {userChoice === null ? <AlertCircle size={16} color="#4b5563" className="mr-2" /> :
             isCorrect ? <CheckCircle size={16} color="#16a34a" className="mr-2" /> :
             <XCircle size={16} color="#dc2626" className="mr-2" />}
            <Text className={`font-bold ${userChoice === null ? 'text-gray-700' : isCorrect ? 'text-green-700' : 'text-red-700'}`}>
              {userChoice === null ? 'Skipped' : isCorrect ? 'Correct' : 'Incorrect'}
            </Text>
          </View>

          <View className="mb-8">
            <Text className="text-sm font-bold tracking-widest text-[#29a38b] uppercase mb-2">{q.subject}</Text>
            <Text className="text-xl font-semibold text-[#1a1c23] leading-8">{q.question}</Text>
          </View>

          <View className="gap-3 mb-8">
            {q.options.map((opt: string, idx: number) => {
              const isUserChoice = userChoice === idx;
              const isActualCorrect = q.correctIdx === idx;
              
              let borderColor = 'border-[#e2e4e9]';
              let bgColor = 'bg-white';
              let textColor = 'text-[#1a1c23]';
              let badgeBg = 'bg-[#faf9f4]';
              let badgeText = 'text-[#737a8d]';
              
              if (isActualCorrect) {
                borderColor = 'border-green-500';
                bgColor = 'bg-green-50';
                textColor = 'text-green-800';
                badgeBg = 'bg-green-500';
                badgeText = 'text-white';
              } else if (isUserChoice && !isActualCorrect) {
                borderColor = 'border-red-400';
                bgColor = 'bg-red-50';
                textColor = 'text-red-800';
                badgeBg = 'bg-red-500';
                badgeText = 'text-white';
              }

              return (
                <View key={idx} className={`flex-row items-center border-[2px] rounded-2xl p-4 ${borderColor} ${bgColor}`}>
                  <View className={`h-8 w-8 rounded-full items-center justify-center mr-4 ${badgeBg}`}>
                    <Text className={`font-bold ${badgeText}`}>{['A', 'B', 'C', 'D'][idx]}</Text>
                  </View>
                  <Text className={`text-lg font-medium flex-1 ${textColor}`}>{opt}</Text>
                  
                  {isActualCorrect && <CheckCircle size={20} color="#22c55e" className="ml-2" />}
                  {(isUserChoice && !isActualCorrect) && <XCircle size={20} color="#ef4444" className="ml-2" />}
                </View>
              )
            })}
          </View>

          {/* Explanation Box */}
          <View className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-8">
            <Text className="font-bold text-blue-800 text-lg mb-2">Explanation & Steps</Text>
            <Text className="text-blue-900 leading-6 text-base">{q.explanation}</Text>
          </View>
          
          {/* Navigation */}
          <View className="flex-row justify-between w-full">
             <TouchableOpacity 
              onPress={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIdx === 0}
              className={`bg-[#f1f2f4] px-6 py-4 rounded-xl flex-row items-center ${currentQuestionIdx === 0 ? 'opacity-50' : ''}`}
            >
              <ArrowLeft size={20} color="#4a4f5c" className="mr-2" />
              <Text className="font-bold text-[#4a4f5c]">Prev</Text>
            </TouchableOpacity>

            <TouchableOpacity 
               onPress={() => {
                if (currentQuestionIdx < questions.length - 1) {
                  setCurrentQuestionIdx(prev => prev + 1);
                } else {
                  setExamState('RESULTS');
                }
               }}
              className="bg-[#1a1c23] px-6 py-4 rounded-xl flex-row items-center"
            >
              <Text className="font-bold text-white shadow-sm mr-2">{currentQuestionIdx < questions.length - 1 ? 'Next' : 'Finish'}</Text>
              {currentQuestionIdx < questions.length - 1 && <ArrowRight size={20} color="white" />}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}
