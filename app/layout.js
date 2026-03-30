export const metadata = {
  title: 'Playlist Spot Dashboard',
  description: 'Daily playlist spot and stream dashboard.',
};

import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
