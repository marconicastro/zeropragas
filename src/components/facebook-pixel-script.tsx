// Caminho: src/components/facebook-pixel-script.tsx

import Script from 'next/script';

const FB_PIXEL_ID = '642933108377475';
const CAPI_GATEWAY_URL = 'https://capig.maracujazeropragas.com';

const fbPixelInit = `
  !function(f,b,e,v,n,t,s )
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src='${CAPI_GATEWAY_URL}/fbevents.js';
  s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script');

  fbq('set', 'autoConfig', false, '${FB_PIXEL_ID}');
  fbq('init', '${FB_PIXEL_ID}');
`;

export function FacebookPixelScript() {
  return (
    <Script
      id="fb-pixel-init"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: fbPixelInit }}
    />
  );
}