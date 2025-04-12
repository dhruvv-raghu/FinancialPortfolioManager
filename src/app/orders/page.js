"use client"

import withAuth from "../components/withAuth";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const formSchema = z.object({
  stockSymbol: z.string().min(1, "Stock symbol is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  action: z.enum(["buy", "sell"]),
});

function OrdersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stockSymbol: "",
      quantity: 1,
      action: "buy",
    },
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data.data);
      } catch (error) {
        toast.error("Error fetching orders: " + error.message);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  async function onSubmit(values) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          symbol: values.stockSymbol.toUpperCase(),
          quantity: values.quantity,
          order_type: values.action.toLowerCase(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong');
      }

      const orderData = await response.json();
      const newOrder = {
        symbol: orderData.order.symbol,
        quantity: orderData.order.quantity,
        type: orderData.order.order_type,
        date_of_order: orderData.order.date_of_order,
      };

      setOrders(prevOrders => [newOrder, ...(prevOrders || [])]);
      toast.success(`${values.action === "buy" ? "Bought" : "Sold"} ${values.quantity} shares of ${values.stockSymbol}`);
      form.reset();
    } catch (error) {
      // console.error("Error Executing Trade:", error);
      toast.error("There was a problem executing your trade. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-[#001f3f] to-black text-white p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-[#4ac1ff] mb-6">Buy/Sell Stocks</h1>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-[#0a2a4d] border-[#4ac1ff] border shadow-xl">
            <CardHeader>
              <CardTitle className="text-[#4ac1ff]">Place Order</CardTitle>
              <CardDescription className="text-gray-300">Enter the details of your trade below.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="stockSymbol"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#4ac1ff]">Stock Symbol</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="AAPL" 
                            {...field} 
                            className="bg-[#001f3f] text-white border-[#4ac1ff] placeholder-gray-400"
                          />
                        </FormControl>
                        <FormDescription className="text-gray-400">
                          Please enter the exact stock symbol.
                        </FormDescription>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#4ac1ff]">Quantity</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="1" 
                            {...field} 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="bg-[#001f3f] text-white border-[#4ac1ff] placeholder-gray-400" 
                          />
                        </FormControl>
                        <FormDescription className="text-gray-400">
                          Enter the number of shares you want to trade
                        </FormDescription>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="action"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-[#4ac1ff]">Action</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex space-x-4"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="buy" className="border-[#4ac1ff] text-[#4ac1ff]" />
                              </FormControl>
                              <label>Buy</label>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="sell" className="border-[#4ac1ff] text-[#4ac1ff]" />
                              </FormControl>
                              <label>Sell</label>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="bg-[#4ac1ff] hover:bg-[#0093db]"
                  >
                    {isLoading ? "Processing..." : "Place Order"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card className="bg-[#0a2a4d] border-[#4ac1ff] border shadow-xl">
            <CardHeader>
              <CardTitle className="text-[#4ac1ff]">Order History</CardTitle>
              <CardDescription className="text-gray-300">Your recent trades will be displayed here.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center p-4 text-[#4ac1ff]">Loading orders...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[#4ac1ff]">Stock Symbol</TableHead>
                      <TableHead className="text-[#4ac1ff]">Quantity</TableHead>
                      <TableHead className="text-[#4ac1ff]">Type</TableHead>
                      <TableHead className="text-[#4ac1ff]">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders && orders.length > 0 ? (
                      orders.map((order) => (
                        <TableRow key={order.id || `${order.symbol}-${order.date_of_order}`}>
                          <TableCell className="text-[#4ac1ff]">{order.symbol}</TableCell>
                          <TableCell className="text-[#4ac1ff]">{order.quantity}</TableCell>
                          <TableCell className="text-[#4ac1ff]">{order.type || "N/A"}</TableCell>
                          <TableCell className="text-[#4ac1ff]">
                            {order.date_of_order ? 
                              new Date(order.date_of_order).toLocaleString() : 
                              "Invalid Date"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          No orders found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default withAuth(OrdersPage);
