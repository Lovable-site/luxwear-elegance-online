
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Settings, Store, CreditCard, Truck } from "lucide-react";

const AdminSettings = () => {
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'LuxuriqWear',
    storeDescription: 'Premium luxury fashion for the discerning customer',
    storeEmail: 'admin@luxuriqwear.com',
    storePhone: '+1 (555) 123-4567',
    currency: 'USD',
    taxRate: '8.5'
  });

  const [shippingSettings, setShippingSettings] = useState({
    freeShippingThreshold: '100',
    standardShippingRate: '9.99',
    expressShippingRate: '19.99'
  });

  const handleSaveStoreSettings = () => {
    console.log('Saving store settings:', storeSettings);
    // Here you would save to your backend
  };

  const handleSaveShippingSettings = () => {
    console.log('Saving shipping settings:', shippingSettings);
    // Here you would save to your backend
  };

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

            <Button onClick={handleSaveStoreSettings} className="w-full bg-luxury-gold text-black hover:bg-yellow-400">
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
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">New order notifications</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Low stock alerts</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Daily sales reports</span>
                </label>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium">Security</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Two-factor authentication</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Login notifications</span>
                </label>
              </div>
            </div>

            <Button className="w-full bg-luxury-gold text-black hover:bg-yellow-400">
              Save System Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
