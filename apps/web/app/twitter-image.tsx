import { ImageResponse } from 'next/og'

import { siteDefaultDescription, siteName } from '@/lib/site'

export const alt = `${siteName} -- social preview`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function TwitterImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    padding: 72,
                    color: '#f8fafc',
                }}
            >
                <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: '-0.02em' }}>
                    {siteName}
                </div>
                <div
                    style={{
                        fontSize: 28,
                        fontWeight: 400,
                        marginTop: 20,
                        maxWidth: 900,
                        lineHeight: 1.35,
                        opacity: 0.92,
                    }}
                >
                    {siteDefaultDescription}
                </div>
            </div>
        ),
        { ...size },
    )
}
