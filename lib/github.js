const _ = require('lodash')

class Github {
  static async getFilesRecursively (github, repo, path) {
    const files = []

    const content = await github.repos.getContents({
      owner: repo.owner,
      repo: repo.repo,
      path: path
    })

    const self = this.getFilesRecursively.bind(this)
    const data = _.isArray(content.data) ? content.data : [ content.data ]
    for (const c of data) {
      if (c.type === 'dir') {
        files.push(...await self(github, repo, c.path))
      } else if (c.type === 'file' && !_.has(c, 'content')) {
        files.push(...await self(github, repo, c.path))
      } else if (c.type === 'file') {
        files.push({
          path: c.path,
          content: Buffer.from(c.content, c.encoding).toString()
        })
      }
    }

    return files
  }
}

module.exports = Github
