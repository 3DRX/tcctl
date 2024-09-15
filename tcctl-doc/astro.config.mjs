import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://tcctl.3drx.top/",
  integrations: [
    starlight({
      title: "tcctl",
      defaultLocale: "en",
      locales: {
        en: {
          label: "English",
        },
        "zh-cn": {
          label: "简体中文",
          lang: "zh-CN",
        },
      },
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
          translations: {
            "zh-CN": "指南",
          },
          items: [
            {
              label: "Getting Started",
              translations: {
                "zh-CN": "快速开始",
              },
              link: "/guides/getting-started/",
            },
            {
              label: "Hardware Setup",
              translations: {
                "zh-CN": "硬件配置",
              },
              link: "/guides/hardware-setup/",
            },
            {
              label: "Development Setup",
              translations: {
                "zh-CN": "开发配置",
              },
              link: "/guides/dev-setup/",
            },
          ],
        },
        {
          label: "Reference",
          translations: {
            "zh-CN": "说明",
          },
          autogenerate: { directory: "reference" },
        },
      ],
      customCss: ["./src/styles/custom.css"],
      components: {
        Head: "./src/components/Head.astro",
      },
    }),
  ],
});
