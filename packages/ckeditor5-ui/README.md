Boilerplate for Git Repositories
================================

The boilerplate used when creating the directory structure for git projects. It contains most of the files we expect to
have inside CKEditor repositories.

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
This is the grunt programming file. It exposes the following tasks:

 * `grunt default`: Alias for "jshint:git", "jscs:git" tasks.
 * `grunt githooks`:  Installs a git pre-commit hook to run `grunt default`.
 * `grunt jscs`: JavaScript code style checker with [JSCS](https://github.com/jscs-dev/node-jscs).
 * `grunt jshint`: Validate JavaScript files with [JSHint](https://github.com/jshint/jshint).

The `jscs:git` and `joshing:git` variations run the checks on files that will endup into the next `git commit` only.

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

Unified configurations for coding in IDEs, including the project standards. See
[editorconfig.org](http://editorconfig.org/).
