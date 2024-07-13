# `@mxy-cli/commitizen-init`

## description

init commitizen config in the current project.

## Usage

```
const commitizenModule = require('@mxy-cli/commitizen-init');
// return package.json fragment, then this fragment will be merged to the last package.json
const pkgFragment = commitizenModule.init({commitizen: true});
```
