// Shamelessly based off of https://github.com/containership/probot-settings/blob/master/lib/plugins/diffable.js
module.exports = class Diffable {
  constructor (github, repo, entries) {
    this.github = github
    this.repo = repo
    this.entries = entries
  }

  sync () {
    if (this.entries) {
      return this.find().then(existingRecords => {
        const changes = []

        this.entries.forEach(attrs => {
          const existing = existingRecords.find(record => {
            return this.comparator(record, attrs)
          })

          if (!existing) {
            changes.push(this.add(attrs))
          } else if (this.changed(existing, attrs)) {
            changes.push(this.update(existing, attrs))
          }
        })

        existingRecords.forEach(x => {
          if (!this.entries.find(y => this.comparator(x, y))) {
            changes.push(this.remove(x))
          }
        })

        return Promise.all(changes)
      })
    }
  }
}
