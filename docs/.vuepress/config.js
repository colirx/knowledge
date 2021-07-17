module.exports = {
  base: '/knowledge/',
  title: '知识库',
  theme: 'reco',
  markdown: {
    lineNumbers: true
  },
  themeConfig: {
    type: 'blog',
    nav: [
      { text: '首页', link: '/', icon: 'reco-home' },
      { text: '关于', link: '/about', icon: 'reco-faq' },
    ],
    subSidebar: 'auto',
    blogConfig: {
      category: {
        location: 2,
        text: '分类'
      },
      tag: {
        location: 3,
        text: '标签'
      }
    },
    lastUpdated: 'Last Updated',
    repo: 'https://gitlab.com/team401/knowledge'
  }
}

