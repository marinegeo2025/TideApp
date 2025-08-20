// File: pages/test-tide.tsx

import { useEffect, useState } from 'react';
import { getMarineData, MarineDataPoint, SunTimes } from '../lib/getMarineData';

export default function TestTide() {
  const [data, setData] = useState<MarineDataPoint[] | null>(null);
  const [sun, setSun] = useState<SunTimes | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { marineData, sunTimes } = await getMarineData(58.215, -6.387);
        console.log('Marine Data:', marineData);
        console.log('Sun Times:', sunTimes);
        setData(marineData);
        setSun(sunTimes);
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err.message || 'Unknown error');
      }
    }

    fetchData();
  }, []);

  if (error) return <p>Error: {error}</p>;
  if (!data) return <p>Loading tide data...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Test Marine Data</h1>
      <h2>Sun Times</h2>
      <pre style={{ fontSize: '14px', marginBottom: '1rem' }}>
        {JSON.stringify(sun, null, 2)}
      </pre>
      <h2>Marine Data Points</h2>
      <pre style={{ fontSize: '12px' }}>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
