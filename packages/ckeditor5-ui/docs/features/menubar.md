---
title: Menu bar
category: features-toolbar
meta-title: Menu bar | CKEditor 5 Documentation
order: 30
---
{@snippet features/build-menubar-source}

# Menu bar

The toolbar is the most basic user interface element of CKEditor&nbsp;5 that gives you the convenient access to all editing options. The menu bar gives you easy access to the plethora of functions, while maintaining a clear, tidy and highly effective toolbar offering just the most important features at hand. This familiar experience popular in large editing desktop and online packages improves usability and efficiency.

## Demo

Below is a demo presenting a sample menu bar for an editor with a basic set of features.

{@snippet features/menubar-basic}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

The menu bar will be automatically filled with features available in the editor and present in the [default preset](#default-menu-bar-preset). If some of the defaults are not installed (like in the demo above), they will simply not be displayed.

You can easily remove some of the presets or add more items, including menu items for custom features. The structure can also be arranged to suit particular needs.

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

If not all these plugins are added to the editor, the missing items will simply not display in the menu.

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
