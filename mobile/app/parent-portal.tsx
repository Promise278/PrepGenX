import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Share, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Shield, Flame, Trophy, BookOpen, TrendingUp, TrendingDown, AlertTriangle, Brain, Share2, ChevronRight, Star, Calendar } from "lucide-react-native";
import { useRouter } from "expo-router";
import { fetchWithAuth } from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function ParentPortal() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [overview, setOverview] = useState<any>(null);
  const [weaknesses, setWeaknesses] = useState<any[]>([]);
  const [examHistory, setExamHistory] = useState<any>(null);
  const [studyActivity, setStudyActivity] = useState<any>(null);
  const [reportCard, setReportCard] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "report">("overview");

  const loadData = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const userStr = await AsyncStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user?.id) return;

      const [ovRes, wkRes, exRes, actRes] = await Promise.all([
        fetchWithAuth(`/parent/child/${user.id}/overview`).catch(() => null),
        fetchWithAuth(`/parent/child/${user.id}/weaknesses`).catch(() => null),
        fetchWithAuth(`/parent/child/${user.id}/exam-history`).catch(() => null),
        fetchWithAuth(`/parent/child/${user.id}/study-activity`).catch(() => null),
      ]);

      const ovData = ovRes ? await ovRes.json() : null;
      const wkData = wkRes ? await wkRes.json() : null;
      const exData = exRes ? await exRes.json() : null;
      const actData = actRes ? await actRes.json() : null;

      if (ovData?.success) setOverview(ovData.data);
      if (wkData?.success) setWeaknesses(wkData.data);
      if (exData?.success) setExamHistory(exData.data);
      if (actData?.success) setStudyActivity(actData.data);
    } catch (e) {
      console.error("Parent portal load error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadReportCard = async () => {
    try {
      setReportLoading(true);
      const userStr = await AsyncStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user?.id) return;
      const res = await fetchWithAuth(`/parent/child/${user.id}/report-card`);
      const data = await res.json();
      if (data?.success) setReportCard(data.data);
    } catch (e) {
      console.error("Report card error:", e);
    } finally {
      setReportLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const res = await fetchWithAuth("/parent/share-token", { method: "POST" });
      const data = await res.json();
      if (data?.success) {
        await Share.share({
          message: `📊 View my PrepGenX progress report:\n${data.data.shareUrl}`,
          title: "PrepGenX Parent Portal",
        });
      } else {
        Alert.alert("Error", data.message || "Could not generate share link.");
      }
    } catch (e) {
      Alert.alert("Error", "Failed to generate share link.");
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#faf9f4", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#29a38b" />
        <Text style={{ color: "#737a8d", marginTop: 16, fontWeight: "600" }}>Loading parent portal...</Text>
      </SafeAreaView>
    );
  }

  const gradeColor = (score: number) => score >= 70 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const sevColor = (s: string) => s === "high" ? "#ef4444" : s === "moderate" ? "#f59e0b" : "#10b981";
  const sevBg = (s: string) => s === "high" ? "#fef2f2" : s === "moderate" ? "#fffbeb" : "#f0fdf4";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#faf9f4" }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <ArrowLeft size={24} color="#1a1c23" />
        </TouchableOpacity>
        <Text style={{ fontSize: 16, fontWeight: "900", color: "#1a1c23", textTransform: "uppercase", letterSpacing: 2 }}>Parent Portal</Text>
        <TouchableOpacity onPress={handleShare} style={{ backgroundColor: "#29a38b", padding: 10, borderRadius: 14 }}>
          <Share2 size={18} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(true); }} tintColor="#29a38b" />}
      >
        {/* Hero Card */}
        {overview && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <View style={{ backgroundColor: "#29a38b", borderRadius: 32, padding: 28, marginBottom: 20, overflow: "hidden", position: "relative" }}>
              <View style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(255,255,255,0.08)" }} />
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <Shield size={16} color="white" />
                <Text style={{ color: "white", fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: 3 }}>Progress Report</Text>
              </View>
              <Text style={{ color: "white", fontSize: 28, fontWeight: "900", letterSpacing: -1, marginBottom: 4 }}>{overview.fullname}</Text>
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "600" }}>
                {overview.daysLeft !== null ? `${overview.daysLeft} days until exam` : "Exam date not set"}
              </Text>

              {/* Readiness Score */}
              <View style={{ marginTop: 20, alignItems: "center" }}>
                <View style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 8, borderColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" }}>
                  <View style={{ position: "absolute", width: 100, height: 100, borderRadius: 50, borderWidth: 8, borderColor: "white", borderRightColor: "transparent", borderBottomColor: "transparent", transform: [{ rotate: "45deg" }] }} />
                  <Text style={{ color: "white", fontSize: 28, fontWeight: "900" }}>{overview.avgScore}%</Text>
                </View>
                <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: "800", textTransform: "uppercase", letterSpacing: 2, marginTop: 10 }}>Overall Readiness</Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Quick Stats */}
        {overview && (
          <Animated.View entering={FadeInDown.duration(400).delay(100)}>
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
              <StatBox icon={<Flame size={18} color="#f97316" />} value={`${overview.streak}`} label="Streak" />
              <StatBox icon={<Star size={18} color="#eab308" />} value={`${overview.points}`} label="Points" />
              <StatBox icon={<BookOpen size={18} color="#29a38b" />} value={`${overview.examsTaken}`} label="Exams" />
              <StatBox icon={<Calendar size={18} color="#8b5cf6" />} value={`${studyActivity?.activeDays || 0}`} label="Active" />
            </View>
          </Animated.View>
        )}

        {/* Tab Switcher */}
        <View style={{ flexDirection: "row", backgroundColor: "white", borderRadius: 16, padding: 4, marginBottom: 20, borderWidth: 1, borderColor: "#eef0f2" }}>
          <TouchableOpacity onPress={() => setActiveTab("overview")} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center", backgroundColor: activeTab === "overview" ? "#29a38b" : "transparent" }}>
            <Text style={{ fontWeight: "800", fontSize: 13, color: activeTab === "overview" ? "white" : "#737a8d" }}>Overview</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setActiveTab("report"); if (!reportCard) loadReportCard(); }} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center", backgroundColor: activeTab === "report" ? "#29a38b" : "transparent" }}>
            <Text style={{ fontWeight: "800", fontSize: 13, color: activeTab === "report" ? "white" : "#737a8d" }}>AI Report</Text>
          </TouchableOpacity>
        </View>

        {activeTab === "overview" ? (
          <>
            {/* Performance Comparison */}
            {overview && (
              <Animated.View entering={FadeInDown.duration(400).delay(200)}>
                <SectionTitle title="Performance" />
                <View style={{ backgroundColor: "white", borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: "#eef0f2" }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
                    <View style={{ alignItems: "center", flex: 1 }}>
                      <Text style={{ fontSize: 28, fontWeight: "900", color: gradeColor(overview.avgScore) }}>{overview.avgScore}%</Text>
                      <Text style={{ fontSize: 10, fontWeight: "700", color: "#737a8d", textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>Your Child</Text>
                    </View>
                    <View style={{ width: 1, backgroundColor: "#eef0f2" }} />
                    <View style={{ alignItems: "center", flex: 1 }}>
                      <Text style={{ fontSize: 28, fontWeight: "900", color: "#737a8d" }}>{overview.platformAvg}%</Text>
                      <Text style={{ fontSize: 10, fontWeight: "700", color: "#737a8d", textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>Platform Avg</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: overview.avgScore >= overview.platformAvg ? "#f0fdf4" : "#fef2f2", padding: 10, borderRadius: 12 }}>
                    {overview.avgScore >= overview.platformAvg ? <TrendingUp size={16} color="#10b981" /> : <TrendingDown size={16} color="#ef4444" />}
                    <Text style={{ fontWeight: "700", fontSize: 13, color: overview.avgScore >= overview.platformAvg ? "#10b981" : "#ef4444" }}>
                      {overview.avgScore >= overview.platformAvg ? "Above" : "Below"} platform average
                    </Text>
                  </View>
                  <View style={{ marginTop: 16, backgroundColor: "#f8f9fa", borderRadius: 12, padding: 14 }}>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: "#737a8d", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Predicted JAMB Score</Text>
                    <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
                      <Text style={{ fontSize: 32, fontWeight: "900", color: "#1a1c23" }}>{overview.predictedScore}</Text>
                      <Text style={{ fontSize: 16, fontWeight: "700", color: "#737a8d" }}>/ 400</Text>
                    </View>
                    <View style={{ height: 6, backgroundColor: "#e5e7eb", borderRadius: 3, marginTop: 8, overflow: "hidden" }}>
                      <View style={{ height: "100%", width: `${(overview.predictedScore / 400) * 100}%`, backgroundColor: "#29a38b", borderRadius: 3 }} />
                    </View>
                  </View>
                </View>
              </Animated.View>
            )}

            {/* Weakness Alerts */}
            {weaknesses.length > 0 && (
              <Animated.View entering={FadeInDown.duration(400).delay(300)}>
                <SectionTitle title={`Weaknesses (${weaknesses.length})`} />
                {weaknesses.slice(0, 5).map((w, idx) => (
                  <View key={w.id || idx} style={{ backgroundColor: "white", borderRadius: 20, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: "#eef0f2", borderLeftWidth: 4, borderLeftColor: sevColor(w.severity) }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 15, fontWeight: "800", color: "#1a1c23" }}>{w.subject}</Text>
                        <Text style={{ fontSize: 12, color: "#737a8d", marginTop: 2 }}>{w.topic}</Text>
                      </View>
                      <View style={{ backgroundColor: sevBg(w.severity), paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
                        <Text style={{ fontWeight: "900", fontSize: 14, color: sevColor(w.severity) }}>{w.score}%</Text>
                      </View>
                    </View>
                    <View style={{ height: 6, backgroundColor: "#f0f2f5", borderRadius: 3, overflow: "hidden" }}>
                      <View style={{ height: "100%", width: `${Math.max(w.score, 5)}%`, backgroundColor: sevColor(w.severity), borderRadius: 3 }} />
                    </View>
                    <Text style={{ fontSize: 11, color: "#737a8d", marginTop: 8 }}>Attempts: {w.attempts} • {w.severity.toUpperCase()}</Text>
                    {w.aiAnalysis && (
                      <View style={{ marginTop: 10, backgroundColor: "#f0fdf4", padding: 12, borderRadius: 10, borderLeftWidth: 3, borderLeftColor: "#29a38b" }}>
                        <Text style={{ fontSize: 12, color: "#1a6b5a", fontStyle: "italic" }}>🧠 {w.aiAnalysis}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </Animated.View>
            )}

            {/* Exam History */}
            {examHistory && examHistory.history.length > 0 && (
              <Animated.View entering={FadeInDown.duration(400).delay(400)}>
                <SectionTitle title="Recent Exams" />
                <View style={{ backgroundColor: "white", borderRadius: 24, borderWidth: 1, borderColor: "#eef0f2", overflow: "hidden" }}>
                  {examHistory.trend !== 0 && (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, padding: 14, backgroundColor: examHistory.trend > 0 ? "#f0fdf4" : "#fef2f2" }}>
                      {examHistory.trend > 0 ? <TrendingUp size={14} color="#10b981" /> : <TrendingDown size={14} color="#ef4444" />}
                      <Text style={{ fontSize: 12, fontWeight: "700", color: examHistory.trend > 0 ? "#10b981" : "#ef4444" }}>
                        {examHistory.trend > 0 ? "+" : ""}{examHistory.trend}% trend vs previous sessions
                      </Text>
                    </View>
                  )}
                  {examHistory.history.slice(0, 8).map((h: any, idx: number) => (
                    <View key={h.id || idx} style={{ flexDirection: "row", alignItems: "center", padding: 14, borderBottomWidth: idx < Math.min(examHistory.history.length, 8) - 1 ? 1 : 0, borderBottomColor: "#f0f2f5" }}>
                      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "#f0fdf4", justifyContent: "center", alignItems: "center", marginRight: 14 }}>
                        <BookOpen size={18} color="#29a38b" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: "700", color: "#1a1c23" }}>{h.subject}</Text>
                        <Text style={{ fontSize: 11, color: "#737a8d" }}>{new Date(h.date).toLocaleDateString()}</Text>
                      </View>
                      <Text style={{ fontSize: 16, fontWeight: "900", color: gradeColor(h.score) }}>{h.score}%</Text>
                    </View>
                  ))}
                </View>
              </Animated.View>
            )}

            {/* Activity Heatmap */}
            {studyActivity && (
              <Animated.View entering={FadeInDown.duration(400).delay(500)}>
                <SectionTitle title="30-Day Activity" />
                <View style={{ backgroundColor: "white", borderRadius: 24, padding: 18, borderWidth: 1, borderColor: "#eef0f2", marginBottom: 20 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 16 }}>
                    <View style={{ alignItems: "center" }}>
                      <Text style={{ fontSize: 24, fontWeight: "900", color: "#29a38b" }}>{studyActivity.activeDays}</Text>
                      <Text style={{ fontSize: 10, fontWeight: "700", color: "#737a8d", textTransform: "uppercase", letterSpacing: 1 }}>Active Days</Text>
                    </View>
                    <View style={{ alignItems: "center" }}>
                      <Text style={{ fontSize: 24, fontWeight: "900", color: "#29a38b" }}>{studyActivity.totalSessions}</Text>
                      <Text style={{ fontSize: 10, fontWeight: "700", color: "#737a8d", textTransform: "uppercase", letterSpacing: 1 }}>Sessions</Text>
                    </View>
                  </View>
                  {/* Mini heatmap grid */}
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, justifyContent: "center" }}>
                    {Array.from({ length: 30 }).map((_, i) => {
                      const d = new Date();
                      d.setDate(d.getDate() - (29 - i));
                      const key = d.toISOString().split("T")[0];
                      const dayData = studyActivity.heatmap?.[key];
                      const intensity = dayData ? Math.min(dayData.count / 3, 1) : 0;
                      return (
                        <View key={i} style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: intensity > 0 ? `rgba(41,163,139,${0.2 + intensity * 0.8})` : "#f0f2f5", justifyContent: "center", alignItems: "center" }}>
                          <Text style={{ fontSize: 8, fontWeight: "700", color: intensity > 0.3 ? "white" : "#737a8d" }}>{d.getDate()}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </Animated.View>
            )}
          </>
        ) : (
          /* AI Report Card Tab */
          <Animated.View entering={FadeInDown.duration(400)}>
            {reportLoading ? (
              <View style={{ alignItems: "center", paddingVertical: 60 }}>
                <ActivityIndicator size="large" color="#29a38b" />
                <Text style={{ color: "#737a8d", marginTop: 16, fontWeight: "600" }}>Generating AI report card...</Text>
              </View>
            ) : reportCard ? (
              <>
                {/* Grade Badge */}
                <View style={{ backgroundColor: "white", borderRadius: 24, padding: 24, marginBottom: 16, borderWidth: 1, borderColor: "#eef0f2", alignItems: "center" }}>
                  <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "#29a38b", justifyContent: "center", alignItems: "center", marginBottom: 12 }}>
                    <Text style={{ color: "white", fontSize: 32, fontWeight: "900" }}>{reportCard.report?.predictedGrade || "B"}</Text>
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: "900", color: "#1a1c23", textAlign: "center", marginBottom: 8 }}>AI Assessment</Text>
                  <Text style={{ fontSize: 13, color: "#737a8d", textAlign: "center", lineHeight: 20 }}>{reportCard.report?.summary}</Text>
                </View>

                {/* Strengths */}
                {reportCard.report?.strengths?.length > 0 && (
                  <View style={{ backgroundColor: "#f0fdf4", borderRadius: 20, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: "#d1fae5" }}>
                    <Text style={{ fontSize: 12, fontWeight: "900", color: "#10b981", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>✅ Strengths</Text>
                    {reportCard.report.strengths.map((s: string, i: number) => (
                      <Text key={i} style={{ fontSize: 13, color: "#1a6b5a", marginBottom: 6, fontWeight: "600" }}>• {s}</Text>
                    ))}
                  </View>
                )}

                {/* Weaknesses */}
                {reportCard.report?.weaknesses?.length > 0 && (
                  <View style={{ backgroundColor: "#fef2f2", borderRadius: 20, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: "#fecaca" }}>
                    <Text style={{ fontSize: 12, fontWeight: "900", color: "#ef4444", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>⚠️ Areas to Improve</Text>
                    {reportCard.report.weaknesses.map((w: string, i: number) => (
                      <Text key={i} style={{ fontSize: 13, color: "#991b1b", marginBottom: 6, fontWeight: "600" }}>• {w}</Text>
                    ))}
                  </View>
                )}

                {/* Recommendations */}
                {reportCard.report?.recommendations?.length > 0 && (
                  <View style={{ backgroundColor: "white", borderRadius: 20, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: "#eef0f2" }}>
                    <Text style={{ fontSize: 12, fontWeight: "900", color: "#29a38b", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>💡 Recommendations</Text>
                    {reportCard.report.recommendations.map((r: string, i: number) => (
                      <View key={i} style={{ flexDirection: "row", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                        <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: "#29a38b", justifyContent: "center", alignItems: "center", marginTop: 1 }}>
                          <Text style={{ color: "white", fontSize: 11, fontWeight: "900" }}>{i + 1}</Text>
                        </View>
                        <Text style={{ fontSize: 13, color: "#1a1c23", fontWeight: "600", flex: 1, lineHeight: 20 }}>{r}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Encouragement */}
                {reportCard.report?.encouragement && (
                  <View style={{ backgroundColor: "#fffbeb", borderRadius: 20, padding: 18, borderWidth: 1, borderColor: "#fde68a", alignItems: "center" }}>
                    <Text style={{ fontSize: 24, marginBottom: 8 }}>💪</Text>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: "#92400e", textAlign: "center", fontStyle: "italic" }}>{reportCard.report.encouragement}</Text>
                  </View>
                )}
              </>
            ) : (
              <View style={{ alignItems: "center", paddingVertical: 60 }}>
                <Brain size={48} color="#737a8d" />
                <Text style={{ color: "#737a8d", marginTop: 16, fontWeight: "600" }}>Failed to load report. Pull to refresh.</Text>
              </View>
            )}
          </Animated.View>
        )}

        {/* Share CTA */}
        <TouchableOpacity onPress={handleShare} style={{ backgroundColor: "#162c26", borderRadius: 24, padding: 20, marginTop: 24, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <Share2 size={20} color="#29a38b" />
          <Text style={{ color: "white", fontWeight: "900", fontSize: 15 }}>Share Report with Parent</Text>
        </TouchableOpacity>

        <Text style={{ textAlign: "center", color: "#737a8d", fontSize: 11, marginTop: 20, fontWeight: "500" }}>Generated by PrepGenX AI • {new Date().toLocaleDateString()}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───
const StatBox = ({ icon, value, label }: { icon: any; value: string; label: string }) => (
  <View style={{ flex: 1, backgroundColor: "white", borderRadius: 18, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "#eef0f2" }}>
    {icon}
    <Text style={{ fontSize: 18, fontWeight: "900", color: "#1a1c23", marginTop: 6 }}>{value}</Text>
    <Text style={{ fontSize: 9, fontWeight: "700", color: "#737a8d", textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>{label}</Text>
  </View>
);

const SectionTitle = ({ title }: { title: string }) => (
  <Text style={{ fontSize: 13, fontWeight: "900", color: "#737a8d", textTransform: "uppercase", letterSpacing: 2, marginBottom: 14, marginTop: 8 }}>{title}</Text>
);
