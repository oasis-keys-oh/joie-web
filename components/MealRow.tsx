interface MealRowProps {
  breakfast?: string
  lunch?: string
  dinner?: string
}

const meals = [
  {
    key: 'breakfast' as const,
    label: 'Breakfast',
    icon: '☀',
    accent: 'rgba(245,158,11,0.7)',
    bg: 'rgba(245,158,11,0.04)',
    border: 'rgba(245,158,11,0.15)',
  },
  {
    key: 'lunch' as const,
    label: 'Lunch',
    icon: '◑',
    accent: 'rgba(59,130,246,0.7)',
    bg: 'rgba(59,130,246,0.04)',
    border: 'rgba(59,130,246,0.12)',
  },
  {
    key: 'dinner' as const,
    label: 'Dinner',
    icon: '☽',
    accent: 'rgba(124,58,237,0.6)',
    bg: 'rgba(124,58,237,0.04)',
    border: 'rgba(124,58,237,0.12)',
  },
]

export default function MealRow({ breakfast, lunch, dinner }: MealRowProps) {
  const values = { breakfast, lunch, dinner }
  const activeMeals = meals.filter((m) => values[m.key])

  if (activeMeals.length === 0) return null

  return (
    <div className={`grid gap-4 ${activeMeals.length === 3 ? 'sm:grid-cols-3' : activeMeals.length === 2 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
      {activeMeals.map((meal) => (
        <div
          key={meal.key}
          className="rounded-sm px-6 py-5"
          style={{ background: meal.bg, border: `1px solid ${meal.border}` }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span style={{ color: meal.accent, fontSize: '0.9rem' }}>{meal.icon}</span>
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ letterSpacing: '0.18em', color: meal.accent }}
            >
              {meal.label}
            </p>
          </div>
          <p
            className="text-sm leading-relaxed"
            style={{ color: '#3d3d3d', lineHeight: '1.65' }}
          >
            {values[meal.key]}
          </p>
        </div>
      ))}
    </div>
  )
}
