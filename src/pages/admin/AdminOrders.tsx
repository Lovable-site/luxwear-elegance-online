
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DataService } from "@/services/dataService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, Eye, X, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type OrderStatus = Database['public']['Enums']['order_status'];

interface Order {
  id: string;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  shipping_address: any;
  profiles: {
    email: string;
    full_name: string;
  };
  order_items: {
    quantity: number;
    price: number;
    size: string;
    products: {
      name: string;
      sku: string;
    };
  }[];
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('[AdminOrders] Fetching orders...');
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles (email, full_name),
          order_items (
            quantity,
            price,
            size,
            products (name, sku)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[AdminOrders] Error fetching orders:', error);
        toast.error('Failed to fetch orders');
        throw error;
      }
      
      console.log('[AdminOrders] Orders fetched successfully:', data?.length);
      setOrders(data || []);
    } catch (error) {
      console.error('[AdminOrders] Error in fetchOrders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      console.log('[AdminOrders] Updating order status:', orderId, newStatus);
      await DataService.updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated successfully');
      fetchOrders(); // Refresh the orders list
    } catch (error) {
      console.error('[AdminOrders] Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      console.log('[AdminOrders] Deleting order:', orderId);
      await DataService.deleteOrder(orderId);
      toast.success('Order deleted successfully');
      fetchOrders(); // Refresh the orders list
    } catch (error) {
      console.error('[AdminOrders] Error deleting order:', error);
      toast.error('Failed to delete order');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-luxury-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm lg:text-base text-gray-600">Manage customer orders and track shipments</p>
      </div>

      {/* Filters - Enhanced mobile responsiveness */}
      <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by customer name, email, or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-sm lg:text-base"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List - Improved mobile layout */}
      <div className="space-y-3 lg:space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id}>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base lg:text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                  <p className="text-sm text-gray-600 truncate">
                    {order.profiles?.full_name || order.profiles?.email}
                  </p>
                  <p className="text-xs lg:text-sm text-gray-500">
                    {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <div className="flex flex-row sm:flex-col sm:text-right items-center sm:items-end gap-2">
                  <p className="text-lg font-bold text-luxury-gold flex-1 sm:flex-none">
                    ${Number(order.total_amount).toFixed(2)}
                  </p>
                  <Badge className={`${getStatusColor(order.status)} flex-shrink-0 text-xs`}>
                    {order.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                  <p className="text-sm text-gray-600">
                    {order.order_items?.length || 0} item(s)
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    Ship to: {order.shipping_address?.city}, {order.shipping_address?.state}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select
                    value={order.status}
                    onValueChange={(value: OrderStatus) => updateOrderStatus(order.id, value)}
                  >
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrder(order)}
                    className="w-full sm:w-auto"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Order</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete order #{order.id.slice(0, 8)}? This action cannot be undone and will permanently remove the order and all associated items from the database.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteOrder(order.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete Order
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No orders found</p>
        </div>
      )}

      {/* Order Details Modal - Enhanced mobile responsiveness */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 lg:p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[95vh] lg:max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 lg:p-6 border-b sticky top-0 bg-white">
              <h2 className="text-lg lg:text-xl font-bold">Order Details</h2>
              <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold mb-2 text-sm lg:text-base">Customer Information</h3>
                <p className="text-sm lg:text-base">{selectedOrder.profiles?.full_name}</p>
                <p className="text-sm lg:text-base break-all">{selectedOrder.profiles?.email}</p>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="font-semibold mb-2 text-sm lg:text-base">Shipping Address</h3>
                <p className="text-sm lg:text-base">{selectedOrder.shipping_address?.street}</p>
                <p className="text-sm lg:text-base">{selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} {selectedOrder.shipping_address?.zip}</p>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-2 text-sm lg:text-base">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.order_items?.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 border rounded gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm lg:text-base truncate">{item.products?.name}</p>
                        <p className="text-xs lg:text-sm text-gray-600">SKU: {item.products?.sku}</p>
                        {item.size && <p className="text-xs lg:text-sm text-gray-600">Size: {item.size}</p>}
                      </div>
                      <div className="text-left sm:text-right flex-shrink-0">
                        <p className="font-medium text-sm lg:text-base">${Number(item.price).toFixed(2)}</p>
                        <p className="text-xs lg:text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-base lg:text-lg font-semibold">Total:</span>
                  <span className="text-base lg:text-lg font-bold text-luxury-gold">
                    ${Number(selectedOrder.total_amount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function getStatusColor(status: string) {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
};

export default AdminOrders;
