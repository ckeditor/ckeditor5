---
title: Fullscreen mode
menu-title: Fullscreen mode
meta-title: Fullscreen mode | CKEditor 5 Documentation
meta-description: The fullscreen mode lets you expand the editor to the whole browser viewport to comfortably edit content and use editor's UI features.
category: features
modified_at: 2025-04-28
---

The fullscreen mode lets you temporarily expand the editor to the whole browser viewport, giving you more space to comfortably edit content and use editor's UI features.

## Demo

Use the fullscreen mode toolbar button {@icon @ckeditor/ckeditor5-icons/theme/icons/fullscreen-enter.svg Enter fullscreen mode} in the editor below to see the feature in action. Once you enter the fullscreen mode, you will notice the following changes:

* Editor UI is stretched to the whole browser viewport.
* Menu bar is visible by default, regardless of its presence outside fullscreen.
* The editor editable area dimensions are changed.
* Some dialogs are re-positioned to better utilize the increased space.
* Website scroll is disabled.
* Annotations display mode is switched to wide sidebar (this affects only annotations UIs without filter function configured).

Fullscreen mode can also be toggled using the <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>F</kbd> (or <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>F</kbd>) keystroke.

{@snippet features/fullscreen-default}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Installation

<info-box info>
	⚠️ **New import paths**

	Starting with {@link updating/update-to-42 version 42.0.0}, we changed the format of import paths. This guide uses the new, shorter format. Refer to the {@link getting-started/legacy-getting-started/legacy-imports Packages in the legacy setup} guide if you use an older version of CKEditor&nbsp;5.
</info-box>

After {@link getting-started/integrations-cdn/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration:

<code-switcher>
```js
import { ClassicEditor, Fullscreen } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Fullscreen, /* ... */ ],
		toolbar: [ 'fullscreen', /* ... */ ]
		fullscreen: {
			// Configuration.
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

## Supported editor types

Fullscreen mode is ready-to-use for {@link getting-started/setup/editor-types#classic-editor classic} and {@link getting-started/setup/editor-types#decoupled-editor-document decoupled} editors. If you want to use it with other editor type, you can use custom callbacks to adjust the layout according to your needs. See the details in the [Enabling other editor types](#enabling-other-editor-types) section.

## Configuration

Fullscreen mode is designed to provide a great editing experience without requiring any additional effort from the integrator. It provides integration with most of the official CKEditor 5 features out-of-the-box, detecting which of them are available. At the same time, it is possible to fully customize how the fullscreen mode is displayed, either through configuration flags, custom CSS definitions or by providing a custom callback that will execute more complex changes.

### Menu bar visibility

By default, menu bar is visible in fullscreen mode for any [supported editor type](#supported-editor-types), regardless of their original configuration. To disable it, use the `config.fullscreen.menuBar.isVisible` option:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		fullscreen: {
			menuBar: {
				isVisible: false
			}
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

Note that this setting does not change the original behavior defined in `config.menuBar.isVisible` configuration option.

### Toolbar grouping

Toolbar grouping in fullscreen mode will behave the same as outside it. To define the behavior explicitly, use `config.fullscreen.toolbar.shouldNotGroupWhenFull` option:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		fullscreen: {
			toolbar: {
				shouldNotGroupWhenFull: true
			}
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

Note that this setting does not change the original behavior defined in `config.toolbar.shouldNotGroupWhenFull` configuration option.

### Using a custom container

If you want to use the fullscreen mode to enhance the editing experience but there are still some elements in your website layout that should stay visible, you can pass a custom container for the editor in fullscreen mode using `config.fullscreen.container` property. The editor will be resized to match the size of the provided container.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		fullscreen: {
			container: document.querySelector( '.fullscreen-editor-container' )
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

When using a custom container, the website scroll will not be locked to allow for accessing the rest of the website content.

<info-box>
	For more technical details, please check the {@link module:fullscreen/fullscreenconfig~FullscreenConfig plugin configuration API}.
</info-box>

## Further customization

Besides basic configuration, it is possible to do virtually any changes to the fullscreen mode layout using CSS and custom configurable callbacks.

### Basic template

To change the component styling (like editable area width or background color), you can use the CSS classes (precede each with `.ck.ck-fullscreen__main-wrapper` selector to ensure enough CSS specificity):

* `ck-fullscreen__top-wrapper` - top wrapper holding the menu bar and toolbar.
* `ck-fullscreen__menu-bar` - container with menu bar.
* `ck-fullscreen__toolbar` - container with toolbar.
* `ck-fullscreen__editable-wrapper` - container with sidebars and editable area.
* `ck-fullscreen__sidebar` - this class is assigned to both left and right sidebar.
* `ck-fullscreen__left-sidebar` - class that only left sidebar has.
* `ck-fullscreen__right-sidebar` - class that only right sidebar has.
* `ck-fullscreen__editable` - container with the editable area.
* `ck-fullscreen__bottom-wrapper` - empty container that can be used for footer-like features.

### Callbacks

If you want to display some additional elements in the fullscreen mode, set the `config.fullscreen.onEnterCallback` and `config.fullscreen.onLeaveCallback` properties.

`onEnterCallback( container )` is fired when you enter fullscreen mode. Passed parameter is the final DOM element container generated by the default fullscreen behavior. It contains the whole fullscreen mode DOM structure, already set up (the editor UI is already injected into the container). You are free to perform any changes, for example, relocate sidebars or append additional UI elements.

`onLeaveCallback( container )` is fired when you leave fullscreen mode. Passed parameter is the container with the fullscreen mode DOM structure. The callback should be used to take care of any of your custom components, for example, if some elements were moved to the fullscreen DOM structure, restore their original locations in the DOM.

### Demo - customized layout: pageless editor

Below you will find a customized demo:

* Instead of occupying the whole viewport, the editor is stretched only over the main website area, not covering top and side navigation bars.
* The "piece of paper" view is replaced by the "pageless" view, replicating the {@link getting-started/setup/editor-types#classic-editor classic editor} experience.
* Menu bar is not displayed.

{@snippet features/fullscreen-pageless}

### Enabling other editor types

This section covers how to provide fullscreen mode integration for other {@link getting-started/setup/editor-types editor types} than classic and decoupled. Please note that only these two editor types are officially supported, so the code snippets below are exemplary and may not solve all technical challenges.

First, you need to create a custom class extending {@link module:fullscreen/handlers/abstracteditorhandler~AbstractEditorHandler `AbstractEditorHandler`}. Besides the optional typing improvements, the most important thing is to implement its custom {@link module:fullscreen/handlers/abstracteditorhandler~AbstractEditorHandler#defaultOnEnter `#defaultOnEnter()`} method. It should move the editor UI elements proper for your editor type to the fullscreen container, preferably using {@link module:fullscreen/handlers/abstracteditorhandler~AbstractEditorHandler#moveToFullscreen `#moveToFullscreen()`} helper - it will assure the elements are moved back in DOM when leaving fullscreen mode.

Then, in the editor's `toggleFullscreen` command, you will need to substitute the {@link module:fullscreen/fullscreencommand~FullscreenCommand#fullscreenHandler `#fullscreenHandler`} property with an instance of your custom class. It can be done by adding a custom plugin that should be later added to the editor configuration (see the full example below).

```ts
import { AbstractEditorHandler, FullscreenEditing } from '@ckeditor/ckeditor5-fullscreen';
import { Plugin } from 'ckeditor5/src/core';

class CustomEditorHandler extends AbstractEditorHandler {
	// It's not mandatory to override `#_editor` property, but that will help TypeScript to properly handle the class.
	// Skip if you are not using TS.
	protected override readonly _editor: CustomEditorClass;

	// Assign the custom editor class.
	constructor( editor: CustomEditorClass ) {
		super( editor );

		this._editor = editor;
	}

	public override defaultOnEnter() {
		// Implement your fullscreen logic here.
		// For DOM manipulation, use `this.moveToFullscreen()` helper to ensure the elements are properly cleaned up
		// after leaving fullscreen mode.
	}
}

class CustomFullscreenHandling extends Plugin {
	// Ensure 'toggleFullscreen' command, registered in `FullscreenEditing` plugin, is already available in the editor.
	public static get requires() {
		return [ FullscreenEditing ] as const;
	}

	init() {
		// Substitute the default editor handler with a custom one.
		this.editor.commands.get( 'toggleFullscreen' ).fullscreenHandler = new CustomEditorHandler( this.editor );
	}
}

CustomEditorClass
	.create( document.querySelector( '#editor' ), {
		// Other configuration options.
		plugins: [ Fullscreen, CustomFullscreenHandling,
			// Other plugins.
		]
	} );
```

## Related features

Here are some CKEditor&nbsp;5 features that are a perfect match for fullscreen mode:

* {@link features/document-outline Document outline} &ndash; Display the list of all document headings next to the editing area.
* {@link features/track-changes Track changes} &ndash; Mark user changes in the content and show them as suggestions in the sidebar for acceptance or rejection.
* {@link features/real-time-collaboration Real-time collaboration} &ndash; Work on the same document with other users simultaneously.

## Common API

The fullscreen plugin registers:

* the `fullscreen` UI button components for toolbar and menu bar,
* the `toggleFullscreen` command.

You can execute the command using the {@link module:core/editor/editor~Editor#execute `editor.execute()`} method:


```js
// Toggle the fullscreen mode.
editor.execute( 'toggleFullscreen' );
```

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-fullscreen](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-fullscreen).
