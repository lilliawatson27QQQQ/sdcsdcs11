import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  ArrowLeftRight,
  Send,
  Plus,
  Zap,
  Building2,
  Wallet,
  Star,
  Shield,
  Clock,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Download,
  Upload,
  ArrowLeft,
  DollarSign,
  CreditCard,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import InstantTransferTab from "./InstantTransferTab";
import RechargeTab from "./RechargeTab";
import { createNotification, type Notification } from "../utils/notifications";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";

interface TransfersTabProps {
  balance: {
    dzd: number;
    eur: number;
    usd: number;
    gbt: number;
    gbp?: number;
  };
  onTransfer?: (amount: number, recipientEmail: string) => void;
  onRecharge?: (amount: number, method: string, rib: string) => void;
  onNotification?: (notification: Notification) => void;
}

function TransfersTab({
  balance = { dzd: 0, eur: 0, usd: 0, gbt: 0, gbp: 0 },
  onTransfer,
  onRecharge,
  onNotification,
}: TransfersTabProps) {
  const [activeTransferType, setActiveTransferType] = useState<
    "main" | "internal" | "external" | "recharge" | "withdraw"
  >("main");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawRib, setWithdrawRib] = useState("");
  const [showWithdrawSuccess, setShowWithdrawSuccess] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");

  const handleNotification = (notification: Notification) => {
    if (onNotification) {
      onNotification(notification);
    }
  };

  const handleTransfer = (amount: number, recipientEmail: string) => {
    if (onTransfer) {
      onTransfer(amount, recipientEmail);
    }
    // Show success notification
    const notification = createNotification(
      "success",
      "تم التحويل بنجاح",
      `تم إرسال ${amount.toLocaleString()} دج بنجاح`,
    );
    handleNotification(notification);
  };

  const handleRecharge = (amount: number, method: string, rib: string) => {
    if (onRecharge) {
      onRecharge(amount, method, rib);
    }
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);

    if (!withdrawAmount || amount <= 0) {
      setWithdrawError("يرجى إدخال مبلغ صحيح");
      return;
    }

    if (amount < 1000) {
      setWithdrawError("الحد الأدنى للسحب هو 1000 دج");
      return;
    }

    if (amount > balance.dzd) {
      setWithdrawError("الرصيد غير كافي");
      return;
    }

    if (!withdrawRib.trim()) {
      setWithdrawError("يرجى إدخال رقم الحساب البنكي (RIB)");
      return;
    }

    if (withdrawRib.length < 16) {
      setWithdrawError("رقم الحساب البنكي غير صحيح");
      return;
    }

    setWithdrawError("");
    setShowWithdrawSuccess(true);

    const notification = createNotification(
      "success",
      "تم إرسال طلب السحب",
      `سيتم تحويل ${amount.toLocaleString()} دج إلى حسابك خلال 24 ساعة`,
    );
    handleNotification(notification);

    // Reset form after 3 seconds
    setTimeout(() => {
      setShowWithdrawSuccess(false);
      setWithdrawAmount("");
      setWithdrawRib("");
      setActiveTransferType("main");
    }, 3000);
  };

  // Main transfer selection screen
  if (activeTransferType === "main") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 p-4 pb-24">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:scale-110 transition-transform duration-300">
                <ArrowLeftRight className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              التحويلات
            </h1>
            <p className="text-gray-300 text-lg font-medium">
              اختر نوع التحويل المناسب لك
            </p>
            <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-400" />
                <span>سريع وآمن</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>مشفر 100%</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>متاح 24/7</span>
              </div>
            </div>
          </div>

          {/* Balance Card */}
          <Card className="bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-600/20 backdrop-blur-md shadow-2xl border border-indigo-400/30 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/5 via-purple-400/5 to-pink-400/5 animate-pulse"></div>
            <CardContent className="p-8 text-center relative z-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-indigo-200 text-sm font-medium">
                    رصيدك الحالي
                  </p>
                  <p className="text-xs text-gray-400">متاح للتحويل</p>
                </div>
              </div>
              <div className="bg-white/10 rounded-2xl p-6 mb-4 border border-white/20">
                <p className="text-5xl font-bold text-white mb-2 tracking-tight">
                  {balance.dzd.toLocaleString()}
                  <span className="text-2xl text-indigo-300 mr-2">دج</span>
                </p>
                <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mb-4"></div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-gray-400 text-xs mb-1">يورو</p>
                    <p className="text-white font-bold">€{balance.eur}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs mb-1">دولار</p>
                    <p className="text-white font-bold">${balance.usd || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs mb-1">جنيه</p>
                    <p className="text-white font-bold">
                      £{balance.gbp?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs text-indigo-200">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>رصيد نشط</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>محمي بالكامل</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transfer Type Selection */}
          <div className="space-y-4">
            {/* Internal Transfer */}
            <Card
              className="bg-gradient-to-br from-emerald-500/20 via-green-500/20 to-teal-600/20 backdrop-blur-md shadow-2xl border border-emerald-400/30 text-white relative overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer"
              onClick={() => setActiveTransferType("internal")}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 via-green-400/5 to-teal-400/5 animate-pulse"></div>
              <CardContent className="p-8 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-2xl">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        معاملات داخلية
                      </h3>
                      <p className="text-emerald-200 text-sm mb-1">
                        تحويل فوري بين المستخدمين
                      </p>
                      <div className="flex items-center gap-4 text-xs text-emerald-300">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>أقل من ثانية</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          <span>آمن 100%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-emerald-400" />
                </div>
              </CardContent>
            </Card>

            {/* External Transfer */}
            <Card
              className="bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-indigo-600/20 backdrop-blur-md shadow-2xl border border-blue-400/30 text-white relative overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer"
              onClick={() => setActiveTransferType("external")}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 via-cyan-400/5 to-indigo-400/5 animate-pulse"></div>
              <CardContent className="p-8 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-2xl">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        معاملات خارجية
                      </h3>
                      <p className="text-blue-200 text-sm mb-1">
                        شحن وسحب عبر بريدي موب
                      </p>
                      <div className="flex items-center gap-4 text-xs text-blue-300">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>خلال 10 دقائق</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          <span>موثوق</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-md border border-purple-400/30 hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <p className="text-purple-200 text-sm mb-2 font-medium">
                  التحويلات اليوم
                </p>
                <p className="text-white font-bold text-xl">0</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-md border border-orange-400/30 hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <p className="text-orange-200 text-sm mb-2 font-medium">
                  الحد المتبقي
                </p>
                <p className="text-white font-bold text-xl">50,000 دج</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Internal Transfer (Instant Transfer)
  if (activeTransferType === "internal") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-green-900">
        {/* Back Button */}
        <div className="p-4">
          <Button
            onClick={() => setActiveTransferType("main")}
            variant="ghost"
            className="text-white hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة للتحويلات
          </Button>
        </div>
        <InstantTransferTab balance={balance} onTransfer={handleTransfer} />
      </div>
    );
  }

  // External Transfer Selection
  if (activeTransferType === "external") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 p-4 pb-24">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Back Button */}
          <Button
            onClick={() => setActiveTransferType("main")}
            variant="ghost"
            className="text-white hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة للتحويلات
          </Button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-cyan-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              معاملات خارجية
            </h1>
            <p className="text-gray-300 text-lg font-medium">
              اختر العملية المطلوبة
            </p>
          </div>

          {/* External Transfer Options */}
          <div className="space-y-4">
            {/* Recharge Option */}
            <Card
              className="bg-gradient-to-br from-emerald-500/20 via-green-500/20 to-teal-600/20 backdrop-blur-md shadow-2xl border border-emerald-400/30 text-white relative overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer"
              onClick={() => setActiveTransferType("recharge")}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 via-green-400/5 to-teal-400/5 animate-pulse"></div>
              <CardContent className="p-8 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-2xl">
                      <Download className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        شحن المحفظة
                      </h3>
                      <p className="text-emerald-200 text-sm mb-1">
                        إضافة أموال من بريدي موب
                      </p>
                      <div className="flex items-center gap-4 text-xs text-emerald-300">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>خلال 10 دقائق</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          <span>آمن ومضمون</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-emerald-400" />
                </div>
              </CardContent>
            </Card>

            {/* Withdraw Option */}
            <Card
              className="bg-gradient-to-br from-orange-500/20 via-red-500/20 to-pink-600/20 backdrop-blur-md shadow-2xl border border-orange-400/30 text-white relative overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer"
              onClick={() => setActiveTransferType("withdraw")}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/5 via-red-400/5 to-pink-400/5 animate-pulse"></div>
              <CardContent className="p-8 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        سحب الأموال
                      </h3>
                      <p className="text-orange-200 text-sm mb-1">
                        تحويل إلى بريدي موب
                      </p>
                      <div className="flex items-center gap-4 text-xs text-orange-300">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>خلال 24 ساعة</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          <span>آمن ومضمون</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Recharge Page
  if (activeTransferType === "recharge") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900">
        {/* Back Button */}
        <div className="p-4">
          <Button
            onClick={() => setActiveTransferType("external")}
            variant="ghost"
            className="text-white hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة للمعاملات الخارجية
          </Button>
        </div>
        <RechargeTab
          balance={balance}
          onRecharge={handleRecharge}
          onNotification={handleNotification}
        />
      </div>
    );
  }

  // Withdraw Page
  if (activeTransferType === "withdraw") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-red-900 p-4 pb-24">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Back Button */}
          <Button
            onClick={() => setActiveTransferType("external")}
            variant="ghost"
            className="text-white hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة للمعاملات الخارجية
          </Button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 via-red-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <Upload className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
              سحب الأموال
            </h1>
            <p className="text-gray-300 text-lg font-medium">
              تحويل الأموال إلى حسابك البنكي
            </p>
            <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-400" />
                <span>خلال 24 ساعة</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-400" />
                <span>آمن ومضمون</span>
              </div>
            </div>
          </div>

          {/* Balance Card */}
          <Card className="bg-gradient-to-br from-orange-500/20 via-red-500/20 to-pink-600/20 backdrop-blur-md shadow-2xl border border-orange-400/30 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400/5 via-red-400/5 to-pink-400/5 animate-pulse"></div>
            <CardContent className="p-8 text-center relative z-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-orange-200 text-sm font-medium">
                    الرصيد المتاح للسحب
                  </p>
                  <p className="text-xs text-gray-400">متاح على مدار الساعة</p>
                </div>
              </div>
              <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                <p className="text-5xl font-bold text-white mb-2 tracking-tight">
                  {balance.dzd.toLocaleString()}
                  <span className="text-2xl text-orange-300 mr-2">دج</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Withdraw Form */}
          <Card className="bg-gradient-to-br from-red-500/20 via-orange-500/20 to-pink-600/20 backdrop-blur-md shadow-2xl border border-red-400/30 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-400/5 via-orange-400/5 to-pink-400/5 animate-pulse"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-white text-2xl flex items-center justify-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold">بيانات السحب</h3>
                  <p className="text-sm text-red-200 font-normal">
                    املأ البيانات أدناه لسحب الأموال
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pt-6 relative z-10">
              {/* Amount */}
              <div className="space-y-4">
                <label className="block text-white text-base font-semibold mb-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <span className="block">المبلغ المراد سحبه</span>
                    <span className="text-sm text-red-200 font-normal">
                      بالدينار الجزائري
                    </span>
                  </div>
                </label>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl blur-sm"></div>
                  <Input
                    type="number"
                    placeholder="0"
                    value={withdrawAmount}
                    onChange={(e) => {
                      setWithdrawAmount(e.target.value);
                      if (withdrawError) setWithdrawError("");
                    }}
                    min="1000"
                    max={balance.dzd}
                    step="1"
                    className="relative bg-white/15 border-2 border-white/20 text-white placeholder:text-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-400/50 h-16 text-center text-3xl font-bold rounded-xl backdrop-blur-sm"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-400 font-bold text-xl">
                    دج
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex justify-between text-sm text-gray-300 mb-2">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      الحد الأدنى: 1,000 دج
                    </span>
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      الحد الأقصى: {balance.dzd.toLocaleString()} دج
                    </span>
                  </div>
                </div>
              </div>

              {/* RIB */}
              <div className="space-y-3">
                <label className="block text-white text-base font-semibold mb-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <span className="block">رقم الحساب البنكي (RIB)</span>
                    <span className="text-sm text-red-200 font-normal">
                      حساب بريدي موب
                    </span>
                  </div>
                </label>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl blur-sm"></div>
                  <Input
                    type="text"
                    placeholder="0079999900272354667"
                    value={withdrawRib}
                    onChange={(e) => {
                      setWithdrawRib(e.target.value);
                      if (withdrawError) setWithdrawError("");
                    }}
                    className="relative bg-white/15 border-2 border-white/20 text-white placeholder:text-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-400/50 h-14 text-base font-medium rounded-xl backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Error Message */}
              {withdrawError && (
                <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <p className="text-red-200 text-sm">{withdrawError}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  onClick={handleWithdraw}
                  disabled={
                    !withdrawAmount ||
                    !withdrawRib ||
                    parseFloat(withdrawAmount || "0") < 1000 ||
                    parseFloat(withdrawAmount || "0") > balance.dzd
                  }
                  className="w-full h-16 bg-gradient-to-r from-red-500 via-orange-600 to-pink-600 hover:from-red-600 hover:via-orange-700 hover:to-pink-700 text-white font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-2xl"
                >
                  <div className="flex items-center justify-center gap-3">
                    <Upload className="w-6 h-6" />
                    <span>تأكيد السحب</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </Button>
                <p className="text-center text-xs text-gray-400 mt-3">
                  سيتم تحويل المبلغ خلال 24 ساعة عمل
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Success Dialog */}
        <Dialog
          open={showWithdrawSuccess}
          onOpenChange={setShowWithdrawSuccess}
        >
          <DialogContent className="bg-gradient-to-br from-slate-900/95 via-green-900/95 to-emerald-900/95 backdrop-blur-md border border-green-400/30 text-white max-w-md mx-auto">
            <DialogHeader className="text-center">
              <DialogTitle className="text-xl font-bold text-white flex items-center justify-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-400" />
                تم إرسال طلب السحب
              </DialogTitle>
              <DialogDescription className="text-green-200">
                سيتم معالجة طلبك خلال 24 ساعة عمل
              </DialogDescription>
            </DialogHeader>
            <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4 my-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-green-200">المبلغ:</span>
                  <span className="text-white font-bold">
                    {parseFloat(withdrawAmount || "0").toLocaleString()} دج
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-200">إلى الحساب:</span>
                  <span className="text-white font-mono text-sm">
                    {withdrawRib}
                  </span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Fallback - should never reach here
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 pb-24">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">خطأ في التحميل</h1>
          <p className="text-gray-300">يرجى المحاولة مرة أخرى</p>
        </div>
      </div>
    </div>
  );
}

export default TransfersTab;
