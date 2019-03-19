## Probot app to sync labels outward from a given repostiory
=======

*This is not intended for external use as is, it was explicitly
implemented in an abbreviated fashion to function accordingly to
the internal uses of Containership. It is a decent
starting point if you want to fork it and make a more
generic outward label syncing solution.*

## Usage

Probot application that outwardly syncs label groups from `labels/*.yaml` to repositories configurations defined in `repositories/${owner}/${repo}.yaml` format.

`labels/{type}.yaml` - YAML file containing single key `labels` that is an array of labels of the following format:

```
labels:
  - name: ...,
    description: ...,
    color: ...
```

`repositories/{owner}/{repo}` - YAML file containing single key `labelGroups` that is an array of any named label `type` file in the `/labels` directory. The names *should include* the file extension

```
labelGroups:
  - 'base.yaml'
```

Any modifications to this repo to the `/labels` or `/repositories` directories will trigger a sync of *all labels to all repos* that are defined

> A GitHub App built with [Probot](https://github.com/probot/probot) that A probot app to outwardly sync labels

## Local Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Contributing

If you have suggestions for how probot-label-sync could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## Additional Considerations

It's not amazingly elegant but it gets the job done. Didn't want to spend too much time implementing a solution.
