const _ = require('lodash')

const PREVIEW_HEADER = 'application/vnd.github.machine-man-preview+json'
const REPO_OR_LABEL_DIR_REGEX = /^\/(labels|repositories)/

module.exports = (app, Repository = require('./lib/repository')) => {
  app.on('push', async context => {
    const payload = context.payload
    const defaultBranch = payload.ref === 'refs/heads/' + payload.repository.default_branch

    const labelsOrReposModified = payload.commits.find(commit => {
      return _.some([
        ...commit.added,
        ...commit.modified
      ], c => REPO_OR_LABEL_DIR_REGEX.test(c))
    })

    //console.log(JSON.stringify(payload, null, 2))
    if(true || defaultBranch && labelsOrReposModified) {
      const result = await context.github.repos.getContents({
        owner: context.repo().owner,
        repo: context.repo().repo,
        path: 'README.md',
        headers: {
          accept: PREVIEW_HEADER
        }
      })

      console.log(result)
    }
  })
}
