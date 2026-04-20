const ROLE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  driver:            { label: 'Driver',           icon: '🚗', color: '#1B2B4B' },
  guide:             { label: 'Local Guide',       icon: '🧭', color: '#0d9488' },
  fixer:             { label: 'Fixer',             icon: '🔑', color: '#7c3aed' },
  restaurant_contact:{ label: 'Restaurant',        icon: '🍽️', color: '#b45309' },
  other:             { label: 'Contact',           icon: '📞', color: '#6b7280' },
}

interface LocalContact {
  id: string
  name: string
  phone: string
  role: string
  specialty?: string
  intro_note?: string
}

interface Props {
  contacts: LocalContact[]
}

export default function LocalContactsSection({ contacts }: Props) {
  if (!contacts || contacts.length === 0) return null

  return (
    <div className="mt-12">
      <div className="flex items-center gap-5 mb-6">
        <p className="label shrink-0">Who to Call</p>
        <div className="flex-1 border-t border-gray-100" />
        <span className="text-navy shrink-0" style={{ fontSize: '0.85rem' }}>📲</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {contacts.map((contact) => {
          const roleInfo = ROLE_LABELS[contact.role] || ROLE_LABELS.other
          const isPhone = contact.phone?.startsWith('+')
          const whatsappUrl = isPhone
            ? `https://wa.me/${contact.phone.replace(/[\s\-]/g, '')}`
            : null

          return (
            <div
              key={contact.id}
              className="px-5 py-4 rounded-sm"
              style={{
                background: 'rgba(27,43,75,0.03)',
                border: '1px solid rgba(27,43,75,0.09)',
                borderLeft: `3px solid ${roleInfo.color}`,
              }}
            >
              {/* Role pill */}
              <div className="flex items-center gap-2 mb-2">
                <span style={{ fontSize: '0.8rem' }}>{roleInfo.icon}</span>
                <span
                  className="uppercase tracking-widest font-semibold"
                  style={{ fontSize: '0.58rem', letterSpacing: '0.18em', color: roleInfo.color }}
                >
                  {roleInfo.label}
                </span>
              </div>

              {/* Name */}
              <p className="font-serif font-bold text-navy text-sm leading-snug mb-1">
                {contact.name}
              </p>

              {/* Specialty */}
              {contact.specialty && (
                <p className="text-ink-muted mb-2" style={{ fontSize: '0.7rem', lineHeight: '1.5' }}>
                  {contact.specialty}
                </p>
              )}

              {/* Intro note */}
              {contact.intro_note && (
                <p className="text-ink leading-relaxed mb-3" style={{ fontSize: '0.73rem', color: '#555', lineHeight: '1.6' }}>
                  {contact.intro_note}
                </p>
              )}

              {/* Phone + WhatsApp */}
              {contact.phone && (
                <div className="flex items-center gap-2 flex-wrap mt-2">
                  <a
                    href={`tel:${contact.phone.replace(/\s/g, '')}`}
                    className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                    style={{
                      fontSize: '0.68rem',
                      color: '#1B2B4B',
                      background: 'rgba(27,43,75,0.06)',
                      border: '1px solid rgba(27,43,75,0.12)',
                      padding: '3px 9px',
                      borderRadius: '2px',
                      letterSpacing: '0.04em',
                    }}
                  >
                    📞 {contact.phone}
                  </a>
                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                      style={{
                        fontSize: '0.66rem',
                        letterSpacing: '0.08em',
                        color: '#15803d',
                        background: 'rgba(21,128,61,0.07)',
                        border: '1px solid rgba(21,128,61,0.2)',
                        padding: '3px 9px',
                        borderRadius: '2px',
                      }}
                    >
                      WhatsApp →
                    </a>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
