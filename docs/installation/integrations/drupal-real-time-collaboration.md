---
menu-title: Drupal
meta-title: Real-time editing in Drupal | CKEditor 5 documentation
meta-description: Learn how to set up real-time collaboration in the Drupal editing platform with the CKEditor 5 Premium Features module.
category: integrations
order: 90
modified_at: 2023-10-06
---

{@snippet installation/integrations/framework-integration}

# Real-time editing in Drupal

Drupal is a free and open-source web content management system (CMS) written in PHP. CKEditor 5 WYSIWYG rich text editor is the default editor module for Drupal. The [CKEditor&nbsp;5 Premium Features module](https://www.drupal.org/project/ckeditor5_premium_features) provides instant integration of the real-time collaboration features with the editing platform.

Currently, the module includes a full set of {@link features/collaboration collaboration tools}, namely Comments, Track changes, and Revision history. It also provides the {@link features/productivity-pack Productivity Pack} &ndash; a set of essential formatting and navigation features &nbsp; as well as document import and export plugins.

## Real-time collaboration in Drupal with CKEditor 5

With {@link features/real-time-collaboration Real-time Collaboration} features, multiple users can work together to write, review, and discuss their content right within Drupal. No need to use different apps for drafting and commenting &ndash; you can do it all in one place.

{@img assets/img/real-time-collaboration-drupal.gif 1014 Drupal with CKEditor&nbsp;5 real-time editing.}

### Adding comments

The {@link features/comments Comments} feature allows users to discuss the content. It lets you add comments to any part of your content, including text, and block elements such as embedded media or images. This is a great way of communication for many authors working on the same document.

### Tracking content changes

The {@link features/track-changes Track changes} feature shows change suggestions added by editors. These can be later on accepted and added to the content or dismissed.

{@link features/revision-history Revision History} is a versioning tool that allows the making of snapshots that can be named and easily browsed to see what changes were made and compare and restore previous versions of the content.

### Notifications

There is also a dedicated, configurable notifications system developed especially for the CKEditor 5 Premium module for Drupal. It helps the users stay up-to-date whenever someone mentions you in a document, comments, or replies to you, accepts or rejects suggestions, and so on. Integrate it with your own plugin to get notifications via email, Slack, or other services.

### Asynchronous collaboration 

All the collaboration features **can also be used for {@link features/collaboration#non-real-time-asynchronous-collaboration asynchronous editing}**. It is a collaboration mode when a single actor can work on the document at once, using the revision history, track changes, and comments features to interact with previous and following editors, as the work is done sequentially.

## Productivity-improving features

Apart from the real-time collaboration tools, the module provides various other plugins. The {@link features/format-painter Format painter} feature lets users easily style the edited text, while the {@link features/mentions Mentions} feature allows you to tag other users in comments. Meanwhile, {@link features/slash-commands Slash commands} let you create, insert, and format rich content on the go by typing a `/` sign and choosing from many predefined actions, such as text formatting, and inserting headings, tables, or lists.

### Full Screen Mode

The Full Screen Mode is a free-to-use plugin that maximizes the editing area. It is especially useful when using features like {@link features/document-outline Document outline} or {@link features/comments Comments} that take up extra space around the editor.

### Converters

The module includes the {@link features/paste-from-office-enhanced Paste from Office enhanced} feature which makes pasting rich-text, advanced content easy and reliable. Users can also use the {@link features/import-word Import from Word} feature to import whole documents into the editor. Once the work is done or needs to be sent to another editor, handy one-click {@link features/export-pdf Export to PDF} and {@link features/export-word Export to Word} features offer portability and cross-platform interoperability.

### Templates

Easily defined document and content {@link features/template templates} make content creation faster and easier thanks to sets of predefined templates. These may define whole documents, like CVs, reports, or formal letters conforming to the company's style guide as well as content blocks, such as pre-formatted tables, lists, and other block elements.

## Supported Drupal versions

* Drupal 9 (requires [enabling CKEditor 5](https://www.drupal.org/docs/core-modules-and-themes/core-modules/experimental-ckeditor-5/installation-and-configuration-of-ckeditor-5-module-on-drupal-9))
* Drupal 10

## Requirements

* PHP 8.0+
* Drupal 9.4 with CKEditor 5 enabled
* Drupal 10

## Installation and configuration

Please refer to the [Adding CKEditor 5 Premium features module to Drupal 10](https://www.drupal.org/docs/contributed-modules/ckeditor-5-premium-features/how-to-install-and-set-up-the-module) guide in Drupal Documentation for details on how to install and set up the module.
