
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Database, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const SystemStatus = () => {
  const [dbStatus, setDbStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const { user, userRole } = useAuth();

  useEffect(() => {
    // Check database connection
    const checkDbConnection = async () => {
      try {
        const { error } = await supabase.from('profiles').select('id').limit(1);
        setDbStatus(error ? 'disconnected' : 'connected');
      } catch {
        setDbStatus('disconnected');
      }
    };

    // Check realtime connection
    const channel = supabase.channel('status-check');
    
    channel.subscribe((status) => {
      setRealtimeStatus(status === 'SUBSCRIBED' ? 'connected' : 'disconnected');
    });

    checkDbConnection();
    const interval = setInterval(checkDbConnection, 30000); // Check every 30 seconds

    return () => {
      clearInterval(interval);
      channel.unsubscribe();
    };
  }, []);

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg p-3 border">
      <div className="flex items-center space-x-3 text-sm">
        <div className="flex items-center space-x-1">
          <Database className="h-4 w-4" />
          <Badge variant={dbStatus === 'connected' ? 'default' : 'destructive'}>
            DB: {dbStatus}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-1">
          {realtimeStatus === 'connected' ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
          <Badge variant={realtimeStatus === 'connected' ? 'default' : 'destructive'}>
            RT: {realtimeStatus}
          </Badge>
        </div>

        <div className="flex items-center space-x-1">
          <Users className="h-4 w-4" />
          <Badge variant="outline">
            {userRole === 'admin' ? 'Admin' : 'Client'}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;
