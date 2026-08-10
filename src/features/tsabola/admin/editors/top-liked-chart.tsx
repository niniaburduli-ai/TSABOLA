'use client'

type Wine = { wineId: string; name: string; count: number }

type Props = {
  wines: Wine[]
}

type Slice = { key: string; name: string; count: number; stroke: string; dot: string }

const SLICE_CLASSES = [
  { stroke: 'stroke-chart-wine-1', dot: 'bg-chart-wine-1' },
  { stroke: 'stroke-chart-wine-2', dot: 'bg-chart-wine-2' },
  { stroke: 'stroke-chart-wine-3', dot: 'bg-chart-wine-3' },
  { stroke: 'stroke-chart-wine-4', dot: 'bg-chart-wine-4' },
] as const

const OTHER_CLASSES = { stroke: 'stroke-chart-wine-other', dot: 'bg-chart-wine-other' }

const RADIUS = 40
const STROKE_WIDTH = 14
const SEGMENT_GAP = 3
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

type PositionedSlice = Slice & { offset: number }

function withOffsets(slices: Slice[]): PositionedSlice[] {
  const positioned: PositionedSlice[] = []
  let cumulative = 0
  for (const slice of slices) {
    positioned.push({ ...slice, offset: cumulative })
    cumulative += slice.count
  }
  return positioned
}

function buildSlices(wines: Wine[]): Slice[] {
  const sorted = [...wines].sort((a, b) => b.count - a.count)
  const top = sorted.slice(0, SLICE_CLASSES.length).map((wine, index) => ({
    key: wine.wineId,
    name: wine.name,
    count: wine.count,
    ...SLICE_CLASSES[index],
  }))
  const rest = sorted.slice(SLICE_CLASSES.length)
  if (rest.length === 0) return top
  return [...top, { key: 'other', name: 'სხვა', count: rest.reduce((sum, w) => sum + w.count, 0), ...OTHER_CLASSES }]
}

export function TopLikedChart({ wines }: Props) {
  if (wines.length === 0) return null
  const slices = buildSlices(wines)
  const total = slices.reduce((sum, slice) => sum + slice.count, 0)
  const positioned = withOffsets(slices)

  return (
    <div>
      <p className="text-xs font-medium text-charcoal/50 uppercase tracking-wide mb-3">
        ყველაზე მოწონებული პროდუქტები
      </p>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
        <div className="relative shrink-0">
          <svg viewBox="0 0 100 100" className="size-36 -rotate-90">
            <circle cx="50" cy="50" r={RADIUS} fill="none" strokeWidth={STROKE_WIDTH} className="stroke-border-wine" />
            {positioned.map((slice) => {
              const length = total > 0 ? (slice.count / total) * CIRCUMFERENCE : 0
              const offsetLength = total > 0 ? (slice.offset / total) * CIRCUMFERENCE : 0
              const dash = Math.max(length - SEGMENT_GAP, 0)
              return (
                <circle
                  key={slice.key}
                  cx="50"
                  cy="50"
                  r={RADIUS}
                  fill="none"
                  strokeWidth={STROKE_WIDTH}
                  strokeLinecap="round"
                  strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                  strokeDashoffset={-offsetLength}
                  className={slice.stroke}
                >
                  <title>{`${slice.name}: ${slice.count}`}</title>
                </circle>
              )
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-wine">{total}</span>
            <span className="text-xs text-charcoal/50">სულ მოწონება</span>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2">
          {slices.map((slice) => (
            <div key={slice.key} className="flex items-center gap-2">
              <span className={`size-2.5 shrink-0 rounded-full ${slice.dot}`} />
              <span className="min-w-0 flex-1 truncate text-sm text-charcoal/70">{slice.name}</span>
              <span className="shrink-0 text-sm font-bold text-wine">{slice.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
