import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  integrations: [
    starlight({
      title: "tcctl",
      social: {
        github: "https://github.com/3DRX/tcctl",
      },
      sidebar: [
        {
          label: "Guides",
          items: [{ label: "Example Guide", link: "/guides/getting-started/" }],
        },
        {
          label: "Reference",
          autogenerate: { directory: "reference" },
        },
      ],
    }),
  ],
});
