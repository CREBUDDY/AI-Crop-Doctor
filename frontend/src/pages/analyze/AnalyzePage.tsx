import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Image as ImageIcon,
  UploadCloud,
  X,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Lock,
  History,
  Infinity as InfinityIcon,
  Map,
  MessageSquare,
  CloudLightning,
  Activity,
  Bell,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../lib/useAuthStore";
import { AuthModal } from "../../components/auth/AuthModal";
import { useQuery } from "@tanstack/react-query";

const getProcessingSteps = (t: any) => [
  t("analyze.steps.scanning"),
  t("analyze.steps.identifying"),
  t("analyze.steps.analyzing"),
  t("analyze.steps.crossReferencing"),
  t("analyze.steps.generating"),
];

export function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const { isGuest } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const PROCESSING_STEPS = getProcessingSteps(t);

  const { data: historyList } = useQuery({
    queryKey: ["scanHistoryList"],
    queryFn: async () => {
      const res = await api.get("/analyze/history/list");
      return res.data;
    },
    enabled: isGuest,
  });

  const scansUsed = historyList?.length || 0;
  const remainingScans = Math.max(0, 2 - scansUsed);
  const isLimitReached = isGuest && scansUsed >= 2;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (selectedFile: File) => {
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const clearSelection = () => {
    setFile(null);
    setPreviewUrl(null);
    setIsAnalyzing(false);
    setProcessingStep(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setProcessingStep(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      setProcessingStep(0);
      const uploadRes = await api.post("/analyze/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const imageId = uploadRes.data.image_id;

      setProcessingStep(1);
      const predictRes = await api.post("/analyze/predict", {
        image_id: imageId,
        farm_id: null,
        language: i18n.language,
      });

      setProcessingStep(4);

      const analysisId = predictRes.data?.analysis_id || predictRes.data?.id;
      if (!analysisId) {
        throw new Error("Analysis completed but no report ID was returned");
      }

      setTimeout(() => navigate(`/report?id=${analysisId}`), 1000);
    } catch (error: any) {
      console.error("Analysis failed:", error);
      setIsAnalyzing(false);

      if (error.response?.status === 403 && error.response?.data?.detail === "GUEST_LIMIT_REACHED") {
        setShowAuthModal(true);
        clearSelection();
      } else if (error.response?.status === 400 && error.response?.data?.detail?.error_code === "IMAGE_REJECTED") {
        const issues = error.response.data.detail.issues?.map((i: string) => `- ${i}`).join("\n") || "";
        alert(
          "Image Quality Rejected\n\n" +
            error.response.data.detail.message +
            "\n\nIssues detected:\n" +
            issues
        );
        clearSelection();
      } else if (error.response?.status === 400 && error.response?.data?.detail?.error_code === "LOW_CONFIDENCE") {
        alert(
          "Low Confidence Detection\n\n" +
            error.response.data.detail.message +
            "\n\nReason: " +
            error.response.data.detail.rejection_reason
        );
        clearSelection();
      } else if (error.response?.status === 400 && error.response?.data?.detail?.error_code === "INVALID_IMAGE") {
        alert(t("analyze.alertValidation") + "\n" + error.response.data.detail.message);
        clearSelection();
      } else if (error.response?.status === 429) {
        alert(
          "Gemini API quota reached\n\n" +
            (error.response?.data?.detail ||
              "Your API key has hit its current usage limit. Please wait and try again later.")
        );
        clearSelection();
      } else if (error.response?.status === 503) {
        alert(
          "AI service unavailable\n\n" +
            (error.response?.data?.detail || t("analyze.alertFail"))
        );
        clearSelection();
      } else {
        alert(error.response?.data?.detail || t("analyze.alertFail"));
      }
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 flex flex-col min-h-[calc(100vh-140px)] max-w-4xl">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{t("analyze.title")}</h1>
        <p className="text-gray-500 mt-2">{t("analyze.subtitle")}</p>
      </div>

      {isGuest && !isLimitReached && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-200/60 text-emerald-900 px-6 py-4 rounded-2xl mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="text-2xl">Trial</div>
            <div>
              <div className="font-bold text-emerald-950">Experience AI Crop Doctor</div>
              <div className="text-sm text-emerald-700/80 font-medium">No signup required.</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/60 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm border border-emerald-100">
              {remainingScans} / 2 Remaining
            </div>
            <Button
              variant="outline"
              size="sm"
              className="bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-xl"
              onClick={() => setShowAuthModal(true)}
            >
              Save Account
            </Button>
          </div>
        </motion.div>
      )}

      {isLimitReached ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl mx-auto"
        >
          <div className="relative overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-2xl shadow-gray-200/50">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/90 to-white/90 backdrop-blur-xl z-0" />

            <div className="relative z-10 p-8 sm:p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30 text-white">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
                You've completed your free trial.
              </h2>
              <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
                Create your FREE account to unlock unlimited AI crop analysis and much more.
              </p>

              <div className="grid grid-cols-2 gap-4 text-left max-w-md mx-auto mb-10 opacity-70 blur-[1px] hover:blur-none transition-all duration-500">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <History className="w-4 h-4 text-emerald-500" /> Crop History
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <InfinityIcon className="w-4 h-4 text-emerald-500" /> Unlimited AI Analysis
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <Map className="w-4 h-4 text-emerald-500" /> Multiple Farms
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <MessageSquare className="w-4 h-4 text-emerald-500" /> AI Chat
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <CloudLightning className="w-4 h-4 text-emerald-500" /> Weather Alerts
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <Activity className="w-4 h-4 text-emerald-500" /> Disease Prediction
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100 col-span-2 justify-center">
                  <Bell className="w-4 h-4 text-emerald-500" /> Notifications & Alerts
                </div>
              </div>

              <Button
                onClick={() => setShowAuthModal(true)}
                size="lg"
                className="w-full max-w-xs mx-auto h-14 text-lg font-bold rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_40px_rgba(5,150,105,0.4)] hover:shadow-[0_0_60px_rgba(5,150,105,0.6)] transition-all animate-pulse-glow"
              >
                Create Free Account
              </Button>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {!previewUrl ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl"
              >
                <div
                  className={`relative overflow-hidden border-2 border-dashed rounded-3xl p-16 text-center transition-all duration-300 cursor-pointer ${
                    isDragActive
                      ? "border-primary-500 bg-primary-50/80 scale-[1.02] shadow-xl shadow-primary-500/20"
                      : "border-primary-200 bg-primary-50/30 hover:border-primary-400 hover:bg-primary-50"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary-400/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-lg border border-primary-100">
                      <UploadCloud className={`h-12 w-12 transition-colors ${isDragActive ? "text-primary-600" : "text-primary-500"}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{t("analyze.dragDrop")}</h3>
                    <p className="text-gray-500 mb-8 max-w-xs mx-auto">{t("analyze.supports")}</p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                      <Button
                        variant="outline"
                        className="h-14 px-8 bg-white border-gray-200 hover:bg-gray-50 shadow-sm rounded-xl font-semibold"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        <ImageIcon className="mr-2 h-5 w-5 text-gray-500" />
                        {t("analyze.browse")}
                      </Button>
                      <Button
                        className="h-14 px-8 bg-primary-600 hover:bg-primary-700 shadow-md rounded-xl font-semibold text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        <Camera className="mr-2 h-5 w-5" />
                        {t("analyze.camera")}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm font-medium text-gray-500">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                    {t("analyze.trust1")}
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-500" />
                    {t("analyze.trust2")}
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                    {t("analyze.trust3")}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-xl"
              >
                <div className="relative overflow-hidden rounded-3xl shadow-2xl border border-gray-200 bg-white">
                  <div className="relative h-96 w-full bg-gray-900">
                    <img src={previewUrl} alt="Crop Preview" className="w-full h-full object-cover opacity-90" />

                    {isAnalyzing && (
                      <>
                        <div className="absolute inset-0 bg-primary-950/60 backdrop-blur-sm transition-all duration-500" />
                        <motion.div
                          initial={{ top: "0%" }}
                          animate={{ top: ["0%", "100%", "0%"] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                          className="absolute left-0 right-0 h-1 bg-primary-400 shadow-[0_0_20px_rgba(74,222,128,1)] z-10"
                        />
                      </>
                    )}

                    {!isAnalyzing && (
                      <button
                        onClick={clearSelection}
                        className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 transition-colors border border-white/20"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    )}

                    {isAnalyzing && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center">
                        <div className="mb-6 relative flex h-20 w-20 items-center justify-center rounded-full bg-primary-500/20 backdrop-blur-md border border-primary-400/30">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                            className="absolute inset-0 rounded-full border-t-2 border-primary-400"
                          />
                          <BrainIcon className="h-10 w-10 text-primary-300" />
                        </div>

                        <div className="h-8 relative w-full flex justify-center">
                          <AnimatePresence mode="wait">
                            <motion.p
                              key={processingStep}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="text-white font-bold text-lg absolute"
                            >
                              {PROCESSING_STEPS[processingStep]}
                            </motion.p>
                          </AnimatePresence>
                        </div>
                      </div>
                    )}
                  </div>

                  {!isAnalyzing && (
                    <div className="p-6 bg-white">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h4 className="font-bold text-gray-900">{t("analyze.qualityTitle")}</h4>
                          <p className="text-sm text-gray-500">{t("analyze.qualityDesc")}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-semibold border border-emerald-100">
                          <CheckCircle2 className="w-4 h-4" /> {t("analyze.excellent")}
                        </div>
                      </div>
                      <Button
                        size="lg"
                        className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary-500/20"
                        onClick={handleAnalyze}
                      >
                        {t("analyze.analyzeBtn")}
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}

function BrainIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
      <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
      <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
      <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
      <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
      <path d="M6 18a4 4 0 0 1-1.967-.516" />
      <path d="M19.967 17.484A4 4 0 0 1 18 18" />
    </svg>
  );
}
