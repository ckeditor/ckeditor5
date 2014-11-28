Boilerplate for Git Repositories
================================

A boilerplate file structure to be used by git based projects. It contains most of the files expected to be inside
CKEditor related repositories.

This is for generic purposes, so it can be used by any project out there.

## Documentation Resources

### README.md

All projects must have a README.md file, which replaces this one.

### LICENSE.md

Includes the default license terms used by most of CKEditor projects.

### CONTRIBUTING.md

Describes the standard contribution process adopted by CKEditor projects.

### CHANGES.md

A template for the changelog file.

## Developer Resources

### gruntfile.js

This is the [grunt](http://gruntjs.com/) configuration file. It exposes the following tasks:

 * `grunt default`: Alias for `jshint:git` and `jscs:git` tasks.
 * `grunt githooks`:  Installs a git pre-commit hook to run `grunt default`.
 * `grunt jscs`: JavaScript code style checker with [JSCS](https://github.com/jscs-dev/node-jscs).
 * `grunt jshint`: Validate JavaScript files with [JSHint](https://github.com/jshint/jshint).

The `jscs:git` and `jshint:git` variations run the checks on files that will endup into the next `git commit` only. It's
therefore much faster.

All grunt tasks are available inside the `dev/tasks` directory.

### package.json

The [npm configuration file](https://www.npmjs.org/doc/files/package.json.html), which describes the project and
includes dependencies for node tools used in the project.

###.gitattributes

EOL and content type rules for git.

### .gitignore

The list of paths to be ignored by git. It also sets the list of paths to be ignored by the `jscs:git` and `jshint:git`
grunt tasks.

### .editorconfig

Unified configurations for IDEs. See
[editorconfig.org](http://editorconfig.org/) for more information.

## Using this Repository

This repository can be used as a starting point for new projects or to bring existing projects to a common pattern. It
helps bringing a uniform form among different projects.

The following steps assume that you're located inside your local clone of the target repository.

### 1. Enabling the Boilerplate into a Repository

```bash
git remote add boilerplate https://github.com/ckeditor/ckeditor-boilerplate.git
```

### 2. Injecting the Boilerplate into Your Repository

```bash
git fetch boilerplate
git merge boilerplate/master
```

If files are present in your repo, there may be the chance that the merge will cause conflicts. Generally it is
straightforward to have them resolved.

### 3. Get Boilerplate Updates

Just repeat "2".

## First Steps After Including the Boilerplate

The boilerplate contains generic files, many of them serving as templates for your projects. The following are the
things to do once you incorporate it into your project.

Reviewing files content:

1. **README.md**: replace this file with contents that describe your project.
2. **CONTRIBUTING.md**: ensure that the contents of this file apply to your project.
3. **LICENSE.md**:
   * Replace the software name with your project name.
   * Check if the license option fits your project.
   * Ensure that the whole file content is good for your project.
4. **package.json**: fill all entries accordingly.

Assuming that `npm` and `grunt` are installed globally, run a few commands:

1. `npm install`: download all project dependencies into node_modules.
2. `grunt githooks`: (optional) if you want to have pre-commit linting enabled straight into your project.

## Boilerplate License

Copyright (c) 2014 CKSource - Frederico Knabben

All boilerplate code is licensed under the terms of the [MIT license](http://opensource.org/licenses/MIT).

Although `LICENSE.md` is available in this repository as a template for your project, it doesn't apply for the
boilerplate project itself.
