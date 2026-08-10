---
category: ckeditor4-migration
menu-title: Troubleshooting
meta-title: Migration from CKEditor 4 - Troubleshooting | CKEditor 5 Documentation
meta-description: Overcoming possible obstacles during your migration to CKEditor 5.
order: 50
modified_at: 2026-08-05
---

# Troubleshooting migration from CKEditor 4

This article describes some issues that you may encounter when migrating from CKEditor 4 to CKEditor&nbsp;5.

## Why does the editor filter out my content (styles, classes, elements)? Where is `config.allowedContent = true`?

Unlike [CKEditor 4](https://ckeditor.com/ckeditor-4/), CKEditor&nbsp;5 implements a custom {@link framework/architecture/editing-engine data model}. This means that every piece of content that is loaded into the editor needs to be converted to that model and then rendered back to the view.

Each kind of content must be handled by a dedicated plugin. For instance, the [`ckeditor5-basic-styles`](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles) package handles HTML elements such as `<b>`, `<i>`, `<u>`, etc. along with their representation in the model. The feature defines the two–way conversion between the HTML (view) and the editor model. Content that none of the enabled features recognizes is dropped.

There is no equivalent of `config.allowedContent = true`. To keep your content, consider the following options, starting with the least amount of work:

1. **Enable the feature that handles the markup.** Some content is dropped only because the matching plugin is missing from your setup. Refer to the {@link updating/migration-from-ckeditor-4#migrating-existing-data Migrating existing data} section of the migration guide for legacy markup that CKEditor&nbsp;5 maps once the right plugins are loaded.
2. **Use the {@link features/general-html-support General HTML Support} feature.** It preserves elements, classes, attributes, and styles that no feature covers, and it requires no code.
3. **Write a plugin.** For markup that needs actual editing behavior rather than preservation, implement the conversion yourself. Refer to the {@link framework/architecture/plugins#creating-plugins Creating plugins} section.

## What happened to the `contents.css` file? How do I style the content of the editor?

There is no such thing as the `contents.css` file anymore. This is because in CKEditor&nbsp;5 the features bring their own content styles, {@link getting-started/setup/css provided via CSS files}.

## Where are the `editor.insertHtml()` and `editor.insertText()` methods? How to insert some content?

Refer to {@link framework/how-tos#how-to-insert-some-content-into-the-editor this CKEditor&nbsp;5 How-to question}.

## What happened to the global `window.CKEDITOR`? How to list all instances of the editor?

Refer to {@link framework/how-tos#how-to-list-all-instances-of-the-editor this CKEditor&nbsp;5 How-to question}.
