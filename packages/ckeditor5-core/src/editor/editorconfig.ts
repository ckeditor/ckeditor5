/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module core/editor/editorconfig
 */

import type { ArrayOrItem, Translations } from '@ckeditor/ckeditor5-utils';
import type Context from '../context.js';
import type { PluginConstructor } from '../plugin.js';
import type Editor from './editor.js';
import type { MenuBarConfig } from '@ckeditor/ckeditor5-ui';

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
 */
export interface EditorConfig {
	context?: Context;

	/**
	 * The list of additional plugins to load along those already available in the
	 * editor. It extends the {@link #plugins `plugins`} configuration.
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
	 * build with complex features, try [CKEditr 5 Builder](https://ckeditor.com/ckeditor-5/builder?redirect=docs).
	 *
	 * **Note:** Make sure you include the new features in you toolbar configuration. Learn more
	 * about the {@glink getting-started/setup/toolbar toolbar setup}.
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
	 * Translation files are available on CDN:
	 *
	 * ```html
	 * <script type="importmap">
	 * {
	 *   "imports": {
	 *     "ckeditor5": "https://cdn.ckeditor.com/ckeditor5/<VERSION>/ckeditor5.js",
	 *     "ckeditor5/": "https://cdn.ckeditor.com/ckeditor5/<VERSION>/"
	 *   }
	 * }
	 * </script>
	 * <script type="module">
	 * import { ClassicEditor, Essentials, Paragraph } from 'ckeditor5';
	 * import translations from 'ckeditor5/dist/translations/pl.js';
	 *
	 * await ClassicEditor.create( document.querySelector( '#editor' ), {
	 *   plugins: [
	 *     Essentials,
	 *     Paragraph,
	 *   ],
	 *   toolbar: {
	 *     items: [ 'undo', 'redo' ]
	 *   },
	 *   translations
	 * } );
	 * </script>
	 * ```
	 *
	 * You can add translation using NPM as well.
	 *
	 * ```html
	 * import { ClassicEditor, Essentials, Paragraph } from 'ckeditor5';
	 * import translations from 'ckeditor5/dist/translations/pl.js';
	 *
	 * import 'ckeditor5/dist/styles.css';
	 *
	 * await ClassicEditor.create( document.querySelector( '#editor' ), {
	 *   plugins: [
	 *     Essentials,
	 *     Paragraph,
	 *   ],
	 *   toolbar: {
	 *     items: [ 'undo', 'redo' ]
	 *   },
	 *   translations
	 * } );
	 * ```
	 *
	 * Check the {@glink getting-started/setup/ui-language UI language} guide for more information about
	 * the localization options and translation process.
	 */
	language?: string | LanguageConfig;

	/**
	 * The editor menu bar configuration.
	 *
	 * **Note**: The menu bar is not available in all editor types. Currently, only the
	 * {@link module:editor-classic/classiceditor~ClassicEditor Classic editor} and
	 * {@link module:editor-decoupled/decouplededitor~DecoupledEditor Decoupled editor}
	 * support this feature. Setting the `config.menuBar` configuration for other editor types will have no effect.
	 *
	 * In Classic editor, the menu bar is hidden by default. Set the `isVisible` configuration flag to `true` in order to show it:
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( document.querySelector( '#editor' ), {
	 * 		menuBar: {
	 * 			isVisible: true
	 * 		}
	 * 	} )
	 * 	.then( ... );
	 * ```
	 *
	 * When using the Decoupled editor, you will need to insert the menu bar in a desired place yourself. For example:
	 *
	 * ```ts
	 * DecoupledEditor
	 * 	.create( document.querySelector( '#editor' ), {
	 * 		toolbar: [ 'undo', 'redo', 'bold', 'italic', 'numberedList', 'bulletedList' ],
	 * 	} )
	 *  .then( editor => {
	 * 		document.getElementById( '#menuBarContainer' ).appendChild( editor.ui.view.menuBarView.element );
	 * 	} );
	 * ```
	 *
	 * **Note**: You do not have to set the `items` property in this configuration in order to use the menu bar.
	 * By default, a {@link module:ui/menubar/utils#DefaultMenuBarItems default set of items} is used that already includes
	 * **all core editor features**. For your convenience, there are `config.menuBar.addItems` and
	 * `config.menuBar.removeItems` options available that will help you adjust the default configuration without setting the
	 * entire menu bar structure from scratch (see below).
	 *
	 * **Removing items from the menu bar**
	 *
	 * You can use the `config.menuBar.removeItems` option to remove items from the default menu bar configuration. You can
	 * remove individual buttons (e.g. "Bold" or "Block quote"), item groups (e.g. the basic styles section that
	 * includes multiple buttons such as "Bold", "Italic", "Underline", etc.), or whole menus (e.g. the "Insert" menu). Please
	 * refer to the {@link module:ui/menubar/utils#DefaultMenuBarItems default configuration} to see default buttons/groups/menus
	 * and their structure.
	 *
	 * To remove individual buttons from the menu bar:
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( document.querySelector( '#editor' ), {
	 * 		menuBar: {
	 * 			// Removes "Bold" and "Block quote" buttons from their respective menus.
	 * 			removeItems: [ 'menuBar:bold', 'menuBar:blockQuote' ]
	 * 		}
	 * 	} )
	 * 	.then( ... );
	 * ```
	 *
	 * To remove a group of buttons from the menu bar:
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( document.querySelector( '#editor' ), {
	 * 		menuBar: {
	 * 			// Removes the entire basic styles group ("Bold", "Italic", "Underline", etc.) from the "Format" menu.
	 * 			removeItems: [ 'basicStyles' ]
	 * 		}
	 * 	} )
	 * 	.then( ... );
	 * ```
	 *
	 * To remove a menu from the menu bar:
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( document.querySelector( '#editor' ), {
	 * 		menuBar: {
	 * 			// Removes the whole top-level "Insert" menu from the menu bar.
	 * 			removeItems: [ 'insert' ]
	 * 		}
	 * 	} )
	 * 	.then( ... );
	 * ```
	 *
	 * **Adding items to the menu bar**
	 *
	 * Using the `config.menuBar.addItems` option you can add individual buttons, button groups or entire menus to the structure
	 * of the menu bar. You can add existing components that you removed from their original position, or add your own components.
	 *
	 * **Note**: When adding items please make sure that features (editor plugins) that bring specific menu bar items are loaded.
	 * For instance, the "Bold" button will not show up in the menu bar unless the {@glink features/basic-styles basic styles} feature is
	 * loaded. {@link module:core/editor/editorconfig~EditorConfig#plugins Learn more} about loading plugins.
	 *
	 * Each entry in the `config.menuBar.addItems` is an object with one of the following properties:
	 *
	 * * `item` &ndash; A name of the button to be added to a specific button group (e.g. `'menuBar:bold'` or `'myButton'`),
	 * * `menu` &ndash; A {@link module:ui/menubar/menubarview#MenuBarMenuDefinition definition of a menu} that should be added to
	 * the menu bar,
	 * * `group` &ndash; A {@link module:ui/menubar/menubarview#MenuBarMenuGroupDefinition definition of a button group} that should be
	 * added to a specific menu.
	 *
	 * Additionally, each entry must define the `position` property that accepts the following values:
	 * * `'start'` &ndash; Adds a top-level menu (e.g. "Format", "Insert", etc.) at the beginning of the menu bar,
	 * * `'start:GROUP_OR_MENU'` &ndash; Adds a button/group at the beginning of the specific group/menu,
	 * * `'end'` &ndash; Adds a top-level menu (e.g. "Format", "Insert", etc.) at the end of the menu bar,
	 * * `'end:GROUP_OR_MENU'` &ndash; Adds a button/group at the end of the specific group/menu,
	 * * `'after:BUTTON_OR_GROUP_OR_MENU'` &ndash; Adds a button/group/menu right after the specific button/group/menu,
	 * * `'before:BUTTON_OR_GROUP_OR_MENU'` &ndash; Adds a button/group/menu right after the specific button/group/menu.
	 *
	 * Please refer to the {@link module:ui/menubar/utils#DefaultMenuBarItems default configuration} to learn about the
	 * names of buttons and positions they can be added at.
	 *
	 * To add a new top-level menu with specific buttons at the end of the menu bar:
	 *
	 * ```ts
	 *  ClassicEditor
	 * 	.create( document.querySelector( '#editor' ), {
	 * 		menuBar: {
	 *  		addItems: [
	 * 				{
	 * 					menu: {
	 * 						menuId: 'my-menu',
	 * 						label: 'My menu',
	 * 						groups: [
	 * 							{
	 * 								groupId: 'my-buttons',
	 * 								items: [
	 * 									'menuBar:bold',
	 * 									'menuBar:italic',
	 * 									'menuBar:underline'
	 * 								]
	 * 							}
	 * 						]
	 * 					},
	 * 					position: 'end'
	 * 				}
	 * 			]
	 * 		}
	 * 	} )
	 * 	.then( ... );
	 * ```
	 *
	 * To add a new group of buttons to the "Format" menu after basic styles buttons ("Bold", "Italic", "Underline", etc.):
	 *
	 * ```ts
	 *  ClassicEditor
	 * 	.create( document.querySelector( '#editor' ), {
	 * 		menuBar: {
	 *  		addItems: [
	 * 				{
	 * 					group: {
	 * 						groupId: 'my-buttons',
	 * 						items: [
	 * 							'myButton1',
	 * 							'myButton2',
	 * 						]
	 * 					},
	 * 					position: 'after:basicStyles'
	 * 				}
	 * 			]
	 * 		}
	 * 	} )
	 * 	.then( ... );
	 * ```
	 *
	 * To add a new button to the basic styles group ("Bold", "Italic", "Underline", etc.) in the "Format" menu:
	 *
	 * ```ts
	 *  ClassicEditor
	 * 	.create( document.querySelector( '#editor' ), {
	 * 		menuBar: {
	 *  		addItems: [
	 * 				{
	 * 					item: 'myButton',
	 * 					position: 'end:basicStyles'
	 * 				}
	 * 			]
	 * 		}
	 * 	} )
	 * 	.then( ... );
	 * ```
	 *
	 * To add a new sub-menu in the "Format" menu:
	 *
	 * ```ts
	 *  ClassicEditor
	 * 	.create( document.querySelector( '#editor' ), {
	 * 		menuBar: {
	 *  		addItems: [
	 * 				{
	 * 					menu: {
	 * 						menuId: 'my-sub-menu',
	 * 						label: 'My sub-menu',
	 * 						groups: [
	 * 							{
	 * 								groupId: 'my-buttons',
	 * 								items: [
	 * 									'myButton1',
	 * 									'myButton2',
	 * 								]
	 * 							}
	 * 						]
	 * 					},
	 * 					position: 'after:basicStyles'
	 * 				}
	 * 			]
	 * 		}
	 * 	} )
	 * 	.then( ... );
	 * ```
	 *
	 * **Defining menu bar from scratch**
	 *
	 * If the `config.menuBar.addItems` and `config.menuBar.removeItems` options are not enough to adjust the
	 * {@link module:ui/menubar/utils#DefaultMenuBarItems default configuration}, you can set the menu bar structure from scratch.
	 *
	 * For instance, to create a minimalistic menu bar configuration with just two main categories (menus), use the following code snippet:
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( document.querySelector( '#editor' ), {
	 * 		menuBar: {
	 * 			items: [
	 * 				{
	 * 					menuId: 'formatting',
	 * 					label: 'Formatting',
	 * 					groups: [
	 * 						{
	 * 							groupId: 'basicStyles',
	 * 							items: [
	 * 								'menuBar:bold',
	 * 								'menuBar:italic',
	 * 							]
	 * 						},
	 * 						{
	 * 							groupId: 'misc',
	 * 							items: [
	 * 								'menuBar:heading',
	 * 								'menuBar:bulletedList',
	 * 								'menuBar:numberedList'
	 * 							]
	 * 						}
	 * 					]
	 * 				},
	 * 				{
	 * 					menuId: 'myButtons',
	 * 					label: 'My actions',
	 * 					groups: [
	 * 						{
	 * 							groupId: 'undo',
	 * 							items: [
	 * 								'myButton1',
	 * 								'myButton2'
	 * 							]
	 * 						}
	 * 					]
	 * 				}
	 * 			]
	 * 		}
	 * 	} )
	 * 	.then( ... );
	 * ```
	 */
	menuBar?: MenuBarConfig;

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
	 * ```ts
	 * import {
	 * // A preset of plugins is a plugin as well.
	 * 	Essentials,
	 * // The bold plugin.
	 * 	Bold
	 * } from 'ckeditor5';
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
	 * The list of plugins which should not be loaded despite being available in
	 * the editor.
	 *
	 * ```ts
	 * const config = {
	 * 	removePlugins: [ 'Bold', 'Italic' ]
	 * };
	 * ```
	 *
	 * **Note:** Be careful when removing plugins using `config.removePlugins`.
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
	 *		`'paragraph'`, `'threeVerticalDots'`, `'dragIndicator'`, `'pilcrow'`):
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
	 * Options which can be set using the UI configuration:
	 *
	 * * **`ui.viewportOffset`** &ndash; The offset (in pixels) of the viewport from every direction. It is
	 * used when positioning a sticky toolbar or other absolutely positioned UI elements.
	 * Useful when a page with which the editor is being integrated has some other sticky or fixed elements
	 * (e.g. the top menu). Thanks to setting the UI viewport offset, the toolbar and other contextual balloons will not be positioned
	 * underneath or above the page's UI.
	 *
	 * 	```ts
	 * 	ui: {
	 * 		viewportOffset: { top: 10, right: 10, bottom: 10, left: 10 }
	 * 	}
	 * 	```
	 *
	 * 	**Note:** If you want to modify the viewport offset in runtime (after the editor was created), you can do that by overriding
	 * 	{@link module:ui/editorui/editorui~EditorUI#viewportOffset `editor.ui.viewportOffset`}.
	 *
	 * * **`ui.poweredBy`** &ndash; The configuration of the project logo displayed over the editor's editing area in
	 *  open-source integrations. It allows customizing the position of the logo to minimize the risk of collision with the
	 *  editor content and UI.
	 *
	 * 	The following configuration properties are supported:
	 *
	 * 	* **`position`** &ndash; The position of the project's logo (default: `'border'`).
	 * 		* When `'inside'`, the logo will be displayed within the boundaries of the editing area.
	 * 		* When `'border'`, the logo will be displayed over the bottom border of the editing area.
	 *
	 * 	* **`side`** (`'left'` or `'right'`, default: `'right'`) &ndash; The side of the editing area where the
	 * 	logo will be displayed.
	 *
	 * 		**Note**: If {@link module:core/editor/editorconfig~EditorConfig#language `config.language`} is set to an RTL (right-to-left)
	 * 		language, the side switches to `'left'` by default.
	 *
	 * 	* **`label`** (default: `'Powered by'`) &ndash; The label displayed next to the project's logo.
	 *
	 * 		**Note**: Set the value to `null` to display the logo without any text.
	 *
	 * 	* **`verticalOffset`** (default: `5`) &ndash; The vertical distance the logo can be moved away from its default position.
	 *
	 * 		**Note**: If `position` is `'border'`, the offset is measured from the (vertical) center of the logo.
	 *
	 * 	* **`horizontalOffset`** (default: `5`) &ndash; The horizontal distance between the side of the editing root and the
	 * 	nearest side of the logo.
	 *
	 * 	```ts
	 * 	ui: {
	 * 		poweredBy: {
	 * 			position: 'border',
	 * 			side: 'left',
	 * 			verticalOffset: 2,
	 * 			horizontalOffset: 30
	 * 		}
	 * 	}
	 */
	ui?: UiConfig;

	/**
	 * Enables updating the source element after the editor is destroyed.
	 *
	 * Enabling this option might have some security implications, as the editor doesn't have control over all data
	 * in the output.
	 *
	 * Be careful, especially while using the
	 * {@glink features/markdown Markdown}, {@glink features/html/general-html-support General HTML Support}, or
	 * {@glink features/html/html-embed HTML embed} features.
	 */
	updateSourceElementOnDestroy?: boolean;

	/**
	 * The license key for the CKEditor 5 commercial license and the premium features.
	 *
	 * If you do not have a key yet, please [contact us](https://ckeditor.com/contact/) or
	 * [order a trial](https://orders.ckeditor.com/trial/premium-features).
	 */
	licenseKey?: string;

	/**
	 * Translations to be used in the editor.
	 */
	translations?: ArrayOrItem<Translations>;

	/**
	 * Label text for the `aria-label` attribute set on editor editing area. Used by assistive technologies
	 * to tell apart multiple editor instances (editing areas) on the page. If not set, a default
	 * "Rich Text Editor. Editing area [name of the area]" is used instead.
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( document.querySelector( '#editor' ), {
	 * 		label: 'My editor'
	 * 	} )
	 * 	.then( ... )
	 * 	.catch( ... );
	 * ```
	 *
	 * If your editor implementation uses multiple roots, you should pass an object with keys corresponding to the editor
	 * roots names and values equal to the label that should be used for each root:
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
	 * 		label: {
	 * 			header: 'Header label',
	 * 			content: 'Content label',
	 * 			leftSide: 'Left side label',
	 * 			rightSide: 'Right side label'
	 * 		}
	 * 	}
	 * )
	 * .then( ... )
	 * .catch( ... );
	 * ```
	 */
	label?: string | Record<string, string>;
}

/**
 * The `config.initialData` option cannot be used together with the initial data passed as the first parameter of
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
 * 		language: ... // The editor language configuration.
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
	 * Allows to use a different language for the editor UI.
	 *
	 * The language codes are defined in the [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) standard.
	 */
	ui?: string;

	/**
	 * Allows to use a different language of the editor content.
	 *
	 * The language codes are defined in the [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) standard.
	 */
	content?: string;
}

export type ToolbarConfig = Array<ToolbarConfigItem> | {
	items?: Array<ToolbarConfigItem>;
	removeItems?: Array<string>;
	shouldNotGroupWhenFull?: boolean;
	icon?: string;
};

export type ToolbarConfigItem = string | {
	items: Array<ToolbarConfigItem>;
	label: string;
	icon?: string | false;
	withText?: boolean;
	tooltip?: boolean | string | ( ( label: string, keystroke: string | undefined ) => string );
};

/**
 * The “Powered by CKEditor” logo configuration options.
 **/
export interface PoweredByConfig {

	/**
	 * The position of the project's logo.
	 *
	 * * When `'inside'`, the logo will be displayed within the boundaries of the editing area.
	 * * When `'border'`, the logo will be displayed over the bottom border of the editing area.
	 *
	 * @default 'border'
	 */
	position: 'inside' | 'border';

	/**
	 * Allows choosing the side of the editing area where the logo will be displayed.
	 *
	 * **Note:** If {@link module:core/editor/editorconfig~EditorConfig#language `config.language`} is set to an RTL (right-to-left)
	 * language, the side switches to `'left'` by default.
	 *
	 * @default 'right'
	 */
	side: 'left' | 'right';

	/**
	 * Allows changing the label displayed next to the CKEditor logo.
	 *
	 * **Note:** Set the value to `null` to hide the label.
	 *
	 * @default 'Powered by'
	 */
	label: string | null;

	/**
	 * The vertical distance the logo can be moved away from its default position.
	 *
	 * **Note:** If `position` is `'border'`, the offset is measured from the (vertical) center of the logo.
	 *
	 * @default 5
	 */
	verticalOffset: number;

	/**
	 * The horizontal distance between the side of the editing root and the nearest side of the logo.
	 *
	 * @default 5
	 */
	horizontalOffset: number;

	/**
	 * Allows to show the logo even if the valid commercial license is configured using
	 * the {@link module:core/editor/editorconfig~EditorConfig#licenseKey `config.licenseKey`} setting.
	 *
	 * @default false
	 */
	forceVisible?: boolean;
}

/**
 * The offset (in pixels) of the viewport from every direction used when positioning a sticky toolbar or other
 * absolutely positioned UI elements.
 */
export interface ViewportOffsetConfig {

	/**
	 * The bottom offset in pixels.
	 */
	bottom?: number;

	/**
	 * The left offset in pixels.
	 */
	left?: number;

	/**
	 * The right offset in pixels.
	 */
	right?: number;

	/**
	 * The top offset in pixels.
	 */
	top?: number;
}

export interface UiConfig {

	/**
	 * The viewport offset used for positioning various absolutely positioned UI elements.
	 *
	 * Read more in {@link module:core/editor/editorconfig~ViewportOffsetConfig}.
	 **/
	viewportOffset?: ViewportOffsetConfig;

	/**
	 * The configuration of the “Powered by CKEditor” logo.
	 *
	 * Read more in {@link module:core/editor/editorconfig~PoweredByConfig}.
	 **/
	poweredBy?: PoweredByConfig;
}
