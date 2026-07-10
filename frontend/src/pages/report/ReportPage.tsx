import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import {
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Droplets,
  MapPin,
  ChevronLeft,
  Info,
  Calendar,
  Sprout,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

export function ReportPage() {
  const [searchParams] = useSearchParams();
  const rawId = searchParams.get("id");
  const id = rawId && rawId !== "undefined" && rawId !== "null" ? rawId : null;
  const { t } = useTranslation();

  const { data: report, isLoading, error } = useQuery({
    queryKey: ["report", id],
    queryFn: async () => {
      if (!id) throw new Error("No report ID provided");
      const res = await api.get(`/analyze/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="container mx-auto p-8 text-center text-red-500 mt-20">
        <AlertTriangle className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <h2 className="text-2xl font-bold">{t("report.error.title")}</h2>
        <p className="mt-2">{t("report.error.desc")}</p>
        <Link to="/dashboard" className="text-emerald-600 mt-4 inline-block hover:underline">
          {t("report.error.back")}
        </Link>
      </div>
    );
  }

  const detectedDiseases = report.detection?.detected_diseases ?? [];
  const detectedPests = report.detection?.detected_pests ?? [];
  const primaryDisease = detectedDiseases.length > 0 ? detectedDiseases[0] : null;
  const severityScore = report.health_score ?? 0;
  const overallSeverity = primaryDisease?.severity ?? "none";
  const primaryTreatment = report.action_plan?.treatments?.[0] ?? null;

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 pb-24 max-w-5xl">
      <div className="flex items-center justify-between border-b border-gray-100 pb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{t("report.title")}</h1>
            <p className="text-gray-500 font-medium">
              {t("report.subtitle")} • {new Date(report.created_at).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-semibold border border-emerald-100 shadow-sm">
          <ShieldCheck className="w-4 h-4" /> {t("report.verified")}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-rose-500/10 border border-rose-100 relative"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="p-8 md:p-10 flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="relative flex h-40 w-40 shrink-0 items-center justify-center rounded-full bg-white shadow-lg border border-gray-50">
            <svg className="absolute inset-0 h-full w-full -rotate-90">
              <circle cx="80" cy="80" r="72" fill="none" stroke="#f1f5f9" strokeWidth="12" />
              <circle
                cx="80"
                cy="80"
                r="72"
                fill="none"
                stroke="#e11d48"
                strokeWidth="12"
                strokeDasharray="452.39"
                strokeDashoffset={452.39 * (1 - severityScore / 100)}
                strokeLinecap="round"
                className="transition-all duration-1500 ease-out"
              />
            </svg>
            <div className="text-center">
              <span className="text-4xl font-black text-gray-900">{severityScore}</span>
              <span className="block text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">
                {t("report.score")}
              </span>
            </div>
          </div>

          <div className="text-center md:text-left flex-1">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border ${
                overallSeverity === "critical"
                  ? "bg-rose-100 text-rose-700 border-rose-200"
                  : overallSeverity === "high"
                    ? "bg-orange-100 text-orange-700 border-orange-200"
                    : overallSeverity === "medium"
                      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                      : "bg-emerald-100 text-emerald-700 border-emerald-200"
              }`}
            >
              {overallSeverity === "none"
                ? t("report.status.healthy")
                : `${overallSeverity} ${t("report.status.severity")}`}
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
              {primaryDisease ? `${primaryDisease.name} ${t("report.status.detected")}` : t("report.status.healthyTitle")}
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed max-w-xl">
              {primaryDisease ? primaryDisease.notes || t("report.status.diseaseDesc") : t("report.status.healthyDesc")}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-8 md:grid-cols-12">
        <div className="md:col-span-5 space-y-8">
          <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl bg-white">
            <CardHeader className="pb-4 border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <AlertTriangle className="h-5 w-5 text-rose-500" />
                {t("report.confidence.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {detectedDiseases.map((d: any, i: number) => (
                <div key={`disease-${i}`}>
                  <div className="flex justify-between items-end mb-2">
                    <h4 className="font-bold text-gray-900">{d.name}</h4>
                    <span className="font-mono text-sm font-bold text-rose-600">{Math.round(d.confidence * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-rose-500 h-2.5 rounded-full" style={{ width: `${d.confidence * 100}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{t("report.confidence.disease")}</p>
                </div>
              ))}

              {detectedPests.map((p: any, i: number) => (
                <div key={`pest-${i}`}>
                  <div className="flex justify-between items-end mb-2">
                    <h4 className="font-bold text-gray-900">{p.name}</h4>
                    <span className="font-mono text-sm font-bold text-amber-500">{Math.round(p.confidence * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${p.confidence * 100}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{t("report.confidence.pest")}</p>
                </div>
              ))}

              {!detectedDiseases.length && !detectedPests.length && (
                <p className="text-gray-500 text-sm">{t("report.confidence.none")}</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl bg-white">
            <CardHeader className="pb-4 border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <Calendar className="h-5 w-5 text-primary-500" />
                {t("report.recovery.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between p-4 bg-primary-50 border border-primary-100 rounded-2xl">
                <div>
                  <p className="text-sm text-primary-600 font-semibold mb-1">{t("report.recovery.label")}</p>
                  <p className="text-2xl font-black text-primary-900">
                    {primaryTreatment?.recovery || t("report.recovery.days")}
                  </p>
                </div>
                <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm text-primary-500">
                  <Sprout className="h-6 w-6" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4 leading-relaxed">{t("report.recovery.desc")}</p>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-7">
          <Card className="border-primary-200 bg-gradient-to-b from-primary-50/50 to-white shadow-lg shadow-primary-500/5 rounded-3xl overflow-hidden h-full">
            <CardHeader className="bg-white border-b border-primary-100 pb-6 pt-8">
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="h-8 w-8 text-primary-600" />
                <CardTitle className="text-2xl font-extrabold text-gray-900">
                  {t("report.plan.title")}
                </CardTitle>
              </div>
              <CardDescription className="text-base text-gray-600 font-medium ml-11">
                {t("report.plan.subtitle")}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-8 space-y-8">
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:border-primary-300 transition-colors">
                <div className="absolute top-0 left-0 w-2 h-full bg-primary-500" />
                <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pl-4">
                  <h4 className="font-extrabold text-gray-900 text-xl">
                    {primaryTreatment?.medicine || "No treatment needed"}
                  </h4>
                  <span className="inline-block px-3 py-1 rounded bg-primary-100 text-primary-800 text-xs font-bold uppercase tracking-wider">
                    {report.recommendation_type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 pl-4 mb-6">
                  <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                    <div className="text-sm text-gray-500 font-medium mb-1 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-gray-400" /> {t("report.plan.medicine.dosage")}
                    </div>
                    <div className="font-black text-gray-900 text-lg">{primaryTreatment?.dose || "-"}</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                    <div className="text-sm text-gray-500 font-medium mb-1 flex items-center gap-1.5">
                      <Droplets className="w-4 h-4 text-gray-400" /> {t("report.plan.medicine.water")}
                    </div>
                    <div className="font-black text-gray-900 text-lg">{primaryTreatment?.water || "-"}</div>
                  </div>
                </div>

                <div className="pl-4">
                  <div className="bg-amber-50 text-amber-900 p-4 rounded-xl border border-amber-200 flex gap-3 shadow-inner">
                    <Info className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                    <p className="text-sm leading-relaxed font-medium">
                      <span className="font-bold">{t("report.plan.medicine.important")}</span>{" "}
                      {primaryTreatment?.precautions || t("report.plan.medicine.warning")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary-500" />
                  {t("report.plan.why.title")}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  {primaryTreatment?.explanation?.why_this_medicine || t("report.plan.why.desc")}
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary-500/20 font-bold">
                  {t("report.plan.actions.add")}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto h-14 px-8 bg-white border-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  {t("report.plan.actions.order")} <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
