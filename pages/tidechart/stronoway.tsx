import { useEffect, useState } from 'react';
import { getMarineData, MarineDataPoint, SunTimes } from '../../lib/getMarineData';
import TideChart from '../../components/TideChart';

const STORNOWAY_LAT = 58.215;
const STORNOWAY_LON = -6.387;

export default function StornowayTideChartPage() {
  const [tideData, setTideData] = useState<{ hour: number; height: number }[]>([]);
  const [waveData, setWaveData] = useState<MarineDataPoint[]>([]);
  const [sunTimes, setSunTimes] = useState<SunTimes | null>(null);
  const [location, setLocation] = useState<'stornoway' | 'brue'>('stornoway'); // 🌊 toggle

  useEffect(() => {
    async function fetchData() {
      try {
        const { marineData, sunTimes } = await getMarineData(STORNOWAY_LAT, STORNOWAY_LON);

        const now = new Date();
        const todayStr = now.toDateString();
        const todaysData = marineData.filter(d => d.time.toDateString() === todayStr);

        // Brue offset = -33 minutes = -0.55 hours
        const offset = location === 'brue' ? -0.55 : 0;

        const condensedTide = todaysData.map(d => ({
          hour: d.time.getHours() + d.time.getMinutes() / 60 + offset,
          height: d.tideHeight || 0,
        }));

        setTideData(condensedTide);
        setWaveData(todaysData);
        if (sunTimes) setSunTimes(sunTimes);
      } catch (error) {
        console.error('Failed to fetch marine data:', error);
      }
    }

    fetchData();
  }, [location]);

  if (!tideData.length || !sunTimes) {
    return <p>Loading tide data...</p>;
  }

  return (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
      {location === 'stornoway' ? 'Stornoway' : 'Brue'} Tide & Wave Data
    </h1>

    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <TideChart
        tideData={tideData}
        sunrise={sunTimes.sunrise.getHours() + sunTimes.sunrise.getMinutes() / 60}
        sunset={sunTimes.sunset.getHours() + sunTimes.sunset.getMinutes() / 60}
        twilightStart={sunTimes.sunrise.getHours() - 1}
        twilightEnd={sunTimes.sunset.getHours() + 1}
      />
    </div>

    {/* 🌍 Centered toggle button below the chart */}
    <button
      onClick={() => setLocation(loc => (loc === 'stornoway' ? 'brue' : 'stornoway'))}
      style={{
        marginTop: '1.5rem',
        padding: '0.5rem 1.2rem',
        background: '#0077b6',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        fontSize: '1rem',
        cursor: 'pointer',
      }}
    >
      Switch to {location === 'stornoway' ? 'Brue' : 'Stornoway'}
    </button>

    <pre style={{ whiteSpace: 'pre-wrap', marginTop: '2rem', textAlign: 'left' }}>
      {JSON.stringify(waveData, null, 2)}
    </pre>
  </div>
);

}
