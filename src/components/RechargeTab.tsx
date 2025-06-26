import { useState, useCallback, useMemo } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Plus,
  CreditCard,
  Building2,
  Copy,
  CheckCircle,
  AlertCircle,
  Info,
  Banknote,
  ArrowLeft,
  DollarSign,
  Shield,
  X,
  Wallet,
  Star,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import {
  createNotification,
  showBrowserNotification,
  type Notification,
} from "../utils/notifications";

interface RechargeTabProps {
  balance: {
    dzd: number;
    eur: number;
    usd: number;
    gbt: number;
  };
  onRecharge: (amount: number, method: string, rib: string) => void;
  onNotification: (notification: Notification) => void;
}

function RechargeTab({
  balance,
  onRecharge,
  onNotification,
}: RechargeTabProps) {
  const [showRechargeDialog, setShowRechargeDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [senderRib, setSenderRib] = useState("");
  const [amountError, setAmountError] = useState("");
  const [ribError, setRibError] = useState("");

  const validateAmount = () => {
    if (!rechargeAmount || parseFloat(rechargeAmount) <= 0) {
      setAmountError("يرجى إدخال مبلغ صحيح");
      return false;
    }
    if (parseFloat(rechargeAmount) < 1000) {
      setAmountError("الحد الأدنى: 1000 دج");
      return false;
    }
    setAmountError("");
    return true;
  };

  const validateRib = () => {
    if (!senderRib.trim()) {
      setRibError("يرجى إدخال رقم المعاملة");
      return false;
    }
    if (senderRib.length < 6) {
      setRibError("رقم المعاملة غير صحيح");
      return false;
    }
    setRibError("");
    return true;
  };

  const handleAmountSubmit = () => {
    if (validateAmount()) {
      setCurrentStep(2);
    }
  };

  const handlePaymentMethodSelect = () => {
    setCurrentStep(3);
  };

  const handleFinalConfirm = useCallback(() => {
    if (validateRib()) {
      const amount = parseFloat(rechargeAmount);
      onRecharge(amount, "bank", senderRib);

      const notification = createNotification(
        "success",
        "تم إرسال طلب الشحن",
        `سوف نتحقق من المعاملة وإضافة ${amount.toLocaleString()} دج في أقل من 10 دقائق`,
      );
      onNotification(notification);
      showBrowserNotification(
        "تم إرسال طلب الشحن",
        `سوف نتحقق من المعاملة وإضافة ${amount.toLocaleString()} دج في أقل من 10 دقائق`,
      );

      // Reset dialog
      setShowRechargeDialog(false);
      setCurrentStep(1);
      setRechargeAmount("");
      setSenderRib("");
      setAmountError("");
      setRibError("");
    }
  }, [rechargeAmount, senderRib, onRecharge, onNotification, validateRib]);

  const resetDialog = () => {
    setShowRechargeDialog(false);
    setCurrentStep(1);
    setRechargeAmount("");
    setSenderRib("");
    setAmountError("");
    setRibError("");
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">أدخل المبلغ</h3>
              <p className="text-gray-300 text-sm">المبلغ بالدينار الجزائري</p>
            </div>
            <div className="space-y-4">
              <Input
                type="number"
                placeholder="أدخل المبلغ (الحد الأدنى: 1000 دج)"
                value={rechargeAmount}
                onChange={(e) => {
                  setRechargeAmount(e.target.value);
                  if (amountError) setAmountError("");
                }}
                className={`text-center text-lg bg-white/10 border-white/30 text-white placeholder:text-gray-400 h-12 ${
                  amountError ? "border-red-400" : "focus:border-green-400"
                }`}
              />
              {amountError && (
                <p className="text-red-400 text-sm text-center">
                  {amountError}
                </p>
              )}
            </div>
            <Button
              onClick={handleAmountSubmit}
              disabled={!rechargeAmount || parseFloat(rechargeAmount) < 1000}
              className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-bold"
            >
              التالي
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                إرسال المبلغ
              </h3>
            </div>
            <Card className="bg-blue-500/20 border border-blue-400/30">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 space-x-reverse mb-3">
                  <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                    <span className="text-white text-sm font-bold">B</span>
                  </div>
                  <div>
                    <p className="text-green-200 text-sm font-medium">
                      بريد الجزائر - BaridiMob
                    </p>
                  </div>
                </div>
                <p className="text-white text-sm mb-3">
                  أرسل المبلغ من بريدي موب إلى الحساب التالي:
                </p>

                <div className="space-y-3 mb-4">
                  <div className="bg-white/10 border border-white/20 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-300 text-xs mb-1">
                          رقم الحساب البنكي (RIB)
                        </p>
                        <p className="text-white font-mono text-sm">
                          0079999900272354667
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText("0079999900272354667");
                          const notification = createNotification(
                            "success",
                            "تم النسخ",
                            "تم نسخ رقم الحساب البنكي",
                          );
                          onNotification(notification);
                        }}
                        className="text-blue-300 hover:text-blue-200 hover:bg-white/10 p-1"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="bg-white/10 border border-white/20 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-300 text-xs mb-1">
                          اسم المستفيد
                        </p>
                        <p className="text-white text-sm">
                          NETLIFY DIGITAL SERVICES
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            "NETLIFY DIGITAL SERVICES",
                          );
                          const notification = createNotification(
                            "success",
                            "تم النسخ",
                            "تم نسخ اسم المستفيد",
                          );
                          onNotification(notification);
                        }}
                        className="text-blue-300 hover:text-blue-200 hover:bg-white/10 p-1"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse text-yellow-300 text-xs mb-3">
                  <AlertCircle className="w-4 h-4" />
                  <span>انقر على أيقونة النسخ لنسخ البيانات</span>
                </div>

                <div className="bg-orange-500/20 border border-orange-400/30 rounded-lg p-3">
                  <p className="text-orange-200 text-sm font-medium">
                    المبلغ: {parseFloat(rechargeAmount).toLocaleString()} دج
                  </p>
                </div>

                <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-3 mt-3">
                  <div className="flex items-center space-x-2 space-x-reverse text-blue-200 text-xs">
                    <Info className="w-4 h-4" />
                    <span>
                      بعد إرسال المبلغ عبر بريدي موب، اضغط على "التالي" وأدخل
                      رقم المعاملة للتأكيد
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="flex gap-3">
              <Button
                onClick={goToPreviousStep}
                variant="outline"
                className="flex-1 h-12 bg-gray-600/50 border-gray-500/50 text-white hover:bg-gray-500/60"
              >
                <ArrowLeft className="w-4 h-4 ml-2" />
                السابق
              </Button>
              <Button
                onClick={handlePaymentMethodSelect}
                className="flex-1 h-12 bg-green-500 hover:bg-green-600 text-white font-bold"
              >
                التالي
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                تأكيد المعاملة
              </h3>
              <p className="text-gray-300 text-sm">
                أدخل رقم المعاملة من بريدي موب
              </p>
            </div>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="أدخل رقم المعاملة من بريدي موب"
                value={senderRib}
                onChange={(e) => {
                  setSenderRib(e.target.value);
                  if (ribError) setRibError("");
                }}
                className={`text-center bg-white/10 border-white/30 text-white placeholder:text-gray-400 h-12 ${
                  ribError ? "border-red-400" : "focus:border-green-400"
                }`}
              />
              {ribError && (
                <p className="text-red-400 text-sm text-center">{ribError}</p>
              )}

              <div className="bg-orange-500/20 border border-orange-400/30 rounded-lg p-3">
                <p className="text-orange-200 text-sm font-medium text-center">
                  المبلغ: {parseFloat(rechargeAmount).toLocaleString()} دج
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 space-x-reverse text-green-200 text-sm mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="font-medium">
                    سوف نتحقق من المعاملة في أقل من 10 دقائق
                  </span>
                </div>
                <p className="text-green-300 text-xs mr-7">
                  سيتم إضافة المبلغ إلى محفظتك فور التحقق من صحة المعاملة
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={goToPreviousStep}
                variant="outline"
                className="flex-1 h-12 bg-gray-600/50 border-gray-500/50 text-white hover:bg-gray-500/60"
              >
                السابق
              </Button>
              <Button
                onClick={handleFinalConfirm}
                disabled={!senderRib.trim()}
                className="flex-1 h-12 bg-green-500 hover:bg-green-600 text-white font-bold"
              >
                تأكيد الشحن
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 p-4 pb-24">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative">
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center animate-pulse">
              <Star className="w-3 h-3 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            شحن المحفظة
          </h1>
          <p className="text-gray-300 text-lg font-medium">
            اختر طريقة الشحن المناسبة لك
          </p>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>آمن 100%</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>سريع وموثوق</span>
            </div>
          </div>
        </div>
        {/* Current Balance */}
        <Card className="bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-cyan-600/20 backdrop-blur-md shadow-2xl border border-emerald-400/30 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 via-teal-400/5 to-cyan-400/5 animate-pulse"></div>
          <CardContent className="p-8 text-center relative z-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-emerald-200 text-sm font-medium">
                  رصيدك الحالي
                </p>
                <p className="text-xs text-gray-400">متاح للشحن</p>
              </div>
            </div>
            <div className="bg-white/10 rounded-2xl p-6 mb-4 border border-white/20">
              <p className="text-5xl font-bold text-white mb-2 tracking-tight">
                {balance.dzd.toLocaleString()}
                <span className="text-2xl text-emerald-300 mr-2">دج</span>
              </p>
              <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mb-4"></div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-gray-400 text-xs mb-1">يورو</p>
                  <p className="text-white font-bold">€{balance.eur}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-xs mb-1">دولار</p>
                  <p className="text-white font-bold">${balance.usd || 0}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-emerald-200">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>محمي بالكامل</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                <span>رصيد نشط</span>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Quick Recharge Button */}
        <div className="space-y-3">
          <Button
            onClick={() => setShowRechargeDialog(true)}
            className="w-full h-16 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-600 hover:via-teal-700 hover:to-cyan-700 text-white font-bold text-xl shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-2xl"
          >
            <div className="flex items-center justify-center gap-3">
              <Plus className="w-6 h-6" />
              <span>شحن المحفظة الآن</span>
              <DollarSign className="w-5 h-5" />
            </div>
          </Button>
          <p className="text-center text-xs text-gray-400 mt-3">
            شحن سريع وآمن عبر بريدي موب
          </p>
        </div>
      </div>
      {/* Recharge Dialog */}
      <Dialog open={showRechargeDialog} onOpenChange={resetDialog}>
        <DialogContent className="bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-md border border-white/20 text-white max-w-md mx-auto">
          <DialogHeader className="text-center relative">
            <Button
              onClick={resetDialog}
              variant="ghost"
              size="sm"
              className="absolute left-0 top-0 text-white/60 hover:text-white hover:bg-white/10 p-1"
            >
              <X className="w-5 h-5" />
            </Button>
            <DialogTitle className="text-xl font-bold text-white flex items-center justify-center gap-2">
              <Banknote className="w-6 h-6 text-green-400" />
              شحن المحفظة
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              الخطوة {currentStep} من 3
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6">{renderStepContent()}</div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RechargeTab;
