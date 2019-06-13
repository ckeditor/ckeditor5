CKEditor 5 editing engine
========================================

[![Join the chat at https://gitter.im/ckeditor/ckeditor5](https://badges.gitter.im/ckeditor/ckeditor5.svg)](https://gitter.im/ckeditor/ckeditor5?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![npm version](https://badge.fury.io/js/%40ckeditor%2Fckeditor5-engine.svg)](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)
[![Build Status](https://travis-ci.org/ckeditor/ckeditor5-engine.svg?branch=master)](https://travis-ci.org/ckeditor/ckeditor5-engine)
[![Coverage Status](https://coveralls.io/repos/github/ckeditor/ckeditor5-engine/badge.svg?branch=master)](https://coveralls.io/github/ckeditor/ckeditor5-engine?branch=master)
<br>
[![Dependency Status](https://david-dm.org/ckeditor/ckeditor5-engine/status.svg)](https://david-dm.org/ckeditor/ckeditor5-engine)
[![devDependency Status](https://david-dm.org/ckeditor/ckeditor5-engine/dev-status.svg)](https://david-dm.org/ckeditor/ckeditor5-engine?type=dev)

The CKEditor 5 editing engine implements a flexible MVC-based architecture for creating rich text editing features.

## Architecture overview

* **Custom data model.** CKEditor 5 implements a tree-structured custom data model, designed to fit multiple requirements such as enabling real-time collaboration and complex editing features (like tables or nested blocks).
* **Virtual DOM.** CKEditor 5's editing engine features a custom, editing-oriented virtual DOM implementation that aims to hide browser quirks from your sight. **No more `contentEditable` nightmares!**
* **Real-time collaborative editing**. The editor implements Operational Transformation for the tree-structured model as well as many other mechanisms which were required to create a seamless collaborative UX. Additionally, we provide cloud infrastructure and plugins enabling real-time collaborative editing in your application! [Check the collaboration demo](https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/overview.html).
* **Extensible.** The entire editor architecture was designed for maximum flexibility. The code is event-based and highly decoupled, allowing you to plug in or replace selected pieces. Features do not directly depend on each other and communicate in standardized ways.
* **Schema-less core**. The core makes minimal assumptions and can be controlled through the schema. This leaves all decisions to plugins and to you.
* **Modular architecture.** Not only can the core modules be reused and recomposed but even the features were implemented in a highly granular way. Feel like running a headless CKEditor 5 with a couple of features in Node.js? Not a problem!
* **Framework for building rich-text editors.** Every use case is different and every editor needs to fulfill different goals. Therefore, we give you the freedom to create your own editors with custom-tailored features and UI.
* **Heavily tested from day one.** CKEditor 5 comes with 3x more tests than React itself. All packages have 100% code coverage.
* **8+ years of support.** It is not yet another framework to be gone next year or a hyped proof-of-concept to fail in a real-life scenario. We have over 15 years of experience in creating rich text editors and invested over 4 years in designing and building your next future-proof rich text editor of choice.

## Documentation

For a general introduction see the [Overview of CKEditor 5 Framework](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/overview.html) guide and then the [Editing engine architecture](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/architecture/editing-engine.html) guide.

Additionally, refer to the [`@ckeditor/ckeditor5-engine` package](https://ckeditor.com/docs/ckeditor5/latest/api/engine.html) page in [CKEditor 5 documentation](https://ckeditor.com/docs/ckeditor5/latest/) for even more information.

## License

Licensed under the terms of [GNU General Public License Version 2 or later](http://www.gnu.org/licenses/gpl.html). For full details about the license, please check the `LICENSE.md` file or [https://ckeditor.com/legal/ckeditor-oss-license](https://ckeditor.com/legal/ckeditor-oss-license).
