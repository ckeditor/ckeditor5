/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { type RootAttributes } from './multirooteditor.js';
import { type ToolbarConfigItem } from 'ckeditor5/src/core.js';

declare module '@ckeditor/ckeditor5-core' {
	interface EditorConfig {

		/**
		 * Initial roots attributes for the document roots.
		 *
		 * **Note: This configuration option is supported only by the
		 * {@link module:editor-multi-root/multirooteditor~MultiRootEditor multi-root} editor type.**
		 *
		 * **Note: You must provide full set of attributes for each root. If an attribute is not set on a root, set the value to `null`.
		 * Only provided attribute keys will be returned by
		 * {@link module:editor-multi-root/multirooteditor~MultiRootEditor#getRootsAttributes}.**
		 *
		 * Roots attributes hold additional data related to the document roots, in addition to the regular document data (which usually is
		 * HTML). In roots attributes, for each root, you can store arbitrary key-value pairs with attributes connected with that root.
		 * Use it to store any custom data that is specific to your integration or custom features.
		 *
		 * Currently, roots attributes are not used only by any official plugins. This is a mechanism that is prepared for custom features
		 * and non-standard integrations. If you do not provide any custom feature that would use root attributes, you do not need to
		 * handle (save and load) this property.
		 *
		 * ```ts
		 * MultiRootEditor.create(
		 * 	// Roots for the editor:
		 * 	{
		 * 		uid1: document.querySelector( '#uid1' ),
		 * 		uid2: document.querySelector( '#uid2' ),
		 * 		uid3: document.querySelector( '#uid3' ),
		 * 		uid4: document.querySelector( '#uid4' )
		 * 	},
		 * 	// Config:
		 * 	{
		 * 		rootsAttributes: {
		 * 			uid1: { order: 20, isLocked: false }, // Third, unlocked.
		 * 			uid2: { order: 10, isLocked: true }, // Second, locked.
		 * 			uid3: { order: 30, isLocked: true }, // Fourth, locked.
		 * 			uid4: { order: 0, isLocked: false } // First, unlocked.
		 * 		}
		 * 	}
		 * )
		 * .then( ... )
		 * .catch( ... );
		 * ```
		 *
		 * Note, that the above code snippet is only an example. You need to implement your own features that will use these attributes.
		 *
		 * Roots attributes can be changed the same way as attributes set on other model nodes:
		 *
		 * ```ts
		 * editor.model.change( writer => {
		 * 	const root = editor.model.getRoot( 'uid3' );
		 *
		 * 	writer.setAttribute( 'order', 40, root );
		 * } );
		 * ```
		 *
		 * You can react to root attributes changes by listening to
		 * {@link module:engine/model/document~Document#event:change:data document `change:data` event}:
		 *
		 * ```ts
		 * editor.model.document.on( 'change:data', () => {
		 * 	const changedRoots = editor.model.document.differ.getChangedRoots();
		 *
		 * 	for ( const change of changedRoots ) {
		 * 		if ( change.attributes ) {
		 * 			const root = editor.model.getRoot( change.name );
		 *
		 * 			// ...
		 * 		}
		 * 	}
		 * } );
		 * ```
		 */
		rootsAttributes?: Record<string, RootAttributes>;

		/**
		 * UI toolbar configurations for the document roots.
		 *
		 * **Note: This configuration option is supported only by the
		 * {@link module:editor-multi-root/multirooteditor~MultiRootEditor multi-root} editor type.**
		 *
		 * **Note: This configuration does not limit what kind of content the user is allowed to create
		 * (write, paste, etc.) in a specific editor root. It affects only the presentation of the toolbar.**
		 *
		 * When specified, the main editor toolbar will change its items dynamically depending on in which root the user
		 * selection is anchored. This allows for targeted editing experience, e.g. to declutter the toolbars for
		 * roots that contain only a specific kind of content.
		 *
		 * Please keep in mind that properties such as {@link module:core/editor/editorconfig~EditorConfig#toolbar `shouldGroupWhenFull`}
		 * or {@link module:core/editor/editorconfig~EditorConfig#toolbar `removeItems`} are inherited by individual root toolbars
		 * from the main {@link module:core/editor/editorconfig~EditorConfig#toolbar toolbar configuration}.
		 *
		 * ```ts
		 * MultiRootEditor.create(
		 * 	// Roots for the editor:
		 * 	{
		 * 		uid1: document.querySelector( '#uid1' ),
		 * 		uid2: document.querySelector( '#uid2' ),
		 * 		uid3: document.querySelector( '#uid3' ),
		 * 		uid4: document.querySelector( '#uid4' )
		 * 	},
		 * 	// Config:
		 * 	{
		 * 		// Specific toolbar configurations for individual roots.
		 * 		rootsToolbars: {
		 * 			uid1: [ 'bold', 'italic', '|', 'undo', 'redo' ],
		 * 			uid3: [ 'bold', 'italic', 'underline', '|', 'undo', 'redo' ]
		 * 		},
		 * 		// Toolbars for roots not specified in config.rootsToolbars use the global toolbar configuration.
		 * 		toolbar: [ 'bold', 'italic' ]
		 * 	}
		 * )
		 * .then( ... )
		 * .catch( ... );
		 * ```
		 *
		 * Alternatively, you can specify this configuration as a function that returns toolbar items for a given root name.
		 * This approach comes in handy when the roots are
		 * {@link module:editor-multi-root/multirooteditor~MultiRootEditor#addRoot added or re-added} on the fly and you want their toolbar
		 * items to be customizable.
		 *
		 * ```ts
		 * MultiRootEditor.create(
		 * 	// Roots for the editor:
		 * 	{
		 * 		uid1: document.querySelector( '#uid1' ),
		 * 		uid2: document.querySelector( '#uid2' ),
		 * 		uid3: document.querySelector( '#uid3' ),
		 * 		uid4: document.querySelector( '#uid4' )
		 * 	},
		 * 	// Config:
		 * 	{
		 * 		rootsToolbars: rootName => {
		 * 			// A specific toolbar configuration for initial roots.
		 * 			if ( rootName === 'uid1' ) {
		 * 				return [ 'bold', 'italic', '|', 'undo', 'redo' ];
		 * 			} else if ( rootName === 'uid3' ) {
		 * 				return [ 'bold', 'italic', 'underline', '|', 'undo', 'redo' ];
		 * 			}
		 * 			// A specific group of new roots will use this unique toolbar configuration.
		 * 			else if ( rootName.startsWith( 'dynamicUid' ) ) {
		 * 				return [ 'undo', 'redo' ];
		 * 			}
		 * 		},
		 *
		 * 		// Roots omitted in config.rootsToolbars use the global toolbar configuration.
		 * 		toolbar: [ 'bold', 'italic' ]
		 * 	}
		 * )
		 * .then( ... )
		 * .catch( ... );
		 * ```
		 */
		rootsToolbars?: Record<string, Array<ToolbarConfigItem>> | ( ( rootName: string ) => Array<ToolbarConfigItem> | undefined );

		/**
		 * A list of names of all the roots that exist in the document but are not initially loaded by the editor.
		 *
		 * These roots can be loaded at any time after the editor has been initialized, using
		 * {@link module:editor-multi-root/multirooteditor~MultiRootEditor#loadRoot `MultiRootEditor#lazyRoot()`}.
		 *
		 * This is useful for handling big documents that contain hundreds of roots, or contain very large roots, which may have
		 * impact editor performance if loaded all at once.
		 */
		lazyRoots?: Array<string>;
	}
}
