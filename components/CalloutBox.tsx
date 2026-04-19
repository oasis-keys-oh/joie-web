interface CalloutBoxProps {
  type: 'wow' | 'thread' | 'one_thing' | 'phrase'
  title?: string
  content: string
}

export default function CalloutBox({
  type,
  title,
  content,
}: CalloutBoxProps) {
  const styles = {
    wow: {
      bg: 'bg-purple-50',
      border: 'border-l-4 border-purple-400',
      title: 'text-purple-900',
      text: 'text-purple-800',
      label: 'text-purple-600',
    },
    thread: {
      bg: 'bg-amber-50',
      border: 'border-l-4 border-amber-400',
      title: 'text-amber-900',
      text: 'text-amber-800',
      label: 'text-amber-600',
    },
    one_thing: {
      bg: 'bg-teal-50',
      border: 'border-l-4 border-teal-400',
      title: 'text-teal-900',
      text: 'text-teal-800',
      label: 'text-teal-600',
    },
    phrase: {
      bg: 'bg-rose-50',
      border: 'border-l-4 border-rose-400',
      title: 'text-rose-900',
      text: 'text-rose-800',
      label: 'text-rose-600',
    },
  }

  const style = styles[type]
  const label = {
    wow: '✨ WOW Moment',
    thread: '🧵 Thread',
    one_thing: '💡 One Thing',
    phrase: '🎭 Phrase',
  }[type]

  return (
    <div className={`mb-6 rounded-lg p-4 ${style.bg} ${style.border}`}>
      <p className={`text-sm font-semibold uppercase tracking-wide ${style.label} mb-2`}>
        {label}
      </p>
      {title && (
        <h3 className={`font-serif text-lg font-bold ${style.title} mb-2`}>
          {title}
        </h3>
      )}
      <p className={`${style.text} leading-relaxed`}>{content}</p>
    </div>
  )
}
