const _ = require('lodash')
const yaml = require('js-yaml')

const Github = require('./lib/github')

const SETTINGS_DIR_REGEX = /^(settings)\//

const buildLabelArray = (files) => {
  const labels = _.map(files, f => {
    return f ? yaml.safeLoad(f.content).labels : []
  })

  return _.flatten(labels)
}

module.exports = (app, Repository = require('./lib/repository')) => {
  app.on('push', async context => {
    const payload = context.payload
    const defaultBranch = payload.ref === 'refs/heads/' + payload.repository.default_branch

    const labelsOrReposModified = payload.commits.find(commit => {
      return _.some([
        ...commit.added,
        ...commit.modified
      ], c => SETTINGS_DIR_REGEX.test(c))
    })

    if (defaultBranch && labelsOrReposModified) {
      const labels = _.keyBy(await Github.getFilesRecursively(context.github, context.repo(), 'settings/labels'), 'path')

      const repoFile = await context.github.repos.getContents({
        owner: context.repo().owner,
        repo: context.repo().repo,
        path: 'settings/repositories.yaml'
      })

      const repositories = yaml.safeLoad(Buffer.from(repoFile.content, repoFile.encoding).toString('utf8'))

      for (const o of repositories.owners) {
        const owner = o.name

        for (const r of o.repositories) {
          const repo = r.name

          const labelPaths = _.map(r.labelGroups, l => `settings/labels/${l}`)
          const repoLabels = buildLabelArray(_.values(_.pick(labels, labelPaths)))

          console.info(`Syncing labels for ${owner}/${repo}...`)
          await Repository.syncLabels(context.github, { owner, repo }, repoLabels)
        }
      }
    } else {
      console.info('No repositories or labels were modified in latest push...')
    }
  })
}
