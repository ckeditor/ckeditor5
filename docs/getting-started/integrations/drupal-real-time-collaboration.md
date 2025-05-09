---
menu-title: Drupal
meta-title: CKEditor 5 real-time editing in Drupal | CKEditor 5 Documentation
meta-description: Learn how to set up real-time collaboration in the Drupal editing platform with the CKEditor 5 Premium Features module.
category: installation
order: 100
modified_at: 2023-10-06
---

# CKEditor&nbsp;5 real-time editing in Drupal

Drupal is a free and open-source web content management system (CMS) written in PHP. CKEditor&nbsp;5 WYSIWYG rich text editor is the default editor module for Drupal. The [CKEditor&nbsp;5 Premium Features module](https://www.drupal.org/project/ckeditor5_premium_features) provides instant integration of the real-time collaboration features with the editing platform.

Currently, the module includes a full set of {@link features/collaboration collaboration tools}, namely comments, track changes, and revision history. It also provides a set of essential formatting and navigation features &nbsp; as well as document import and export plugins.

## Real-time collaboration in Drupal with CKEditor 5

With {@link features/real-time-collaboration real-time collaboration} features, many users can work together to write, review, and discuss their content right within Drupal. No need to use different applications for drafting and commenting &ndash; you can do it all in one place.

{@img assets/img/real-time-collaboration-drupal.gif 1014 Drupal with CKEditor&nbsp;5 real-time collaborative editing.}

### Adding comments

The {@link features/comments comments} feature allows users to discuss the content. It lets them add comments to any part of the content, including text and block elements such as embedded media or images. This is a great way of communication for many authors working on the same document.

### Tracking content changes

The {@link features/track-changes track changes} feature shows change suggestions added by editors. These can be later accepted and added to the content or dismissed.

{@link features/revision-history Revision History} is a versioning tool that allows the making of document snapshots (revisions). You can name these snapshots and easily browse them to see what changes were made. You can also compare and restore previous versions of the content.

### Notifications

There is also a dedicated, configurable notifications system developed especially for the CKEditor&nbsp;5 Premium Features module for Drupal. It helps you stay up-to-date whenever someone mentions you in a document, comments, or replies to you, accepts or rejects suggestions, and so on. Integrate it with your custom plugin to get notifications via email, Slack, or other services.

### Asynchronous collaboration

You can use all the collaboration features **for {@link features/collaboration#asynchronous-collaboration asynchronous editing}**. It is a collaboration mode when a single actor can work on the document at once, using the revision history, track changes, and comments features to interact with the previous and following editors, as the work happens sequentially.

## Productivity-improving features

Apart from the real-time collaboration tools, the module provides various other plugins. The {@link features/format-painter format painter} feature lets users consistently style the edited text, while the {@link features/mentions mentions} feature allows you to tag other users in comments. Meanwhile, {@link features/slash-commands slash commands} let you create, insert, and format rich content on the go by typing the `/` character and choosing from many predefined actions, such as text formatting, and inserting headings, tables, or lists.

### Fullscreen mode

The fullscreen mode is a free-to-use plugin that maximizes the editing area. It is especially useful when using features like {@link features/document-outline document outline} or {@link features/comments comments} that take up extra space around the editor.

### Document converters

The module includes the {@link features/paste-from-office-enhanced enhanced Paste from Office} feature which makes pasting advanced rich-text content easy and reliable. Users can also use the {@link features/import-word import from Word} feature to import entire documents into the editor. Once the work is done or needs to be sent to another editor, handy one-click {@link features/export-pdf export to PDF} and {@link features/export-word export to Word} features offer portability and cross-platform interoperability.

### Templates

Easily defined document and content {@link features/template templates} make content creation faster and easier thanks to sets of predefined templates. These may define entire documents, like CVs, reports, or formal letters conforming to the company's style guide. You can also use templates to create content blocks, such as pre-formatted tables, lists, and other block elements.

## CKEditor 5 Plugin Pack

The [CKEditor&nbsp;5 Plugin Pack](https://www.drupal.org/project/ckeditor5_plugin_pack) is a free-to-use module that offers multiple CKEditor 5 plugins that are not available in the Drupal core, extending editor's functionality.

### Features available in the CKEditor 5 Plugin Pack module

* {@link features/indent Block indentation}
* {@link features/find-and-replace Find and replace}
* {@link features/font Fonts family, size and colors}
* {@link features/highlight Highlight}
* {@link features/text-transformation Text transformation}
* {@link features/todo-lists To-do lists}
* {@link features/word-count Word count}
* Free version of {@link features/spelling-and-grammar-checking WProofreader} &ndash; limitation of the free version are listed [on this page](https://www.drupal.org/docs/extending-drupal/contributed-modules/contributed-module-documentation/ckeditor-5-plugin-pack/wproofreader-free-vs-premium-feature-comparison)

Plugin Pack also makes it possible to use some of the premium features for free.

Currently available premium features:

* {@link features/template Templates}
* Fullscreen mode

Detailed descriptions of each plugin can be found on the [CKEditor&nbsp;5 Plugin Pack module page](https://www.drupal.org/project/ckeditor5_plugin_pack)

## Supported Drupal versions

* Drupal 9 (requires [enabling CKEditor&ndash;5](https://www.drupal.org/docs/core-modules-and-themes/core-modules/experimental-ckeditor-5/installation-and-configuration-of-ckeditor-5-module-on-drupal-9))
* Drupal 10

## Requirements

* PHP 8.0+
* Drupal 9.4 with CKEditor&ndash;5 enabled
* Drupal 10
* To-do list module requires Drupal 10.2+
* Templates module requires Drupal 10.3+

## Installation and configuration

Refer to the [Adding CKEditor&ndash;5 Premium Features module to Drupal 10](https://www.drupal.org/docs/contributed-modules/ckeditor-5-premium-features/how-to-install-and-set-up-the-module) guide in the Drupal documentation for details on how to install and set up the Premium Features module.

Refer to the [Adding CKEditor 5 Plugin Pack module to Drupal 10](https://www.drupal.org/docs/extending-drupal/contributed-modules/contributed-module-documentation/ckeditor-5-plugin-pack/how-to-install-and-set-up-the-module) guide in the Drupal documentation for details on how to install and set up the Plugin Pack module.

## Next steps

* See how to manipulate the editor's data in the {@link getting-started/setup/getting-and-setting-data Getting and setting data} guide.
* Refer to further guides in the {@link getting-started/setup/configuration setup section} to see how to customize your editor further.
* Check the {@link features/index features category} to learn more about individual features.
