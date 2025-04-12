"use client"

import { useState, useEffect } from "react"
import { BarChart2Icon, UsersIcon, DollarSignIcon, AlertTriangleIcon, LogOutIcon, BellIcon, UserPlusIcon, ShieldAlertIcon, ArrowRightIcon } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [dashboardData, setDashboardData] = useState({
    lastUser: null,
    lastLargestTransaction: null,
    biggestPortfolio: null,
    totalUsers: 0,
    usersWithHoldings: 0,
    totalTransactionsValue: 0,
  })
  const [chartData, setChartData] = useState({
    mostBoughtStocks: [],
    largestPortfolios: [],
  })
  const [userData, setUserData] = useState(null)
  const [financialData, setFinancialData] = useState(null)
  const [alertData, setAlertData] = useState({
    largeTransactions: [],
    newUsers: [],
    unusualActivity: []
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/admin/dashboard")
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data")
        }
        const data = await response.json()
        setDashboardData(data)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      }
    }

    const fetchChartData = async () => {
      try {
        const response = await fetch("/api/admin/chart")
        if (!response.ok) {
          throw new Error("Failed to fetch chart data")
        }
        const data = await response.json()
        setChartData(data)
      } catch (error) {
        console.error("Error fetching chart data:", error)
      }
    }

    fetchDashboardData()
    fetchChartData()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      if (activeTab === "users") {
        const response = await fetch("/api/admin/users")
        const data = await response.json()
        setUserData(data)
      } else if (activeTab === "financials") {
        const response = await fetch("/api/admin/financials")
        const data = await response.json()
        setFinancialData(data)
      } else if (activeTab === "alerts") {
        const response = await fetch("/api/admin/alerts")
        const data = await response.json()
        setAlertData(data)
      }
    }

    fetchData()
  }, [activeTab])

  const notifications = [
    dashboardData.lastUser && {
      title: "New user registered",
      description: `${dashboardData.lastUser.username} (${dashboardData.lastUser.email})`,
      time: "Just now",
    },
    dashboardData.lastLargestTransaction && {
      title: "Large transaction alert",
      description: `$${dashboardData.lastLargestTransaction.transaction_value.toLocaleString()} transaction`,
      time: "Recently",
    },
    dashboardData.biggestPortfolio && {
      title: "Biggest portfolio",
      description: `${dashboardData.biggestPortfolio.username}'s portfolio worth $${dashboardData.biggestPortfolio.portfolio_value.toLocaleString()}`,
      time: "Recently",
    },
  ].filter(Boolean)

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card className="bg-[#0a2a4d] border-[#4ac1ff] border shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold text-[#4ac1ff]">Total Users</CardTitle>
                  <UsersIcon className="h-5 w-5 text-[#4ac1ff]" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{dashboardData.totalUsers.toLocaleString()}</div>
                  <p className="text-sm text-gray-400">How many are part of us</p>
                </CardContent>
              </Card>
              <Card className="bg-[#0a2a4d] border-[#4ac1ff] border shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold text-[#4ac1ff]">Users with Holdings</CardTitle>
                  <DollarSignIcon className="h-5 w-5 text-[#4ac1ff]" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{dashboardData.usersWithHoldings.toLocaleString()}</div>
                  <p className="text-sm text-gray-400">How many have made transactions</p>
                </CardContent>
              </Card>
              <Card className="bg-[#0a2a4d] border-[#4ac1ff] border shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold text-[#4ac1ff]">Total Transactions</CardTitle>
                  <BarChart2Icon className="h-5 w-5 text-[#4ac1ff]" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">${Number(dashboardData.totalTransactionsValue).toLocaleString()}</div>
                  <p className="text-sm text-gray-400">All of them, ever!</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="bg-[#0a2a4d] border-[#4ac1ff] border shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-[#4ac1ff]">Top 5 Most Bought Stocks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData.mostBoughtStocks}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
                        <XAxis dataKey="symbol" stroke="#4ac1ff" />
                        <YAxis stroke="#4ac1ff" />
                        <Tooltip contentStyle={{ backgroundColor: '#0a2a4d', border: 'none' }} />
                        <Bar dataKey="purchaseCount" fill="#4ac1ff" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-[#0a2a4d] border-[#4ac1ff] border shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-[#4ac1ff]">Top 5 Largest Portfolios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData.largestPortfolios}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
                        <XAxis dataKey="userId" stroke="#4ac1ff" />
                        <YAxis stroke="#4ac1ff" />
                        <Tooltip contentStyle={{ backgroundColor: '#0a2a4d', border: 'none' }} />
                        <Bar dataKey="totalPortfolioValue" fill="#66d5ff" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-[#0a2a4d] border-[#4ac1ff] border shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-[#4ac1ff]">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {notifications.length > 0 ? (
                    notifications.map((notification, index) => (
                      <li key={index} className="flex items-center justify-between border-b border-[#1e3a5f] pb-2 last:border-b-0">
                        <div>
                          <p className="font-semibold text-white">{notification.title}</p>
                          <p className="text-sm text-gray-400">{notification.description}</p>
                        </div>
                        <span className="text-sm text-gray-400">{notification.time}</span>
                      </li>
                    ))
                  ) : (
                    <p className="text-gray-400">No notifications to display</p>
                  )}
                </ul>
              </CardContent>
            </Card>
          </>
        )
      case "users":
        return userData ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card className="bg-[#0a2a4d] border-[#4ac1ff] border shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold text-[#4ac1ff]">Total Users</CardTitle>
                  <UsersIcon className="h-5 w-5 text-[#4ac1ff]" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{userData.totalUsers[0].count}</div>
                </CardContent>
              </Card>
              <Card className="bg-[#0a2a4d] border-[#4ac1ff] border shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold text-[#4ac1ff]">New Users Today</CardTitle>
                  <UserPlusIcon className="h-5 w-5 text-[#4ac1ff]" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{userData.newUsersToday[0].count}</div>
                </CardContent>
              </Card>
              <Card className="bg-[#0a2a4d] border-[#4ac1ff] border shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold text-[#4ac1ff]">Active Users (Last 7 Days)</CardTitle>
                  <UsersIcon className="h-5 w-5 text-[#4ac1ff]" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{userData.activeUsers[0].count}</div>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="bg-[#0a2a4d] border-[#4ac1ff] border shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-[#4ac1ff]">Top Watchlisters</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {userData.topWatchlisters.map((user, index) => (
                      <li key={index} className="flex justify-between items-center border-b border-[#1e3a5f] pb-2 last:border-b-0">
                        <span className="text-white">{user.username}</span>
                        <span className="text-gray-400">{user.watchlist_count} stocks</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-[#0a2a4d] border-[#4ac1ff] border shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-[#4ac1ff]">Recent Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {userData.recentUsers.map((user, index) => (
                      <li key={index} className="flex justify-between items-center border-b border-[#1e3a5f] pb-2 last:border-b-0">
                        <span className="text-white">{user.username}</span>
                        <span className="text-gray-400">{new Date(user.created_at).toLocaleDateString()}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <p className="text-white">Loading user data...</p>
        )
      case "financials":
        return financialData ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="bg-[#0a2a4d] border-[#4ac1ff] border shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold text-[#4ac1ff]">Total Transaction Value</CardTitle>
                  <DollarSignIcon className="h-5 w-5 text-[#4ac1ff]" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">
                    ${Number(financialData.totalTransactionValue[0].total_value).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-[#0a2a4d] border-[#4ac1ff] border shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold text-[#4ac1ff]">Today's Transaction Value</CardTitle>
                  <DollarSignIcon className="h-5 w-5 text-[#4ac1ff]" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">
                    ${Number(financialData.todayTransactionValue[0].today_value).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="bg-[#0a2a4d] border-[#4ac1ff] border shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-[#4ac1ff]">Top Traders (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {financialData.topTraders.map((trader, index) => (
                      <li key={index} className="flex justify-between items-center border-b border-[#1e3a5f] pb-2 last:border-b-0">
                        <span className="text-white">{trader.username}</span>
                        <span className="text-gray-400">{trader.trade_count} trades</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-[#0a2a4d] border-[#4ac1ff] border shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-[#4ac1ff]">Most Traded Stocks (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {financialData.mostTradedStocks.map((stock, index) => (
                      <li key={index} className="flex justify-between items-center border-b border-[#1e3a5f] pb-2 last:border-b-0">
                        <span className="text-white">{stock.symbol}</span>
                        <span className="text-gray-400">{stock.trade_count} trades</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
            <Card className="bg-[#0a2a4d] border-[#4ac1ff] border shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-[#4ac1ff]">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {financialData.recentTransactions.map((transaction, index) => (
                    <li key={index} className="flex justify-between items-center border-b border-[#1e3a5f] pb-2 last:border-b-0">
                      <span className="text-white">{transaction.username} - {transaction.symbol}</span>
                      <span className="text-gray-400">
                        {transaction.type} {transaction.quantity} @ ${Number(transaction.price).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </>
        ) : (
          <p className="text-white">Loading financial data...</p>
        )
      case "alerts":
        return (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Card className="bg-[#0a2a4d] border-[#4ac1ff] border shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-[#4ac1ff] flex items-center">
                    <BellIcon className="mr-2 h-5 w-5" /> Large Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {alertData && alertData.largeTransactions && alertData.largeTransactions.length > 0 ? (
                    <ul className="space-y-2">
                      {alertData.largeTransactions.map((transaction, index) => (
                        <li key={index} className="border-b border-[#1e3a5f] pb-2 last:border-b-0">
                          <p className="text-white"><span className="font-semibold">{transaction.username}</span> - {transaction.symbol}</p>
                          <p className="text-gray-400">
                            {transaction.type} {transaction.quantity} @ ${Number(transaction.price).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-400">
                            {new Date(transaction.date_of_order).toLocaleString()}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-white">No large transactions to display</p>
                  )}
                </CardContent>
              </Card>
              <Card className="bg-[#0a2a4d] border-[#4ac1ff] border shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-[#4ac1ff] flex items-center">
                    <UserPlusIcon className="mr-2 h-5 w-5" /> New Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {alertData && alertData.newUsers && alertData.newUsers.length > 0 ? (
                    <ul className="space-y-2">
                      {alertData.newUsers.map((user, index) => (
                        <li key={index} className="border-b border-[#1e3a5f] pb-2 last:border-b-0">
                          <p className="text-white"><span className="font-semibold">{user.username}</span></p>
                          <p className="text-gray-400">{user.email}</p>
                          <p className="text-sm text-gray-400">
                            {new Date(user.created_at).toLocaleString()}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-white">No new users to display</p>
                  )}
                </CardContent>
              </Card>
              <Card className="bg-[#0a2a4d] border-[#4ac1ff] border shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-[#4ac1ff] flex items-center">
                    <ShieldAlertIcon className="mr-2 h-5 w-5" /> Unusual Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {alertData && alertData.unusualActivity && alertData.unusualActivity.length > 0 ? (
                    <ul className="space-y-2">
                      {alertData.unusualActivity.map((activity, index) => (
                        <li key={index} className="border-b border-[#1e3a5f] pb-2 last:border-b-0">
                          <p className="text-white"><span className="font-semibold">{activity.username}</span></p>
                          <p className="text-gray-400">
                            {activity.login_count} logins in the last 24 hours
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-white">No unusual activity to display</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )
      default:
        return <p className="text-white">Select a tab to view content</p>
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-b from-[#001f3f] to-black text-white">
      <aside className="w-64 bg-[#0a2a4d] p-6">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold mb-8 text-[#4ac1ff]"
        >
          StockSavvy Admin
        </motion.h1>
        <nav>
          <ul className="space-y-2">
            <li>
              <Button
                variant={activeTab === "dashboard" ? "default" : "ghost"}
                className="w-full justify-start text-white hover:text-[#4ac1ff] transition-colors"
                onClick={() => setActiveTab("dashboard")}
              >
                <BarChart2Icon className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </li>
            <li>
              <Button
                variant={activeTab === "users" ? "default" : "ghost"}
                className="w-full justify-start text-white hover:text-[#4ac1ff] transition-colors"
                onClick={() => setActiveTab("users")}
              >
                <UsersIcon className="mr-2 h-4 w-4" />
                Users
              </Button>
            </li>
            <li>
              <Button
                variant={activeTab === "financials" ? "default" : "ghost"}
                className="w-full justify-start text-white hover:text-[#4ac1ff] transition-colors"
                onClick={() => setActiveTab("financials")}
              >
                <DollarSignIcon className="mr-2 h-4 w-4" />
                Financials
              </Button>
            </li>
            <li>
              <Button
                variant={activeTab === "alerts" ? "default" : "ghost"}
                className="w-full justify-start text-white hover:text-[#4ac1ff] transition-colors"
                onClick={() => setActiveTab("alerts")}
              >
                <AlertTriangleIcon className="mr-2 h-4 w-4" />
                Alerts
              </Button>
            </li>
          </ul>
        </nav>
        <div className="absolute bottom-0 left-0 w-64 p-6">
          <Button variant="outline" className="w-full text-white hover:text-[#4ac1ff] transition-colors">
            <LogOutIcon className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-3xl font-bold mb-8 text-[#4ac1ff]"
        >
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Overview
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {renderContent()}
        </motion.div>
      </main>
    </div>
  )
}
