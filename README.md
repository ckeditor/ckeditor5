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

The [ckeditor5](https://github.com/ckeditor/ckeditor5) repository contains also the core classes which implements the base architecture of the CKEditor 5 framework.

Another key repositories are:

* [ckeditor5-engine](https://github.com/ckeditor/ckeditor5-engine), which keeps the **editor's editing engine** (data model, editing and data views, etc.). Big part of the development happens in this repository, as the engine is the base of the editor.
* [ckeditor5-ui](https://github.com/ckeditor/ckeditor5-ui) and [ckeditor5-ui-default](https://github.com/ckeditor/ckeditor5-ui-default), which keep the UI framework and default UI library (based on this framework). The official features use these packages to create their UI.

![Diagram of CKEditor 5 key repositories](https://cloud.githubusercontent.com/assets/630060/13987605/a668a8c6-f108-11e5-839f-c2337c5f9c39.png)

### Reporting Issues and Feature Requests

Each repository independently handles its issues, so focus is kept on their scope:

* [ckeditor5-design](https://github.com/ckeditor/ckeditor5-design): issues related to macro program design, not going into the specifics of other repos.
* [ckeditor5](https://github.com/ckeditor/ckeditor5): issues related to the core API as well as the development environment and workflow. When you don't know where to report an issue, report it here.
* [ckeditor5-engine](https://github.com/ckeditor/ckeditor5-engine): issues related to the engine API.
* other [ckeditor5-*](https://github.com/ckeditor?utf8=%E2%9C%93&query=ckeditor5-) repos: issues related to all other parts of the code, like features, UI libraries, themes, etc.

## License

Licensed under the GPL, LGPL and MPL licenses, at your choice. For full details about the license, please check the LICENSE.md file.
