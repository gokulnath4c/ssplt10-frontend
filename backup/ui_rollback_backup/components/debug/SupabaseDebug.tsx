import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const SupabaseDebug = () => {
  const [tables, setTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoading(true);
        
        // Test connection by fetching registration table
        const { data, error: registrationError } = await supabase
          .from('player_registrations')
          .select('*')
          .limit(1);

        if (registrationError) {
          setError(`Error fetching player_registration: ${registrationError.message}`);
          console.error('Registration Error:', registrationError);
          return;
        }

        console.log('Sample registration data:', data);
        
        setTables(['player_registration']);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        console.error('Debug Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-2">Supabase Debug Info</h3>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <div className="text-red-600">
          <p>Error: {error}</p>
        </div>
      ) : (
        <div>
          <p>Connection Status: ✅ Connected</p>
          <p>Available Tables: {tables.join(', ')}</p>
        </div>
      )}
    </div>
  );
};
