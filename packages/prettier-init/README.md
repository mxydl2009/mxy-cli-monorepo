# `@mxy-cli/prettier-init`

## description

init prettier config in the current project.

## Usage

```
const prettierModule = require('@mxy-cli/prettier-init');
// return package.json fragment, then this fragment will be merged to the last package.json
const pkgFragment = prettierModule.init({prettier: true});
```
