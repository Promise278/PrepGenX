import AsyncStorage from "@react-native-async-storage/async-storage";

// Determine Base URL correctly for local vs production
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // Default for local development
  return "http://localhost:5000";
};

export const API_URL = getBaseUrl();

// Helper for authorized requests
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = await AsyncStorage.getItem("userToken");
  
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  return response;
};

// AI Services
export const uploadAudioToAI = async (audioUri: string, history: any[] = [], userId?: string, persona?: string) => {
  const formData = new FormData();
  formData.append("audio", {
    uri: audioUri,
    name: "voice.m4a",
    type: "audio/m4a",
  } as any);

  if (history && history.length > 0) {
    formData.append("history", JSON.stringify(history));
  }
  
  if (userId) {
    formData.append("userId", userId);
  }

  if (persona) {
    formData.append("persona", persona);
  }

  const response = await fetchWithAuth("/ai/tutor", {
    method: "POST",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    body: formData,
  });
  
  if (!response.ok) throw new Error("Failed to process audio.");
  return response.json();
};

export const uploadImageToAI = async (imageUri: string, question?: string) => {
  const formData = new FormData();
  formData.append("image", {
    uri: imageUri,
    name: "homework.jpg",
    type: "image/jpeg",
  } as any);

  if (question) {
    formData.append("question", question);
  }

  const response = await fetchWithAuth("/ai/image", {
    method: "POST",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    body: formData,
  });

  if (!response.ok) throw new Error("Failed to process image.");
  return response.json();
};

// Exam Services (Placeholders for when endpoints are built)
export const getExams = async () => {
  const response = await fetchWithAuth("/exams");
  if (!response.ok) throw new Error("Failed to load exams.");
  return response.json();
};
