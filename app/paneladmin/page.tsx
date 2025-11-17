// app/paneladmin/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";

const BASE_URL = process.env.API_BASE_URL || "http://localhost:5000/api";

interface Stats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingVerification: number;
  totalProducts: number;
}

interface OrderItem {
  id?: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  total: number;
  cardNumber?: string;
  status: "pending_receipt" | "pending_verification" | "completed" | "rejected";
  createdAt: string;
  receipt?: {
    filename: string;
    path: string;
    uploadedAt: string;
  };
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
}

interface Receipt {
  id: string;
  userId: string;
  orderId: string;
  filename: string;
  originalName: string;
  path: string;
  uploadedAt: string;
  status: "pending" | "verified" | "rejected";
  user?: {
    name: string;
    email: string;
  };
  order?: {
    total: number;
    items: OrderItem[];
  };
}

type DisplayOrder = Order | {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  total: number;
  cardNumber: string;
  status: "pending_verification";
  createdAt: string;
  receipt: {
    filename: string;
    path: string;
    uploadedAt: string;
  };
};

function AdminPanel() {
  const router = useRouter();
  const { isAuthorized, loading } = useAuth("admin");
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingVerification: 0,
    totalProducts: 0,
  });

  const [pendingReceipts, setPendingReceipts] = useState<Receipt[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedOrder, setSelectedOrder] = useState<DisplayOrder | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const getCookie = (name: string): string | null => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  };

  const fetchStats = async (): Promise<void> => {
    try {
      setStatsLoading(true);
      const token = getCookie("token");

      const response = await axios.get(`${BASE_URL}/admin/stats`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const data = response.data;
      setStats({
        totalUsers: data.totalUsers || 0,
        totalOrders: data.totalOrders || 0,
        totalRevenue: data.totalRevenue || 0,
        pendingVerification: data.pendingReceipts || 0,
        totalProducts: data.totalProducts || 0,
      });
    } catch (error: any) {
      console.error("Error fetching stats:", error);
      setStats({
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingVerification: 0,
        totalProducts: 0,
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchPendingReceipts = async (): Promise<void> => {
    try {
      const token = getCookie("token");

      const response = await axios.get(`${BASE_URL}/admin/pending-receipts`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const data = response.data;
      setPendingReceipts(data.receipts || data || []);
    } catch (error: any) {
      console.error("Error fetching pending receipts:", error);
      setPendingReceipts([]);
    }
  };

  const fetchAllOrders = async (): Promise<void> => {
    try {
      setOrdersLoading(true);
      const token = getCookie("token");

      const response = await axios.get(`${BASE_URL}/admin/orders`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const data = response.data;
      setAllOrders(data.orders || data || []);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      setAllOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const verifyReceipt = async (orderId: string, approved: boolean, note?: string): Promise<void> => {
    try {
      setActionLoading(orderId);
      const token = getCookie("token");

      const response = await axios.patch(
        `${BASE_URL}/admin/verify-receipt/${orderId}`,
        {
          approved,
          note: note || "",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (response.data.success) {
        await Promise.all([fetchPendingReceipts(), fetchAllOrders(), fetchStats()]);
        setSelectedOrder(null);
        alert(approved ? "رسید با موفقیت تایید شد" : "رسید رد شد");
      }
    } catch (error: any) {
      console.error("Error verifying receipt:", error);
      alert("خطا در انجام عملیات");
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchStats();
      fetchPendingReceipts();
      fetchAllOrders();
    }
  }, [isAuthorized]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { text: string; color: string } } = {
      pending_receipt: {
        text: "در انتظار آپلود رسید",
        color: "bg-blue-100 text-blue-800",
      },
      pending_verification: {
        text: "در انتظار تایید",
        color: "bg-yellow-100 text-yellow-800",
      },
      completed: { text: "تایید شده", color: "bg-green-100 text-green-800" },
      rejected: { text: "رد شده", color: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[status] || {
      text: status,
      color: "bg-gray-100 text-gray-800",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const handleLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    localStorage.removeItem("userRole");
    router.push("/login");
  };

  const getOrdersToDisplay = (): DisplayOrder[] => {
    if (activeTab === "pending") {
      return pendingReceipts.map(receipt => ({
        id: receipt.orderId,
        userId: receipt.userId,
        userName: receipt.user?.name || "کاربر",
        userEmail: receipt.user?.email || "ندارد",
        items: receipt.order?.items || [{ name: "محصول", price: 0, quantity: 1 }],
        total: receipt.order?.total || 0,
        cardNumber: "****",
        status: "pending_verification" as const,
        createdAt: receipt.uploadedAt,
        receipt: {
          filename: receipt.filename,
          path: receipt.path,
          uploadedAt: receipt.uploadedAt
        }
      }));
    }
    return allOrders;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#2B8E5D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بررسی دسترسی...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="bg-[#2B8E5D] p-2 rounded-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div className="mr-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  پنل مدیریت فروشگاه
                </h1>
                <p className="text-sm text-gray-500">
                  مدیریت سفارشات و تایید پرداخت‌ها
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="text-right ml-2">
                <p className="text-sm font-medium text-gray-900">مدیر سیستم</p>
                <p className="text-xs text-gray-500">admin</p>
              </div>
              <div className="w-10 h-10 bg-[#2B8E5D] rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-xl">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div className="mr-3">
                <p className="text-sm text-gray-500">کل کاربران</p>
                <div className="text-2xl font-bold text-gray-900">
                  {statsLoading ? (
                    <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
                  ) : (
                    stats.totalUsers.toLocaleString("fa-IR")
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-xl">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="mr-3">
                <p className="text-sm text-gray-500">سفارشات کل</p>
                <div className="text-2xl font-bold text-gray-900">
                  {statsLoading ? (
                    <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
                  ) : (
                    stats.totalOrders.toLocaleString("fa-IR")
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-xl">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div className="mr-3">
                <p className="text-sm text-gray-500">درآمد کل</p>
                <div className="text-2xl font-bold text-gray-900">
                  {statsLoading ? (
                    <div className="animate-pulse bg-gray-200 h-6 w-20 rounded"></div>
                  ) : (
                    formatPrice(stats.totalRevenue)
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-xl">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="mr-3">
                <p className="text-sm text-gray-500">در انتظار تایید</p>
                <div className="text-2xl font-bold text-gray-900">
                  {statsLoading ? (
                    <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
                  ) : (
                    stats.pendingVerification.toLocaleString("fa-IR")
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Management Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("pending")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "pending"
                    ? "border-[#2B8E5D] text-[#2B8E5D]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                سفارشات در انتظار تایید ({pendingReceipts.length})
              </button>
              <button
                onClick={() => setActiveTab("all")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "all"
                    ? "border-[#2B8E5D] text-[#2B8E5D]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                همه سفارشات ({allOrders.length})
              </button>
            </nav>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    مشتری
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    محصولات
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    مبلغ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاریخ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    وضعیت
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ordersLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <div className="flex justify-center">
                        <div className="w-8 h-8 border-4 border-[#2B8E5D] border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <p className="text-gray-500 mt-2">در حال بارگذاری سفارشات...</p>
                    </td>
                  </tr>
                ) : getOrdersToDisplay().length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      {activeTab === "pending" 
                        ? "هیچ سفارشی در انتظار تایید وجود ندارد" 
                        : "هیچ سفارشی یافت نشد"}
                    </td>
                  </tr>
                ) : (
                  getOrdersToDisplay().map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 transition duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.userName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.userEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {order.items
                            .map(
                              (item) => `${item.name} (${item.quantity} عدد)`
                            )
                            .join("، ")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-[#2B8E5D] hover:text-[#4ac085] ml-4"
                        >
                          مشاهده جزئیات
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">
                جزئیات سفارش #{selectedOrder.id}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  اطلاعات مشتری
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p>
                    <strong>نام:</strong> {selectedOrder.userName}
                  </p>
                  <p>
                    <strong>ایمیل:</strong> {selectedOrder.userEmail}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  محصولات سفارش
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} عدد × {formatPrice(item.price)}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-300">
                    <p className="font-bold">جمع کل:</p>
                    <p className="font-bold text-lg">
                      {formatPrice(selectedOrder.total)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Receipt Section */}
              {selectedOrder.receipt && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    رسید پرداخت
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-600">
                        آپلود شده در:{" "}
                        {formatDate(selectedOrder.receipt.uploadedAt)}
                      </span>
                      <a
                        href={`http://localhost:5000${selectedOrder.receipt.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#2B8E5D] hover:text-[#4ac085] text-sm font-medium"
                      >
                        مشاهده رسید
                      </a>
                    </div>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <svg
                        className="w-12 h-12 text-gray-400 mx-auto mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-sm text-gray-600">
                        {selectedOrder.receipt.filename}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {selectedOrder.status === "pending_verification" && (
                <div className="flex space-x-3 space-x-reverse">
                  <button
                    onClick={() =>
                      verifyReceipt(selectedOrder.id, false, "رسید نامعتبر است")
                    }
                    disabled={actionLoading === selectedOrder.id}
                    className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === selectedOrder.id ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        در حال پردازش...
                      </div>
                    ) : (
                      "رد کردن سفارش"
                    )}
                  </button>
                  <button
                    onClick={() => verifyReceipt(selectedOrder.id, true)}
                    disabled={actionLoading === selectedOrder.id}
                    className="flex-1 bg-[#2B8E5D] text-white py-3 px-4 rounded-lg hover:bg-[#4ac085] transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === selectedOrder.id ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        در حال پردازش...
                      </div>
                    ) : (
                      "تایید پرداخت"
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;