const Labels = require('./labels')

// Shamelessly based off of https://github.com/containership/probot-settings/blob/master/lib/settings.js
class Repository {
  static async syncLabels (github, repo, labels) {
    return new Labels(github, repo, labels).sync()
  }

  constructor (github, repo, labels) {
    this.github = github
    this.repo = repo
    this.labels = labels
  }

  syncLabels () {
    return new Labels(this.github, this.repo, this.labels).sync()
  }
}

module.exports = Repository
