
import { useState, useEffect } from "react";
import { Outlet, Navigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X
} from "lucide-react";

const AdminLayout = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user role
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          setUserRole(profile?.role || null);
        } else {
          setUserRole(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            setUserRole(profile?.role || null);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-luxury-gold mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated or not admin/manager
  if (!user || !userRole || !['admin', 'manager'].includes(userRole)) {
    return <Navigate to="/login" replace />;
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar - Improved mobile responsiveness */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-black transform transition-transform duration-300 ease-in-out z-50 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo - Responsive text */}
          <div className="flex items-center justify-between h-16 px-4 lg:px-6 bg-luxury-gold">
            <h1 className="text-lg lg:text-xl font-bold text-black truncate">LuxuriqWear Admin</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-black hover:text-gray-700 p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation - Better mobile spacing */}
          <nav className="flex-1 px-3 lg:px-4 py-4 lg:py-6 space-y-1 lg:space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 lg:px-4 py-2 lg:py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-luxury-gold text-black'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-2 lg:mr-3 h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info and logout - Responsive layout */}
          <div className="p-3 lg:p-4 border-t border-gray-800">
            <div className="flex items-center mb-3 lg:mb-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs lg:text-sm font-medium text-white truncate">{user.email}</p>
                <p className="text-xs text-gray-400 capitalize">{userRole}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="w-full text-white border-gray-600 hover:bg-gray-800 text-xs lg:text-sm"
            >
              <LogOut className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar - Enhanced mobile responsiveness */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-30">
          <div className="flex items-center justify-between h-14 lg:h-16 px-4 lg:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900 p-2 -ml-2"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex-1 lg:hidden"></div>
            <h2 className="text-base lg:text-lg font-semibold text-gray-900 truncate">
              {navigation.find(item => item.href === location.pathname)?.name || 'Admin Panel'}
            </h2>
          </div>
        </div>

        {/* Page content - Improved mobile padding */}
        <main className="p-4 lg:p-6 pb-20 lg:pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
