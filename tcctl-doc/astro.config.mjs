import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  integrations: [
    starlight({
      title: "tcctl",
      logo: {
        light: "./src/assets/tcctl-cropped.png",
        dark: "./src/assets/tcctl-dark-cropped.png",
        replacesTitle: true,
      },
      favicon: "/tcctl-logo-dark.png",
      social: {
        github: "https://github.com/3DRX/tcctl",
      },
      sidebar: [
        {
          label: "Guides",
          items: [
            { label: "Getting Started", link: "/guides/getting-started/" },
            { label: "Development Setup", link: "/guides/dev-setup/" },
          ],
        },
        {
          label: "Reference",
          autogenerate: { directory: "reference" },
        },
      ],
      customCss: ["./src/styles/custom.css"],
    }),
  ],
});
