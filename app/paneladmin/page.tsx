// app/paneladmin/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface Stats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingVerification: number;
  totalProducts: number;
}

interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  cardNumber: string;
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

  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setTimeout(() => {
        const mockPendingOrders: Order[] = [
          {
            id: "1",
            userId: "user1",
            userName: "علی محمدی",
            userEmail: "ali@example.com",
            items: [
              {
                id: "1",
                name: "گوشی موبایل سامسونگ",
                price: 8000000,
                quantity: 1,
              },
              { id: "2", name: "قاب محافظ", price: 150000, quantity: 1 },
            ],
            total: 8150000,
            cardNumber: "6037****1234",
            status: "pending_verification",
            createdAt: "2024-01-15T10:30:00Z",
            receipt: {
              filename: "receipt-123456.jpg",
              path: "/uploads/receipts/receipt-123456.jpg",
              uploadedAt: "2024-01-15T11:00:00Z",
            },
          },
        ];

        const mockAllOrders: Order[] = [
          ...mockPendingOrders,
          {
            id: "3",
            userId: "user3",
            userName: "رضا احمدی",
            userEmail: "reza@example.com",
            items: [
              { id: "4", name: "هدفون بی‌سیم", price: 1200000, quantity: 2 },
            ],
            total: 2400000,
            cardNumber: "6274****9012",
            status: "completed",
            createdAt: "2024-01-14T16:45:00Z",
            receipt: {
              filename: "receipt-345678.jpg",
              path: "/uploads/receipts/receipt-345678.jpg",
              uploadedAt: "2024-01-14T17:20:00Z",
            },
            verifiedAt: "2024-01-14T18:00:00Z",
            verifiedBy: "admin",
          },
        ];

        setStats({
          totalUsers: 1247,
          totalOrders: mockAllOrders.length,
          totalRevenue: mockAllOrders
            .filter((o) => o.status === "completed")
            .reduce((sum, o) => sum + o.total, 0),
          pendingVerification: mockPendingOrders.length,
          totalProducts: 89,
        });

        setPendingOrders(mockPendingOrders);
        setAllOrders(mockAllOrders);
      }, 1000);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const verifyOrder = async (orderId: string, approved: boolean, note?: string) => {
    try {
      console.log("Verifying order:", orderId, approved, note);

      setPendingOrders((prev) => prev.filter((order) => order.id !== orderId));
      setAllOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: approved ? "completed" : "rejected",
                verifiedAt: new Date().toISOString(),
                verifiedBy: "admin",
                ...(approved ? {} : { rejectionReason: note }),
              }
            : order
        )
      );

      setStats((prev) => ({
        ...prev,
        pendingVerification: prev.pendingVerification - 1,
        totalRevenue: approved
          ? prev.totalRevenue +
            (allOrders.find((o) => o.id === orderId)?.total || 0)
          : prev.totalRevenue,
      }));

      setSelectedOrder(null);
    } catch (error) {
      console.error("Error verifying order:", error);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#2B8E5D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری پنل مدیریت...</p>
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
              <div className="text-right">
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
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalUsers.toLocaleString("fa-IR")}
                </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalOrders.toLocaleString("fa-IR")}
                </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(stats.totalRevenue)}
                </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pendingVerification.toLocaleString("fa-IR")}
                </p>
              </div>
            </div>
          </div>
        </div>

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
                سفارشات در انتظار تایید ({pendingOrders.length})
              </button>
              <button
                onClick={() => setActiveTab("all")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "all"
                    ? "border-[#2B8E5D] text-[#2B8E5D]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                همه سفارشات
              </button>
            </nav>
          </div>

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
                    شماره کارت
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
                {(activeTab === "pending" ? pendingOrders : allOrders).map(
                  (order) => (
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
                        {order.cardNumber}
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
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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
                  <p>
                    <strong>شماره کارت:</strong> {selectedOrder.cardNumber}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  محصولات سفارش
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={item.id}
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

              {selectedOrder.status === "pending_verification" && (
                <div className="flex space-x-3 space-x-reverse">
                  <button
                    onClick={() =>
                      verifyOrder(selectedOrder.id, false, "رسید نامعتبر است")
                    }
                    className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition duration-200 font-medium"
                  >
                    رد کردن سفارش
                  </button>
                  <button
                    onClick={() => verifyOrder(selectedOrder.id, true)}
                    className="flex-1 bg-[#2B8E5D] text-white py-3 px-4 rounded-lg hover:bg-[#4ac085] transition duration-200 font-medium"
                  >
                    تایید پرداخت
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