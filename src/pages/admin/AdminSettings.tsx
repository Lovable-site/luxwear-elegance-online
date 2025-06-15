
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminSettings = () => {
  const [storeSettings, setStoreSettings] = useState({
    currency: "",
    taxRate: ""
  });

  const [shippingSettings, setShippingSettings] = useState({
    freeShippingThreshold: "",
    standardShippingRate: "",
    expressShippingRate: ""
  });

  const [loading, setLoading] = useState(true);

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (error) {
        toast.error("Failed to load settings");
        setLoading(false);
        return;
      }
      if (data) {
        setStoreSettings({
          currency: data.currency || "",
          taxRate: data.tax_rate !== null && data.tax_rate !== undefined ? String(data.tax_rate) : ""
        });
        setShippingSettings({
          freeShippingThreshold: data.free_shipping_threshold !== null && data.free_shipping_threshold !== undefined ? String(data.free_shipping_threshold) : "",
          standardShippingRate: data.standard_shipping_rate !== null && data.standard_shipping_rate !== undefined ? String(data.standard_shipping_rate) : "",
          expressShippingRate: data.express_shipping_rate !== null && data.express_shipping_rate !== undefined ? String(data.express_shipping_rate) : ""
        });
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const upsertSettings = async () => {
    // Map to database column format
    const payload = {
      currency: storeSettings.currency,
      tax_rate: storeSettings.taxRate !== "" ? parseFloat(storeSettings.taxRate) : null,
      free_shipping_threshold: shippingSettings.freeShippingThreshold !== "" ? parseFloat(shippingSettings.freeShippingThreshold) : null,
      standard_shipping_rate: shippingSettings.standardShippingRate !== "" ? parseFloat(shippingSettings.standardShippingRate) : null,
      express_shipping_rate: shippingSettings.expressShippingRate !== "" ? parseFloat(shippingSettings.expressShippingRate) : null,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('store_settings')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      toast.error("Failed to save settings.");
      return false;
    }
    toast.success("Settings saved!");
    return true;
  };

  const handleSaveFinancialSettings = async () => {
    await upsertSettings();
  };

  const handleSaveShippingSettings = async () => {
    await upsertSettings();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-luxury-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your store configuration and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              Financial Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={storeSettings.currency}
                onChange={(e) => setStoreSettings({ ...storeSettings, currency: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                step="0.1"
                value={storeSettings.taxRate}
                onChange={(e) => setStoreSettings({ ...storeSettings, taxRate: e.target.value })}
              />
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-medium">Payment Methods</h4>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Credit Cards: Enabled</p>
                <p className="text-sm text-gray-600">PayPal: Enabled</p>
                <p className="text-sm text-gray-600">Apple Pay: Enabled</p>
              </div>
            </div>
            <Button onClick={handleSaveFinancialSettings} className="w-full bg-luxury-gold text-black hover:bg-yellow-400">
              Save Financial Settings
            </Button>
          </CardContent>
        </Card>

        {/* Shipping Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Truck className="mr-2 h-5 w-5" />
              Shipping Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="freeShippingThreshold">Free Shipping Threshold ($)</Label>
              <Input
                id="freeShippingThreshold"
                type="number"
                value={shippingSettings.freeShippingThreshold}
                onChange={(e) => setShippingSettings({ ...shippingSettings, freeShippingThreshold: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="standardShippingRate">Standard Shipping Rate ($)</Label>
              <Input
                id="standardShippingRate"
                type="number"
                step="0.01"
                value={shippingSettings.standardShippingRate}
                onChange={(e) => setShippingSettings({ ...shippingSettings, standardShippingRate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="expressShippingRate">Express Shipping Rate ($)</Label>
              <Input
                id="expressShippingRate"
                type="number"
                step="0.01"
                value={shippingSettings.expressShippingRate}
                onChange={(e) => setShippingSettings({ ...shippingSettings, expressShippingRate: e.target.value })}
              />
            </div>
            <Button onClick={handleSaveShippingSettings} className="w-full bg-luxury-gold text-black hover:bg-yellow-400">
              Save Shipping Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
