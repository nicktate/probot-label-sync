// Shamelessly based off of https://github.com/containership/probot-settings/blob/master/lib/plugins/labels.js
const Diffable = require('./diffable')
const previewHeaders = { accept: 'application/vnd.github.symmetra-preview+json' }

module.exports = class Labels extends Diffable {
  constructor (...args) {
    super(...args)

    if (this.entries) {
      this.entries.forEach(label => {
        // Force color to string since some hex colors can be numerical (e.g. 999999)
        if (label.color) {
          label.color = String(label.color)
          if (label.color.length < 6) {
            label.color.padStart(6, '0')
          }
        }
      })
    }
  }

  async find () {
    const res = await this.github.issues.listLabelsForRepo(this.wrapAttrs({}))

    return res.data
  }

  comparator (existing, attrs) {
    return existing.name === attrs.name || existing.name === attrs.current_name
  }

  changed (existing, attrs) {
    return attrs.current_name === existing.name || existing.color !== attrs.color || existing.description !== attrs.description
  }

  async update (existing, attrs) {
    attrs.current_name = attrs.current_name || attrs.name
    const res = await this.github.issues.updateLabel(this.wrapAttrs(attrs))
    return res
  }

  async add (attrs) {
    const res = await this.github.issues.createLabel(this.wrapAttrs(attrs))
    return res
  }

  async remove (existing) {
    const res = await this.github.issues.deleteLabel(this.wrapAttrs({ name: existing.name }))
    return res
  }

  wrapAttrs (attrs) {
    return Object.assign({}, attrs, this.repo, { headers: previewHeaders, per_page: 100 })
  }
}
