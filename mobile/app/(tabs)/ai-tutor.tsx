import React, { useState, useRef } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mic, MicOff, MessageSquare, Send } from "lucide-react-native";

export default function AiTutor() {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [textMessage, setTextMessage] = useState("");
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
    { role: 'ai', content: "Hello! I am your StudyAI Tutor. What would you like to focus on today? I noticed Mathematics is your weakest subject!" }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const simulateAiResponse = (userText: string) => {
    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    
    setTimeout(() => {
      setLoading(false);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: `I'd love to help with that! Here is a simple explanation to help you understand better.` 
      }]);
      setIsSpeaking(true);
    }, 1500);
  };

  const toggleRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
      simulateAiResponse("Can you explain integration to me?");
    } else {
      setIsRecording(true);
      setIsSpeaking(false);
    }
  };

  const sendTextMessage = () => {
    if (textMessage.trim().length === 0) return;
    const msg = textMessage.trim();
    setTextMessage("");
    setIsSpeaking(false);
    simulateAiResponse(msg);
  };

  const stopSpeaking = () => {
    setIsSpeaking(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#faf9f4]" edges={['top']}>
      {/* Header */}
      <View className="px-6 pt-4 pb-4 border-b border-[#e2e4e9] bg-[#fefffe] shadow-sm flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-[#29a38b]">
            <MessageSquare size={20} color="white" />
          </View>
          <View>
            <Text className="text-lg font-bold text-[#1a1c23]">StudyAI Tutor</Text>
            <Text className="text-xs text-[#29a38b] font-medium">
              {isRecording ? "Listening..." : isSpeaking ? "Speaking..." : "Online"}
            </Text>
          </View>
        </View>
        {isSpeaking && (
          <TouchableOpacity className="rounded-full bg-red-100 px-3 py-1" onPress={stopSpeaking}>
            <Text className="text-xs font-bold text-red-600">Stop</Text>
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
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
              <View className={`rounded-2xl px-5 py-3 ${msg.role === 'user' ? 'bg-[#29a38b] rounded-tr-sm' : 'bg-[#e5efea] rounded-tl-sm'}`}>
                <Text className={`text-base leading-6 ${msg.role === 'user' ? 'text-[#fefffe]' : 'text-[#1a1c23]'}`}>
                  {msg.content}
                </Text>
              </View>
            </View>
          ))}

          {loading && (
            <View className="self-start max-w-[85%] mb-4">
              <View className="rounded-2xl px-5 py-4 bg-[#e5efea] rounded-tl-sm">
                <ActivityIndicator color="#29a38b" />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View className="px-4 pb-8 pt-3 bg-[#fefffe] border-t border-[#e2e4e9] flex-row items-end gap-2">
          <View className="flex-1 bg-[#faf9f4] rounded-3xl border border-[#e2e4e9] px-4 py-2 flex-row items-center min-h-[50px] max-h-[120px]">
            <TextInput 
              className="flex-1 text-[#1a1c23] text-base pt-2 pb-2"
              placeholder="Message Tutor..."
              multiline
              value={textMessage}
              onChangeText={setTextMessage}
            />
          </View>
          
          {textMessage.trim().length > 0 ? (
            <TouchableOpacity 
              onPress={sendTextMessage}
              className="h-[50px] w-[50px] rounded-full bg-[#29a38b] items-center justify-center shadow-sm mb-1"
            >
              <Send size={20} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={toggleRecording}
              className={`h-[50px] w-[50px] mb-1 rounded-full items-center justify-center shadow-sm ${isRecording ? 'bg-red-500' : 'bg-[#29a38b]'}`}
            >
              {isRecording ? <MicOff size={20} color="white" /> : <Mic size={20} color="white" />}
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}
