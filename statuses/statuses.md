# Pull request validations

### Invalid version
The pull request does not have an updated version in the `package.json`.

You can resolve this by running either `npm version patch` for non breaking changes, or `npm version minor` when you have breaking changes.