import hope from "vuepress-theme-hope";

export default hope.config({
  title: "知识库",
  description: "群策群力",
  dest: "./dist",
  locales: {
    "/": {
      title: "知识库",
      description: "群策群力",
    }
  },
  themeConfig: {
    logo: "/logo.svg",
    hostname: "https://gitlab.com/team401/knowledge",

    author: "causes",
    repo: "https://gitlab.com/team401/knowledge",

    nav: [
      { text: '首页', link: '/', icon: 'reco-home' },
      { text: '关于', link: '/about/', icon: 'reco-faq' },
    ],
    blog: {
      intro: "/intro/",
      sidebarDisplay: "mobile",
    },
    footer: {
      display: false,
      content: '<a href="https://beian.miit.gov.cn/#/Integrated/index">鲁ICP备20021989号-2</a>',
    },

    comment: {
      type: "waline",
      serverURL: "https://waline-pwyhf4ldl-whza.vercel.app/",
    },

    copyright: {
      status: "global",
    },

    cleanUrl: false,

    git: {
      timezone: "Asia/Shanghai",
    },

    mdEnhance: {
      enableAll: true,
      presentation: {
        plugins: [
          "highlight",
          "math",
          "search",
          "notes",
          "zoom",
          "anything",
          "audio",
          "chalkboard",
        ],
      },
    },

    pwa: {
      favicon: "/favicon.ico",
      cachePic: true,
      apple: {
        icon: "/assets/icon/apple-icon-152.png",
        statusBarColor: "black",
      },
      msTile: {
        image: "/assets/icon/ms-icon-144.png",
        color: "#ffffff",
      },
      manifest: {
        icons: [
          {
            src: "/assets/icon/chrome-mask-512.png",
            sizes: "512x512",
            purpose: "maskable",
            type: "image/png",
          },
          {
            src: "/assets/icon/chrome-mask-192.png",
            sizes: "192x192",
            purpose: "maskable",
            type: "image/png",
          },
          {
            src: "/assets/icon/chrome-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/assets/icon/chrome-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
        shortcuts: [
          {
            name: "Guide",
            short_name: "Guide",
            url: "/guide/",
            icons: [
              {
                src: "/assets/icon/guide-maskable.png",
                sizes: "192x192",
                purpose: "maskable",
                type: "image/png",
              },
              {
                src: "/assets/icon/guide-monochrome.png",
                sizes: "192x192",
                purpose: "monochrome",
                type: "image/png",
              },
            ],
          },
        ],
      },
    },
  },
});
