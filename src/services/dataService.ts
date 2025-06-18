
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

  static async deleteProduct(productId: string) {
    console.log('[DataService] Deleting product:', productId);
    
    // Get product details to access images
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('images')
      .eq('id', productId)
      .single();

    if (fetchError) {
      console.error('[DataService] Error fetching product for deletion:', fetchError);
      throw fetchError;
    }

    // Delete images from storage first
    if (product?.images && product.images.length > 0) {
      const filesToDelete = product.images.map((imageUrl: string) => {
        const urlParts = imageUrl.split('/');
        return urlParts[urlParts.length - 1];
      });

      const { error: storageError } = await supabase.storage
        .from('products')
        .remove(filesToDelete);

      if (storageError) {
        console.error('[DataService] Error deleting product images:', storageError);
        // Continue with product deletion even if image deletion fails
      }
    }

    // Delete the product from database
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('[DataService] Error deleting product:', error);
      throw error;
    }

    return { success: true };
  }

  // Collection Management
  static async deleteCollection(categoryId: string) {
    console.log('[DataService] Deleting collection:', categoryId);
    
    // Get category details to access image
    const { data: category, error: fetchError } = await supabase
      .from('categories')
      .select('image_url')
      .eq('id', categoryId)
      .single();

    if (fetchError) {
      console.error('[DataService] Error fetching category for deletion:', fetchError);
      throw fetchError;
    }

    // Delete image from storage first if it exists
    if (category?.image_url) {
      const urlParts = category.image_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      const { error: storageError } = await supabase.storage
        .from('products')
        .remove([fileName]);

      if (storageError) {
        console.error('[DataService] Error deleting collection image:', storageError);
        // Continue with category deletion even if image deletion fails
      }
    }

    // Delete the category from database
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      console.error('[DataService] Error deleting category:', error);
      throw error;
    }

    return { success: true };
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
    console.log('[DataService] Starting order deletion process for:', orderId);
    
    try {
      // First, let's check if the order exists and get its details
      const { data: orderExists, error: checkError } = await supabase
        .from('orders')
        .select('id, user_id')
        .eq('id', orderId)
        .maybeSingle();

      if (checkError) {
        console.error('[DataService] Error checking order existence:', checkError);
        throw new Error(`Failed to check order existence: ${checkError.message}`);
      }

      if (!orderExists) {
        console.log('[DataService] Order does not exist:', orderId);
        throw new Error('Order not found');
      }

      console.log('[DataService] Order exists, proceeding with deletion for user:', orderExists.user_id);

      // Step 1: Delete order items first (due to foreign key constraints)
      console.log('[DataService] Deleting order items for order:', orderId);
      const { error: itemsError, count: deletedItemsCount } = await supabase
        .from('order_items')
        .delete({ count: 'exact' })
        .eq('order_id', orderId);

      if (itemsError) {
        console.error('[DataService] Error deleting order items:', itemsError);
        throw new Error(`Failed to delete order items: ${itemsError.message}`);
      }

      console.log(`[DataService] Successfully deleted ${deletedItemsCount || 0} order items`);

      // Step 2: Small delay to ensure database consistency
      await new Promise(resolve => setTimeout(resolve, 100));

      // Step 3: Delete the order itself
      console.log('[DataService] Deleting order:', orderId);
      const { error: orderError, count: deletedOrderCount } = await supabase
        .from('orders')
        .delete({ count: 'exact' })
        .eq('id', orderId);

      if (orderError) {
        console.error('[DataService] Error deleting order:', orderError);
        throw new Error(`Failed to delete order: ${orderError.message}`);
      }

      if (deletedOrderCount === 0) {
        console.error('[DataService] No order was deleted - this indicates a permission or constraint issue');
        throw new Error('Order deletion failed - no rows affected. Check permissions and constraints.');
      }

      console.log(`[DataService] Successfully deleted ${deletedOrderCount} order(s)`);

      // Step 4: Wait a bit longer for database propagation
      await new Promise(resolve => setTimeout(resolve, 200));

      // Step 5: Verify deletion with multiple attempts to handle eventual consistency
      let verificationAttempts = 0;
      const maxAttempts = 3;
      let orderStillExists = true;

      while (verificationAttempts < maxAttempts && orderStillExists) {
        verificationAttempts++;
        console.log(`[DataService] Verification attempt ${verificationAttempts}/${maxAttempts}`);

        // Use a fresh query to bypass any caching
        const { data: verifyDeleted, error: verifyError } = await supabase
          .from('orders')
          .select('id, status, user_id')
          .eq('id', orderId)
          .maybeSingle();

        if (verifyError) {
          console.error(`[DataService] Error in verification attempt ${verificationAttempts}:`, verifyError);
          // If it's a "not found" error, that's actually good - the order is deleted
          if (verifyError.code === 'PGRST116' || verifyError.message?.includes('No rows found')) {
            console.log('[DataService] Order successfully deleted (confirmed by not found error)');
            orderStillExists = false;
            break;
          }
          // For other errors, we'll retry
          if (verificationAttempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 300));
            continue;
          }
          throw new Error(`Verification failed: ${verifyError.message}`);
        }

        if (!verifyDeleted) {
          console.log(`[DataService] Verification attempt ${verificationAttempts}: Order successfully deleted`);
          orderStillExists = false;
        } else {
          console.warn(`[DataService] Verification attempt ${verificationAttempts}: Order still exists:`, {
            id: verifyDeleted.id,
            status: verifyDeleted.status,
            user_id: verifyDeleted.user_id
          });
          
          if (verificationAttempts < maxAttempts) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        }
      }

      if (orderStillExists) {
        console.error('[DataService] Order deletion verification failed after all attempts');
        
        // Final diagnostic query to understand why it still exists
        const { data: diagnosticData, error: diagnosticError } = await supabase
          .from('orders')
          .select('id, status, user_id, created_at, updated_at')
          .eq('id', orderId)
          .maybeSingle();

        if (!diagnosticError && diagnosticData) {
          console.error('[DataService] Diagnostic data for failed deletion:', diagnosticData);
          throw new Error(`Order deletion verification failed. Order still exists with status: ${diagnosticData.status}. This may be due to RLS policies or database constraints.`);
        }
        
        throw new Error('Order deletion verification failed - order may still exist due to database consistency issues');
      }

      console.log('[DataService] Order deletion completed and verified successfully');
      return { success: true, deletedItemsCount: deletedItemsCount || 0 };

    } catch (error) {
      console.error('[DataService] Error in deleteOrder:', error);
      
      // Enhanced error reporting
      if (error instanceof Error) {
        throw new Error(`Order deletion failed: ${error.message}`);
      }
      throw new Error('Order deletion failed due to unknown error');
    }
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
