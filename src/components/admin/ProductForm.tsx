
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import ImageUpload from "./ImageUpload";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  product?: any;
  onClose: () => void;
  onSave: () => void;
}

const ProductForm = ({ product, onClose, onSave }: ProductFormProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    sku: '',
    stock_quantity: '',
    sizes: '',
    tags: '',
    is_featured: false,
    is_active: true,
    images: [] as string[]
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    console.log('ProductForm useEffect - product:', product);
    
    if (product) {
      console.log('Setting form data with product:', {
        name: product.name,
        description: product.description,
        price: product.price,
        category_id: product.category_id,
        sku: product.sku,
        stock_quantity: product.stock_quantity,
        sizes: product.sizes,
        tags: product.tags,
        is_featured: product.is_featured,
        is_active: product.is_active,
        images: product.images
      });
      
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        category_id: product.category_id || '',
        sku: product.sku || '',
        stock_quantity: product.stock_quantity?.toString() || '',
        sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : '',
        tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
        is_featured: Boolean(product.is_featured),
        is_active: product.is_active !== false,
        images: Array.isArray(product.images) ? product.images : []
      });
    } else {
      console.log('Resetting form data for new product');
      setFormData({
        name: '',
        description: '',
        price: '',
        category_id: '',
        sku: '',
        stock_quantity: '',
        sizes: '',
        tags: '',
        is_featured: false,
        is_active: true,
        images: []
      });
    }
  }, [product]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category_id: formData.category_id || null,
        sku: formData.sku,
        stock_quantity: parseInt(formData.stock_quantity),
        sizes: formData.sizes.split(',').map(s => s.trim()).filter(s => s),
        tags: formData.tags.split(',').map(s => s.trim()).filter(s => s),
        is_featured: formData.is_featured,
        is_active: formData.is_active,
        images: formData.images,
        updated_at: new Date().toISOString()
      };

      let error;
      if (product) {
        console.log('Updating product with data:', productData);
        ({ error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id));
      } else {
        console.log('Creating new product with data:', productData);
        ({ error } = await supabase
          .from('products')
          .insert([productData]));
      }

      if (error) throw error;
      
      toast.success(product ? 'Product updated successfully' : 'Product created successfully');
      onSave();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  console.log('ProductForm render - formData:', formData);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="stock_quantity">Stock Quantity</Label>
              <Input
                id="stock_quantity"
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sizes">Sizes (comma separated)</Label>
              <Input
                id="sizes"
                value={formData.sizes}
                onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                placeholder="S, M, L, XL"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="luxury, premium, designer"
            />
          </div>

          {/* Image Upload Component */}
          <ImageUpload
            images={formData.images}
            onImagesChange={(images) => setFormData({ ...formData, images })}
            maxImages={3}
          />

          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: !!checked })}
              />
              <Label htmlFor="is_featured">Featured Product</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: !!checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-luxury-gold text-black hover:bg-yellow-400"
            >
              {loading ? 'Saving...' : 'Save Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
