import React, { useState, useRef, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  Animated,
  Easing,
  Modal
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mic, MicOff, MessageSquare, Send, Volume2, X, Zap, Baby, Target, Sparkles, Users } from "lucide-react-native";
import { fetchWithAuth, uploadAudioToAI } from "../../utils/api";
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AiTutor() {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [textMessage, setTextMessage] = useState("");
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
    { role: 'ai', content: "Hello! I am your StudyAI Tutor. What would you like to focus on today? I noticed Mathematics is your weakest subject!" }
  ]);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [persona, setPersona] = useState<'sage' | 'hype' | 'peer'>('sage');

  const personaConfig = {
    sage: { label: 'The Sage', color: '#29a38b', icon: <Sparkles size={16} color="white" />, prompt: "Explain like a professor, focusing on theory." },
    hype: { label: 'The Hype-Man', color: '#fcd34d', icon: <Zap size={16} color="white" />, prompt: "Be high energy, motivational, and use simple terms." },
    peer: { label: 'Study-Buddy', color: '#a855f7', icon: <Users size={16} color="white" />, prompt: "Use casual slang, relatable analogies, and keep it light." }
  };

  const fetchAiResponse = async (userText: string) => {
    setLoading(true);
    const updatedMessages = [...messages, { role: 'user' as const, content: userText }];
    setMessages(updatedMessages);
    
    try {
      const userStr = await AsyncStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      
      const response = await fetchWithAuth("/ai/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userText,
          history: messages.slice(-6),
          userId: user?.id,
          persona: personaConfig[persona].prompt
        })
      });
      const data = await response.json();
      
      if (data.success) {
        setMessages(prev => [...prev, { role: 'ai', content: data.aiText }]);
        setIsSpeaking(true);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I had trouble processing that request." }]);
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'ai', content: "An error occurred. Please check your network connection." }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isRecording || isSpeaking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.5,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.in(Easing.ease),
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, isSpeaking, pulseAnim]);

  const playVoiceResponse = async (base64Audio: string) => {
    try {
      setIsSpeaking(true);
      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:audio/mp3;base64,${base64Audio}` },
        { shouldPlay: true }
      );
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.didJustFinish) {
          setIsSpeaking(false);
          sound.unloadAsync();
        }
      });
    } catch (e) {
      console.error("Playback error:", e);
      setIsSpeaking(false);
    }
  };

  const toggleRecording = async () => {
    try {
      if (isRecording) {
        setIsRecording(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        if (recording) {
          await recording.stopAndUnloadAsync();
          const uri = recording.getURI();
          if (uri) {
            setLoading(true);
            
            // Get user info for context
            const userStr = await AsyncStorage.getItem("user");
            const user = userStr ? JSON.parse(userStr) : null;
            
            // Format history for OpenAI (role and content)
            const history = messages.slice(-6); // Keep last 6 messages
            
            const data = await uploadAudioToAI(uri, history, user?.id, personaConfig[persona].prompt);
            if (data.success) {
              setMessages(prev => [
                ...prev, 
                { role: 'user', content: data.studentText },
                { role: 'ai', content: data.aiText }
              ]);
              if (data.audioBase64) {
                playVoiceResponse(data.audioBase64);
              }
            }
            setLoading(false);
          }
          setRecording(null);
        }
      } else {
        const permission = await Audio.requestPermissionsAsync();
        if (permission.status !== 'granted') return;

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        
        setRecording(newRecording);
        setIsRecording(true);
        setIsSpeaking(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (err) {
      console.error('Failed to start recording', err);
      setIsRecording(false);
    }
  };

  const sendTextMessage = () => {
    if (textMessage.trim().length === 0) return;
    const msg = textMessage.trim();
    setTextMessage("");
    setIsSpeaking(false);
    fetchAiResponse(msg);
  };

  const stopSpeaking = () => {
    setIsSpeaking(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#faf9f4] edges={['top']}">
      {/* Header */}
      <View className="px-6 py-6 border-b border-[#e2e4e9] bg-white shadow-sm flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-[#29a38b]">
            <MessageSquare size={20} color="white" />
          </View>
          <View>
            <Text className="text-lg font-bold text-black">StudyAI Tutor</Text>
            <Text className="text-xs text-[#29a38b] font-medium">
              {isRecording ? "Listening..." : isSpeaking ? "Speaking..." : "Online"}
            </Text>
          </View>
        </View>
        {isSpeaking && (
          <TouchableOpacity className="rounded-full bg-red-500/10 px-3 py-1" onPress={stopSpeaking}>
            <Text className="text-xs font-bold text-red-500">Stop</Text>
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        className="flex-1"
      >
        {/* Chat Messages */}
        <ScrollView 
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          className="flex-1 px-4 pt-4" 
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {messages.map((msg, idx) => (
            <View key={idx} className={`mb-4 max-w-[85%] ${msg.role === 'user' ? 'self-end' : 'self-start'}`}>
              <View className={`rounded-2xl px-5 py-3 ${msg.role === 'user' ? 'bg-[#29a38b] rounded-tr-sm' : 'bg-[#dff0eb] rounded-tl-sm border border-white/5'}`}>
                <Text className={`text-base leading-6 ${msg.role === 'user' ? 'text-white' : 'text-black'}`}>
                  {msg.content}
                </Text>
              </View>
            </View>
          ))}

          {loading && (
            <View className="self-start max-w-[85%] mb-4">
              <View className="rounded-2xl px-5 py-4 bg-[#162c26] rounded-tl-sm border border-white/5">
                <ActivityIndicator color={personaConfig[persona].color} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Speed Actions Palette (Addiction Loop) */}
        {/* {!isVoiceMode && (
           <View className="px-4 py-3 flex-row gap-2">
             <TouchableOpacity 
               onPress={() => fetchAiResponse("Summarize the last point in 10 seconds exactly.")}
               className="flex-row items-center gap-2 bg-[#162c26] px-4 py-2 rounded-full border border-white/5"
             >
                <Zap size={14} color="#fcd34d" />
                <Text className="text-white font-bold text-[10px] uppercase">10s Explain</Text>
             </TouchableOpacity>
             <TouchableOpacity 
               onPress={() => fetchAiResponse("Explain the concept like I'm 5 years old.")}
               className="flex-row items-center gap-2 bg-[#162c26] px-4 py-2 rounded-full border border-white/5"
             >
                <Baby size={14} color="#29a38b" />
                <Text className="text-white font-bold text-[10px] uppercase">ELI5</Text>
             </TouchableOpacity>
             <TouchableOpacity 
               onPress={() => fetchAiResponse("Give me a similar JAMB-style question right now.")}
               className="flex-row items-center gap-2 bg-[#162c26] px-4 py-2 rounded-full border border-white/5"
             >
                <Target size={14} color="#a855f7" />
                <Text className="text-white font-bold text-[10px] uppercase">Similar Quiz</Text>
             </TouchableOpacity>
           </View>
        )} */}

        {/* Persona Selector */}
        {/* {!isVoiceMode && (
          <View className="px-4 pb-2 flex-row gap-2">
             {(['sage', 'hype', 'peer'] as const).map((p) => (
                <TouchableOpacity 
                  key={p} 
                  onPress={() => setPersona(p)}
                  className={`flex-1 flex-row items-center justify-center gap-2 py-2 rounded-xl border ${persona === p ? 'border-[#29a38b] bg-[#29a38b]/10' : 'border-white/5 bg-[#162c26]'}`}
                >
                   {personaConfig[p].icon}
                   <Text className={`font-bold text-[10px] uppercase ${persona === p ? 'text-[#29a38b]' : 'text-white/40'}`}>{personaConfig[p].label}</Text>
                </TouchableOpacity>
             ))}
          </View>
        )} */}

        {/* Input Area */}
        <View className="px-4 bg-white border border-white/5 flex-row items-end gap-2">
          <View className="flex-1 bg-[#e8ebea] rounded-3xl border border-white/10 px-4 py-2 flex-row items-center min-h-[50px] max-h-[120px]">
            <TextInput 
              className="flex-1 text-black text-base pt-2 pb-2"
              placeholder="Message Tutor..."
              placeholderTextColor="#737a8d"
              multiline
              value={textMessage}
              onChangeText={setTextMessage}
            />
          </View>
          
          {textMessage.trim().length > 0 ? (
            <TouchableOpacity 
              onPress={sendTextMessage}
              className="h-[50px] w-[50px] rounded-full bg-[#29a38b] items-center justify-center shadow-lg mb-1"
            >
              <Send size={20} color="white" />
            </TouchableOpacity>
          ) : (
            <View className="items-center justify-center">
              {(isRecording || isSpeaking) && (
                <Animated.View 
                  style={{
                    position: 'absolute',
                    width: 70,
                    height: 70,
                    borderRadius: 35,
                    backgroundColor: isRecording ? 'rgba(239, 68, 68, 0.2)' : 'rgba(41, 163, 139, 0.2)',
                    transform: [{ scale: pulseAnim }]
                  }}
                />
              )}
              <TouchableOpacity 
                onPress={toggleRecording}
                onLongPress={() => setIsVoiceMode(true)}
                className={`h-[50px] w-[50px] mb-1 rounded-full items-center justify-center shadow-lg ${isRecording ? 'bg-red-500' : 'bg-[#29a38b]'}`}
              >
                {isRecording ? <MicOff size={20} color="white" /> : <Mic size={20} color="white" />}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Voice Mode Overlay */}
        <Modal 
          visible={isVoiceMode} 
          animationType="fade" 
          transparent={true}
        >
          <View className="flex-1 bg-[#0d1f1a]">
            <SafeAreaView className="flex-1 items-center justify-between py-20 px-6">
              <TouchableOpacity 
                onPress={() => setIsVoiceMode(false)}
                className="absolute top-14 right-6 h-12 w-12 rounded-full bg-white/10 items-center justify-center border border-white/5"
              >
                <X size={24} color="white" />
              </TouchableOpacity>

              <View className="items-center">
                <Text className="text-[#29a38b] text-lg font-bold mb-2 uppercase tracking-widest">StudyAI Tutor</Text>
                <Text className="text-white text-3xl font-bold text-center px-6">
                  {isRecording ? "I'm listening..." : isSpeaking ? "Listen carefully..." : "How can I help you succeed?"}
                </Text>
              </View>

              <View className="items-center justify-center h-64 w-64">
                  <Animated.View 
                    style={{
                      position: 'absolute',
                      width: 220,
                      height: 220,
                      borderRadius: 110,
                      backgroundColor: personaConfig[persona].color,
                      opacity: 0.1,
                      transform: [{ scale: pulseAnim }]
                    }}
                  />
                  <Animated.View 
                    style={{
                      position: 'absolute',
                      width: 160,
                      height: 160,
                      borderRadius: 80,
                      backgroundColor: personaConfig[persona].color,
                      opacity: 0.2,
                      transform: [{ scale: Animated.multiply(pulseAnim, 0.85) }]
                    }}
                  />
                  <TouchableOpacity 
                    onPress={toggleRecording}
                    className={`h-28 w-28 rounded-full items-center justify-center shadow-2xl ${isRecording ? 'bg-red-500 shadow-red-500/50' : 'bg-[#29a38b] shadow-[#29a38b]/50'}`}
                    style={!isRecording ? { backgroundColor: personaConfig[persona].color } : {}}
                  >
                    {isRecording ? <MicOff size={44} color="white" /> : <Mic size={44} color="white" />}
                  </TouchableOpacity>
              </View>

              <View className="items-center">
                 <Volume2 size={32} color={isSpeaking ? "#29a38b" : "white"} />
                 <Text className="text-white/40 mt-6 font-medium uppercase tracking-widest text-xs">Premium Voice Tutoring Active</Text>
              </View>
            </SafeAreaView>
          </View>
        </Modal>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}
