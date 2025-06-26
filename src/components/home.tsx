import { useState, useEffect, lazy, Suspense } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Wallet,
  TrendingUp,
  Send,
  Receipt,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Eye,
  EyeOff,
  Bell,
  Settings,
  User,
  Star,
  Shield,
  UserCheck,
  Zap,
  Globe,
  ChevronRight,
  Activity,
  PieChart,
  Target,
  Gift,
  Calculator,
  PiggyBank,
  BarChart3,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import BottomNavBar from "./BottomNavBar";
import TopNavBar from "./TopNavBar";
import CurrencyConverter from "./CurrencyConverter";

// Lazy load tab components with preloading for better performance
const CardTab = lazy(() => import("./CardTab"));
const SavingsTab = lazy(() => import("./SavingsTab"));
const InstantTransferTab = lazy(() => import("./InstantTransferTab"));
const BillPaymentTab = lazy(() => import("./BillPaymentTab"));
const TransactionsTab = lazy(() => import("./TransactionsTab"));
const RechargeTab = lazy(() => import("./RechargeTab"));
const InvestmentTab = lazy(() => import("./InvestmentTab"));
const TransfersTab = lazy(() => import("./TransfersTab"));

// Preload components for faster navigation
const preloadComponents = () => {
  import("./CardTab");
  import("./SavingsTab");
  import("./TransfersTab");
  import("./InvestmentTab");
  import("./RechargeTab");
};
import {
  createNotification,
  showBrowserNotification,
  type Notification,
} from "../utils/notifications";
import { ConversionResult } from "../utils/currency";
import { validateAmount, maskBalance, isDataLoaded } from "../utils/security";
import { useDatabase } from "../hooks/useDatabase";
import { useAuth } from "../hooks/useAuth";

interface HomeProps {
  onLogout?: () => void;
}

interface Investment {
  id: string;
  type: "weekly" | "monthly";
  amount: number;
  startDate: Date;
  endDate: Date;
  profitRate: number;
  status: "active" | "completed";
  profit: number;
}

function Home({ onLogout }: HomeProps) {
  const { user } = useAuth();
  const {
    balance,
    transactions,
    notifications,
    updateBalance,
    addTransaction,
    addNotification,
    getRecentTransactions,
    loading,
    error,
  } = useDatabase(user?.id || null);

  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  const [activeTab, setActiveTab] = useState("home");
  const [showBalance, setShowBalance] = useState(true);
  const [showCurrencyConverter, setShowCurrencyConverter] = useState(false);
  const [isCardActivated] = useState(true);
  const [showAddMoneyDialog, setShowAddMoneyDialog] = useState(false);
  const [addMoneyAmount, setAddMoneyAmount] = useState("");
  const [showBonusDialog, setShowBonusDialog] = useState(false);
  const [preloadedTabs, setPreloadedTabs] = useState(new Set<string>());
  const [isNavigating, setIsNavigating] = useState(false);

  // Use balance from database with zero fallback (no fake amounts)
  const currentBalance = balance;
  const isBalanceLoaded = !loading && balance !== null;

  // Zero fallback for calculations and display - no fake amounts
  const zeroBalance = {
    dzd: 0,
    eur: 0,
    usd: 0,
    gbp: 0,
  };

  const safeBalance = currentBalance || zeroBalance;

  // Debug logging for balance state
  console.log("🏠 Home Component Debug:", {
    loading,
    balance,
    currentBalance,
    isBalanceLoaded,
    safeBalance,
    userId: user?.id,
    userEmail: user?.email,
    userProvider: user?.app_metadata?.provider,
    hasProfile: !!user?.profile,
    profileData: user?.profile,
    userCreatedAt: user?.created_at,
    isGoogleUser: user?.app_metadata?.provider === "google",
  });

  const currentTransactions = transactions || [];
  const currentNotifications = notifications || [];

  // Load recent transactions
  const loadRecentTransactions = async () => {
    if (!user?.id) return;

    setLoadingRecent(true);
    try {
      const { data } = await getRecentTransactions(5);
      if (data && data.length > 0) {
        console.log("✅ Recent transactions loaded:", data.length);
        setRecentTransactions(data);
      } else {
        console.log("⚠️ No recent transactions found, setting sample data");
        // No sample transactions - show empty state
        setRecentTransactions([]);
      }
    } catch (error) {
      console.error("Error loading recent transactions:", error);
      // No sample transactions on error - show empty state
      setRecentTransactions([]);
    } finally {
      setLoadingRecent(false);
    }
  };

  // Load recent transactions on component mount and when user changes
  useEffect(() => {
    loadRecentTransactions();
  }, [user?.id]);

  // Preload components on mount for faster navigation
  useEffect(() => {
    const timer = setTimeout(() => {
      preloadComponents();
    }, 1000); // Delay to not interfere with initial load
    return () => clearTimeout(timer);
  }, []);

  // Optimized tab change with preloading
  const handleTabChange = async (newTab: string) => {
    setIsNavigating(true);

    // Preload the component if not already preloaded
    if (!preloadedTabs.has(newTab)) {
      switch (newTab) {
        case "card":
          import("./CardTab");
          break;
        case "transfers":
          import("./TransfersTab");
          break;
        case "investment":
          import("./InvestmentTab");
          break;
        case "savings":
          import("./SavingsTab");
          break;
        case "recharge":
          import("./RechargeTab");
          break;
      }
      setPreloadedTabs((prev) => new Set([...prev, newTab]));
    }

    // Small delay for smooth transition
    await new Promise((resolve) => setTimeout(resolve, 50));
    setActiveTab(newTab);
    setIsNavigating(false);
  };

  const handleSavingsDeposit = async (amount: number, goalId: string) => {
    if (!user?.id) return;

    try {
      console.log("Starting handleSavingsDeposit:", {
        amount,
        goalId,
        currentBalance: currentBalance.dzd,
        userId: user.id,
      });

      // Check if user has sufficient balance
      if (safeBalance.dzd < amount) {
        console.error("Insufficient balance:", {
          required: amount,
          available: safeBalance.dzd,
        });
        return;
      }

      // Calculate new balance after deduction
      const newBalance = {
        ...safeBalance,
        dzd: safeBalance.dzd - amount,
      };

      console.log("Calculated new balance:", {
        oldBalance: safeBalance.dzd,
        deductedAmount: amount,
        newBalance: newBalance.dzd,
      });

      // Update balance in database first
      const balanceResult = await updateBalance(newBalance);
      if (balanceResult?.error) {
        console.error("Error updating balance:", balanceResult.error);
        return;
      }

      console.log("Balance updated successfully in database");

      // Add transaction to database
      const transactionData = {
        type: goalId === "investment" ? "investment" : "transfer",
        amount: amount,
        currency: "dzd",
        description: goalId === "investment" ? `استثمار` : `إيداع في الادخار`,
        status: "completed",
      };

      const transactionResult = await addTransaction(transactionData);
      if (transactionResult?.error) {
        console.error("Error adding transaction:", transactionResult.error);
      } else {
        console.log("Transaction added successfully");
      }
    } catch (error) {
      console.error("Error processing savings deposit:", error);
    }
  };

  const handleInvestmentReturn = async (amount: number) => {
    if (!user?.id) return;

    try {
      // Update balance in database
      const newBalance = {
        ...safeBalance,
        dzd: safeBalance.dzd + amount,
      };
      await updateBalance(newBalance);

      // Add transaction to database
      const transactionData = {
        type: "investment",
        amount: amount,
        currency: "dzd",
        description: `عائد استثمار`,
        status: "completed",
      };
      await addTransaction(transactionData);
    } catch (error) {
      console.error("Error processing investment return:", error);
    }
  };

  const handleNotification = async (notification: Notification) => {
    if (!user?.id) return;

    try {
      const notificationData = {
        type: notification.type,
        title: notification.title,
        message: notification.message,
        is_read: false,
      };
      await addNotification(notificationData);
    } catch (error) {
      console.error("Error adding notification:", error);
    }
  };

  const handleCurrencyConversion = async (result: ConversionResult) => {
    if (!user?.id) return;

    try {
      let newBalance = { ...safeBalance };

      if (result.fromCurrency === "DZD" && result.toCurrency === "EUR") {
        newBalance = {
          ...newBalance,
          dzd: newBalance.dzd - result.fromAmount,
          eur: newBalance.eur + result.toAmount,
        };
      } else if (result.fromCurrency === "EUR" && result.toCurrency === "DZD") {
        newBalance = {
          ...newBalance,
          dzd: newBalance.dzd + result.toAmount,
          eur: newBalance.eur - result.fromAmount,
        };
      }

      await updateBalance(newBalance);

      const transactionData = {
        type: "conversion",
        amount: result.fromAmount,
        currency: result.fromCurrency.toLowerCase(),
        description: `تحويل ${result.fromCurrency} إلى ${result.toCurrency}`,
        status: "completed",
      };
      await addTransaction(transactionData);
    } catch (error) {
      console.error("Error processing currency conversion:", error);
    }
  };

  const handleAddMoney = () => {
    setShowAddMoneyDialog(true);
  };

  const confirmAddMoney = async () => {
    if (!user?.id || !addMoneyAmount || parseFloat(addMoneyAmount) <= 0) return;

    try {
      const chargeAmount = parseFloat(addMoneyAmount);

      // Update balance in database
      const newBalance = {
        ...safeBalance,
        dzd: safeBalance.dzd + chargeAmount,
      };
      await updateBalance(newBalance);

      // Add transaction to database
      const transactionData = {
        type: "recharge",
        amount: chargeAmount,
        currency: "dzd",
        description: "شحن المحفظة",
        status: "completed",
      };
      await addTransaction(transactionData);

      const notification = createNotification(
        "success",
        "تم الشحن بنجاح",
        `تم شحن ${chargeAmount.toLocaleString()} دج في محفظتك`,
      );
      await handleNotification(notification);
      showBrowserNotification(
        "تم الشحن بنجاح",
        `تم شحن ${chargeAmount.toLocaleString()} دج في محفظتك`,
      );
      setShowAddMoneyDialog(false);
      setAddMoneyAmount("");
    } catch (error) {
      console.error("Error adding money:", error);
    }
  };

  const quickActions = [
    {
      icon: Plus,
      title: "إضافة أموال",
      subtitle: "شحن سريع",
      color: "from-emerald-500 to-teal-600",
      action: () => {
        console.log("Recharge button clicked");
        setActiveTab("recharge");
      },
    },
    {
      icon: Calculator,
      title: "محول العملات",
      subtitle: "تحويل سريع",
      color: "from-indigo-500 to-purple-600",
      action: () => {
        console.log("Currency converter button clicked");
        setShowCurrencyConverter(true);
      },
    },
  ];

  // Helper functions for transaction display
  const getTransactionIcon = (
    type: string,
    amount: number,
    isInstant: boolean = false,
  ) => {
    if (isInstant) {
      return (
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
      );
    }

    switch (type) {
      case "recharge":
        return (
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5 text-white" />
          </div>
        );
      case "instant_transfer_sent":
      case "transfer":
        return amount > 0 ? (
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5 text-white" />
          </div>
        ) : (
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-white" />
          </div>
        );
      case "investment":
        return (
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
        );
      case "bill":
        return (
          <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
            <Receipt className="w-5 h-5 text-white" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
        );
    }
  };

  const getTransactionTitle = (transaction: any) => {
    if (transaction.is_instant) {
      return transaction.type === "instant_transfer_sent"
        ? "تحويل فوري صادر"
        : "تحويل فوري وارد";
    }

    switch (transaction.type) {
      case "recharge":
        return "شحن المحفظة";
      case "transfer":
        return transaction.amount > 0 ? "تحويل مستلم" : "تحويل مرسل";
      case "investment":
        return "استثمار";
      case "bill":
        return "دفع فاتورة";
      case "conversion":
        return "تحويل عملة";
      default:
        return "معاملة مالية";
    }
  };

  const getTransactionDescription = (transaction: any) => {
    if (transaction.is_instant) {
      if (transaction.type === "instant_transfer_sent") {
        return `إلى ${transaction.recipient_name || transaction.recipient}`;
      } else {
        return `من ${transaction.sender_name || transaction.recipient}`;
      }
    }
    return transaction.description;
  };

  const features = [
    {
      icon: Shield,
      title: "أمان عالي",
      description: "حماية متقدمة لأموالك",
    },
    {
      icon: Zap,
      title: "سرعة فائقة",
      description: "معاملات فورية",
    },
    {
      icon: Globe,
      title: "عالمي",
      description: "تحويلات دولية",
    },
  ];

  // Optimized loading fallback component for tabs
  const TabLoadingFallback = () => (
    <div className="flex items-center justify-center h-32 sm:h-64">
      <div className="w-6 h-6 sm:w-8 sm:h-8 relative">
        <div className="absolute inset-0 border-2 border-blue-400/30 rounded-full animate-spin">
          <div className="absolute top-0 left-1/2 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-blue-400 rounded-full transform -translate-x-1/2 -translate-y-0.5"></div>
        </div>
        <div className="absolute inset-0.5 sm:inset-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-pulse flex items-center justify-center">
          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 text-white animate-spin" />
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="w-full max-w-sm sm:max-w-md mx-auto space-y-6 pb-20">
            {/* Welcome Header - Clean and Centered */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  {user?.profile?.full_name
                    ? `مرحباً ${user.profile.full_name}`
                    : user?.user_metadata?.full_name
                      ? `مرحباً ${user.user_metadata.full_name}`
                      : "مرحباً بك"}
                </h1>
                <p className="text-gray-300">إدارة أموالك بسهولة وأمان</p>
              </div>
            </div>

            {/* Total Balance Card - Investment Style */}
            <Card className="bg-gradient-to-br from-indigo-500/20 to-purple-600/20 backdrop-blur-md border border-indigo-400/30 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="p-3 bg-indigo-500/30 rounded-full">
                      <Wallet className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        الرصيد الإجمالي
                      </h3>
                      <p className="text-indigo-300 text-sm">جميع العملات</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBalance(!showBalance)}
                    className="text-white/80 hover:bg-white/20 p-2 rounded-full"
                  >
                    {showBalance ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {/* Main Balance Display */}
                <div className="text-center mb-6">
                  <p className="text-4xl font-bold text-white mb-2">
                    {!showBalance
                      ? "••••••"
                      : loading
                        ? "..."
                        : (safeBalance.dzd || 0).toLocaleString()}
                  </p>
                  <p className="text-indigo-300 text-lg">دينار جزائري</p>
                </div>

                {/* Multi-Currency Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-indigo-500/10 rounded-lg p-4 text-center border border-indigo-400/20">
                    <p className="text-white font-bold text-lg mb-1">
                      {!showBalance
                        ? "••••"
                        : loading
                          ? "..."
                          : (safeBalance.usd || 0).toLocaleString()}
                    </p>
                    <p className="text-indigo-300 text-xs">دولار أمريكي</p>
                  </div>

                  <div className="bg-green-500/10 rounded-lg p-4 text-center border border-green-400/20">
                    <p className="text-white font-bold text-lg mb-1">
                      {!showBalance
                        ? "••••"
                        : loading
                          ? "..."
                          : (safeBalance.eur || 0).toLocaleString()}
                    </p>
                    <p className="text-green-300 text-xs">يورو</p>
                  </div>

                  <div className="bg-purple-500/10 rounded-lg p-4 text-center border border-purple-400/20">
                    <p className="text-white font-bold text-lg mb-1">
                      {!showBalance
                        ? "••••"
                        : loading
                          ? "..."
                          : (safeBalance.gbp || 0).toFixed(2)}
                    </p>
                    <p className="text-purple-300 text-xs">جنيه إسترليني</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions - Mobile Optimized Single Column */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <Card
                    key={index}
                    className={`bg-white/10 backdrop-blur-md border border-white/20 cursor-pointer hover:bg-white/15 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 bg-gradient-to-br ${action.color}/20 border-opacity-30`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log(`Quick action clicked: ${action.title}`);
                      action.action();
                    }}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center mb-3">
                        <div
                          className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center shadow-lg`}
                        >
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <p className="text-white font-bold text-sm mb-1">
                        {action.title}
                      </p>
                      <p className="text-white/70 text-xs">{action.subtitle}</p>
                      <div className="mt-3 pt-3 border-t border-white/20">
                        <div className="flex items-center justify-center space-x-2 space-x-reverse">
                          <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse"></div>
                          <span className="text-white/60 text-xs font-medium">
                            متاح
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Recent Transactions - Clean List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">
                  المعاملات الأخيرة
                </h2>
                <Button
                  onClick={() => setActiveTab("transactions")}
                  variant="ghost"
                  size="sm"
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  عرض الكل
                  <ChevronRight className="w-4 h-4 mr-1" />
                </Button>
              </div>

              <Card className="bg-white/10 backdrop-blur-md border border-white/20">
                <CardContent className="p-4">
                  {loadingRecent ? (
                    <div className="text-center py-6">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-white" />
                      <p className="text-gray-400 text-sm">
                        جاري تحميل المعاملات...
                      </p>
                    </div>
                  ) : recentTransactions.length > 0 ? (
                    <div className="space-y-3">
                      {recentTransactions
                        .slice(0, 3)
                        .map((transaction, index) => (
                          <div
                            key={transaction.id || index}
                            className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                          >
                            <div className="flex items-center space-x-3 space-x-reverse">
                              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                                <Activity className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-white text-sm">
                                  {getTransactionTitle(transaction)}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {new Date(
                                    transaction.created_at,
                                  ).toLocaleDateString("ar-DZ")}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p
                                className={`font-bold text-sm ${
                                  transaction.amount > 0
                                    ? "text-green-400"
                                    : "text-orange-400"
                                }`}
                              >
                                {`${transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toLocaleString()} دج`}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Activity className="w-8 h-8 mx-auto mb-2 text-gray-400 opacity-50" />
                      <p className="text-gray-400 text-sm">
                        لا توجد معاملات حتى الآن
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "recharge":
        return (
          <Suspense fallback={<TabLoadingFallback />}>
            <RechargeTab
              balance={safeBalance}
              onRecharge={async (amount, method, rib) => {
                if (!user?.id) return;

                try {
                  // Add transaction to database
                  const transactionData = {
                    type: "recharge",
                    amount: amount,
                    currency: "dzd",
                    description: `شحن من ${method} - RIB: ${rib}`,
                    status: "pending",
                    reference: rib,
                  };
                  await addTransaction(transactionData);

                  const notification = createNotification(
                    "success",
                    "تم استلام طلب الشحن",
                    `سيتم إضافة ${amount.toLocaleString()} دج من RIB: ${rib} خلال 5-10 دقائق`,
                  );
                  await handleNotification(notification);
                  showBrowserNotification(
                    "تم استلام طلب الشحن",
                    `سيتم إضافة ${amount.toLocaleString()} دج خلال 5-10 دقائق`,
                  );
                } catch (error) {
                  console.error("Error processing recharge:", error);
                }
              }}
              onNotification={handleNotification}
            />
          </Suspense>
        );
      case "savings":
        return (
          <Suspense fallback={<TabLoadingFallback />}>
            <SavingsTab
              balance={safeBalance}
              onSavingsDeposit={handleSavingsDeposit}
              onInvestmentReturn={handleInvestmentReturn}
              onNotification={handleNotification}
              onAddTestBalance={async (amount) => {
                if (!user?.id) return;

                try {
                  const newBalance = {
                    ...safeBalance,
                    dzd: safeBalance.dzd + amount,
                  };
                  await updateBalance(newBalance);

                  const transactionData = {
                    type: "recharge",
                    amount: amount,
                    currency: "dzd",
                    description: "إضافة رصيد تجريبي",
                    status: "completed",
                  };
                  await addTransaction(transactionData);
                } catch (error) {
                  console.error("Error adding test balance:", error);
                }
              }}
            />
          </Suspense>
        );
      case "card":
        return (
          <Suspense fallback={<TabLoadingFallback />}>
            <div
              className={`transition-opacity duration-200 ${isNavigating ? "opacity-50" : "opacity-100"}`}
            >
              <CardTab isActivated={isCardActivated} balance={safeBalance} />
            </div>
          </Suspense>
        );
      case "instant-transfer":
        return (
          <Suspense fallback={<TabLoadingFallback />}>
            <InstantTransferTab
              balance={safeBalance}
              onTransfer={async (amount, recipient) => {
                if (!user?.id) return;

                try {
                  const newBalance = {
                    ...safeBalance,
                    dzd: safeBalance.dzd - amount,
                  };
                  await updateBalance(newBalance);

                  const transactionData = {
                    type: "instant_transfer",
                    amount: amount,
                    currency: "dzd",
                    description: `تحويل فوري إلى ${recipient}`,
                    recipient: recipient,
                    status: "completed",
                  };
                  await addTransaction(transactionData);
                } catch (error) {
                  console.error("Error processing instant transfer:", error);
                }
              }}
            />
          </Suspense>
        );
      case "bills":
        return (
          <Suspense fallback={<TabLoadingFallback />}>
            <BillPaymentTab
              balance={safeBalance}
              onPayment={async (amount, billType, reference) => {
                if (!user?.id) return;

                try {
                  const newBalance = {
                    ...safeBalance,
                    dzd: safeBalance.dzd - amount,
                  };
                  await updateBalance(newBalance);

                  const transactionData = {
                    type: "bill",
                    amount: amount,
                    currency: "dzd",
                    description: `دفع فاتورة ${billType} - ${reference}`,
                    reference: reference,
                    status: "completed",
                  };
                  await addTransaction(transactionData);
                } catch (error) {
                  console.error("Error processing bill payment:", error);
                }
              }}
              onNotification={handleNotification}
            />
          </Suspense>
        );
      case "investment":
        return (
          <Suspense fallback={<TabLoadingFallback />}>
            <InvestmentTab
              balance={safeBalance}
              onSavingsDeposit={handleSavingsDeposit}
              onInvestmentReturn={handleInvestmentReturn}
              onNotification={handleNotification}
            />
          </Suspense>
        );
      case "transactions":
        return (
          <Suspense fallback={<TabLoadingFallback />}>
            <TransactionsTab transactions={currentTransactions} />
          </Suspense>
        );
      case "transfers":
        return (
          <Suspense fallback={<TabLoadingFallback />}>
            <TransfersTab
              balance={safeBalance}
              onTransfer={async (amount, recipient) => {
                if (!user?.id) return;

                try {
                  const newBalance = {
                    ...safeBalance,
                    dzd: safeBalance.dzd - amount,
                  };
                  await updateBalance(newBalance);

                  const transactionData = {
                    type: "instant_transfer",
                    amount: amount,
                    currency: "dzd",
                    description: `تحويل فوري إلى ${recipient}`,
                    recipient: recipient,
                    status: "completed",
                  };
                  await addTransaction(transactionData);
                } catch (error) {
                  console.error("Error processing instant transfer:", error);
                }
              }}
              onRecharge={async (amount, method, rib) => {
                if (!user?.id) return;

                try {
                  // Add transaction to database
                  const transactionData = {
                    type: "recharge",
                    amount: amount,
                    currency: "dzd",
                    description: `شحن من ${method} - RIB: ${rib}`,
                    status: "pending",
                    reference: rib,
                  };
                  await addTransaction(transactionData);

                  const notification = createNotification(
                    "success",
                    "تم استلام طلب الشحن",
                    `سيتم إضافة ${amount.toLocaleString()} دج من RIB: ${rib} خلال 5-10 دقائق`,
                  );
                  await handleNotification(notification);
                  showBrowserNotification(
                    "تم استلام طلب الشحن",
                    `سيتم إضافة ${amount.toLocaleString()} دج خلال 5-10 دقائق`,
                  );
                } catch (error) {
                  console.error("Error processing recharge:", error);
                }
              }}
              onNotification={handleNotification}
            />
          </Suspense>
        );
      case "referral":
        return (
          <Suspense fallback={<TabLoadingFallback />}>
            <SavingsTab
              balance={safeBalance}
              onSavingsDeposit={handleSavingsDeposit}
              onNotification={handleNotification}
              onAddTestBalance={async (amount) => {
                if (!user?.id) return;

                try {
                  const newBalance = {
                    ...safeBalance,
                    dzd: safeBalance.dzd + amount,
                  };
                  await updateBalance(newBalance);

                  const transactionData = {
                    type: "recharge",
                    amount: amount,
                    currency: "dzd",
                    description: "إضافة رصيد تجريبي",
                    status: "completed",
                  };
                  await addTransaction(transactionData);
                } catch (error) {
                  console.error("Error adding test balance:", error);
                }
              }}
            />
          </Suspense>
        );
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-white text-lg">الصفحة غير متوفرة</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Clean Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-black/10">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        ></div>
      </div>

      {/* Top Navigation */}
      <TopNavBar className="relative z-20" onLogout={onLogout} />

      {/* Main Content - Centered and Clean */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 pt-20">
        {renderTabContent()}
      </div>

      {/* Bottom Navigation with optimized tab switching */}
      <BottomNavBar activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Currency Converter */}
      <CurrencyConverter
        isOpen={showCurrencyConverter}
        onClose={() => setShowCurrencyConverter(false)}
        onConvert={handleCurrencyConversion}
      />

      {/* Add Money Dialog */}
      <Dialog open={showAddMoneyDialog} onOpenChange={setShowAddMoneyDialog}>
        <DialogContent className="bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-md border border-white/20 text-white max-w-md mx-auto">
          <DialogHeader className="text-center">
            <DialogTitle className="text-xl font-bold text-white flex items-center justify-center gap-2">
              <Plus className="w-6 h-6 text-green-400" />
              شحن المحفظة
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              أدخل المبلغ الذي تريد إضافته إلى محفظتك
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label htmlFor="addAmount" className="text-white font-medium">
                مبلغ الشحن (دج)
              </Label>
              <Input
                id="addAmount"
                type="number"
                placeholder="أدخل المبلغ"
                value={addMoneyAmount}
                onChange={(e) => setAddMoneyAmount(e.target.value)}
                className="text-center text-lg bg-white/10 border-white/30 text-white placeholder:text-gray-400 h-12 focus:border-green-400 focus:ring-green-400"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowAddMoneyDialog(false);
                  setAddMoneyAmount("");
                }}
                variant="outline"
                className="flex-1 h-12 bg-gray-600/50 border-gray-500/50 text-white hover:bg-gray-500/60 text-right"
              >
                إلغاء
              </Button>
              <Button
                onClick={confirmAddMoney}
                disabled={!addMoneyAmount || parseFloat(addMoneyAmount) <= 0}
                className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                شحن المحفظة
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bonus Dialog */}
      <Dialog open={showBonusDialog} onOpenChange={setShowBonusDialog}>
        <DialogContent className="bg-gradient-to-br from-slate-900/95 via-yellow-900/95 to-slate-900/95 backdrop-blur-md border border-yellow-400/30 text-white max-w-md mx-auto">
          <DialogHeader className="text-center">
            <DialogTitle className="text-xl font-bold text-white flex items-center justify-center gap-2">
              <Gift className="w-6 h-6 text-yellow-400" />
              مكافأة خاصة!
            </DialogTitle>
            <DialogDescription className="text-yellow-200">
              احصل على 5% مكافأة من رصيدك الحالي
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-6">
            <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4 text-center">
              <p className="text-yellow-200 text-sm mb-2">رصيدك الحالي:</p>
              <p className="text-2xl font-bold text-white mb-2">
                {loading ? "..." : `${safeBalance.dzd.toLocaleString()} دج`}
              </p>
              <p className="text-yellow-200 text-sm mb-2">ستحصل على:</p>
              <p className="text-xl font-bold text-yellow-400">
                {loading
                  ? "..."
                  : `${Math.floor(safeBalance.dzd * 0.05).toLocaleString()} دج`}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowBonusDialog(false)}
                variant="outline"
                className="flex-1 h-12 bg-gray-600/50 border-gray-500/50 text-white hover:bg-gray-500/60 text-right"
              >
                إلغاء
              </Button>
              <Button
                onClick={async () => {
                  if (!user?.id) return;

                  try {
                    const bonusAmount = Math.floor(safeBalance.dzd * 0.05);
                    const newBalance = {
                      ...safeBalance,
                      dzd: safeBalance.dzd + bonusAmount,
                    };
                    await updateBalance(newBalance);

                    const transactionData = {
                      type: "recharge",
                      amount: bonusAmount,
                      currency: "dzd",
                      description: "كافأة خاصة - 5% من الرصيد",
                      status: "completed",
                    };
                    await addTransaction(transactionData);

                    const notification = createNotification(
                      "success",
                      "تم الحصول على المكافأة!",
                      `تم إضافة ${bonusAmount.toLocaleString()} دج ككافأة`,
                    );
                    await handleNotification(notification);
                    showBrowserNotification(
                      "تم الحصول على المكافأة!",
                      `تم إضافة ${bonusAmount.toLocaleString()} دج ككافأة`,
                    );
                    setShowBonusDialog(false);
                  } catch (error) {
                    console.error("Error processing bonus:", error);
                  }
                }}
                className="flex-1 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                احصل على المكافأة
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Home;
