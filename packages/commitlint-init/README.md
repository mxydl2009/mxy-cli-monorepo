# `@mxy-cli/commitlint-init`

## description

init commitlint config in the current project.

## Usage

```
const commitlintModule = require('@mxy-cli/commitlint-init');
// return package.json fragment, then this fragment will be merged to the last package.json
const pkgFragment = commitlintModule.init({commitlint: true});
```
