
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Settings, Store, CreditCard, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DEFAULT_SYSTEM_SETTINGS = {
  email_notifications: {
    order: true,
    low_stock: true,
    daily_reports: false,
  },
  security: {
    "2fa": true,
    login_notifications: true,
  },
};

// Type for enforced settings
type SystemSettingsType = typeof DEFAULT_SYSTEM_SETTINGS;

// Utility type guard to validate the correct shape
function isSystemSettings(obj: any): obj is SystemSettingsType {
  if (
    typeof obj === "object" &&
    obj !== null &&
    "email_notifications" in obj &&
    "security" in obj &&
    typeof obj.email_notifications === "object" &&
    obj.email_notifications !== null &&
    typeof obj.email_notifications.order === "boolean" &&
    typeof obj.email_notifications.low_stock === "boolean" &&
    typeof obj.email_notifications.daily_reports === "boolean" &&
    typeof obj.security === "object" &&
    obj.security !== null &&
    typeof obj.security["2fa"] === "boolean" &&
    typeof obj.security.login_notifications === "boolean"
  ) {
    return true;
  }
  return false;
}

const AdminSettings = () => {
  const [storeSettings, setStoreSettings] = useState({
    storeName: "",
    storeDescription: "",
    storeEmail: "",
    storePhone: "",
    currency: "",
    taxRate: ""
  });

  const [shippingSettings, setShippingSettings] = useState({
    freeShippingThreshold: "",
    standardShippingRate: "",
    expressShippingRate: ""
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettingsType>(DEFAULT_SYSTEM_SETTINGS);
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
          storeName: data.store_name || "",
          storeDescription: data.store_description || "",
          storeEmail: data.store_email || "",
          storePhone: data.store_phone || "",
          currency: data.currency || "",
          taxRate: data.tax_rate !== null && data.tax_rate !== undefined ? String(data.tax_rate) : ""
        });
        setShippingSettings({
          freeShippingThreshold: data.free_shipping_threshold !== null && data.free_shipping_threshold !== undefined ? String(data.free_shipping_threshold) : "",
          standardShippingRate: data.standard_shipping_rate !== null && data.standard_shipping_rate !== undefined ? String(data.standard_shipping_rate) : "",
          expressShippingRate: data.express_shipping_rate !== null && data.express_shipping_rate !== undefined ? String(data.express_shipping_rate) : ""
        });
        if (isSystemSettings(data.system_settings)) {
          setSystemSettings(data.system_settings);
        } else {
          setSystemSettings(DEFAULT_SYSTEM_SETTINGS);
        }
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  // Handle toggling notification/security settings
  const handleSysCheckbox = (section: string, field: string, value: boolean) => {
    setSystemSettings((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const upsertSettings = async (newSystemSettingsOverride?: any) => {
    // Map to database column format
    const payload = {
      store_name: storeSettings.storeName,
      store_description: storeSettings.storeDescription,
      store_email: storeSettings.storeEmail,
      store_phone: storeSettings.storePhone,
      currency: storeSettings.currency,
      tax_rate: storeSettings.taxRate !== "" ? parseFloat(storeSettings.taxRate) : null,
      free_shipping_threshold: shippingSettings.freeShippingThreshold !== "" ? parseFloat(shippingSettings.freeShippingThreshold) : null,
      standard_shipping_rate: shippingSettings.standardShippingRate !== "" ? parseFloat(shippingSettings.standardShippingRate) : null,
      express_shipping_rate: shippingSettings.expressShippingRate !== "" ? parseFloat(shippingSettings.expressShippingRate) : null,
      system_settings: newSystemSettingsOverride ?? systemSettings,
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

  const handleSaveStoreSettings = async () => {
    await upsertSettings();
  };

  const handleSaveFinancialSettings = async () => {
    await upsertSettings();
  };

  const handleSaveShippingSettings = async () => {
    await upsertSettings();
  };

  const handleSaveSystemSettings = async () => {
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
        {/* Store Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Store className="mr-2 h-5 w-5" />
              Store Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="storeName">Store Name</Label>
              <Input
                id="storeName"
                value={storeSettings.storeName}
                onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="storeDescription">Store Description</Label>
              <Textarea
                id="storeDescription"
                value={storeSettings.storeDescription}
                onChange={(e) => setStoreSettings({ ...storeSettings, storeDescription: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="storeEmail">Store Email</Label>
              <Input
                id="storeEmail"
                type="email"
                value={storeSettings.storeEmail}
                onChange={(e) => setStoreSettings({ ...storeSettings, storeEmail: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="storePhone">Store Phone</Label>
              <Input
                id="storePhone"
                value={storeSettings.storePhone}
                onChange={(e) => setStoreSettings({ ...storeSettings, storePhone: e.target.value })}
              />
            </div>
            <Button onClick={handleSaveStoreSettings} className="w-full bg-luxury-gold text-black hover:bg-yellow-400">
              Save Store Settings
            </Button>
          </CardContent>
        </Card>

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

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              System Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium">Email Notifications</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox"
                    checked={!!systemSettings.email_notifications?.order}
                    onChange={(e) => handleSysCheckbox("email_notifications", "order", e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">New order notifications</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox"
                    checked={!!systemSettings.email_notifications?.low_stock}
                    onChange={(e) => handleSysCheckbox("email_notifications", "low_stock", e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Low stock alerts</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox"
                    checked={!!systemSettings.email_notifications?.daily_reports}
                    onChange={(e) => handleSysCheckbox("email_notifications", "daily_reports", e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Daily sales reports</span>
                </label>
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-medium">Security</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox"
                    checked={!!systemSettings.security?.["2fa"]}
                    onChange={(e) => handleSysCheckbox("security", "2fa", e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Two-factor authentication</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox"
                    checked={!!systemSettings.security?.login_notifications}
                    onChange={(e) => handleSysCheckbox("security", "login_notifications", e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Login notifications</span>
                </label>
              </div>
            </div>
            <Button onClick={handleSaveSystemSettings} className="w-full bg-luxury-gold text-black hover:bg-yellow-400">
              Save System Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;

