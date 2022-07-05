This is a React-wrapped ready-to-use **rich text editor** for [Taskworld app](https://github.com/taskworld/tw-frontend).

# Philosophy

This repository has 2 types of packages: editor and plugin.

An **editor** on its own does not have any feature but a feature-specific **plugin** must be imported into the editor to enable such capabilities and UI, for example _ckeditor5-basic-styles/src/bold.js_

This repository is a fork of [the official CKEditor 5](https://github.com/ckeditor/ckeditor5) where icons, shortcut keys and style are **heavily modified** to match Taskworld designs and requirements. This makes it easier for upgrading the core CKEditor version by pulling the latest from the original repository.

See also [CKEditor 5 official documentation](https://ckeditor.com/docs/ckeditor5/latest/)

# Development

The editor bundle can be found at [_packages/ckeditor5-build-taskworld_](packages/ckeditor5-build-taskworld/README.md) directory.

To test a work-in-progress editor, make sure you have [tw-frontend](https://github.com/taskworld/tw-frontend) repository cloned next to this repository then run the below:
```bash
yarn
cd packages/ckeditor5-build-taskworld
yarn test
```

The above commands will rebuild the editor and copy the bundle onto _../tw-frontend/node_modules/@taskworld/ckeditor5_

# Usage

To deploy a new version, simply push a new commit to `taskworld` branch. [GitHub Actions](.github/workflows/publish.yml) will automatically create a new version containing the **Git commit hash** and publish it to GitHub registry.

You can find the latest version at https://github.com/taskworld/ckeditor5/packages/1002564

You can consume the editor by installing `@taskworld/ckeditor5` with `.npmrc` file containing [your access token](https://github.com/settings/tokens).

```
@taskworld:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=...
```
