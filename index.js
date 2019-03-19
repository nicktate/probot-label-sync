const _ = require('lodash')
const yaml = require('js-yaml')

const Github = require('./lib/github')

const REPO_OR_LABEL_DIR_REGEX = /^\/(labels|repositories)/

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
      ], c => REPO_OR_LABEL_DIR_REGEX.test(c))
    })

    if (defaultBranch && labelsOrReposModified) {
      const labels = _.keyBy(await Github.getFilesRecursively(context.github, context.repo(), 'labels'), 'path')
      const repos = await Github.getFilesRecursively(context.github, context.repo(), 'repositories')

      for (const r of repos) {
        // formatted /repositories/containership/example
        // eslint-disable-next-line no-unused-vars
        let [_ignore, org, name] = r.path.split('/')
        // strip file extension
        name = name.substring(0, name.indexOf('.yaml'))

        const labelPaths = _.map(yaml.safeLoad(r.content).labelGroups, l => `labels/${l}`)
        const repoLabels = buildLabelArray(_.values(_.pick(labels, labelPaths)))

        console.log(`Syncing labels for ${org}/${name}...`)
        await Repository.syncLabels(context.github, { owner: org, repo: name }, repoLabels)
      }
    }
  })
}
