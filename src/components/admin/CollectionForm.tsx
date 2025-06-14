
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Upload, Image } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  description: string | null;
  is_curated: boolean;
  image_url: string | null;
}

interface CollectionFormProps {
  category?: Category | null;
  onClose: () => void;
  onSave: () => void;
}

const CollectionForm = ({ category, onClose, onSave }: CollectionFormProps) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_curated: false,
    image_url: null as string | null
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        is_curated: category.is_curated || false,
        image_url: category.image_url || null
      });
    } else {
      setFormData({
        name: '',
        description: '',
        is_curated: false,
        image_url: null
      });
    }
  }, [category]);

  const uploadImage = async (file: File) => {
    if (!file) return null;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return null;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return null;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `collection-${Date.now()}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
      .from('products')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload image');
      return null;
    }

    const { data } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      if (imageUrl) {
        setFormData({ ...formData, image_url: imageUrl });
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const removeImage = async () => {
    if (formData.image_url) {
      try {
        const urlParts = formData.image_url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        await supabase.storage
          .from('products')
          .remove([fileName]);
      } catch (error) {
        console.error('Error deleting image from storage:', error);
      }
    }

    setFormData({ ...formData, image_url: null });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const categoryData = {
        name: formData.name,
        description: formData.description || null,
        is_curated: formData.is_curated,
        image_url: formData.image_url
      };

      let error;
      if (category) {
        // Update existing category
        ({ error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', category.id));
      } else {
        // Create new category
        ({ error } = await supabase
          .from('categories')
          .insert([categoryData]));
      }

      if (error) throw error;
      onSave();
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">
            {category ? 'Edit Collection' : 'Add New Collection'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="name">Collection Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Enter collection name"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Enter collection description (optional)"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_curated"
              checked={formData.is_curated}
              onCheckedChange={(checked) => setFormData({ ...formData, is_curated: !!checked })}
            />
            <Label htmlFor="is_curated">Curated Collection</Label>
          </div>

          <div className="space-y-4">
            <Label htmlFor="collection-image">Collection Image</Label>
            
            {/* Upload Button */}
            {!formData.image_url && (
              <div>
                <Input
                  id="collection-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('collection-image')?.click()}
                  disabled={uploading}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Collection Image'}
                </Button>
                <p className="text-xs text-gray-500 mt-1">
                  Accepts: JPG, PNG, GIF. Max size: 5MB
                </p>
              </div>
            )}

            {/* Image Preview */}
            {formData.image_url && (
              <div className="relative group">
                <div className="aspect-video border border-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={formData.image_url}
                    alt="Collection image"
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={removeImage}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            {!formData.image_url && !uploading && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Image className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No image uploaded yet</p>
              </div>
            )}
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
              {loading ? 'Saving...' : 'Save Collection'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CollectionForm;
