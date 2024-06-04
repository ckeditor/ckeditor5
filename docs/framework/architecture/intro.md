---
category: framework-architecture
menu-title: Introduction
meta-title: Introduction to CKEditor 5 architecture | CKEditor 5 Framework Documentation
order: 10
toc: false
feedback-widget: false
---

# Introduction to CKEditor&nbsp;5 architecture

This guide introduces the main pillars of the CKEditor&nbsp;5 architecture. 

## Basic CKEditor&nbsp;5 architecture

### Design

The framework was designed to be a highly flexible and universal platform for creating custom rich-text editing solutions. At the same time, it meets several goals that make implementing features as easy a task as possible.

* **Plugin-based architecture.** Everything is a plugin &ndash; even such crucial features as support for typing or `<p>` elements. You can remove plugins or replace them with your own implementations to achieve fully customized results.
* **Schema-less core.** The core makes minimal assumptions and can be controlled through the schema. This leaves all decisions to plugins and hence to you.
* **Collaboration-ready.** Or rather, real-time collaboration is **ready for you to use**! The editor implements [Operational Transformation](https://en.wikipedia.org/wiki/Operational_transformation) for the tree-structured model as well as many other mechanisms which were required to create a seamless collaborative UX. Additionally, we provide cloud infrastructure and plugins enabling real-time collaborative editing in your application! {@link features/real-time-collaboration Check the collaboration demo}.
* **Custom data model.** The editing engine implements a tree-structured custom data model, designed to fit multiple requirements such as enabling real-time collaboration and complex editing features (like tables or nested blocks).
* **Virtual DOM.** The editing engine features a custom, editing-oriented virtual DOM implementation that aims to hide browser quirks from your sight. **No more `contentEditable` nightmares!**
* **TypeScript.** The project is written in TypeScript and provides native type definitions. This helps create better, more reliable code that is easier to understand and maintain.
* **Granular, reusable features.** Features are implemented in a granular way. This allows for reusing and recomposing them which, in turn, makes it possible to customize and extend the editor. For instance, the {@link features/images-overview image feature} consists of over 10 plugins at the moment.
* **Extensibility.** The entire editor architecture was designed for maximum flexibility. The code is event-based and highly decoupled, allowing you to plug in or replace selected pieces. Features do not directly depend on one another and communicate in standardized ways.
* **A beautiful UI.** Text editing is not only about typing &ndash; your users will need a UI to create links or manage images. We believe that a proper UX needs to be carefully designed and we did not skip this part. Having second thoughts about the proposed UI? No problem at all! You can always create your custom interface for CKEditor&nbsp;5 thanks to its decoupled UI.
* **Quality.** All official packages have extensive test suites (100% code coverage is merely a step to that). All code has extensive {@link api/index API documentation}.
* **Minimal configuration.** To avoid bloat, features have minimal configuration. Deeper changes in their behavior can be done by recomposing them with custom features.
* **8+ years of support.** It is not yet another framework to be gone next year or a hyped proof-of-concept to fail in a real-life scenario. We have over 20 years of experience in creating rich-text editors and continue working day in and day out on improving your future-proof rich-text editor of choice.

### Framework structure

The framework is made of several [npm packages](https://npmjs.com). Each package is available in the [`/packages`](https://github.com/ckeditor/ckeditor5/tree/master/packages) directory of the CKEditor&nbsp;5 GitHub repository.

There are a few groups of packages:

* Core libraries &ndash; A set of packages which are the root of the framework.
* Editors &ndash; Packages that implement various types of editors.
* Features &ndash; Packages that implement end-user features.
* Themes &ndash; Packages that implement editor themes.

## Main components

CKEditor&nbsp;5 Framework comes with its 3 main pillars:

* **{@link framework/architecture/core-editor-architecture Core editor architecture}**

	The core editor architecture is implemented by the {@link api/core `@ckeditor/ckeditor5-core`} package. It consists of some core classes and interfaces that glue everything together.

	The main purpose of the core editor architecture is to lay the groundwork for implementing editor features. Therefore, it introduces concepts such as {@link framework/architecture/core-editor-architecture#plugins plugins} and {@link framework/architecture/core-editor-architecture#commands commands} which simplify and standardize the way of implementing features.

* **{@link framework/architecture/editing-engine Editing engine}**

	The editing engine is implemented by the {@link api/engine `@ckeditor/ckeditor5-engine`} package. It is the biggest and by far the most complex piece of the framework, implementing the custom data model, the view layer, conversion mechanisms, the rendering engine responsible for [taming `contentEditable`](https://medium.com/content-uneditable/contenteditable-the-good-the-bad-and-the-ugly-261a38555e9c) and a lot more.

* **{@link framework/architecture/ui-library UI library}**

	The standard UI library is implemented by the {@link api/ui `@ckeditor/ckeditor5-ui`} package. It contains a simple MVC implementation whose main goal is to best fit the CKEditor&nbsp;5 needs. Furthermore, it introduces basic UI components to be used by editor features.
