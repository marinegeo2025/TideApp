import React, { useEffect, useRef } from 'react';

type TidePoint = { hour: number; height: number };

type Props = {
  tideData: TidePoint[];
  sunrise: number;
  sunset: number;
  twilightStart: number;
  twilightEnd: number;
  highLowPoints?: { hour: number; height: number; type: 'high' | 'low' }[];
};

const TideChart: React.FC<Props> = ({
  tideData,
  sunrise,
  sunset,
  twilightStart,
  twilightEnd,
  highLowPoints
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const tideHeights = tideData.map(p => p.height);
    const minTide = -3;
    const maxTide = 4;
    if (!ctx) return;
    const width = (canvas.width = 800);
    const height = (canvas.height = 300);

    const now = new Date();
    const nowHour = now.getHours() + now.getMinutes() / 60;
    const toX = (h: number) => (h / 24) * width;
    const toY = (m: number) =>
        height - ((m - minTide) / (maxTide - minTide)) * height;

    const drawBackground = () => {
      const grey = (start: number, end: number, color: string) => {
        ctx.fillStyle = color;
        ctx.fillRect(toX(start), 0, toX(end - start), height);
      };
      grey(0, twilightStart, '#2c2c2c');
      grey(twilightStart, sunrise, '#5c5c5c');
      grey(sunrise, sunset, '#f2f2f2');
      grey(sunset, twilightEnd, '#5c5c5c');
      grey(twilightEnd, 24, '#2c2c2c');
    };

    const drawTideLine = () => {
      ctx.beginPath();
      tideData.forEach((point, i) => {
        const x = toX(point.hour);
        const y = toY(point.height);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = '#0077b6';
      ctx.lineWidth = 3;
      ctx.stroke();
    };

    const drawNowLine = () => {
      const x = toX(nowHour);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.strokeStyle = '#00f';
      ctx.lineWidth = 2;
      ctx.stroke();
    };

const drawHighLowPoints = () => {
  if (!highLowPoints) return;

  highLowPoints.forEach((point) => {
    const x = toX(point.hour);
    const y = toY(point.height);

    // Draw circle marker
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = point.type === 'high' ? '#ff5722' : '#2196f3';
    ctx.fill();

    // Label H or L
    ctx.fillStyle = '#000';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(point.type === 'high' ? 'H' : 'L', x, y - 10);
  });
};

    const drawYAxis = () => {
  ctx.fillStyle = '#000';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'left';

  const steps = maxTide - minTide;
  for (let i = 0; i <= steps; i++) {
    const val = minTide + i;
    const y = toY(val);
    ctx.fillText(`${val}m`, 5, y);
    ctx.beginPath();
    ctx.moveTo(35, y);
    ctx.lineTo(width, y);
    ctx.strokeStyle = '#ddd';
    ctx.stroke();
  }
};
const drawXAxis = () => {
  ctx.fillStyle = '#000';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';

  for (let h = 0; h <= 24; h++) {
    const x = (h / 24) * width;
    const label = h === 0 || h === 24 ? '12' : `${h % 12 || 12}`;
    ctx.fillText(label, x, height - 5);
  }
};

    drawBackground();
    drawYAxis();
    drawXAxis();    
    drawTideLine();
    drawHighLowPoints();
    drawNowLine();
  }, [tideData, sunrise, sunset, twilightStart, twilightEnd, highLowPoints]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', maxWidth: '800px', height: 'auto' }}
    />
  );
};

export default TideChart;
