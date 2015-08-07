Boilerplate for Git Repositories
================================

[![devDependency Status](https://david-dm.org/ckeditor/ckeditor-boilerplate/dev-status.svg)](https://david-dm.org/ckeditor/ckeditor-boilerplate#info=devDependencies)

A boilerplate file structure to be used by Git-based projects. It contains most of the files expected to be inside
CKEditor-related repositories.

The boilerplate is generic enough to be used by any project out there.

## Documentation Resources

The following section lists documentation-related files that should be available in the project.

### README.md

All projects must have a `README.md` file which replaces this one.

### LICENSE.md

Includes the default license terms used by most CKEditor projects.

### CONTRIBUTING.md

Describes the standard contribution process adopted for CKEditor projects.

### CHANGES.md

A template for the changelog file.

## Developer Resources

The following section lists developer-targeted files that should be available in the project.

### gruntfile.js

This is the [Grunt](http://gruntjs.com/) configuration file. It exposes the following tasks:

 * `grunt default` &ndash; Alias for `jshint:git` and `jscs:git` tasks.
 * `grunt githooks` &ndash;  Installs a Git pre-commit hook to run `grunt default`.
 * `grunt jscs` &ndash; JavaScript code style checker with [JSCS](https://github.com/jscs-dev/node-jscs).
 * `grunt jshint` &ndash; Validates JavaScript files with [JSHint](https://github.com/jshint/jshint).

The `jscs:git` and `jshint:git` variations run the checks on files that will end up in the next `git commit` only. It's
therefore much faster.

All Grunt tasks are available inside the `dev/tasks` directory.

### package.json

The [npm configuration file](https://www.npmjs.org/doc/files/package.json.html) which describes the project and
includes dependencies for Node tools used in the project.

### .gitattributes

EOL and content type rules for Git.

### .gitignore

The list of paths to be ignored by Git. This file also sets the list of paths to be ignored by the `jscs:git` and `jshint:git`
Grunt tasks.

### .editorconfig

Unified configurations for IDEs. See
[editorconfig.org](http://editorconfig.org/) for more information.

## Using This Repository

This repository can be used as a starting point for new projects or to bring existing projects to a common pattern. It
helps to preserve uniformity across different projects.

The following steps assume that you are located inside your local clone of the target repository.

### 1. Enabling the Boilerplate in a Repository

```bash
git remote add boilerplate https://github.com/ckeditor/ckeditor-boilerplate.git
```

### 2. Injecting the Boilerplate into a Repository

```bash
git fetch boilerplate
git merge boilerplate/master
```

If any files are already present in your repository, there is a chance that the merge will cause conflicts. Generally it should
be straightforward to resolve them.

### 3. Get Boilerplate Updates

Just repeat step 2.

## First Steps after Including the Boilerplate

The boilerplate contains generic files, many of them serving as templates for your projects. The following are the
things to do once you incorporate it into your project.

Reviewing file content:

1. `README.md` &ndash; Replace this file with the content that describes your project.
2. `CONTRIBUTING.md` &ndash; Ensure that the content of this file applies to your project.
3. `LICENSE.md`:
   * Replace the software name with your project name.
   * Check if the license option fits your project.
   * Ensure that the entire content of this file is appropriate for your project.
4. `package.json` &ndash; Fill all entries accordingly.

Assuming that `npm` and `grunt` are installed globally, run a few commands:

1. `npm install` &ndash; Downloads all project dependencies into `node_modules`.
2. `grunt githooks`&ndash; (optional) If you want to have pre-commit linting enabled straight in your project.

## Additional Directories

Other than the files available in this repository, it is expected that target projects will also contain the following directories:

* `/src/`<br>
  The source code of the project.

* `/build/`<br>
  If any build is created, it should be placed in this folder.

* `[module|group]/tests/`<br>
  The place for tests. Its final placement is per project. It can either stay in the project root or inside sub-directories that represent parts of the project, like modules or plugins.

## Boilerplate License

Copyright (c) 2014 CKSource - Frederico Knabben

All boilerplate code is licensed under the terms of the [MIT license](http://opensource.org/licenses/MIT).

Although `LICENSE.md` is available in this repository as a template for your project, it does not apply to the
boilerplate project itself.
