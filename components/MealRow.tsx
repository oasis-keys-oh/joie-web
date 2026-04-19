interface MealRowProps {
  breakfast?: string
  lunch?: string
  dinner?: string
}

export default function MealRow({
  breakfast,
  lunch,
  dinner,
}: MealRowProps) {
  return (
    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
      {breakfast && (
        <div className="rounded-lg border-l-4 border-yellow-400 bg-yellow-50 p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">Breakfast</h3>
          <p className="text-yellow-800">{breakfast}</p>
        </div>
      )}
      {lunch && (
        <div className="rounded-lg border-l-4 border-blue-400 bg-blue-50 p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Lunch</h3>
          <p className="text-blue-800">{lunch}</p>
        </div>
      )}
      {dinner && (
        <div className="rounded-lg border-l-4 border-orange-400 bg-orange-50 p-4">
          <h3 className="font-semibold text-orange-900 mb-2">Dinner</h3>
          <p className="text-orange-800">{dinner}</p>
        </div>
      )}
    </div>
  )
}
