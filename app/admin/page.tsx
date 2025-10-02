"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function AdminPage() {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!session || session.user.role !== "ADMIN") {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 px-2 sm:px-4 md:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Admin Dashboard
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Welcome to the IP Toolkit Admin Panel
                    </p>
                </div>

                {/* IP Pool Add Form for IP Technicians */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-2xl p-8 mb-12 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-blue-700 dark:text-blue-300 mb-6 tracking-tight">
                        Add New IP Pool Range
                    </h2>
                    <form className="space-y-6" id="ip-pool-form">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-base font-semibold mb-2 text-gray-800 dark:text-gray-200">
                                    Region
                                </label>
                                <input
                                    name="region"
                                    type="text"
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white dark:bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-base font-semibold mb-2 text-gray-800 dark:text-gray-200">
                                    Interface Name
                                </label>
                                <input
                                    name="interfaceName"
                                    type="text"
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white dark:bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-base font-semibold mb-2 text-gray-800 dark:text-gray-200">
                                    IP Pool Start
                                </label>
                                <input
                                    name="ipPoolStart"
                                    type="text"
                                    placeholder="e.g. 10.129.0.1"
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white dark:bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-base font-semibold mb-2 text-gray-800 dark:text-gray-200">
                                    IP Pool End
                                </label>
                                <input
                                    name="ipPoolEnd"
                                    type="text"
                                    placeholder="e.g. 10.129.47.255"
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white dark:bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-base font-semibold mb-2 text-gray-800 dark:text-gray-200">
                                    Subnet Mask
                                </label>
                                <input
                                    name="subnetMask"
                                    type="text"
                                    placeholder="e.g. 255.255.192.0"
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white dark:bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-base font-semibold mb-2 text-gray-800 dark:text-gray-200">
                                    Default Gateway
                                </label>
                                <input
                                    name="defaultGateway"
                                    type="text"
                                    placeholder="e.g. 10.129.48.1"
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white dark:bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-base font-semibold mb-2 text-gray-800 dark:text-gray-200">
                                    Technician Employee ID
                                </label>
                                <input
                                    name="employeeId"
                                    type="text"
                                    placeholder="e.g. ethio14777"
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white dark:bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    required
                                />
                            </div>
                        </div>
                        <div className="pt-6 flex justify-end">
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition-all duration-200"
                            >
                                Add IP Pool
                            </button>
                        </div>
                    </form>
                </div>

                {/* Divider and WAN IP Analyzer Section */}
                <div className="my-12 border-t border-gray-300 dark:border-gray-700"></div>
                <div className="bg-white dark:bg-gray-800 shadow rounded-2xl w-full p-4 sm:p-8 md:p-8 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-green-700 dark:text-green-300 mb-6 tracking-tight">
                        Search Customer or Analyze WAN IP
                    </h2>
                    <form
                        className="space-y-6 w-full"
                        id="wan-ip-analyzer-form"
                        autoComplete="off"
                    >
                        <div>
                            <label className="block text-base font-semibold mb-2 text-green-900 dark:text-green-200">
                                Account Number
                            </label>
                            <input
                                name="accountNumber"
                                type="text"
                                inputMode="numeric"
                                pattern="\\d{9}"
                                maxLength={9}
                                placeholder="9 digits (e.g., 123456789)"
                                className="w-full border border-green-100 rounded-xl px-4 py-3 bg-white dark:bg-white text-gray-900 placeholder-green-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-base font-semibold mb-2 text-green-900 dark:text-green-200">
                                Access Number
                            </label>
                            <input
                                name="accessNumber"
                                type="text"
                                inputMode="numeric"
                                pattern="\\d{11}"
                                maxLength={11}
                                placeholder="11 digits (e.g., 12345678901)"
                                className="w-full border border-green-100 rounded-xl px-4 py-3 bg-white dark:bg-white text-gray-900 placeholder-green-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-base font-semibold mb-2 text-green-900 dark:text-green-200">
                                WAN IP Address
                            </label>
                            <input
                                name="wanIp"
                                type="text"
                                placeholder="e.g., 197.156.64.1"
                                className="w-full border border-green-100 rounded-xl px-4 py-3 bg-white dark:bg-white text-gray-900 placeholder-green-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                                required
                            />
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-green-600 to-green-400 hover:from-green-700 hover:to-green-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition-all duration-200 w-full md:w-auto"
                            >
                                Analyze
                            </button>
                        </div>
                    </form>
                    {/* Results will be shown here in the future */}
                    <div
                        id="wan-ip-analyzer-result"
                        className="mt-8 min-h-[48px] text-base text-gray-800 dark:text-gray-100"
                    ></div>
                </div>
            </div>
        </div>
    );
}
