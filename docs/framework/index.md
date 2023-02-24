---
category: framework
order: 10
menu-title: Overview
meta-title: CKEditor 5 Framework documentation
meta-description: Learn how to install, integrate, configure and develop CKEditor 5 Framework. Browse through API documentation and online samples.
---

# CKEditor 5 Framework overview

CKEditor 5 is a project that allows you to quickly and easily initialize one of the many types of editors it offers in your application. At the same time, it is a framework for creating custom-tailored rich-text editing solutions. The former requirement is met thanks to the {@link installation/getting-started/predefined-builds predefined CKEditor 5 builds}. The latter &mdash; thanks to CKEditor 5 Framework.

CKEditor 5 Framework is a highly-flexible and universal platform providing a set of components allowing you to create any kind of rich text editing solution. It enables creating different, custom-tailored editors that suit specific needs. It also provides tools for creation and integration of user-made features and for customizing the existing ones.

This guide explains how the framework is built and how to start using it.

Please note that the CKEditor 5 Framework documentation is constantly updated and expanded, but it may still be lacking some things. Feel free to [suggest documentation enhancements](https://github.com/ckeditor/ckeditor5/labels/type%3Adocs) and share your feedback about the framework.

If the documentation is insufficient, do not be afraid to look into the source code of [CKEditor 5 packages](https://github.com/ckeditor?utf8=%E2%9C%93&q=ckeditor5&type=public). For example, if you plan to create a new feature, check if a similar one already exists and try to take inspiration from its source code.

## When to use the framework?

The CKEditor 5 predefined builds {@link installation/getting-started/quick-start-other#customizing-a-predefined-build can be customized}, but certain types of customizations require using the framework.

* **Writing your own features.** New features are implemented using the framework.
* **Customizing existing features.** Changing the behavior or look of existing features can be done thanks to the framework capabilities.
* **Creating new types of editors.** You can create new editor types using the framework.

To sum up: you need to start using the framework as soon as existing builds do not meet your requirements or cannot be customized to the extent you need.

## Design

The framework was designed to be a highly flexible and universal platform for creating custom rich-text editing solutions. At the same time it meets several goals that make implementing features as easy a task as possible.

* **Plugin-based architecture.** Everything is a plugin &mdash; even such crucial features as support for typing or `<p>` elements. You can remove plugins or replace them with your own implementations to achieve fully customized results.
* **Schema-less core.** The core makes minimal assumptions and can be controlled through the schema. This leaves all decisions to plugins and hence to you.
* **Collaboration-ready.** Or rather, real-time collaboration is **ready for you to use**! The editor implements [Operational Transformation](https://en.wikipedia.org/wiki/Operational_transformation) for the tree-structured model as well as many other mechanisms which were required to create a seamless collaborative UX. Additionally, we provide cloud infrastructure and plugins enabling real-time collaborative editing in your application! {@link features/real-time-collaboration Check the collaboration demo}.
* **Custom data model.** The editing engine implements a tree-structured custom data model, designed to fit multiple requirements such as enabling real-time collaboration and complex editing features (like tables or nested blocks).
* **Virtual DOM.** The editing engine features a custom, editing-oriented virtual DOM implementation that aims to hide browser quirks from your sight. **No more `contentEditable` nightmares!**
* **Granular, reusable features.** Features are implemented in a granular way. This allows for reusing and recomposing them which, in turn, makes it possible to customize and extend the editor. For instance, the {@link features/images-overview image feature} consists of over 10 plugins at the moment.
* **Extensibility.** The entire editor architecture was designed for maximum flexibility. The code is event-based and highly decoupled, allowing you to plug in or replace selected pieces. Features do not directly depend on one another and communicate in standardized ways.
* **A beautiful UI.** Text editing is not only about typing &mdash; your users will need a UI to create links or manage images. We believe that a proper UX needs to be carefully designed and we did not skip this part. Having second thoughts about the proposed UI? No problem at all! You can always create your custom interface for CKEditor 5 thanks to its decoupled UI.
* **Quality.** All official packages have extensive tests suites (100% code coverage is merely a step to that). All code has extensive {@link api/index API documentation}.
* **Minimal configuration.** To avoid bloat, features have minimal configuration. Deeper changes in their behavior can be done by recomposing them with custom features.
* **8+ years of support.** It is not yet another framework to be gone next year or a hyped proof-of-concept to fail in a real-life scenario. We have over 15 years of experience in creating rich-text editors and invested over 4 years in designing and building your next future-proof rich-text editor of choice.

## Framework structure

The framework is made of several [npm packages](https://npmjs.com). Each package is available in the `/packages` directory of the [https://github.com/ckeditor/ckeditor5](https://github.com/ckeditor/ckeditor5) repository.

There are a few groups of packages:

* [Core libraries](https://github.com/ckeditor/ckeditor5#core-libraries) &ndash; A set of packages which are the root of the framework.
* [Editors](https://github.com/ckeditor/ckeditor5#editors) &ndash; Packages that implement various types of editors.
* [Features](https://github.com/ckeditor/ckeditor5#features) &ndash; Packages that implement end user features.
* [Themes](https://github.com/ckeditor/ckeditor5#themes) &ndash; Packages that implement editor themes.
* [Builds](https://github.com/ckeditor/ckeditor5#builds) &ndash; Packages containing {@link installation/getting-started/predefined-builds CKEditor 5 builds}.

## What's next?

To start using the framework refer to:

* The {@link framework/quick-start Quick start} guide.
* The {@link framework/architecture/intro Introduction to the framework architecture} guide.
* The {@link framework/creating-simple-plugin-timestamp Creating a simple plugin} guide.