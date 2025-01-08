CKEditor&nbsp;5 editing engine
========================================

[![npm version](https://badge.fury.io/js/%40ckeditor%2Fckeditor5-engine.svg)](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine)
[![Coverage Status](https://coveralls.io/repos/github/ckeditor/ckeditor5/badge.svg?branch=master)](https://coveralls.io/github/ckeditor/ckeditor5?branch=master)
[![CircleCI](https://circleci.com/gh/ckeditor/ckeditor5.svg?style=shield)](https://app.circleci.com/pipelines/github/ckeditor/ckeditor5?branch=master)

The CKEditor&nbsp;5 editing engine implements a flexible MVC-based architecture for creating rich text editing features.

## Installation

This plugin is part of the `ckeditor5` package. Install the whole package to use it.

```bash
npm install ckeditor5
```

## Create free account

If you want to check full CKEditor&nbsp;5 capabilities, sign up for a [free non-commitment 14-day trial](https://portal.ckeditor.com/checkout?plan=free).

## Architecture overview

* **Custom data model.** CKEditor&nbsp;5 implements a tree-structured custom data model, designed to fit multiple requirements such as enabling real-time collaboration and complex editing features (like tables or nested blocks).
* **Virtual DOM.** CKEditor&nbsp;5's editing engine features a custom, editing-oriented virtual DOM implementation that aims to hide browser quirks from your sight. **No more `contentEditable` nightmares!**
* **Real-time collaborative editing**. The editor implements Operational Transformation for the tree-structured model as well as many other mechanisms which were required to create a seamless collaborative UX. Additionally, we provide cloud infrastructure and plugins enabling real-time collaborative editing in your application! [Check the collaboration demo](https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/overview.html).
* **Extensible.** The entire editor architecture was designed for maximum flexibility. The code is event-based and highly decoupled, allowing you to plug in or replace selected pieces. Features do not directly depend on each other and communicate in standardized ways.
* **Schema-less core**. The core makes minimal assumptions and can be controlled through the schema. This leaves all decisions to plugins and to you.
* **Modular architecture.** Not only can the core modules be reused and recomposed but even the features were implemented in a highly granular way. Feel like running a headless CKEditor&nbsp;5 with a couple of features in Node.js? Not a problem!
* **Framework for building rich-text editors.** Every use case is different and every editor needs to fulfill different goals. Therefore, we give you the freedom to create your own editors with custom-tailored features and UI.
* **Heavily tested from day one.** CKEditor&nbsp;5 comes with 3x more tests than React itself. All packages have 100% code coverage.
* **8+ years of support.** It is not yet another framework to be gone next year or a hyped proof-of-concept to fail in a real-life scenario. We have over 15 years of experience in creating rich text editors and invested over 4 years in designing and building your next future-proof rich text editor of choice.

## Documentation

For a general introduction see the [Overview of CKEditor&nbsp;5 Framework](https://ckeditor.com/docs/ckeditor5/latest/framework/architecture/core-editor-architecture.html) guide and then the [Editing engine architecture guide](https://ckeditor.com/docs/ckeditor5/latest/framework/architecture/editing-engine.html).

Additionally, refer to the [`@ckeditor/ckeditor5-engine` package](https://ckeditor.com/docs/ckeditor5/latest/api/engine.html) page in [CKEditor&nbsp;5 documentation](https://ckeditor.com/docs/ckeditor5/latest/) for even more information.

## License

Licensed under a dual-license model, this software is available under:

* the [GNU General Public License Version 2 or later](https://www.gnu.org/licenses/gpl.html),
* or commercial license terms from CKSource Holding sp. z o.o.

For more information, see: [https://ckeditor.com/legal/ckeditor-licensing-options](https://ckeditor.com/legal/ckeditor-licensing-options).
