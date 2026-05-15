import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Melhores Encontros — Organize seus dates e descubra sua melhor conexão'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#faf6f0',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
          gap: '24px',
        }}
      >
        {/* Polaroids decorativos */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
          {['#fecdd3', '#e9d5ff', '#bae6fd'].map((bg, i) => (
            <div
              key={i}
              style={{
                background: 'white',
                padding: '10px',
                paddingBottom: '32px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                transform: `rotate(${[-6, 1, 5][i]}deg)`,
                display: 'flex',
                flexDirection: 'column',
                width: '120px',
              }}
            >
              <div style={{ width: '100px', height: '100px', background: bg }} />
              <span style={{ fontSize: '14px', color: '#374151', marginTop: '8px', fontFamily: 'serif' }}>
                {['Gabi', 'Luna', 'Felipe'][i]}
              </span>
            </div>
          ))}
        </div>

        {/* Título */}
        <div
          style={{
            fontSize: '72px',
            fontWeight: 'bold',
            color: '#111827',
            textAlign: 'center',
            lineHeight: 1.1,
            fontFamily: 'serif',
          }}
        >
          Melhores Encontros
        </div>

        {/* Subtítulo */}
        <div
          style={{
            fontSize: '28px',
            color: '#6b7280',
            textAlign: 'center',
            maxWidth: '700px',
            lineHeight: 1.4,
          }}
        >
          Organize seus dates e descubra quem tem mais conexão com você.
        </div>

        {/* Badge */}
        <div
          style={{
            background: '#fff1f2',
            color: '#f43f5e',
            fontSize: '20px',
            fontWeight: '600',
            padding: '10px 24px',
            borderRadius: '999px',
            marginTop: '8px',
          }}
        >
          💘 Gratuito · Privado · Simples
        </div>
      </div>
    ),
    { ...size }
  )
}
