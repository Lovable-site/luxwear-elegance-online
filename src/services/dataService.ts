import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Tables = Database['public']['Tables'];
type Product = Tables['products']['Row'];
type Order = Tables['orders']['Row'];
type OrderItem = Tables['order_items']['Row'];
type Profile = Tables['profiles']['Row'];
type CartItem = Tables['cart_items']['Row'];

export class DataService {
  // Product Management (Admin + Client)
  static async getProducts(filters?: {
    category?: string;
    isActive?: boolean;
    isFeatured?: boolean;
  }) {
    console.log('[DataService] Fetching products with filters:', filters);
    
    let query = supabase.from('products').select(`
      *,
      categories (name, description)
    `);

    if (filters?.category) {
      query = query.eq('categories.name', filters.category);
    }
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }
    if (filters?.isFeatured !== undefined) {
      query = query.eq('is_featured', filters.isFeatured);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('[DataService] Error fetching products:', error);
      throw error;
    }
    
    return data;
  }

  static async getProductById(id: string) {
    console.log('[DataService] Fetching product:', id);
    
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (name, description)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('[DataService] Error fetching product:', error);
      throw error;
    }

    return data;
  }

  static async updateProductStock(productId: string, newStock: number) {
    console.log('[DataService] Updating product stock:', productId, newStock);
    
    const { data, error } = await supabase
      .from('products')
      .update({ stock_quantity: newStock, updated_at: new Date().toISOString() })
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      console.error('[DataService] Error updating stock:', error);
      throw error;
    }

    return data;
  }

  // Order Management (Admin + Client)
  static async getOrdersByUser(userId: string) {
    console.log('[DataService] Fetching orders for user:', userId);
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (name, price, images)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[DataService] Error fetching user orders:', error);
      throw error;
    }

    return data;
  }

  static async getAllOrders() {
    console.log('[DataService] Fetching all orders (admin)');
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        profiles (full_name, email),
        order_items (
          *,
          products (name, price)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[DataService] Error fetching all orders:', error);
      throw error;
    }

    return data;
  }

  static async updateOrderStatus(orderId: string, status: string) {
    console.log('[DataService] Updating order status:', orderId, status);
    
    const { data, error } = await supabase
      .from('orders')
      .update({ status: status as any, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('[DataService] Error updating order status:', error);
      throw error;
    }

    return data;
  }

  static async deleteOrder(orderId: string) {
    console.log('[DataService] Deleting order:', orderId);
    
    // First delete order items
    const { error: itemsError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', orderId);

    if (itemsError) {
      console.error('[DataService] Error deleting order items:', itemsError);
      throw itemsError;
    }

    // Then delete the order
    const { error: orderError } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (orderError) {
      console.error('[DataService] Error deleting order:', orderError);
      throw orderError;
    }

    return { success: true };
  }

  // User Management (Admin)
  static async getAllUsers() {
    console.log('[DataService] Fetching all users (admin)');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[DataService] Error fetching users:', error);
      throw error;
    }

    return data;
  }

  static async updateUserRole(userId: string, role: 'admin' | 'customer') {
    console.log('[DataService] Updating user role:', userId, role);
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('[DataService] Error updating user role:', error);
      throw error;
    }

    return data;
  }

  // Cart Management (Client)
  static async syncCartToDatabase(userId: string, cartItems: any[]) {
    console.log('[DataService] Syncing cart to database:', userId, cartItems.length);
    
    // Clear existing cart
    await supabase.from('cart_items').delete().eq('user_id', userId);
    
    if (cartItems.length === 0) return;

    // Insert new cart items
    const cartData = cartItems.map(item => ({
      user_id: userId,
      product_id: item.id,
      quantity: item.quantity,
      size: item.size
    }));

    const { data, error } = await supabase
      .from('cart_items')
      .insert(cartData)
      .select();

    if (error) {
      console.error('[DataService] Error syncing cart:', error);
      throw error;
    }

    return data;
  }

  static async getCartFromDatabase(userId: string) {
    console.log('[DataService] Loading cart from database:', userId);
    
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        products (*)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('[DataService] Error loading cart:', error);
      throw error;
    }

    return data;
  }

  // Analytics (Admin)
  static async getAnalytics() {
    console.log('[DataService] Fetching analytics data');
    
    // Get order statistics
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('total_amount, created_at, status');

    if (ordersError) throw ordersError;

    // Get product statistics
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('stock_quantity, price, created_at');

    if (productsError) throw productsError;

    // Get user statistics
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('created_at, role');

    if (usersError) throw usersError;

    return {
      orders: orders || [],
      products: products || [],
      users: users || []
    };
  }
}
