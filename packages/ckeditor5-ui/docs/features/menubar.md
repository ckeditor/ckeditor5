---
title: Menu bar
category: features-toolbar
meta-title: Menu bar | CKEditor 5 Documentation
order: 30
---
{@snippet features/build-menubar-source}

# Menu bar

The toolbar is the most basic user interface element of CKEditor&nbsp;5 that gives you convenient access to all its features. It has buttons and dropdowns that you can use to format, manage, insert, and change elements of your content.

## Demo

Below is a sample menu bar with a basic set of features. Menu items can be easily added or removed. Read on to learn how to do that.

{@snippet features/menubar-basic}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Configuration

### Enabling the menu bar

<info-box>
	The menu bar is currently only available in the {@link examples/builds/classic-editor Classic editor} and {@link examples/builds/document-editor Document editor}. Setting the `config.menuBar` configuration for other editor types will have no effect.
</info-box>

The menu bar is disabled by default. To make it available in your editor, use set the `isVisible` setting to `true`. This will turn on the menu bar with a default set of features.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		toolbar: [ 'undo', 'redo', 'bold', 'italic', 'numberedList', 'bulletedList' ],
		menuBar: {
			isVisible: true
		}
	} )
	.catch( error => {
		console.log( error );
	} );
```
### Default menu bar preset

The menu bar comes with a {@link module:ui/menubar/utils#DefaultMenuBarItems predefined set of features} for convenience.

<info-box>
	If not all these plugins are added to the editor, the missing items will simply not display in the menu.
</info-box>

The default preset contains the following menu items:

* File
Export to PDF, Export to Word, Import from Word, Revision history
* Edit
Undo, Redo, Select all, Find and replace
* View
Source editing, Show block, Editable region
* Insert
Image upload, Open CKBox, Open CKFinder, Insert table, Insert link, Comment, Template, Block quote, Code block, Embed HTML, Horizontal line, Page break, Table of contents, Restricted editing
* Format
Bold, Italic, Underline, Strikethrough, Superscript, Subscript, Code, Text part language, Font size, Font Family, Font color, Font background color, Unordered list, Ordered list, To-do list, Alignment, Indent, Outdent, Case change, Remove format
* Tools
AI Assistant, AI commands, Track changes, Comment archive
* Help
Accessibility help

<!-- We may decide to rewrite the API instructions into this guide -->
### The editor menu bar configuration

The menu bar can be configured using the `config.menuBar` option and its `config.menuBar.removeItems` and `config.menuBar.addItems` properties. Please refer to the {@link module:core/editor/editorconfig~EditorConfig#menuBar `config.menuBar` API documentation} for details on how to do it.

<info-box warning>
	Before adding a feature to the menu bar, make sure the plugin for that feature is imported into the editor.
</info-box>

<!-- 
## Common API

The menu bar feature registers the followings components:
-->

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-ui](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-ui).
