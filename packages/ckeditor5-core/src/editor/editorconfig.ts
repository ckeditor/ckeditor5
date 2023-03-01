/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module core/editor/editorconfig
 */

import type Context from '../context';
import type { PluginConstructor } from '../plugin';
import type Editor from './editor';

/**
 * CKEditor configuration options.
 *
 * An object defining the editor configuration can be passed when initializing the editor:
 *
 * ```ts
 * EditorClass
 * 	.create( {
 * 		toolbar: [ 'bold', 'italic' ],
 * 		image: {
 * 			styles: [
 * 				...
 * 			]
 * 		}
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * Check the {@glink installation/getting-started/predefined-builds Configuration} guide for more information
 * about setting configuration options.
 */
export interface EditorConfig {
	context?: Context;

	/**
	 * The list of additional plugins to load along those already available in the
	 * {@glink installation/getting-started/predefined-builds editor build}. It extends the {@link #plugins `plugins`} configuration.
	 *
	 * ```ts
	 * function MyPlugin( editor ) {
	 * 	// ...
	 * }
	 *
	 * const config = {
	 * 	extraPlugins: [ MyPlugin ]
	 * };
	 * ```
	 *
	 * **Note:** This configuration works only for simple plugins which utilize the
	 * {@link module:core/plugin~PluginInterface plugin interface} and have no dependencies. To extend a
	 * build with complex features, create a
	 * {@glink installation/getting-started/quick-start-other#creating-custom-builds-with-online-builder custom build}.
	 *
	 * **Note:** Make sure you include the new features in you toolbar configuration. Learn more
	 * about the {@glink features/toolbar/toolbar toolbar setup}.
	 */
	extraPlugins?: Array<PluginConstructor<Editor>>;

	/**
	 * The initial editor data to be used instead of the provided element's HTML content.
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( document.querySelector( '#editor' ), {
	 * 		initialData: '<h2>Initial data</h2><p>Foo bar.</p>'
	 * 	} )
	 * 	.then( ... )
	 * 	.catch( ... );
	 * ```
	 *
	 * By default, the editor is initialized with the content of the element on which this editor is initialized.
	 * This configuration option lets you override this behavior and pass different initial data.
	 * It is especially useful if it is difficult for your integration to put the data inside the HTML element.
	 *
	 * If your editor implementation uses multiple roots, you should pass an object with keys corresponding to the editor
	 * roots names and values equal to the data that should be set in each root:
	 *
	 * ```ts
	 * MultiRootEditor.create(
	 * 	// Roots for the editor:
	 * 	{
	 * 		header: document.querySelector( '#header' ),
	 * 		content: document.querySelector( '#content' ),
	 * 		leftSide: document.querySelector( '#left-side' ),
	 * 		rightSide: document.querySelector( '#right-side' )
	 * 	},
	 * 	// Config:
	 * 	{
	 * 		initialData: {
	 * 			header: '<p>Content for header part.</p>',
	 * 			content: '<p>Content for main part.</p>',
	 * 			leftSide: '<p>Content for left-side box.</p>',
	 * 			rightSide: '<p>Content for right-side box.</p>'
	 * 		}
	 * 	}
	 * )
	 * .then( ... )
	 * .catch( ... );
	 * ```
	 *
	 * See also {@link module:core/editor/editor~Editor.create Editor.create()} documentation for the editor implementation which you use.
	 *
	 * **Note:** If initial data is passed to `Editor.create()` in the first parameter (instead of a DOM element), and,
	 * at the same time, `config.initialData` is set, an error will be thrown as those two options exclude themselves.
	 *
	 * If `config.initialData` is not set when the editor is initialized, the data received in `Editor.create()` call
	 * will be used to set `config.initialData`. As a result, `initialData` is always set in the editor's config and
	 * plugins can read and/or modify it during initialization.
	 */
	initialData?: string | Record<string, string>;

	/**
	 * The language of the editor UI and its content.
	 *
	 * Note: You do not have to specify this option if your build is optimized for one UI language or if it is
	 * the default language (English is the default language for CDN builds), unless you want to change
	 * the language of your content.
	 *
	 * Simple usage (change the language of the UI and the content):
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( document.querySelector( '#editor' ), {
	 * 		// The UI of the editor as well as its content will be in German.
	 * 		language: 'de'
	 * 	} )
	 * 	.then( editor => {
	 * 		console.log( editor );
	 * 	} )
	 * 	.catch( error => {
	 * 		console.error( error );
	 * 	} );
	 * ```
	 *
	 * Use different languages for the UI and the content using the {@link module:core/editor/editorconfig~LanguageConfig configuration}
	 * syntax:
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( document.querySelector( '#editor' ), {
	 * 		language: {
	 * 			// The UI will be in English.
	 * 			ui: 'en',
	 *
	 * 			// But the content will be edited in Arabic.
	 * 			content: 'ar'
	 * 		}
	 * 	} )
	 * 	.then( editor => {
	 * 		console.log( editor );
	 * 	} )
	 * 	.catch( error => {
	 * 		console.error( error );
	 * 	} );
	 * ```
	 *
	 * The language of the content has an impact on the editing experience, for instance it affects screen readers
	 * and spell checkers. It is also particularly useful for typing in certain languages (e.g. right–to–left ones)
	 * because it changes the default alignment of the text.
	 *
	 * The language codes are defined in the [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) standard.
	 *
	 * You need to add the corresponding translation file for the new UI language to work.
	 * Translation files are available on CDN for predefined builds:
	 *
	 * ```html
	 * `<script src="https://cdn.ckeditor.com/ckeditor5/[version.number]/[distribution]/lang/[lang].js"></script>`
	 * ```
	 *
	 * But you can add them manually by coping from the `node_modules/@ckeditor/ckeditor5-build-[name]/build/lang/[lang].js'`.
	 *
	 * Check the {@glink features/ui-language UI language} guide for more information about the localization options and translation
	 * process.
	 */
	language?: string | LanguageConfig;

	/**
	 * Specifies the text displayed in the editor when there is no content (editor is empty). It is intended to
	 * help users locate the editor in the application (form) and prompt them to input the content. Work similarly
	 * as to the native DOM
	 * [`placeholder` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#The_placeholder_attribute)
	 * used by inputs.
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( document.querySelector( '#editor' ), {
	 * 		placeholder: 'Type some text...'
	 * 	} )
	 * 	.then( ... )
	 * 	.catch( ... );
	 * ```
	 *
	 * If your editor implementation uses multiple roots, you should pass an object with keys corresponding to the editor
	 * roots names and values equal to the placeholder that should be set in each root:
	 *
	 * ```ts
	 * MultiRootEditor.create(
	 * 	// Roots for the editor:
	 * 	{
	 * 		header: document.querySelector( '#header' ),
	 * 		content: document.querySelector( '#content' ),
	 * 		leftSide: document.querySelector( '#left-side' ),
	 * 		rightSide: document.querySelector( '#right-side' )
	 * 	},
	 * 	// Config:
	 * 	{
	 * 		placeholder: {
	 * 			header: 'Type header...',
	 * 			content: 'Type content...',
	 * 			leftSide: 'Type left-side...',
	 * 			rightSide: 'Type right-side...'
	 * 		}
	 * 	}
	 * )
	 * .then( ... )
	 * .catch( ... );
	 * ```
	 *
	 * The placeholder text is displayed as a pseudo–element of an empty paragraph in the editor content.
	 * The paragraph has the `.ck-placeholder` CSS class and the `data-placeholder` attribute.
	 *
	 * ```html
	 * <p data-placeholder="Type some text..." class="ck-placeholder">
	 * 	::before
	 * </p>
	 * ```
	 *
	 * **Note**: Placeholder text can also be set using the `placeholder` attribute if a `<textarea>` is passed to
	 * the `create()` method, e.g. {@link module:editor-classic/classiceditor~ClassicEditor.create `ClassicEditor.create()`}.
	 *
	 * **Note**: This configuration has precedence over the value of the `placeholder` attribute of a `<textarea>`
	 * element passed to the `create()` method.
	 *
	 * See the {@glink features/editor-placeholder "Editor placeholder"} guide for more information and live examples.
	 */
	placeholder?: string | Record<string, string>;

	/**
	 * The list of plugins to load.
	 *
	 * If you use an {@glink installation/getting-started/predefined-builds editor build} you can define the list of plugins to load
	 * using the names of plugins that are available:
	 *
	 * ```ts
	 * const config = {
	 * 	plugins: [ 'Bold', 'Italic', 'Typing', 'Enter', ... ]
	 * };
	 * ```
	 *
	 * You can check the list of plugins available in a build using this snippet:
	 *
	 * ```ts
	 * ClassicEditor.builtinPlugins.map( plugin => plugin.pluginName );
	 * ```
	 *
	 * If you use an editor creator directly (imported from a package like `@ckeditor/ckeditor5-editor-classic`) or you
	 * want to load additional plugins which were not included in a build you use, then you need to specify
	 * the plugins using their constructors:
	 *
	 * ```ts
	 * // A preset of plugins is a plugin as well.
	 * import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
	 * // The bold plugin.
	 * import Bold from '@ckeditor/ckeditor5-editor-basic-styles/src/bold';
	 *
	 * const config = {
	 * 	plugins: [ Essentials, Bold ]
	 * };
	 * ```
	 *
	 * **Note:** To load additional plugins, you should use the {@link #extraPlugins `extraPlugins`} configuration.
	 * To narrow the list of loaded plugins, use the {@link #removePlugins `removePlugins`} configuration.
	 */
	plugins?: Array<PluginConstructor<Editor> | string>;

	/**
	 * The list of plugins which should not be loaded despite being available in an {@glink installation/getting-started/predefined-builds
 * editor build}.
	 *
	 * ```ts
	 * const config = {
	 * 	removePlugins: [ 'Bold', 'Italic' ]
	 * };
	 * ```
	 *
	 * **Note:** Be careful when removing plugins using `config.removePlugins` from CKEditor builds.
	 * If removed plugins were providing toolbar buttons, the default toolbar configuration included in a build
	 * will become invalid. In such case you need to provide the updated
	 * {@link module:core/editor/editorconfig~EditorConfig#toolbar toolbar configuration}.
	 */
	removePlugins?: Array<PluginConstructor<Editor> | string>;

	substitutePlugins?: Array<PluginConstructor<Editor>>;

	/**
	 * The editor toolbar configuration.
	 *
	 * Simple format (specifies only toolbar items):
	 *
	 * ```ts
	 * const config = {
	 * 	toolbar: [ 'bold', 'italic', '|', 'undo', 'redo' ]
	 * };
	 * ```
	 *
	 * Extended format:
	 *
	 * ```ts
	 * const config = {
	 * 	toolbar: {
	 * 		items: [ 'bold', 'italic', '|', 'undo', 'redo', '-', 'numberedList', 'bulletedList' ],
	 *
	 * 		shouldNotGroupWhenFull: true
	 * 	}
	 * };
	 * ```
	 *
	 * Options which can be set using the extended format:
	 *
	 * * **`toolbar.items`** &ndash; An array of toolbar item names. The components (buttons, dropdowns, etc.) which can be used
	 *	as toolbar items are defined in `editor.ui.componentFactory` and can be listed using the following snippet:
	 *
	 *	```ts
	 *	Array.from( editor.ui.componentFactory.names() );
	 *	```
	 *
	 *	You can also use `'|'` to create a separator between groups of items:
	 *
	 *	```
	 *	toolbar: [ 'bold', 'italic', '|', 'undo', 'redo' ]
	 *	```
	 *
	 * or `'-'` to make a line break and render items in multiple lines:
	 *
	 *	```
	 *	toolbar: [ 'bold', 'italic', '-', 'undo', 'redo' ]
	 *	```
	 *
	 *	Line break will work only in the extended format when `shouldNotGroupWhenFull` option is set to `true`.
	 *
	 *	**Note**: To save space in your toolbar, you can group several items into a dropdown:
	 *
	 *	```
	 *	toolbar: [
	 *		{
	 *			label: 'Basic styles',
	 *			icon: 'text',
	 *			items: [ 'bold', 'italic', ... ]
	 *		},
	 *		'|',
	 *		'undo', 'redo'
	 *	]
	 *	```
	 *
	 *	The code above will create a "Basic styles" dropdown with a "text" icon containing the "bold" and "italic" buttons.
	 *	You can customize the look of the dropdown by setting the `withText`, `icon`, and `tooltip` properties:
	 *
	 *	* **Displaying a label**
	 *
	 *		For instance, to hide the icon and to display the label only, you can use the following configuration:
	 *
	 *		```ts
	 *		{
	 *			label: 'Basic styles',
	 *			// Show the textual label of the drop-down. Note that the "icon" property is not configured.
	 *			withText: true,
	 *			items: [ 'bold', 'italic', ... ]
	 *		}
	 *		```
	 *
	 *	* **Selecting an icon**
	 *
	 *		You can use one of the common icons provided by the editor (`'bold'`, `'plus'`, `'text'`, `'importExport'`, `'alignLeft'`,
	 *		`'paragraph'`, `'threeVerticalDots'`):
	 *
	 *		```ts
	 *		{
	 *			label: '...',
	 *			// A "plus" sign icon works best for content insertion tools.
	 *			icon: 'plus',
	 *			items: [ ... ]
	 *		}
	 *		```
	 *
	 *		If no icon is specified, `'threeVerticalDots'` will be used as a default:
	 *
	 *		```ts
	 *		// No icon specified, using a default one.
	 *		{
	 *			label: 'Default icon',
	 *			items: [ ... ]
	 *		}
	 *		```
	 *
	 *		If `icon: false` is configured, no icon will be displayed at all and the text label will show up instead:
	 *
	 *		```ts
	 *		// This drop-down has no icon. The text label will be displayed instead.
	 *		{
	 *			label: 'No icon',
	 *			icon: false,
	 *			items: [ ... ]
	 *		}
	 *		```
	 *
	 *		You can also set a custom icon for the drop-down by passing an SVG string:
	 *
	 *		```ts
	 *		{
	 *			label: '...',
	 *			// If you want your icon to change the color dynamically (e.g. when the dropdown opens), avoid fill="..."
	 *			// and stroke="..." styling attributes. Use solid shapes and avoid paths with strokes.
	 *			icon: '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">...</svg>',
	 *			items: [ ... ]
	 *		}
	 *		```
	 *
	 *	* **Customizing the tooltip**
	 *
	 *		By default, the tooltip of the button shares its text with the label. You can customize it to better describe your dropdown
	 *		using the `tooltip` property ({@link module:ui/button/buttonview~ButtonView#tooltip learn more}):
	 *
	 *		```ts
	 *		{
	 *			label: 'Drop-down label',
	 *			tooltip: 'Custom tooltip of the drop-down',
	 *			icon: '...',
	 *			items: [ ... ]
	 *		}
	 *		```
	 *
	 * * **`toolbar.viewportTopOffset` (deprecated)** &ndash; The offset (in pixels) from the top of the viewport used when positioning a
	 *	sticky toolbar.
	 *	Useful when a page with which the editor is being integrated has some other sticky or fixed elements
	 *	(e.g. the top menu). Thanks to setting the toolbar offset the toolbar will not be positioned underneath or above the page's UI.
	 *
	 *	**This property has been deprecated and will be removed in the future versions of CKEditor. Please use
	 *	`{@link module:core/editor/editorconfig~EditorConfig#ui EditorConfig#ui.viewportOffset}` instead.**
	 *
	 * * **`toolbar.shouldNotGroupWhenFull`** &ndash; When set to `true`, the toolbar will stop grouping items
	 *	and let them wrap to the next line if there is not enough space to display them in a single row.
	 */
	toolbar?: ToolbarConfig;

	/**
	 * The editor UI configuration.
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( document.querySelector( '#editor' ), {
	 * 		ui: { ... }
	 * 	} )
	 * 	.then( ... )
	 * 	.catch( ... );
	 * ```
	 *
	 * Options which can be set using the UI config:
	 *
	 * * **`ui.viewportOffset`** &ndash; The offset (in pixels) of the viewport from every direction used when positioning a sticky toolbar
	 * or other absolutely positioned UI elements.
	 * Useful when a page with which the editor is being integrated has some other sticky or fixed elements
	 * (e.g. the top menu). Thanks to setting the UI viewport offset the toolbar and other contextual balloons will not be positioned
	 * underneath or above the page's UI.
	 *
	 * ```ts
	 * ui: {
	 * 	viewportOffset: { top: 10, right: 10, bottom: 10, left: 10 }
	 * }
	 * ```
	 *
	 * 	**Note:** If you want to modify the viewport offset in runtime (after editor was created), you can do that by overriding
	 * {@link module:ui/editorui/editorui~EditorUI#viewportOffset `editor.ui.viewportOffset`}.
	 */
	ui?: UiConfig;

	/**
	 * Enables updating the source element after the editor destroy.
	 *
	 * Enabling this option might have some security implications, as the editor doesn't have control over all data
	 * in the output.
	 *
	 * Be careful, especially while using
	 * {@glink features/markdown Markdown}, {@glink features/html/general-html-support General HTML Support} or
	 * {@glink features/html/html-embed HTML embed} features.
	 */
	updateSourceElementOnDestroy?: boolean;
}

/**
 * The `config.initialData` option cannot be used together with initial data passed as the first parameter of
 * {@link module:core/editor/editor~Editor.create `Editor.create()`}.
 *
 * @error editor-create-initial-data
 */

/**
 * The configuration of the editor language.
 *
 * ```ts
 * ClassicEditor
 * 	.create( document.querySelector( '#editor' ), {
 * 		language: ... // Editor language configuration.
 * 	} )
 * 	.then( editor => {
 * 		console.log( editor );
 * 	} )
 * 	.catch( error => {
 * 		console.error( error );
 * 	} );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 */
export interface LanguageConfig {

	/**
	 * Allows to use different language for the editor UI.
	 *
	 * The language codes are defined in the [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) standard.
	 */
	ui?: string;

	/**
	 * Allows to use different language of the editor content.
	 *
	 * The language codes are defined in the [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) standard.
	 */
	content?: string;
}

export type ToolbarConfig = Array<ToolbarConfigItem> | {
	items?: Array<ToolbarConfigItem>;
	removeItems?: Array<string>;
	shouldNotGroupWhenFull?: boolean;
};

export type ToolbarConfigItem = string | {
	items: Array<ToolbarConfigItem>;
	label: string;
	icon?: string | false;
	withText?: boolean;
	tooltip?: boolean | string | ( ( label: string, keystroke: string | undefined ) => string );
};

export interface UiConfig {
	viewportOffset?: {
		bottom?: number;
		left?: number;
		right?: number;
		top?: number;
	};
}
