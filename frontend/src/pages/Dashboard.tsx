import { useEffect, useState, useRef } from 'react';
import { Panel } from '../components/ui/Panel';
import { Film, FileAudio, Image as ImageIcon, Upload, X, Sparkles, AlertTriangle, CheckCircle, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs
} from 'firebase/firestore';
import { MultiModelAudioAnalysis } from '../components/MultiModelAudioAnalysis';
import { MultiModelAnalysis } from '../services/modelService';

/* ================= STAT CARD WITH ANIMATIONS ================= */
const StatCard = ({ label, value, trend, color = "text-red-500", icon: Icon }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(255,0,51,0.2)' }}
    transition={{ duration: 0.3 }}
    className="relative p-6 bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden group"
  >
    {/* Animated gradient background */}
    <motion.div
      className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100"
      transition={{ duration: 0.3 }}
    />

    {/* Icon */}
    <div className="relative z-10 flex items-start justify-between mb-3">
      <div>
        <p className="text-[9px] font-mono text-gray-500 tracking-[0.2em] uppercase font-semibold mb-1">
          {label}
        </p>
        <motion.h4
          className={`text-3xl font-bold ${color}`}
          style={{ fontFamily: '"JetBrains Mono", monospace' }}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          {value}
        </motion.h4>
      </div>
      {Icon && (
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Icon className={`w-8 h-8 ${color} opacity-30`} />
        </motion.div>
      )}
    </div>

    <div className="relative z-10">
      <span className="text-[10px] font-mono text-gray-600 tracking-wide">{trend}</span>
    </div>

    {/* Bottom glow line */}
    <motion.div
      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent"
      initial={{ scaleX: 0 }}
      whileHover={{ scaleX: 1 }}
      transition={{ duration: 0.5 }}
    />
  </motion.div>
);

/* ================= IMAGE UPLOAD MODAL ================= */
const ImageUploadModal = ({ onClose, onUpload }: any) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) return;
    setUploading(true);
    await onUpload(selectedImage);
    setUploading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg mx-4 bg-gradient-to-br from-black via-red-950/20 to-black border border-red-500/30 rounded-2xl overflow-hidden"
        style={{
          boxShadow: '0 0 60px rgba(255,0,51,0.3), inset 0 0 40px rgba(255,0,51,0.05)',
        }}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5 text-red-400" />
            </motion.div>
            <h3
              className="text-xl font-bold text-white tracking-wide"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              Image Analysis Portal
            </h3>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-gray-500 hover:text-red-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Upload Area */}
          {!preview ? (
            <motion.div
              onClick={(e) => {
    e.stopPropagation();   // 🔑 THIS LINE FIXES IT
    fileInputRef.current?.click();
  }}
              className="relative border-2 border-dashed border-white/20 rounded-xl p-12 cursor-pointer group hover:border-red-500/50 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 rounded-xl"
                transition={{ duration: 0.3 }}
              />
              
              <div className="relative z-10 text-center space-y-4">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center"
                >
                  <ImageIcon className="w-8 h-8 text-red-400" />
                </motion.div>
                <div>
                  <p className="text-sm font-mono text-gray-300 mb-2">
                    Drop image here or click to browse
                  </p>
                  <p className="text-xs font-mono text-gray-500">
                    PNG, JPG, WEBP up to 10MB
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              {/* Preview */}
              <div className="relative rounded-xl overflow-hidden border border-white/10">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-64 object-contain bg-black/40"
                />
                <motion.button
                  onClick={() => {
                    setSelectedImage(null);
                    setPreview(null);
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-3 right-3 p-2 bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg text-gray-300 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* File Info */}
              <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-white/10">
                <ImageIcon className="w-5 h-5 text-red-400" />
                <div className="flex-1">
                  <p className="text-xs font-mono text-white truncate">
                    {selectedImage?.name}
                  </p>
                  <p className="text-[10px] font-mono text-gray-500">
                    {(selectedImage!.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-black/60 border border-white/10 hover:border-white/30 text-white rounded-xl font-mono text-sm tracking-wide transition-all"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUpload}
              disabled={!selectedImage || uploading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl font-mono text-sm tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {uploading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Analyze Image
                  </>
                )}
              </span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ================= DASHBOARD ================= */
export const Dashboard = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [audioResult, setAudioResult] = useState<any>(null);
  const [heatmapImage, setHeatmapImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const [mindflayer, setMindflayer] = useState<number>(0);
  const [riftStatus, setRiftStatus] = useState<'NORMAL' | 'CRITICAL'>('NORMAL');
  const [deepfakeCount, setDeepfakeCount] = useState<number>(0);
  const [activeAgents, setActiveAgents] = useState<number>(0);

  /* ---------- Deepfake Upload Handler ---------- */
  const analyzeVideo = async () => {
    if (!videoFile) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', videoFile);

    try {
      const res = await fetch('http://localhost:3001/api/detect-deepfake', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ error: 'Analysis failed' });
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Audio Deepfake Detection Handler ---------- */
  const analyzeAudio = async () => {
    if (!audioFile) return;

    setAudioLoading(true);
    setAudioResult(null);
    setHeatmapImage(null);

    const formData = new FormData();
    formData.append('file', audioFile);

    try {
      // Call our FastAPI backend
      const res = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setAudioResult(data.prediction);
      setHeatmapImage(data.heatmap.heatmap_image);
    } catch (err) {
      console.error('Audio analysis error:', err);
      setAudioResult({ error: 'Audio analysis failed. Make sure the backend is running on localhost:8000' });
    } finally {
      setAudioLoading(false);
    }
  };

  /* ---------- Image Upload Handler ---------- */
  const handleImageUpload = async (file: File) => {
    console.log('Analyzing image:', file.name);
    // Implement your image analysis API call here
    setShowImageModal(false);
  };

  useEffect(() => {
    const fetchStats = async () => {
      const auth = getAuth();
      const db = getFirestore();
      const user = auth.currentUser;

      if (user) {
        const statsRef = doc(db, 'stats', user.uid);
        const statsSnap = await getDoc(statsRef);

        if (statsSnap.exists()) {
          const value = statsSnap.data().mindflayer ?? 0;
          setMindflayer(value);
          setRiftStatus(value < 50 ? 'NORMAL' : 'CRITICAL');
        } else {
          setMindflayer(0);
          setRiftStatus('NORMAL');
        }
      }

      const countSnap = await getDocs(collection(db, 'count'));
      countSnap.forEach((doc) => {
        const data = doc.data();
        if (data.total !== undefined) {
          setDeepfakeCount(data.total);
        }
      });

      const usersSnap = await getDocs(collection(db, 'users'));
      setActiveAgents(usersSnap.size);
    };

    fetchStats();
  }, []);

  return (
    <div className="h-full flex flex-col gap-8">
      {/* ================= HEADER ================= */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2
            className="text-5xl font-bold tracking-tight leading-none mb-3"
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              background: 'linear-gradient(135deg, #ffffff 0%, #ff0033 50%, #00ffff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Detection Lab
          </h2>
          <p className="text-gray-500 font-mono text-sm tracking-[0.15em] uppercase">
            Deepfake Analysis System
          </p>
        </div>
        
        <motion.div
          animate={{
            boxShadow: [
              '0 0 20px rgba(255,0,51,0.3)',
              '0 0 40px rgba(255,0,51,0.6)',
              '0 0 20px rgba(255,0,51,0.3)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center gap-3 px-6 py-3 bg-red-950/30 border border-red-500/40 rounded-full backdrop-blur-sm"
        >
          <motion.div
            className="w-3 h-3 bg-red-500 rounded-full"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-sm font-mono text-red-400 tracking-[0.15em] uppercase font-semibold">
            Threat: Critical
          </span>
        </motion.div>
      </motion.header>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Mindflayer Activity"
          value={`${mindflayer}%`}
          trend={mindflayer < 50 ? 'Stable Readings' : '↑ Anomaly Detected'}
          icon={AlertTriangle}
        />

        <StatCard
          label="Deepfakes Detected"
          value={deepfakeCount}
          trend="Total Incidents"
          color="text-cyan-400"
          icon={CheckCircle}
        />

        <StatCard
          label="Rift Stability"
          value={riftStatus}
          trend={riftStatus === 'CRITICAL' ? 'System Failing' : 'Within Parameters'}
          color={riftStatus === 'CRITICAL' ? 'text-purple-400' : 'text-cyan-400'}
          icon={Sparkles}
        />

        <StatCard
          label="Active Agents"
          value={activeAgents}
          trend="Currently Online"
          color="text-white"
          icon={CheckCircle}
        />
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* ===== GLOBAL MONITOR ===== */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-7"
        >
          <Panel className="h-full relative overflow-hidden" title="Global Rift Tracker">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.08),transparent_70%)]" />
            
            {/* Animated threat markers */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  top: `${15 + Math.random() * 70}%`,
                  left: `${15 + Math.random() * 70}%`,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1, 1.2, 1],
                  opacity: [0, 1, 0.6, 1],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.2,
                  repeat: Infinity,
                  repeatDelay: 5,
                }}
              >
                <div className="relative">
                  <motion.div
                    className="w-4 h-4 border-2 border-red-500 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.8, 0.3, 0.8],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  </div>
                </div>
              </motion.div>
            ))}

            <div className="absolute bottom-4 left-4 font-mono text-[10px] text-red-500/80 space-y-1">
              <p className="tracking-[0.15em]">SECTOR: HAWKINS</p>
              <p className="tracking-[0.15em]">COORDINATES: LOCKED</p>
              <p className="tracking-[0.15em]">STATUS: MONITORING</p>
            </div>
          </Panel>
        </motion.div>

        {/* ===== ANALYSIS OUTPUT ===== */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-5"
        >
          <Panel className="h-full overflow-hidden" title="Analysis Output">
            <div className="h-full overflow-y-auto font-mono text-xs text-gray-400 space-y-3 pr-2 custom-scrollbar">
              <AnimatePresence mode="wait">
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2"
                  >
                    <p className="text-cyan-400 flex items-center gap-2">
                      <Loader className="w-3 h-3 animate-spin" />
                      Analyzing video stream...
                    </p>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-500 to-red-500"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    </div>
                  </motion.div>
                )}

                {!loading && result && !result.error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-white/10">
                      <span className="text-gray-500 uppercase text-[10px] tracking-wide">Verdict</span>
                      <span className={`font-bold ${result.overall_verdict === 'Deepfake' ? 'text-red-500' : 'text-cyan-400'}`}>
                        {result.overall_verdict}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-white/10">
                      <span className="text-gray-500 uppercase text-[10px] tracking-wide">Confidence</span>
                      <span className="text-white font-bold">
                        {(result.overall_confidence * 100).toFixed(2)}%
                      </span>
                    </div>

                    {result.suspicious_segments.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-gray-500 uppercase text-[10px] tracking-wide mb-2">
                          Suspicious Segments
                        </p>
                        {result.suspicious_segments.map((seg: any, i: number) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center gap-2 p-2 bg-red-950/20 border-l-2 border-red-500 rounded"
                          >
                            <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0" />
                            <span className="text-red-400 text-[11px]">
                              {seg.start_time.toFixed(2)}s – {seg.end_time.toFixed(2)}s
                              <span className="text-gray-500 ml-2">
                                ({(seg.confidence * 100).toFixed(1)}%)
                              </span>
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {result?.error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 bg-red-950/20 border border-red-500/30 rounded-lg"
                  >
                    <p className="text-red-400 text-xs">Analysis failed. Please try again.</p>
                  </motion.div>
                )}

                {!loading && !result && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-40"
                  >
                    <Sparkles className="w-8 h-8 text-gray-600" />
                    <p className="text-gray-600 text-xs">
                      Awaiting video ingestion...
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Panel>
        </motion.div>
      </div>

      {/* ================= INGESTION PANELS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* VIDEO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-1"
        >
          <Panel title="Video Ingestion">
            <div className="relative">
              {!videoFile ? (
                <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-white/20 rounded-xl bg-black/30 cursor-pointer group hover:border-red-500/50 transition-all">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-center"
                  >
                    <Film className="w-10 h-10 mx-auto text-gray-600 group-hover:text-red-400 transition-colors mb-3" />
                    <p className="text-xs font-mono text-gray-500 group-hover:text-gray-400">
                      Drop video file or click to browse
                    </p>
                    <p className="text-[10px] font-mono text-gray-700 mt-1">
                      MP4, MOV, AVI supported
                    </p>
                  </motion.div>
                  <input
                    type="file"
                    accept="video/*"
                    hidden
                    onChange={(e) =>
                      e.target.files && setVideoFile(e.target.files[0])
                    }
                  />
                </label>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-black/40 rounded-lg border border-cyan-500/30">
                    <Film className="w-5 h-5 text-cyan-400" />
                    <div className="flex-1">
                      <p className="text-xs font-mono text-white truncate">
                        {videoFile.name}
                      </p>
                      <p className="text-[10px] font-mono text-gray-500">
                        {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setVideoFile(null)}
                      className="text-gray-500 hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </div>

                  <motion.button
                    onClick={analyzeVideo}
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white rounded-xl font-mono text-sm tracking-wide transition-all disabled:opacity-50 relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Analyze Video
                        </>
                      )}
                    </span>
                  </motion.button>
                </div>
              )}
            </div>
          </Panel>
        </motion.div>

        {/* AUDIO + IMAGE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-1"
        >
          <Panel title="Audio & Image Ingestion">
            <div className="grid grid-cols-2 gap-4">
              {/* Audio */}
              <div className="space-y-3">
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-white/20 rounded-xl bg-black/30 cursor-pointer group hover:border-purple-500/50 transition-all">
                  {!audioFile ? (
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      className="text-center"
                    >
                      <FileAudio className="w-6 h-6 mx-auto text-gray-600 group-hover:text-purple-400 transition-colors mb-2" />
                      <p className="text-[10px] font-mono text-gray-500 group-hover:text-gray-400">
                        Audio File
                      </p>
                    </motion.div>
                  ) : (
                    <div className="text-center px-2">
                      <FileAudio className="w-5 h-5 mx-auto text-purple-400 mb-2" />
                      <p className="text-[10px] font-mono text-purple-400 truncate">
                        {audioFile.name}
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="audio/*"
                    hidden
                    onChange={(e) =>
                      e.target.files && setAudioFile(e.target.files[0])
                    }
                  />
                </label>
                
                {audioFile && (
                  <motion.button
                    onClick={analyzeAudio}
                    disabled={audioLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-lg font-mono text-xs tracking-wide transition-all disabled:opacity-50 relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {audioLoading ? (
                        <>
                          <Loader className="w-3 h-3 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" />
                          Analyze Audio
                        </>
                      )}
                    </span>
                  </motion.button>
                )}
              </div>

              {/* Image */}
              <motion.button
                onClick={() => setShowImageModal(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-white/20 rounded-xl bg-black/30 cursor-pointer group hover:border-red-500/50 transition-all"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  className="text-center"
                >
                  <ImageIcon className="w-6 h-6 mx-auto text-gray-600 group-hover:text-red-400 transition-colors mb-2" />
                  <p className="text-[10px] font-mono text-gray-500 group-hover:text-gray-400">
                    Image Analysis
                  </p>
                  <p className="text-[9px] font-mono text-gray-700 mt-1">
                    Click to upload
                  </p>
                </motion.div>
              </motion.button>
            </div>
            
            {/* Audio Analysis Results */}
            {audioResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-black/40 rounded-lg border border-purple-500/30 space-y-2"
              >
                <h4 className="text-xs font-mono text-purple-400 uppercase tracking-wide mb-2">Audio Analysis Results</h4>
                
                {audioResult.error ? (
                  <p className="text-red-400 text-xs">{audioResult.error}</p>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-[10px] uppercase">Prediction</span>
                      <span className={`font-bold text-xs ${audioResult.is_deepfake ? 'text-red-500' : 'text-cyan-400'}`}>
                        {audioResult.prediction?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-[10px] uppercase">Confidence</span>
                      <span className="text-white font-bold text-xs">
                        {audioResult.confidence ? `${(audioResult.confidence * 100).toFixed(2)}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-[10px] uppercase">Fake Probability</span>
                      <span className="text-orange-400 font-bold text-xs">
                        {audioResult.fake_probability ? `${(audioResult.fake_probability * 100).toFixed(2)}%` : 'N/A'}
                      </span>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </Panel>
        </motion.div>

        {/* HEATMAP DISPLAY */}
        {heatmapImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-1"
          >
            <Panel title="Grad-CAM Heatmap">
              <div className="space-y-3">
                <div className="relative rounded-lg overflow-hidden border border-white/10">
                  <img
                    src={heatmapImage}
                    alt="Grad-CAM Heatmap"
                    className="w-full h-auto bg-black/40"
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs font-mono text-gray-400">
                    Heatmap shows regions the model focused on for detection
                  </p>
                  <p className="text-[10px] font-mono text-gray-600 mt-1">
                    Warmer colors indicate higher importance
                  </p>
                </div>
              </div>
            </Panel>
          </motion.div>
        )}
      </div>

      {/* Image Upload Modal */}
      <AnimatePresence>
        {showImageModal && (
          <ImageUploadModal
            onClose={() => setShowImageModal(false)}
            onUpload={handleImageUpload}
          />
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 0, 51, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 0, 51, 0.5);
        }
      `}</style>
    </div>
  );
};