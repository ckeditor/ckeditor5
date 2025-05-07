---
category: getting-started
order: 10
menu-title: Quick start
meta-title: CKEditor 5 installation quick start | CKEditor 5 Documentation
meta-description: Learn how to start with CKEditor 5, the modern JavaScript-rich text editor. Find installation guides, tutorials, and integration tips.
---

# Getting started with CKEditor&nbsp;5

CKEditor&nbsp;5 is a flexible editing framework that provides every type of WYSIWYG editing solution imaginable. From editors similar to Google Docs and Medium to Notion, Slack, or Twitter-like applications, all is possible within a single editing framework. It is a modern JavaScript rich-text editor with MVC architecture, custom data model, and virtual DOM, written from scratch in TypeScript with excellent support for modern bundlers. Find out the most convenient way to start using it!

{@snippet getting-started/use-builder}

## Are you new to CKEditor&nbsp;5?

If your dive into using our WYSIWYG editor is only starting, find out how to kick off this adventure easily. You have a few methods to choose from:

* [Using CKEditor&nbsp;5 Builder](#ckeditor-5-builder) for the smoothest setup with live preview and multiple integration options.
* {@link getting-started/integrations/quick-start#installing-ckeditor-5-using-npm Using npm}, where you use a JavaScript package and build the editor with a bundler.
* {@link getting-started/integrations-cdn/quick-start#installing-ckeditor-5-from-cdn Using CDN}, where you use our cloud-distributed CDN in a no-build setup.
* {@link getting-started/integrations/quick-start#installing-ckeditor-5-from-a-zip-file Using a ZIP file}, where you download the ready-to-run files and copy them to your project.
* Choosing one of the [pre-made integrations with popular frameworks](#ckeditor-5-framework-integrations).

## CKEditor&nbsp;5 framework integrations

Do you want to use a framework? Native integrations with the most popular libraries will save you time and effort. There are several official integrations so far:

* Integrate CKEditor&nbsp;5 with **Angular** using {@link getting-started/integrations-cdn/angular CDN} or {@link getting-started/integrations/angular npm}.
* Integrate CKEditor&nbsp;5 with **React** using  {@link getting-started/integrations-cdn/react-default-cdn CDN} or {@link getting-started/integrations/react-default-npm npm}.
* Integrate CKEditor&nbsp;5 with **Next.js** using {@link getting-started/integrations-cdn/next-js CDN} or {@link getting-started/integrations/next-js npm}.
* Integrate CKEditor&nbsp;5 with **Nuxt** using {@link getting-started/integrations-cdn/nuxt CDN} or {@link getting-started/integrations/nuxt npm}.
* Integrate CKEditor&nbsp;5 with **Vue.js 3.x** using {@link getting-started/integrations-cdn/vuejs-v3 CDN} or {@link getting-started/integrations/vuejs-v3 npm}.
* Integrate CKEditor&nbsp;5 with **Vue.js 2.x** using {@link getting-started/integrations/vuejs-v2 npm}.
* Integrate CKEditor&nbsp;5 with **Salesforce** using {@link getting-started/integrations-cdn/salesforce CDN} or {@link getting-started/integrations/salesforce npm}.
* Integrate CKEditor&nbsp;5 with **Svelte** using {@link getting-started/integrations-cdn/svelte CDN} or {@link getting-started/integrations/svelte npm}.
* Integrate CKEditor&nbsp;5 with **Spring-boot** using {@link getting-started/integrations-cdn/spring-boot CDN} or {@link getting-started/integrations/spring-boot npm}.
* Integrate CKEditor&nbsp;5 with {@link getting-started/integrations/sharepoint **Sharepoint SPFx**}.
* Integrate CKEditor&nbsp;5 with {@link getting-started/integrations/drupal-real-time-collaboration **Drupal**}.
* Integrate CKEditor&nbsp;5 with {@link getting-started/integrations/css **CSS frameworks**}.

<!-- However, integration steps for some more frameworks are also documented. Refer to their documentation on the left to learn how to use them. -->

### Support for other frameworks

CKEditor&nbsp;5 is a native JavaScript rich-text editing component written in TypeScript. As such, it is framework-agnostic and **can be integrated with any JavaScript framework and application**. It does not require any uncommon techniques or technologies to be used. Therefore, unless the framework you use has atypical limitations, CKEditor&nbsp;5 is compatible with it.

CKEditor&nbsp;5 is also compatible with popular CSS frameworks such as Bootstrap or Foundation. Such integrations, however, often require additional changes and adjustments that we have gathered {@link getting-started/integrations/css in this guide}.

We plan to provide more integrations with time. We would like to [hear your ideas](https://github.com/ckeditor/ckeditor5/issues/1002) about what we should work on next.

## Migrating from CKEditor&nbsp;4?

If you are familiar with our previous, discontinued product and would like to switch, check the **{@link updating/migration-from-ckeditor-4 Migration section}**. You will find a useful upgrade guide there to help you switch with the least effort.

## Configuring CKEditor&nbsp;5

Once you install your copy of CKEditor&nbsp;5, take some time to {@link getting-started/setup/configuration configure it} before first use. Set up data-saving methods, editor toolbars, and UI.

You may also take the {@link tutorials/crash-course/editor step-by-step tutorial} that will guide you through the installation and configuration of the editor.

## Legacy installation methods

Before version 42.0.0, CKEditor&nbsp;5 used different installation methods. If, for whatever reason, you wish to use these older versions &ndash; while it is not advised &ndash; you can have a look at the {@link getting-started/legacy-getting-started/quick-start legacy installation guides}. Otherwise, please see the {@link updating/nim-migration/migration-to-new-installation-methods Migrating CKEditor&nbsp;5 to new installation methods} guide.
