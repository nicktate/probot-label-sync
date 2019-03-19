// Shamelessly based off of https://github.com/containership/probot-settings/blob/master/lib/settings.js
class Repository {
  static syncLabels (github, repo, config) {
    return github.repos.getContents({
      owner: repo.owner,
      repo: repo.repo,
    }).then(res => {
      return new Repository(github, repo, config).syncLabels()
    })
  }

  constructor (github, repo, config) {
    this.github = github
    this.repo = repo
    this.config = config
  }

  syncLabels () {
    return Promise.all(Object.entries(this.config).map(([ section, config ]) => {
      const debug = { repo: this.repo }
      debug[ section ] = config

      const Plugin = Repository.PLUGINS.labels
      return new Plugin(this.github, this.repo, config).sync()
    }))
  }
}

Repository.PLUGINS = {
  labels: require('./labels')
}

module.exports = Repository
