CKEditor 5 – Development Repository
===================================

[![Dependency Status](https://david-dm.org/ckeditor/ckeditor5.svg)](https://david-dm.org/ckeditor/ckeditor5)
[![devDependency Status](https://david-dm.org/ckeditor/ckeditor5/dev-status.svg)](https://david-dm.org/ckeditor/ckeditor5#info=devDependencies)

## Project Status (July 2016)

Version 0.1.0 was released on July 8, 2016. This is the first developer preview of the new CKEditor 5, and the first demo-able version.

**It is not production ready** and will be followed by several releases before it reaches its first stable 1.0.0 version.

Read more in the [CKEditor 5 v0.1.0 release blog post](http://ckeditor.com/blog/First-Developer-Preview-of-CKEditor-5-Available).

Check the basic CKEditor 5 sample on the [GitHub.io page](https://ckeditor5.github.io/).

[Periodic updates and news](https://github.com/ckeditor/ckeditor5/wiki/News-and-Updates) about the project can be found on the wiki pages of [ckeditor5](https://github.com/ckeditor/ckeditor5).

## Project Organization

### Design

Discussions, decisions and documentation about the architecture design of CKEditor 5 can be found in the "ckeditor5-design" repository:

* Discussion: https://github.com/ckeditor/ckeditor5-design/issues
* Documentation: https://github.com/ckeditor/ckeditor5-design/wiki

At the current stage, this is the best place for bringing opinions and contributions. Letting the core team know if they are going in the right or wrong direction is great feedback and will be much appreciated!

### Development

The project is split into several different repositories, as described in the [design wiki](https://github.com/ckeditor/ckeditor5-design/wiki/Architecture-Overview). Most of these repositories are generally available within the CKEditor organization in GitHub, prefixed with "ckeditor5".

The [ckeditor5](https://github.com/ckeditor/ckeditor5) repository is the place that centralizes the development of CKEditor 5. It bundles different repositories into a single place, adding the necessary helper tools for the development workflow, like the builder and the test runner. [Basic information on how to set up the development environment](https://github.com/ckeditor/ckeditor5/wiki/Development-Environment) can be found in the wiki pages.

The [ckeditor5](https://github.com/ckeditor/ckeditor5) repository also contains the core classes which implement the base architecture of the CKEditor 5 framework.

Other key repositories are:

* [ckeditor5-engine](https://github.com/ckeditor/ckeditor5-engine) &ndash; Stores the **editor's editing engine** (data model, editing and data views, etc.). A big part of the entire project development happens in this repository, as the engine is the base of the editor.
* [ckeditor5-ui](https://github.com/ckeditor/ckeditor5-ui) and [ckeditor5-ui-default](https://github.com/ckeditor/ckeditor5-ui-default) &ndash; Stores the UI framework and the default UI library (based on this framework). The official features use these packages to create their UI.

![Diagram of CKEditor 5 key repositories](https://cloud.githubusercontent.com/assets/630060/13987605/a668a8c6-f108-11e5-839f-c2337c5f9c39.png)

### Reporting Issues and Feature Requests

Each repository independently handles its issues, so focus is kept on their scope:

* [ckeditor5-design](https://github.com/ckeditor/ckeditor5-design) &ndash; Issues related to macro program design, not going into the specifics of other repos.
* [ckeditor5](https://github.com/ckeditor/ckeditor5) &ndash; Issues related to the core API as well as the development environment and workflow. When you do not know where to report an issue, report it here.
* [ckeditor5-engine](https://github.com/ckeditor/ckeditor5-engine) &ndash; Issues related to the engine API.
* Other [ckeditor5-*](https://github.com/ckeditor?utf8=%E2%9C%93&query=ckeditor5-) repositories &ndash; Issues related to all other parts of the code, like features, UI libraries, themes, etc.

## License

Licensed under the GPL, LGPL and MPL licenses, at your choice. For full details about the license, please check the LICENSE.md file.
