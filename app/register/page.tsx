"use client";

import Link from "next/link";
import React, { useState } from "react";

function Register() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("رمز عبور و تایید رمز عبور مطابقت ندارند.");
      return;
    }
    // Here you can add registration logic, e.g., API call
    setError("");
    alert("ثبت نام با موفقیت انجام شد!");
  };

  return (
    <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-50 to-gray-200" dir="rtl">
      <div className="w-[30%] bg-white shadow-2xl rounded-3xl p-4 flex flex-col items-center">
        <div className="mb-6">
          <svg className="w-12 h-12 text-[#2B8E5D]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8a2 2 0 012-2m6-5v4m-3 0h6" />
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-4 border-b-2 border-[#2B8E5D] pb-3 w-full text-center tracking-wide">ثبت نام</h1>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">نام کامل</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-[#2B8E5D] transition duration-300"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">ایمیل</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-[#2B8E5D] transition duration-300"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">رمز عبور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-[#2B8E5D] transition duration-300"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">تایید رمز عبور</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-[#2B8E5D] transition duration-300"
              required
            />
          </div>
          {error && <p className="text-red-500 text-center text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 duration-300 hover:shadow-2xl cursor-pointer hover:bg-[#4ac085] text-white bg-[#2B8E5D] rounded-full text-base font-semibold tracking-wide transform hover:-translate-y-1"
          >
            ثبت نام
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-4 text-gray-600 text-sm">
          حساب کاربری دارید؟{' '}
          <Link href="/login" className="text-[#2B8E5D] hover:text-[#4ac085] font-medium duration-300">
            ورود
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;