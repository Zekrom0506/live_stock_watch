import Chart from 'chart.js/auto'
import { useEffect, useRef } from 'react'

interface Props {
  symbol: string
  // recent prices, oldest first
  points: number[]
}

function PriceChart({ symbol, points }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const chartRef = useRef<Chart | null>(null)

  // create the chart once, and destroy it when the component is removed
  useEffect(() => {
    if (!canvasRef.current) return

    const chart = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            data: [],
            borderColor: '#4c8dff',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: { display: false },
          y: {
            ticks: { color: '#8b95a1' },
            grid: { color: '#222c38' },
          },
        },
      },
    })
    chartRef.current = chart

    return () => {
      chart.destroy()
      chartRef.current = null
    }
  }, [])

  // when new prices come in, update the data of the existing chart
  // instead of building a new chart every time
  useEffect(() => {
    const chart = chartRef.current
    if (!chart) return

    chart.data.labels = points.map((_, index) => index)
    chart.data.datasets[0].data = points
    chart.update()
  }, [points])

  return (
    <div className="chart-box">
      <div className="chart-title">
        {symbol} <span className="muted">last {points.length} ticks</span>
      </div>
      <div className="chart-area">
        <canvas ref={canvasRef}></canvas>
      </div>
    </div>
  )
}

export default PriceChart
