# `@mxy-cli/husky-init`

## description

init husky config in the current project.

## Usage

```
const huskyModule = require('@mxy-cli/husky-init');
// return package.json fragment, then this fragment will be merged to the last package.json
const pkgFragment = await huskyModule.init({husky: true});
```
