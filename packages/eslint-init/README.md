# `@mxy-cli/eslint-init`

## description

init eslint config in the current project.

## Usage

```
const eslintModule = require('@mxy-cli/eslint-init');
// return package.json fragment, then this fragment will be merged to the last package.json
const pkgFragment = eslintModule.init({eslint: true});
```
