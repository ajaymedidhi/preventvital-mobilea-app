import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Dimensions, ActivityIndicator, Linking, Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import YoutubeIframe from 'react-native-youtube-iframe';
import { WebView } from 'react-native-webview';
import client, { API_URL } from '../../api/client';
import { getToken } from '../../api/storage';
import { useAuth } from '../../auth/AuthContext';

const { width } = Dimensions.get('window');

const CAT_EMOJI: Record<string, string> = {
    hypertension: '🫀', diabetes: '🩸', cardiac: '❤️', stress: '🧠', sleep: '😴',
    fitness: '💪', nutrition: '🥗', metabolic: '🔬', cardiovascular: '🫁',
    respiratory: '🌬️', mental: '🧘', musculoskeletal: '🦴', preventive: '🛡️',
};

const PLAN_BADGE: Record<string, { bg: string; text: string }> = {
    free: { bg: '#F3F4F6', text: '#6B7280' },
    premium: { bg: '#DBEAFE', text: '#2563EB' },
    pro: { bg: '#FEF3C7', text: '#D97706' },
    family: { bg: '#EDE9FE', text: '#7C3AED' },
};

// Generate session data — prefers API modules, then YouTube sessions, then stub
const generateSessions = (count: number, youtubeSessions?: any[], apiModules?: any[]) => {
    // API modules (GCS-backed videos from backend)
    if (apiModules && apiModules.length > 0) {
        return apiModules.map((mod: any, i: number) => ({
            id: i,
            title: mod.title || `Session ${i + 1}`,
            subtitle: `Session ${i + 1}${mod.duration ? ` • ${mod.duration} min` : ''}`,
            videoId: undefined as string | undefined,
            videoUrl: mod.videoUrl || undefined,
            videoMediaId: mod.videoMediaId ? mod.videoMediaId.toString() : undefined,
            contentType: mod.contentType || 'video',
            modules: [
                {
                    type: mod.contentType || 'video',
                    title: mod.title || 'Video Session',
                    duration: mod.duration ? `${mod.duration} min` : '—',
                    icon: mod.contentType === 'quiz' ? '✅' : mod.contentType === 'resource' ? '📄' : '🎬',
                    desc: mod.content || 'Watch this guided video session. Tap to play.',
                },
                { type: 'exercise', title: 'Practice Along', duration: '10 min', icon: '🏃', desc: 'Follow the techniques shown at your own pace.' },
                { type: 'quiz', title: 'Session Reflection', duration: '3 min', icon: '✅', desc: 'Reflect on what you learned and track your progress.' },
            ],
        }));
    }
    // Recommended programs with YouTube sessions
    if (youtubeSessions && youtubeSessions.length > 0) {
        return youtubeSessions.map((yt, i) => ({
            id: i,
            title: yt.title,
            subtitle: `Session ${i + 1} • ${yt.duration}`,
            videoId: yt.videoId,
            videoUrl: undefined as string | undefined,
            contentType: 'video',
            modules: [
                { type: 'video', title: yt.title, duration: yt.duration, icon: '🎬', desc: 'Watch this guided video session. Tap to play on YouTube.' },
                { type: 'exercise', title: 'Practice Along', duration: '10 min', icon: '🏃', desc: 'Follow the techniques shown in the video at your own pace.' },
                { type: 'quiz', title: 'Session Reflection', duration: '3 min', icon: '✅', desc: 'Reflect on what you learned and track your progress.' },
            ],
        }));
    }
    // Stub fallback
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        title: `Session ${i + 1}`,
        subtitle: i === 0 ? 'Getting Started' : i < 3 ? 'Foundation' : i < count - 2 ? 'Deep Practice' : 'Mastery',
        videoId: undefined as string | undefined,
        videoUrl: undefined as string | undefined,
        contentType: 'video',
        modules: [
            { type: 'video', title: 'Introduction & Overview', duration: '8 min', icon: '🎬', desc: 'Key concepts and theory covered in this session.' },
            { type: 'exercise', title: 'Guided Practice', duration: '15 min', icon: '🏃', desc: 'Follow along with guided exercises. Track vitals before and after.' },
            { type: 'quiz', title: 'Knowledge Check', duration: '5 min', icon: '✅', desc: 'Quick assessment to test your understanding.' },
        ],
    }));
};


const ProgramDetailsScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { programId, program: passedProgram } = route.params || {};

    const { subscription, currentPlan, userToken } = useAuth();
    const [program, setProgram] = useState<any>(passedProgram || null);
    // Always re-fetch for API programs to get resolved GCS video URLs
    const [loading, setLoading] = useState(!passedProgram?.isRecommended);
    const [activeSession, setActiveSession] = useState(0);
    const [completedSessions, setCompletedSessions] = useState<number[]>([]);
    const [enrollingProgram, setEnrollingProgram] = useState(false);
    const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
    const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null);
    const [resolvingVideo, setResolvingVideo] = useState(false);

    const userPlan = currentPlan;
    const planHierarchy = ['free', 'premium', 'pro', 'family'];
    const userPlanRank = planHierarchy.indexOf(userPlan);

    useEffect(() => {
        // Always fetch the full program from the single-program endpoint for API programs.
        // The list endpoint (/api/programs) does NOT resolve GCS video URLs — only
        // GET /api/programs/:id runs resolveModuleVideos and returns signed videoUrls.
        const isRecommended = passedProgram?.isRecommended;
        if (programId && !isRecommended) {
            const fetchProgram = async () => {
                try {
                    const res = await client.get(`/api/programs/${programId}`);
                    const fetched = res.data?.data?.program;
                    if (fetched) setProgram(fetched);
                } catch {
                    // Keep passedProgram as fallback
                }
                setLoading(false);
            };
            fetchProgram();
        } else {
            setLoading(false);
        }
    }, [programId]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366F1" />
            </View>
        );
    }

    if (!program) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={{ fontSize: 40 }}>😔</Text>
                    <Text style={styles.emptyText}>Program not found</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnEmpty}>
                        <Text style={styles.backBtnEmptyText}>← Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const isRecommended = !!program.isRecommended;
    const sessions = generateSessions(program.totalSessions || 8, program.youtubeSessions, program.modules);
    const current = sessions[activeSession] || sessions[0];
    const progress = Math.round((completedSessions.length / sessions.length) * 100);
    const emoji = program.emoji || CAT_EMOJI[program.category] || '📋';
    
    const reqPlan = program.requiredPlan?.toLowerCase() || 'free';
    const reqPlanRank = planHierarchy.indexOf(reqPlan);
    
    // Robust access check
    const isLocked = !isRecommended && (
        program.locked !== undefined 
            ? program.locked 
            : (program.accessiblePlans && program.accessiblePlans.length > 0)
                ? !program.accessiblePlans.map((p: string) => p.toLowerCase()).includes(currentPlan.toLowerCase())
                : userPlanRank < reqPlanRank
    );

    const heroColors: [string, string, string] = program.gradientColors
        ? [program.gradientColors[0], program.gradientColors[1], program.gradientColors[1] + 'CC']
        : ['#6366F1', '#8B5CF6', '#A78BFA'];

    const handleEnroll = async () => {
        setEnrollingProgram(true);
        try {
            await client.post(`/api/programs/${program._id}/enroll`);
            setProgram({ ...program, enrollmentStatus: 'active', enrollmentRequired: program.enrollmentRequired });
        } catch (err: any) {
            Alert.alert('Enrollment Failed', err.response?.data?.message || 'Something went wrong');
        }
        setEnrollingProgram(false);
    };

    const handleCompleteSession = () => {
        if (!completedSessions.includes(activeSession)) {
            setCompletedSessions(prev => [...prev, activeSession]);
            if (activeSession < sessions.length - 1) {
                setTimeout(() => {
                    setActiveSession(prev => prev + 1);
                    setPlayingVideoId(null);
                    setPlayingVideoUrl(null);
                }, 600);
            }
        }
    };

    // Mirrors ProgramDetailPage.tsx openModule() in the web frontend exactly:
    // 1. Use videoUrl if already resolved (getProgram → resolveModuleVideos)
    // 2. Call GET /api/media/:id/signed-url for a fresh GCS signed URL
    // 3. Fall back to /api/media/:id/stream?token= proxy (no GCS credentials needed)
    // 4. YouTube ID only for recommended demo programs
    const openVideoDemo = async (sessionIdx: number) => {
        const session = sessions[sessionIdx] as any;

        // Already resolved by server's resolveModuleVideos
        if (session?.videoUrl) {
            setPlayingVideoUrl(session.videoUrl);
            setPlayingVideoId(null);
            return;
        }

        // YouTube only for recommended demo programs
        if (session?.videoId) {
            setPlayingVideoId(session.videoId);
            setPlayingVideoUrl(null);
            return;
        }

        // GCS video — resolve URL at tap time (same as web frontend)
        const mediaId = session?.videoMediaId;
        if (mediaId) {
            setResolvingVideo(true);
            let resolvedUrl: string | null = null;

            // Try signed URL first (works when GCS IAM signing is configured)
            try {
                const res = await client.get(`/api/media/${mediaId}/signed-url`);
                resolvedUrl = res.data?.data?.signedUrl || null;
            } catch {
                // GCS signing unavailable — fall through to stream proxy
            }

            // Stream proxy fallback — backend pipes GCS bytes with auth via ?token=
            // so <video src="..."> works without custom request headers
            if (!resolvedUrl) {
                const token = userToken || await getToken('userToken');
                if (token) {
                    resolvedUrl = `${API_URL}/api/media/${mediaId}/stream?token=${encodeURIComponent(token)}`;
                }
            }

            setResolvingVideo(false);

            if (resolvedUrl) {
                setPlayingVideoUrl(resolvedUrl);
                setPlayingVideoId(null);
                return;
            }

            Alert.alert('Video Unavailable', 'This video could not be loaded. Please try again shortly.');
            return;
        }

        // No video attached to this session
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                {/* ── Hero ──────────────────────────────────────── */}
                <View style={styles.hero}>
                    {program.image && program.image !== 'https://placehold.co/600x400' && (
                        <Image
                            source={{ uri: program.image }}
                            style={StyleSheet.absoluteFillObject}
                            contentFit="cover"
                        />
                    )}
                    <LinearGradient
                        colors={program.image && program.image !== 'https://placehold.co/600x400'
                            ? [heroColors[0] + 'CC', heroColors[1] + 'DD', heroColors[2]]
                            : heroColors}
                        style={StyleSheet.absoluteFillObject}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />
                    <SafeAreaView edges={['top']}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={22} color="#FFF" />
                            <Text style={styles.backBtnText}>Back</Text>
                        </TouchableOpacity>

                        <View style={styles.heroContent}>
                            <View style={styles.heroEmojiWrap}>
                                <Text style={styles.heroEmoji}>{emoji}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.heroTitle}>{program.title}</Text>
                                <View style={styles.heroMetaRow}>
                                    {program.category && (
                                        <View style={styles.heroCatChip}>
                                            <Text style={styles.heroCatChipText}>{program.category}</Text>
                                        </View>
                                    )}
                                    {program.difficulty && (
                                        <View style={styles.heroDiffChip}>
                                            <Text style={styles.heroDiffChipText}>{program.difficulty}</Text>
                                        </View>
                                    )}
                                    <Text style={styles.heroWeeks}>⏱ {program.durationWeeks}w</Text>
                                </View>
                            </View>
                        </View>

                        {/* Progress */}
                        {!isLocked && (
                            <View style={styles.progressSection}>
                                <View style={styles.progressHead}>
                                    <Text style={styles.progressLabel}>PROGRESS</Text>
                                    <Text style={styles.progressPct}>{progress}%</Text>
                                </View>
                                <View style={styles.progressBar}>
                                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                                </View>
                                <Text style={styles.progressCount}>{completedSessions.length} of {sessions.length} sessions done</Text>
                            </View>
                        )}
                    </SafeAreaView>
                </View>

                {/* Locked State */}
                {isLocked ? (
                    <View style={styles.lockedSection}>
                        <Ionicons name="lock-closed" size={48} color="#D1D5DB" />
                        <Text style={styles.lockedTitle}>Program Locked</Text>
                        <Text style={styles.lockedDesc}>
                            This program requires a <Text style={{ fontWeight: '800', color: '#D97706' }}>{program.requiredPlan}</Text> plan or higher.
                        </Text>
                        <TouchableOpacity style={styles.upgradeBtn}>
                            <LinearGradient colors={['#F59E0B', '#EA580C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.upgradeBtnInner}>
                                <Ionicons name="arrow-up-circle" size={18} color="#FFF" />
                                <Text style={styles.upgradeBtnText}>Upgrade to {program.requiredPlan?.charAt(0).toUpperCase() + program.requiredPlan?.slice(1)}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                ) : program.enrollmentRequired && program.enrollmentStatus === 'not_enrolled' ? (
                    /* Enrollment Required */
                    <View style={styles.lockedSection}>
                        <Text style={{ fontSize: 48 }}>📝</Text>
                        <Text style={styles.lockedTitle}>Enrollment Required</Text>
                        <Text style={styles.lockedDesc}>{program.description}</Text>
                        <TouchableOpacity style={styles.upgradeBtn} onPress={handleEnroll} disabled={enrollingProgram}>
                            <LinearGradient colors={['#7C3AED', '#6366F1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.upgradeBtnInner}>
                                {enrollingProgram ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <>
                                        <Ionicons name="add-circle" size={18} color="#FFF" />
                                        <Text style={styles.upgradeBtnText}>Enroll Now</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                ) : (
                    /* ── Program Execution View ──────────────────── */
                    <View style={styles.executionSection}>
                        {/* About */}
                        <View style={styles.aboutCard}>
                            <Text style={styles.aboutTitle}>About This Program</Text>
                            <Text style={styles.aboutText}>{program.description}</Text>
                            <View style={styles.aboutStats}>
                                {[
                                    [`⏱`, `${program.durationWeeks} weeks`],
                                    [`📋`, `${program.totalSessions} sessions`],
                                    [`👥`, `${(program.enrollmentCount || 0).toLocaleString()} enrolled`],
                                ].map(([icon, val]) => (
                                    <View key={val as string} style={styles.aboutStatItem}>
                                        <Text style={{ fontSize: 18 }}>{icon}</Text>
                                        <Text style={styles.aboutStatText}>{val}</Text>
                                    </View>
                                ))}
                            </View>
                            {/* Plan badges */}
                            <View style={styles.planRow}>
                                {(program.accessiblePlans || []).map((plan: string) => (
                                    <View key={plan} style={[styles.planTag, { backgroundColor: PLAN_BADGE[plan]?.bg || '#F3F4F6' }]}>
                                        <Text style={[styles.planTagText, { color: PLAN_BADGE[plan]?.text || '#6B7280' }]}>{plan}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Sessions List */}
                        <View style={styles.sessionsHeadRow}>
                            <Text style={styles.sessionsHeading}>Sessions</Text>
                            <Text style={styles.sessionsCount}>{sessions.length} total</Text>
                        </View>
                        {sessions.map((session, idx) => {
                            const isCompleted = completedSessions.includes(idx);
                            const isCurrent = idx === activeSession;
                            const isSessionLocked = idx > completedSessions.length && idx !== 0;
                            const hasVideo = !!(session as any).videoId || !!(session as any).videoMediaId || !!(session as any).videoUrl;

                            return (
                                <TouchableOpacity
                                    key={idx}
                                    style={[
                                        styles.sessionCard,
                                        isCurrent && styles.sessionCardActive,
                                        isCompleted && styles.sessionCardCompleted,
                                        isSessionLocked && styles.sessionCardLocked,
                                    ]}
                                    onPress={() => {
                                        if (!isSessionLocked) {
                                            setActiveSession(idx);
                                            setPlayingVideoId(null);
                                            setPlayingVideoUrl(null);
                                        }
                                    }}
                                    disabled={isSessionLocked}
                                    activeOpacity={0.7}
                                >
                                    <View style={[
                                        styles.sessionIdx,
                                        isCurrent && { backgroundColor: '#6366F1' },
                                        isCompleted && { backgroundColor: '#16A34A' },
                                        isSessionLocked && { backgroundColor: '#E5E7EB' },
                                    ]}>
                                        {isCompleted ? (
                                            <Ionicons name="checkmark" size={14} color="#FFF" />
                                        ) : isSessionLocked ? (
                                            <Ionicons name="lock-closed" size={12} color="#94A3B8" />
                                        ) : (
                                            <Text style={styles.sessionIdxText}>{idx + 1}</Text>
                                        )}
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.sessionTitle, isSessionLocked && { color: '#CBD5E1' }]} numberOfLines={1}>{session.title}</Text>
                                        <View style={styles.sessionSubRow}>
                                            <Text style={styles.sessionSubtitle}>{session.subtitle}</Text>
                                            {hasVideo && !isSessionLocked && (
                                                <View style={styles.videoTag}>
                                                    <Ionicons name={(session as any).videoId ? 'logo-youtube' : 'play-circle'} size={10} color={(session as any).videoId ? '#DC2626' : '#16A34A'} />
                                                    <Text style={[styles.videoTagText, { color: (session as any).videoId ? '#DC2626' : '#16A34A' }]}>
                                                        {(session as any).videoId ? 'YouTube' : 'Video'}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                    {isCurrent ? (
                                        <View style={styles.activeDot}><Text style={styles.activeText}>NOW</Text></View>
                                    ) : isCompleted ? (
                                        <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                                    ) : null}
                                </TouchableOpacity>
                            );
                        })}

                        {/* Current Session Modules */}
                        <View style={styles.modulesCard}>
                            <View style={styles.modulesHeader}>
                                <Text style={styles.modulesTitle}>{current.title}</Text>
                                <View style={[styles.modulesStatus, completedSessions.includes(activeSession) ? { backgroundColor: '#DCFCE7' } : { backgroundColor: '#DBEAFE' }]}>
                                    <Text style={[styles.modulesStatusText, completedSessions.includes(activeSession) ? { color: '#16A34A' } : { color: '#2563EB' }]}>
                                        {completedSessions.includes(activeSession) ? '✓ Done' : '● In Progress'}
                                    </Text>
                                </View>
                            </View>

                            {/* Video resolving indicator */}
                            {resolvingVideo && (
                                <View style={styles.resolvingRow}>
                                    <ActivityIndicator size="small" color="#6366F1" />
                                    <Text style={styles.resolvingText}>Loading video…</Text>
                                </View>
                            )}

                            {/* Inline Video Player */}
                            {(playingVideoId || playingVideoUrl) && (
                                <View style={styles.videoPlayerContainer}>
                                    <View style={styles.videoPlayerHeader}>
                                        <Text style={styles.videoPlayerTitle}>Now Playing</Text>
                                        <TouchableOpacity onPress={() => { setPlayingVideoId(null); setPlayingVideoUrl(null); }}>
                                            <Ionicons name="close-circle" size={24} color="#64748B" />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.videoWrapper}>
                                        {playingVideoUrl ? (
                                            <WebView
                                                source={{ html: `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{margin:0;padding:0;background:#000}video{width:100%;height:200px;display:block}</style></head><body><video src="${playingVideoUrl}" controls autoplay playsinline></video></body></html>` }}
                                                style={{ height: 200, width: '100%', backgroundColor: '#000' }}
                                                allowsInlineMediaPlayback
                                                mediaPlaybackRequiresUserAction={false}
                                                javaScriptEnabled
                                            />
                                        ) : (
                                            <YoutubeIframe
                                                height={200}
                                                play={true}
                                                videoId={playingVideoId!}
                                            />
                                        )}
                                    </View>
                                </View>
                            )}

                            {current.modules.map((mod, mi) => {
                                const hasGcsVideo = !!(current as any).videoUrl || !!(current as any).videoMediaId;
                                const hasYouTube = !!(current as any).videoId;
                                const isVideoModule = mod.type === 'video';
                                return (
                                <TouchableOpacity
                                    key={mi}
                                    style={[styles.moduleItem, isVideoModule && !hasGcsVideo && !hasYouTube && { opacity: 0.5 }]}
                                    onPress={() => isVideoModule ? openVideoDemo(activeSession) : undefined}
                                    disabled={!isVideoModule || resolvingVideo}
                                    activeOpacity={isVideoModule ? 0.7 : 1}
                                >
                                    <Text style={styles.moduleIcon}>{mod.icon}</Text>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.moduleTitle}>{mod.title}</Text>
                                        <Text style={styles.moduleDesc}>{mod.desc}</Text>
                                        <View style={styles.moduleAction}>
                                            {isVideoModule && hasGcsVideo ? (
                                                <View style={[styles.moduleTag, { backgroundColor: '#DCFCE7' }]}>
                                                    <Ionicons name="play-circle" size={12} color="#16A34A" />
                                                    <Text style={[styles.moduleTagText, { color: '#16A34A' }]}>Play Video</Text>
                                                </View>
                                            ) : isVideoModule && hasYouTube ? (
                                                <View style={[styles.moduleTag, { backgroundColor: '#FEE2E2' }]}>
                                                    <Ionicons name="logo-youtube" size={12} color="#DC2626" />
                                                    <Text style={[styles.moduleTagText, { color: '#DC2626' }]}>Play on YouTube</Text>
                                                </View>
                                            ) : isVideoModule ? (
                                                <View style={[styles.moduleTag, { backgroundColor: '#F1F5F9' }]}>
                                                    <Ionicons name="videocam-outline" size={10} color="#94A3B8" />
                                                    <Text style={[styles.moduleTagText, { color: '#94A3B8' }]}>No video</Text>
                                                </View>
                                            ) : null}
                                            {mod.type === 'exercise' && (
                                                <View style={[styles.moduleTag, { backgroundColor: '#FEF3C7' }]}>
                                                    <Ionicons name="fitness" size={10} color="#D97706" />
                                                    <Text style={[styles.moduleTagText, { color: '#D97706' }]}>Exercise</Text>
                                                </View>
                                            )}
                                            {mod.type === 'quiz' && (
                                                <View style={[styles.moduleTag, { backgroundColor: '#DCFCE7' }]}>
                                                    <Ionicons name="shield-checkmark" size={10} color="#16A34A" />
                                                    <Text style={[styles.moduleTagText, { color: '#16A34A' }]}>Assessment</Text>
                                                </View>
                                            )}
                                            <Text style={styles.moduleDur}>⏱ {mod.duration}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Health Tips */}
                        <View style={styles.tipsCard}>
                            <Text style={styles.tipsHeading}>💡 Today's Tips</Text>
                            {[
                                { emoji: '💧', tip: 'Stay hydrated — drink 8 glasses of water' },
                                { emoji: '🧘', tip: '5 min deep breathing before each session' },
                                { emoji: '🥗', tip: 'Balanced meal 1 hour before exercise' },
                                { emoji: '😴', tip: 'Aim for 7-8 hours quality sleep' },
                            ].map((item, i) => (
                                <View key={i} style={styles.tipRow}>
                                    <Text style={{ fontSize: 16 }}>{item.emoji}</Text>
                                    <Text style={styles.tipText}>{item.tip}</Text>
                                </View>
                            ))}
                        </View>

                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* ── Bottom Action Bar ───────────────────────────── */}
            {!isLocked && !(program.enrollmentRequired && program.enrollmentStatus === 'not_enrolled') && (
                <View style={styles.bottomBar}>
                    <View style={styles.bottomBarInner}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.bottomSession}>{current.title}</Text>
                            <Text style={styles.bottomSubtitle}>{current.subtitle}</Text>
                        </View>
                        <View style={styles.bottomBtns}>
                            <TouchableOpacity
                                style={styles.prevBtn}
                                disabled={activeSession === 0}
                                onPress={() => setActiveSession(prev => Math.max(0, prev - 1))}
                            >
                                <Ionicons name="chevron-back" size={16} color={activeSession === 0 ? '#D1D5DB' : '#6366F1'} />
                            </TouchableOpacity>

                            {completedSessions.includes(activeSession) ? (
                                <TouchableOpacity
                                    style={[styles.completeBtn, { backgroundColor: '#16A34A' }]}
                                    disabled={activeSession >= sessions.length - 1}
                                    onPress={() => setActiveSession(prev => Math.min(sessions.length - 1, prev + 1))}
                                >
                                    <Text style={styles.completeBtnText}>Next</Text>
                                    <Ionicons name="chevron-forward" size={14} color="#FFF" />
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity style={styles.completeBtn} onPress={handleCompleteSession}>
                                    <Text style={styles.completeBtnText}>Complete</Text>
                                    <Ionicons name="flash" size={14} color="#FFF" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' },
    emptyText: { fontSize: 14, color: '#94A3B8', fontWeight: '500', marginTop: 8 },
    backBtnEmpty: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, backgroundColor: '#F1F5F9' },
    backBtnEmptyText: { fontSize: 13, fontWeight: '600', color: '#6366F1' },

    // Hero
    hero: { paddingBottom: 24, paddingHorizontal: 20, overflow: 'hidden' },
    backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16, marginTop: 8 },
    backBtnText: { fontSize: 14, fontWeight: '600', color: '#FFF' },
    heroContent: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 14 },
    heroEmojiWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    heroEmoji: { fontSize: 30 },
    heroTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', marginBottom: 8 },
    heroMetaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
    heroCatChip: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    heroCatChipText: { fontSize: 10, fontWeight: '700', color: '#FFF' },
    heroDiffChip: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    heroDiffChipText: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.85)' },
    heroWeeks: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
    progressSection: { marginTop: 8 },
    progressHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    progressLabel: { fontSize: 9, fontWeight: '700', color: '#C7D2FE', letterSpacing: 1.5 },
    progressPct: { fontSize: 13, fontWeight: '800', color: '#FFF' },
    progressBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#34D399', borderRadius: 3 },
    progressCount: { fontSize: 10, color: '#C7D2FE', marginTop: 4 },

    // Locked
    lockedSection: { alignItems: 'center', paddingVertical: 50, paddingHorizontal: 30 },
    lockedTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginTop: 12 },
    lockedDesc: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20, marginTop: 6, marginBottom: 20 },
    upgradeBtn: { borderRadius: 12, overflow: 'hidden' },
    upgradeBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
    upgradeBtnText: { fontSize: 14, fontWeight: '700', color: '#FFF' },

    // Execution
    executionSection: { paddingHorizontal: 20, paddingTop: 20 },

    aboutCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 20 },
    aboutTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
    aboutText: { fontSize: 12, color: '#64748B', lineHeight: 18, marginBottom: 12 },
    aboutStats: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    aboutStatItem: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
    aboutStatText: { fontSize: 10, color: '#64748B', fontWeight: '600', marginTop: 4, textAlign: 'center' },
    planRow: { flexDirection: 'row', gap: 6 },
    planTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    planTagText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },

    sessionsHeadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
    sessionsHeading: { fontSize: 14, fontWeight: '800', color: '#0F172A', letterSpacing: 0.5, textTransform: 'uppercase' },
    sessionsCount: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
    sessionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#F1F5F9' },
    sessionCardActive: { borderColor: '#818CF8', backgroundColor: '#EEF2FF' },
    sessionCardCompleted: { borderColor: '#86EFAC', backgroundColor: '#F0FDF4' },
    sessionCardLocked: { opacity: 0.45 },
    sessionIdx: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    sessionIdxText: { fontSize: 13, fontWeight: '800', color: '#FFF' },
    sessionTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginBottom: 3 },
    sessionSubRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    sessionSubtitle: { fontSize: 10, color: '#94A3B8' },
    videoTag: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#F8FAFC', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5 },
    videoTagText: { fontSize: 9, fontWeight: '700' },
    activeDot: { backgroundColor: '#6366F1', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    activeText: { fontSize: 8, fontWeight: '800', color: '#FFF', letterSpacing: 1 },

    resolvingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 4 },
    resolvingText: { fontSize: 12, color: '#6366F1', fontWeight: '600' },
    modulesCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#F1F5F9', marginTop: 16, marginBottom: 16 },
    modulesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    modulesTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
    modulesStatus: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    modulesStatusText: { fontSize: 10, fontWeight: '700' },
    moduleItem: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#F1F5F9' },
    moduleIcon: { fontSize: 24, marginRight: 12, marginTop: 2 },
    moduleTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
    moduleDesc: { fontSize: 11, color: '#64748B', lineHeight: 16, marginBottom: 8 },
    moduleAction: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    moduleTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    moduleTagText: { fontSize: 10, fontWeight: '700' },
    moduleDur: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },

    // Video Player
    videoPlayerContainer: { marginTop: 16, marginBottom: 8, backgroundColor: '#F8FAFC', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0' },
    videoPlayerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', backgroundColor: '#FFF' },
    videoPlayerTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
    videoWrapper: { width: '100%', height: 200, backgroundColor: '#000' },

    // Tips
    tipsCard: { backgroundColor: '#F0F9FF', borderRadius: 16, padding: 16, marginBottom: 16 },
    tipsHeading: { fontSize: 13, fontWeight: '800', color: '#0F172A', marginBottom: 12, letterSpacing: 0.5, textTransform: 'uppercase' },
    tipRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    tipText: { fontSize: 12, color: '#64748B', flex: 1, lineHeight: 17 },

    // Bottom Bar
    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingBottom: 30, paddingTop: 12, paddingHorizontal: 20 },
    bottomBarInner: { flexDirection: 'row', alignItems: 'center' },
    bottomSession: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
    bottomSubtitle: { fontSize: 10, color: '#94A3B8' },
    bottomBtns: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    prevBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
    completeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#6366F1', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
    completeBtnText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
});

export default ProgramDetailsScreen;
