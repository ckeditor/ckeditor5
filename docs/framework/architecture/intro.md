---
category: framework-architecture
menu-title: Introduction
order: 10
toc: false
feedback-widget: false
---

# Introduction to CKEditor 5 architecture

This guide introduces the main pillars of the CKEditor 5 architecture. It is assumed that you have read the {@link framework/index Framework's overview} and saw some code in the {@link framework/quick-start Quick start} guide. This should help you go through the next steps.

## Main components

CKEditor 5 Framework comes with its 3 main pillars:

* **{@link framework/architecture/core-editor-architecture Core editor architecture}**

	The core editor architecture is implemented by the {@link api/core `@ckeditor/ckeditor5-core`} package. It consists of some core classes and interfaces that glue everything together.

	The main purpose of the core editor architecture is to lay the groundwork for implementing editor features. Therefore, it introduces concepts such as {@link framework/architecture/core-editor-architecture#plugins plugins} and {@link framework/architecture/core-editor-architecture#commands commands} which simplify and standardize the way of implementing features.

* **{@link framework/architecture/editing-engine Editing engine}**

	The editing engine is implemented by the {@link api/engine `@ckeditor/ckeditor5-engine`} package. It is the biggest and by far the most complex piece of the framework, implementing the custom data model, the view layer, conversion mechanisms, the rendering engine responsible for [taming `contentEditable`](https://medium.com/content-uneditable/contenteditable-the-good-the-bad-and-the-ugly-261a38555e9c) and a lot more.

* **{@link framework/architecture/ui-library UI library}**

	The standard UI library is implemented by the {@link api/ui `@ckeditor/ckeditor5-ui`} package. It contains a simple MVC implementation whose main goal is to best fit the CKEditor 5 needs. Furthermore, it introduces basic UI components to be used by editor features.
