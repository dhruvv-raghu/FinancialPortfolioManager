"use client"

import React, { useState, useEffect } from "react"
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, TrashIcon, SearchIcon } from "lucide-react"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import withAuth from "../components/withAuth";

const WatchlistPage = () => {
  const [watchlist, setWatchlist] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [loggedInUserId, setLoggedInUserId] = useState(null)
  const [selectedStock, setSelectedStock] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const StockDetailsDialog = async (symbol) => {
    const token = localStorage.getItem("token")
    try {
      const response = await fetch(`/api/stocks?symbol=${encodeURIComponent(symbol)}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const stockDetails = await response.json()
        setSelectedStock(stockDetails)
        setShowModal(true)
      } else {
        const error = await response.json()
        toast.error(`Error fetching stock details: ${error.message}`)
      }
    } catch (error) {
      toast.error("Error fetching stock details.")
    }
  }

  const handleCloseModal = () => {
    setSelectedStock(null)
    setShowModal(false)
  }

  useEffect(() => {
    // Validate token with the API
    const validateToken = async () => {
      const token = localStorage.getItem("token")

      if (token) {
        // POST /api/validate with the token
        const response = await fetch("/api/validate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (data.success) {
          setLoggedInUserId(data.id)
          fetchUserWatchlist()
        } else {
          toast.error(data.message)
        }
      } else {
        toast.error("No token found, please log in")
      }
    }

    validateToken()
  }, [])

  const fetchUserWatchlist = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/watchlist", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const watchlistData = await response.json()
        console.log(watchlistData)
        setWatchlist(watchlistData.data)
      } else {
        const error = await response.json()
        toast.error(`Failed to load watchlist: ${error.message}`)
      }
    } catch (error) {
      toast.error("Error fetching watchlist.")
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a stock symbol.")
      return
    }

    const token = localStorage.getItem("token")
    try {
      const response = await fetch(`/api/stocks?symbol=${searchQuery.trim()}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(`Error: ${error.message || "Unable to fetch stock data"}`)
        return
      }

      const stockData = await response.json()
      setSearchResults([...searchResults, stockData])
    } catch (error) {
      toast.error("An error occurred while searching for the stock.")
    }
  }

  const addToWatchlist = async (stock) => {
    const token = localStorage.getItem("token")
    try {
      const response = await fetch("/api/watchlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(stock),
      })

      if (response.ok) {
        setWatchlist([...watchlist, stock])
        toast.success(`${stock.symbol} added to your watchlist.`)
      } else {
        const error = await response.json()
        toast.error(`Failed to add stock: ${error.message}`)
      }
    } catch (error) {
      toast.error("Error adding stock to watchlist.")
    }
  }

  const removeFromWatchlist = async (symbol) => {
    const token = localStorage.getItem("token")
    try {
      const response = await fetch(`/api/watchlist?symbol=${symbol}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setWatchlist(watchlist.filter((stock) => stock.symbol !== symbol))
        toast.success(`${symbol} removed from your watchlist.`)
      } else {
        const error = await response.json()
        toast.error(`Failed to remove stock: ${error.message}`)
      }
    } catch (error) {
      toast.error("Error removing stock from watchlist.")
    }
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-[#001f3f] to-black text-white">
      <div className="container mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-bold text-[#4ac1ff]">Your Watchlist</h1>

        <Card className="bg-[#0a2a4d] border-[#4ac1ff] border">
          <CardHeader>
            <CardTitle className="text-[#4ac1ff]">Search Stocks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search by symbol"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="bg-[#001f3f] text-white border-[#4ac1ff] placeholder-gray-400"
              />
              <Button onClick={handleSearch} className="bg-[#4ac1ff] text-[#001f3f] hover:bg-[#39a0e5]">
                <SearchIcon className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            {searchResults.length > 0 && (
              <Table className="mt-4">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[#4ac1ff]">Symbol</TableHead>
                    <TableHead className="text-[#4ac1ff]">Name</TableHead>
                    <TableHead className="text-right text-[#4ac1ff]">Price</TableHead>
                    <TableHead className="text-right text-[#4ac1ff]">Change</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.map((stock) => (
                    <TableRow
                      key={stock.symbol}
                      onClick={() => StockDetailsDialog(stock.symbol)}
                      className="cursor-pointer hover:bg-[#001f3f]"
                    >
                      <TableCell className="font-medium text-[#4ac1ff]">{stock.symbol}</TableCell>
                      <TableCell className="font-medium text-[#4ac1ff]">{stock.name}</TableCell>
                      <TableCell className="text-right text-[#4ac1ff]">${stock.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-[#4ac1ff]">
                        <span className={stock.change >= 0 ? "text-green-400" : "text-red-400"}>
                          {stock.change >= 0 ? (
                            <ArrowUpIcon className="inline h-4 w-4" />
                          ) : (
                            <ArrowDownIcon className="inline h-4 w-4" />
                          )}
                          {Math.abs(stock.change)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            addToWatchlist(stock)
                          }}
                          className="border-[#4ac1ff] text-[#4ac1ff] hover:bg-[#4ac1ff] hover:text-[#001f3f]"
                        >
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#0a2a4d] border-[#4ac1ff] border">
          <CardHeader>
            <CardTitle className="text-[#4ac1ff]">Your Watchlist</CardTitle>
          </CardHeader>
          <CardContent>
            {watchlist.length === 0 ? (
              <p className="text-center text-gray-400">Your watchlist is empty. Search for stocks to add them.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[#4ac1ff]">Symbol</TableHead>
                    <TableHead className="text-[#4ac1ff]">Name</TableHead>
                    <TableHead className="text-right text-[#4ac1ff]">Price</TableHead>
                    <TableHead className="text-right text-[#4ac1ff]">Change</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {watchlist.map((stock) => (
                    <TableRow
                      key={stock.symbol}
                      onClick={() => StockDetailsDialog(stock.symbol)}
                      className="cursor-pointer hover:bg-[#001f3f]"
                    >
                      <TableCell className="font-medium text-[#4ac1ff]">{stock.symbol}</TableCell>
                      <TableCell className="font-medium text-[#4ac1ff]">{stock.name}</TableCell>
                      <TableCell className="text-right text-[#4ac1ff]">${stock.price?.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-[#4ac1ff]">
                        <span className={stock.change >= 0 ? "text-green-400" : "text-red-400"}>
                          {stock.change >= 0 ? (
                            <ArrowUpIcon className="inline h-4 w-4" />
                          ) : (
                            <ArrowDownIcon className="inline h-4 w-4" />
                          )}
                          {Math.abs(stock.change)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFromWatchlist(stock.symbol)
                          }}
                          className="border-[#4ac1ff] text-[#4ac1ff] hover:bg-[#4ac1ff] hover:text-[#001f3f]"
                        >
                          <TrashIcon className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="bg-[#0a2a4d] text-white border-[#4ac1ff]">
            <DialogHeader>
              <DialogTitle className="text-[#4ac1ff]">{selectedStock?.symbol} - {selectedStock?.name || "N/A"}</DialogTitle>
            </DialogHeader>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="text-[#4ac1ff]">Symbol</TableCell>
                  <TableCell>{selectedStock?.symbol}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-[#4ac1ff]">Highest Price</TableCell>
                  <TableCell>${selectedStock?.highestPrice?.toFixed(2) || "N/A"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-[#4ac1ff]">Lowest Price</TableCell>
                  <TableCell>${selectedStock?.lowestPrice?.toFixed(2) || "N/A"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-[#4ac1ff]">Face Value</TableCell>
                  <TableCell>${selectedStock?.faceValue?.toFixed(2) || "N/A"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-[#4ac1ff]">PE Ratio</TableCell>
                  <TableCell>{selectedStock?.peRatio?.toFixed(2) || "N/A"}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <DialogClose asChild>
              <Button className="mt-4 bg-[#4ac1ff] text-[#001f3f] hover:bg-[#39a0e5]">Close</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default withAuth(WatchlistPage); // Use withAuth to protect the WatchlistPage;
