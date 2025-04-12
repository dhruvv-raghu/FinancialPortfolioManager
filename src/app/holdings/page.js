"use client"

import React, { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/solid'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import withAuth from "../components/withAuth"

function HoldingsPage() {
  const [holdings, setHoldings] = useState([])
  const [loggedInUserId, setLoggedInUserId] = useState(null)

  const totalValue = holdings.reduce((sum, holding) => {
    const quantity = holding.quantity || 0
    const currentPrice = holding.currentPrice || 0 // Fallback to 0 if undefined
    return sum + quantity * currentPrice
  }, 0)

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token')

      if (token) {
        try {
          const response = await fetch('/api/validate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          })

          const data = await response.json()

          if (data.success) {
            console.log('Token validated, User ID:', data.id)
            setLoggedInUserId(data.id)
            fetchUserHoldings()  // Fetch holdings if the token is valid
          } else {
            toast.error(data.message || 'Token validation failed')
          }
        } catch (error) {
          toast.error('Error validating token')
          console.error('Token validation error:', error)
        }
      } else {
        toast.error('No token found, please log in')
      }
    }

    validateToken()
  }, [])

  const fetchUserHoldings = async () => {
    const token = localStorage.getItem('token')
    
    if (!token) {
      toast.error('Authorization token missing')
      return
    }

    try {
      const response = await fetch(`/api/holdings`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const holdingsData = await response.json()
        setHoldings(holdingsData.data || [])  // Ensure data fallback to an array if undefined
        console.log('Holdings data:', holdingsData.data)
      } else {
        const error = await response.json()
        toast.error(`Failed to load your holdings: ${error.message || 'Unknown error'}`)
        console.error('Holdings fetch error:', error)
      }
    } catch (error) {
      toast.error('Error fetching holdings data.')
      console.error('Error fetching holdings:', error)
    }
  }
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-[#001f3f] to-black text-white">
      <div className="container mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-bold text-[#4ac1ff]">Your Holdings</h1>
  
        <Card className="bg-[#0a2a4d] border-[#4ac1ff] border">
          <CardHeader>
            <CardTitle className="text-[#4ac1ff]">Portfolio Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#4ac1ff]">
              ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-gray-400">Total Portfolio Value</p>
          </CardContent>
        </Card>
  
        <Card className="bg-[#0a2a4d] border-[#4ac1ff] border">
          <CardHeader>
            <CardTitle className="text-[#4ac1ff]">Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[#4ac1ff]">Symbol</TableHead>
                  <TableHead className="text-[#4ac1ff]">Name</TableHead>
                  <TableHead className="text-right text-[#4ac1ff]">Quantity</TableHead>
                  <TableHead className="text-right text-[#4ac1ff]">Current Price</TableHead>
                  <TableHead className="text-right text-[#4ac1ff]">Change (%)</TableHead>
                  <TableHead className="text-right text-[#4ac1ff]">Total Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {holdings.map((holding) => (
                  <TableRow key={holding.symbol}>
                    <TableCell className="font-medium text-[#4ac1ff]">{holding.symbol || "N/A"}</TableCell>
                    <TableCell className="font-medium text-[#4ac1ff]">{holding.name || "N/A"}</TableCell>
                    <TableCell className="text-right text-[#4ac1ff]">{holding.quantity || 0}</TableCell>
                    <TableCell className="text-right text-[#4ac1ff]">
                      ${holding.currentPrice ? holding.currentPrice.toFixed(2) : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={holding.price_change >= 0 ? "text-green-400" : "text-red-400"}>
                        {holding.price_change >= 0 ? <ArrowUpIcon className="inline h-4 w-4" /> : <ArrowDownIcon className="inline h-4 w-4" />}
                        {holding.price_change != null ? Math.abs(holding.price_change).toFixed(2) : "0.00"}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-[#4ac1ff]">
                      ${(holding.quantity && holding.currentPrice ? (holding.quantity * holding.currentPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default withAuth(HoldingsPage);
