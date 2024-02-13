---
category: getting-started
order: 10
menu-title: Overview
meta-title: Getting started with CKEditor 5 | CKEditor 5 documentation
meta-description: Learn how to install, integrate, configure, and develop CKEditor 5. Browse through the API documentation and online samples.
---

# Getting started with CKEditor&nbsp;5

CKEditor&nbsp;5 is a flexible editing framework, which provides every type of WYSIWYG editing solution imaginable. From editors similar to Google Docs and Medium to Notion, Slack or Twitter-like applications, all is possible within a single editing framework. It is an ultra-modern JavaScript rich-text editor with MVC architecture, custom data model, and virtual DOM, written from scratch in TypeScript with excellent webpack and Vite support. Find out the most convenient way to start using it!

<span class="navigation-hint_mobile">
	<info-box>
		Use the **main menu button in the upper-left corner** to navigate through the documentation.
	</info-box>
</span>

## New to CKEditor&nbsp;5?

If your dive into using our WYSIWYG editor is only starting, find out how to kick off this adventure easily with the {@link getting-started/quick-start Quick Start} guide.

## Migrating from CKEditor&nbsp;4?

If you are familiar with our previous, discontinued product and would like to switch, check the {@link updating/migration-from-ckeditor-4 migration} section.

## CKEditor&nbsp;5 framework integrations

Dou you prefer to use ready-made frameworks? Native integrations with the most popular libraries will save you time and effort.

There are four official integrations so far:

* {@link getting-started/integrations/angular CKEditor&nbsp;5 rich-text editor for Angular}
* {@link getting-started/integrations/react CKEditor&nbsp;5 rich-text editor for React}
* {@link getting-started/integrations/vuejs-v2 CKEditor&nbsp;5 rich-text editor for Vue.js 2.x}
* {@link getting-started/integrations/vuejs-v3 CKEditor&nbsp;5 rich-text editor for Vue.js 3.x}

However, some more frameworks are also supported. Refer to their documentation on the left to learn how to use them. CKEditor&nbsp;5 is a native JavaScript rich-text editing component written in TypeScript. As such, it is framework agnostic and can be integrated with any JavaScript framework. It does not require any uncommon techniques or technologies to be used. Therefore, unless the framework you use has atypical limitations, CKEditor&nbsp;5 is compatible with it.

CKEditor&nbsp;5 is also compatible with popular CSS frameworks such as Bootstrap or Foundation. Such integrations, however, often require additional changes and adjustments that we have gathered {@link getting-started/integrations/css in this guide}.

We plan to provide more integrations with time. We would like to [hear your ideas](https://github.com/ckeditor/ckeditor5/issues/1002) about what we should work on next.

<!-- ### How do I use CKEditor&nbsp;5 if my framework does not have an official integration?

CKEditor&nbsp;5 should be compatible with your framework and initializing it usually requires a single method call. A tighter integration of CKEditor&nbsp;5 with your framework may require using an existing or writing a new adapter (integration layer) to communicate your framework with CKEditor&nbsp;5.

When checking how to integrate CKEditor&nbsp;5 with your framework, you can follow these steps:

* If no official integrations (listed above) are available, search for community-driven integrations. Most of them are available on [npm](https://www.npmjs.com/).
* If none exists, integrate CKEditor&nbsp;5 with your framework by yourself.

CKEditor&nbsp;5 offers {@link getting-started/legacy-getting-started/predefined-builds predefined builds} that expose a rich JavaScript API, which you can use to {@link getting-started/legacy-getting-started/editor-lifecycle#creating-an-editor-with-create create editors} and {@link getting-started/getting-and-setting-data#setting-the-editor-data-with-setdata control them}. -->

## Want to remove the "Powered by CKEditor" logo?

IF you came here looking for a guide on how to suppress the branding logo, check the dedicated {@link support/managing-ckeditor-logo branding} guide.
