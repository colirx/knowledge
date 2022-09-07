module.exports = {
  base: '/',
  title: '知识库',
  theme: 'vuepress-theme-hope',
  markdown: {
    lineNumbers: true
  },
  themeConfig: {
    blog: {
      sidebarDisplay: 'always',
      autoExcerpt: false
    },
    nav: [
      { text: '首页', link: '/', icon: 'reco-home' },
      { text: '关于', link: '/about', icon: 'reco-faq' },
    ],
    mdEnhance: {
      enableAll: true,
    },
    footer: {
      display: true,
      content: '<a href="https://beian.miit.gov.cn/#/Integrated/index">鲁ICP备20021989号-2</a>',
    },
    repo: 'https://gitlab.com/team401/knowledge'
  },
  plugins: [
    ['flexsearch'], 
    [
      '@vuepress-reco/vuepress-plugin-rss',
      {
        site_url: 'https://causes.cloud',
        copyright: "causes"
      }
    ]
  ],
}
