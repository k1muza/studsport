import { ImageResponse } from 'next/og';

export const alt = 'StudSport commercial vehicle wheel stud identification';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#121416', color: '#f1f1ef', padding: '72px' }}>
      <div style={{ display: 'flex', color: '#d77a43', fontSize: 28, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Harare · Zimbabwe</div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', fontSize: 92, fontWeight: 800, letterSpacing: '-0.05em' }}>StudSport</div>
        <div style={{ display: 'flex', fontSize: 44, color: '#a2a8ae' }}>Wheel studs, hub bolts &amp; nuts</div>
      </div>
      <div style={{ display: 'flex', fontSize: 26, color: '#d7d9db' }}>Identify by vehicle and dimensions · Enquire before ordering</div>
    </div>,
    size,
  );
}
