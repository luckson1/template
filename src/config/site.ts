/**
 * Site configuration settings
 *
 * This file contains all the metadata and site-wide configuration settings.
 * Update these values when using this template for your own project.
 */

export const siteConfig = {
  name: "AI Image Editor",
  description:
    "Transform your photos with our powerful AI Image Editor. Advanced photo editing tools powered by artificial intelligence for professional results in seconds.",
  url: "https://your-domain.com",
  ogImage: "/og-image.jpg",
  twitterImage: "/twitter-image.jpg",
  twitterHandle: "@yourtwitterhandle",

  // SEO metadata
  title: {
    default:
      "AI Image Editor | Professional Photo Editing with Artificial Intelligence",
    template: "%s | AI Image Editor",
  },
  keywords: [
    "AI Image Editor",
    "artificial intelligence photo editing",
    "AI photo enhancement",
    "image editing software",
    "photo manipulation AI",
  ],

  // Open Graph
  openGraph: {
    title: "AI Image Editor | Professional Photo Editing with AI",
    description:
      "Transform your photos with our powerful AI Image Editor. Get professional results in seconds with our advanced AI tools.",
    siteName: "AI Image Editor",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AI Image Editor Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "AI Image Editor | Transform Photos with AI",
    description:
      "Professional photo editing powered by artificial intelligence. Transform your images in seconds.",
  },

  // Links
  links: {
    github: "https://github.com/yourusername/your-repo",
    twitter: "https://twitter.com/yourtwitterhandle",
  },

  // Application details
  application: {
    category: "DesignApplication", // Schema.org applicationCategory
    operatingSystem: "Web",
    screenshots: [
      {
        url: "/screenshots/editor.jpg",
        alt: "AI Image Editor Interface",
        width: 1920,
        height: 1080,
      },
      {
        url: "/screenshots/mobile.jpg",
        alt: "AI Image Editor on Mobile",
        width: 390,
        height: 844,
      },
    ],
    pricing: {
      currency: "USD",
      value: "0", // "0" for free, or the price as a string
      model: "freemium", // "free", "freemium", "subscription", "one-time"
    },
    features: [
      "AI enhancement",
      "Background removal",
      "Object detection",
      "Color correction",
      "Smart filters",
      "Automatic retouching",
      "Portrait enhancement",
    ],
    rating: {
      value: "4.8",
      count: "1024",
      // Only include if you have actual ratings
    },
  },
};

// Helper functions
export const createMetadata = {
  /**
   * Creates a formatted page title
   * @param title Page-specific title
   * @returns Formatted title with site name
   */
  title: (title?: string): string => {
    if (!title) return siteConfig.title.default;
    return siteConfig.title.template.replace("%s", title);
  },
};

// Type definitions for the site configuration
export type SiteConfig = typeof siteConfig;
