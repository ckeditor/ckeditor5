CKEditor 5 – Development Repository
===================================

[![Dependency Status](https://david-dm.org/ckeditor/ckeditor5.svg)](https://david-dm.org/ckeditor/ckeditor5)
[![devDependency Status](https://david-dm.org/ckeditor/ckeditor5/dev-status.svg)](https://david-dm.org/ckeditor/ckeditor5#info=devDependencies)

## Project Status (January 2016)

**WARNING:** The project is still at its first development stage. No usable software is currently available.

[Periodic updates and news](https://github.com/ckeditor/ckeditor5/wiki/News-and-Updates) about the project can be found at the wiki pages of [ckeditor5](https://github.com/ckeditor/ckeditor5).

## Project Organization

### Design

Discussions, decisions and documentation about the architecture design of CKEditor 5 are made at the "ckeditor5-design" repository:

* Discussion: https://github.com/ckeditor/ckeditor5-design/issues
* Documentation: https://github.com/ckeditor/ckeditor5-design/wiki

At the current stage, this is the best place for bringing opinions and contributions. Letting the core team know if they are going in the right or wrong direction is great feedback.

### Development

The project is split into several different repositories, as described in the [design wiki](https://github.com/ckeditor/ckeditor5-design/wiki/Architecture-Overview). Most of these repositories are generally available within the CKEditor organization in GitHub, prefixed with "ckeditor5".

The [ckeditor5](https://github.com/ckeditor/ckeditor5) repository is the place that centralizes the development of CKEditor 5. It bundles different repositories into a single place, adding the necessary helper tools for the development workflow, like the builder and the test runner. [Basic information on how to setup the development environment](https://github.com/ckeditor/ckeditor5/wiki/Development-Environment) can be found in the wiki pages.

A key repository is [ckeditor5-core](https://github.com/ckeditor/ckeditor5-core), which keeps the editor's core modules such as the basic infrastructure, the data model and the basic classes for UI libraries. **Most of the development happens in this repository**.

![CKEditor 5 Development repository = Developer Tools (builder, test runner) + NPM packages (ckeditor5-core and others)](https://cloud.githubusercontent.com/assets/630060/12577912/d5c32244-c41d-11e5-8b09-2dd97a1abb05.png)

### Reporting Issues and Feature Requests

Each repository independently handles its issues, so focus is kept on their scope:
[ckeditor5-design](https://github.com/ckeditor/ckeditor5-design): issues related to macro program design, not going into the specifics of other repos.
[ckeditor5](https://github.com/ckeditor/ckeditor5): issues related to the development environment and workflow.
[ckeditor5-core](https://github.com/ckeditor/ckeditor5-core): issues related to the core API.
other [ckeditor5-*](https://github.com/ckeditor?utf8=%E2%9C%93&query=ckeditor5-) repos: issues related to all other parts of the code, like features, UI libraries, themes, etc.

## License

Licensed under the GPL, LGPL and MPL licenses, at your choice. For full details about the license, please check the LICENSE.md file.
