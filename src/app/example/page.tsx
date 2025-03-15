import { type Metadata } from "next";
import { siteConfig } from "@/config/site";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Example Page | AI Image Editor",
  description: "An example page demonstrating the use of site configuration",
};

export default function ExamplePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">{siteConfig.name}</h1>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">
          Site Configuration Example
        </h2>
        <p className="mb-4">{siteConfig.description}</p>

        <div className="rounded-lg bg-gray-100 p-4">
          <h3 className="mb-2 font-medium">Site Information</h3>
          <ul className="list-inside list-disc space-y-2">
            <li>Name: {siteConfig.name}</li>
            <li>URL: {siteConfig.url}</li>
            <li>Twitter: {siteConfig.twitterHandle}</li>
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Keywords</h2>
        <div className="flex flex-wrap gap-2">
          {siteConfig.keywords.map((keyword, index) => (
            <span
              key={index}
              className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
            >
              {keyword}
            </span>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Application Details</h2>

        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg bg-gray-100 p-4">
            <h3 className="mb-2 font-medium">Basic Info</h3>
            <ul className="list-inside list-disc space-y-2">
              <li>Category: {siteConfig.application.category}</li>
              <li>
                Operating System: {siteConfig.application.operatingSystem}
              </li>
              <li>
                Price: {siteConfig.application.pricing.value}{" "}
                {siteConfig.application.pricing.currency}
              </li>
              <li>Pricing Model: {siteConfig.application.pricing.model}</li>
            </ul>
          </div>

          <div className="rounded-lg bg-gray-100 p-4">
            <h3 className="mb-2 font-medium">Rating</h3>
            <div className="flex items-center">
              <div className="mr-2 flex items-center">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <svg
                      key={i}
                      className={`h-5 w-5 ${
                        i <
                        Math.floor(Number(siteConfig.application.rating.value))
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
              </div>
              <span className="text-sm font-medium">
                {siteConfig.application.rating.value} (
                {siteConfig.application.rating.count} reviews)
              </span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="mb-2 font-medium">Features</h3>
          <div className="flex flex-wrap gap-2">
            {siteConfig.application.features.map((feature, index) => (
              <span
                key={index}
                className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-2 font-medium">Screenshots</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {siteConfig.application.screenshots.map((screenshot, index) => (
              <div key={index} className="overflow-hidden rounded-lg border">
                <div className="relative h-48 w-full">
                  {/* Note: In a real app, you'd want to use actual images here */}
                  <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500">
                    {screenshot.alt}
                    <br />({screenshot.url})
                  </div>
                </div>
                <div className="p-2 text-sm text-gray-600">
                  {screenshot.alt} ({screenshot.width}x{screenshot.height})
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Links</h2>
        <div className="flex gap-4">
          <a
            href={siteConfig.links.github}
            className="rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-700"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a
            href={siteConfig.links.twitter}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-400"
            target="_blank"
            rel="noopener noreferrer"
          >
            Twitter
          </a>
        </div>
      </section>
    </div>
  );
}
