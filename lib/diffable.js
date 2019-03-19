// Shamelessly based off of https://github.com/containership/probot-settings/blob/master/lib/plugins/diffable.js
module.exports = class Diffable {
  constructor (github, repo, entries) {
    this.github = github
    this.repo = repo
    this.entries = entries
  }

  async sync () {
    if (this.entries) {
      const existingRecords = await this.find()
      const changes = []

      for (const attrs of this.entries) {
        const existing = existingRecords.find(record => {
          return this.comparator(record, attrs)
        })

        if (!existing) {
          changes.push(await this.add(attrs))
        } else if (this.changed(existing, attrs)) {
          changes.push(await this.update(existing, attrs))
        }
      }

      for (const x of existingRecords) {
        if (!this.entries.find(y => this.comparator(x, y))) {
          changes.push(await this.remove(x))
        }
      }

      return Promise.all(changes)
    }
  }
}
