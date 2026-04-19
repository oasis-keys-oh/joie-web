export const regionColors: Record<string, string> = {
  'Andalusia': 'bg-orange-100 border-orange-300 text-orange-900',
  'Basque Country': 'bg-red-100 border-red-300 text-red-900',
  'Catalonia': 'bg-yellow-100 border-yellow-300 text-yellow-900',
  'Madrid': 'bg-amber-100 border-amber-300 text-amber-900',
  'Galicia': 'bg-green-100 border-green-300 text-green-900',
  'Castilla': 'bg-yellow-100 border-yellow-300 text-yellow-900',
  'Valencia': 'bg-blue-100 border-blue-300 text-blue-900',
  'Malaga': 'bg-pink-100 border-pink-300 text-pink-900',
  'Barcelona': 'bg-purple-100 border-purple-300 text-purple-900',
}

export const getRegionColor = (region: string): string => {
  return regionColors[region] || 'bg-gray-100 border-gray-300 text-gray-900'
}

export const getRegionAccentColor = (region: string): string => {
  const colorMap: Record<string, string> = {
    'Andalusia': 'from-orange-400 to-orange-600',
    'Basque Country': 'from-red-400 to-red-600',
    'Catalonia': 'from-yellow-400 to-yellow-600',
    'Madrid': 'from-amber-400 to-amber-600',
    'Galicia': 'from-green-400 to-green-600',
    'Castilla': 'from-yellow-400 to-yellow-600',
    'Valencia': 'from-blue-400 to-blue-600',
    'Malaga': 'from-pink-400 to-pink-600',
    'Barcelona': 'from-purple-400 to-purple-600',
  }
  return colorMap[region] || 'from-gray-400 to-gray-600'
}
