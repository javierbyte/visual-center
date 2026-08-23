import './globals.css';
import 'jbx/main.css';

import { GoogleAnalytics } from '@next/third-parties/google';

import GitHubCorner from '../components/GitHubCorner.jsx';

const TITLE = 'Visual Center | Find the visual center of your images';
const DESCRIPTION =
  'Find the visual center of your images. Upload your logos and images and find the visual center.';
const CANONICAL = 'https://javier.xyz/visual-center';
const THUMBNAIL =
  'https://javier.xyz/visual-center/javier-xyz-visual-center.jpg';

export const metadata = {
  metadataBase: new URL('https://javier.xyz'),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    images: [
      {
        url: THUMBNAIL,
        width: 1200,
        height: 600,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [THUMBNAIL],
  },
};

export const viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <GitHubCorner />
        <GoogleAnalytics gaId="G-M2FT27FXS2" />
      </body>
    </html>
  );
}
