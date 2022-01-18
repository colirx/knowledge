module.exports = {
  base: '/knowledge/',
  title: '知识库',
  theme: 'reco',
  markdown: {
    lineNumbers: true
  },
  themeConfig: {
    type: 'blog',
    record: '鲁ICP备20021989号-2',
    recordLink: 'https://beian.miit.gov.cn/#/Integrated/index',
    startYear: '2021',
    nav: [
      { text: '首页', link: '/', icon: 'reco-home' },
      { text: '关于', link: '/about', icon: 'reco-faq' },
    ],
    // subSidebar: 'auto',
    sidebar: 'auto',
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
