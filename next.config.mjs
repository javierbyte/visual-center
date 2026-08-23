/** @type {import('next').NextConfig} */
export default {
  // Fully static bundle published to the gh-pages branch.
  output: 'export',
  // The site is served from this path both on GitHub Pages and through the
  // javier.xyz Vercel rewrite.
  basePath: '/visual-center',
  // Keep the public URL and canonical free of a trailing slash.
  trailingSlash: false,
};
