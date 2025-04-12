"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUpIcon, NewspaperIcon, DollarSignIcon, StarIcon, ArrowRightIcon } from 'lucide-react'
import { ScrollArea } from "@/components/ui/scroll-area"
import withAuth from "../components/withAuth.js"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

function UserDashboard() {
  const [newsArticles, setNewsArticles] = useState([])
  const [portfolioValue, setPortfolioValue] = useState(null)
  const [marketOverview, setMarketOverview] = useState([])
  const [mostBoughtSoldStock, setMostBoughtSoldStock] = useState(null)
  const router = useRouter()

  // Fetch market overview and portfolio value
  useEffect(() => {
    async function fetchMarketData() {
      try {
        const marketResponse = await fetch("/api/dashboard/marketOverview")
        if (!marketResponse.ok) throw new Error("Failed to fetch market overview data.")
        const marketData = await marketResponse.json()
        setMarketOverview(marketData.marketOverview || [])

        const portfolioResponse = await fetch("/api/dashboard/totalPortfolioValue")
        if (!portfolioResponse.ok) throw new Error("Failed to fetch portfolio value data.")
        const portfolioData = await portfolioResponse.json()
        setPortfolioValue(portfolioData.value)
      } catch (error) {
        console.error("Error fetching market or portfolio data:", error)
      }
    }
    fetchMarketData()
  }, [])

  // Fetch top news articles
  useEffect(() => {
    async function fetchNews() {
      try {
        const response = await fetch("/api/dashboard/getNews")
        if (!response.ok) throw new Error("Failed to fetch news data.")
        const data = await response.json()
        setNewsArticles(data.newsSnippets || [])
      } catch (error) {
        console.error("Error fetching news:", error)
      }
    }
    fetchNews()
  }, [])

  // Fetch most bought and sold stock
  useEffect(() => {
    async function fetchBoughtSoldStocks() {
      try {
        const response = await fetch("/api/dashboard/procedure")
        if (!response.ok) throw new Error("Failed to fetch bought and sold stock data.")
        const data = await response.json()
        setMostBoughtSoldStock(data)
      } catch (error) {
        console.error("Error fetching bought and sold stocks:", error)
      }
    }
    fetchBoughtSoldStocks()
  }, [])

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-[#001f3f] to-black text-white">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-8 text-[#4ac1ff] tracking-tight"
        >
          Welcome back
        </motion.h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {/* Market Overview Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-[#0a2a4d] border-[#4ac1ff] border shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold text-[#4ac1ff]">Market Overview</CardTitle>
                  <TrendingUpIcon className="h-5 w-5 text-[#4ac1ff]" />
                </div>
              </CardHeader>
              <CardContent>
                {marketOverview.length === 0 ? (
                  <p className="text-white">Loading market overview...</p>
                ) : (
                  marketOverview.map((item, index) => (
                    <div key={index} className="mb-3 last:mb-0">
                      <p className="text-white font-semibold flex justify-between items-center">
                        <span>{item.symbol}</span>
                        <span className={`${item.change.startsWith('-') ? 'text-red-400' : 'text-green-400'}`}>
                          ${item.price} ({item.change}%)
                        </span>
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Portfolio Value Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card
              className="bg-[#0a2a4d] border-[#4ac1ff] border shadow-xl hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
              onClick={() => router.push("/holdings")}
            >
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold text-[#4ac1ff]">Portfolio Value</CardTitle>
                  <DollarSignIcon className="h-5 w-5 text-[#4ac1ff]" />
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-400 mb-6">
                  Track your portfolio performance and manage your holdings in one place.
                </p>
                <Button
                  className="bg-[#4ac1ff] text-black font-bold hover:bg-[#66d5ff] transition-all group"
                  onClick={() => router.push("/holdings")}
                >
                  Go to Holdings
                  <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Most Bought and Sold Stocks Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-[#0a2a4d] border-[#4ac1ff] border shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold text-[#4ac1ff]">Most Traded Stocks</CardTitle>
                  <StarIcon className="h-5 w-5 text-[#4ac1ff]" />
                </div>
              </CardHeader>
              <CardContent>
                {mostBoughtSoldStock ? (
                  <>
                    <div className="mb-4">
                      <p className="text-gray-400 mb-1">Most Bought</p>
                      <p className="text-white font-semibold text-lg">
                        {mostBoughtSoldStock.mostBoughtStock.symbol}
                      </p>
                      <p className="text-green-400">
                        {mostBoughtSoldStock.mostBoughtStock.total_bought_quantity} shares
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1">Most Sold</p>
                      <p className="text-white font-semibold text-lg">
                        {mostBoughtSoldStock.mostSoldStock.symbol}
                      </p>
                      <p className="text-red-400">
                        {mostBoughtSoldStock.mostSoldStock.total_sold_quantity} shares
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-white">Loading stock data...</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Top News Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="w-full bg-[#0a2a4d] border-[#4ac1ff] border shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-[#4ac1ff]">Top News</CardTitle>
              <CardDescription className="text-gray-400">Stay updated with the latest market news</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] w-full pr-4">
                {newsArticles.length === 0 ? (
                  <p className="text-white">No news available at the moment.</p>
                ) : (
                  newsArticles.map((article, index) => (
                    <div key={index} className="mb-6 last:mb-0 pb-6 border-b border-gray-700 last:border-b-0">
                      <h3 className="text-xl font-semibold text-white mb-2">{article.title}</h3>
                      <div className="flex items-center mb-2 text-sm text-gray-400">
                        <NewspaperIcon className="h-4 w-4 mr-2" />
                        <span>{new URL(article.url).hostname}</span>
                      </div>
                      <p className="text-gray-300 mb-3">{article.description || "No description available."}</p>
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[#4ac1ff] hover:underline inline-flex items-center group"
                      >
                        Read more
                        <ArrowRightIcon className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </a>
                    </div>
                  ))
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default withAuth(UserDashboard)
