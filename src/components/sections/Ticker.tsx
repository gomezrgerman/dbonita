import { TICKER_ITEMS } from '@/lib/constants'

export default function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS]

  return (
    <section
      className="py-4 overflow-hidden"
      style={{ backgroundColor: 'var(--color-lemon)' }}
      aria-label="Servicios destacados"
    >
      <div className="relative flex overflow-hidden">
        <div className="animate-ticker flex items-center gap-0" aria-hidden="true">
          {items.map((item, i) => (
            <span
              key={i}
              className="font-sans text-sm font-700 tracking-tight text-black whitespace-nowrap px-8"
              style={{ fontWeight: 700 }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
