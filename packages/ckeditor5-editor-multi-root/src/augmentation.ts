/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { type RootAttributes } from './multirooteditor.js';

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
		 * A list of names of all the roots that exist in the document but are not initially loaded by the editor.
		 *
		 * **Important! Lazy roots loading is an experimental feature, and may become deprecated. Be advised of the following
		 * known limitations:**
		 *
		 * * **Real-time collaboration integrations that use
		 * [uploaded editor bundles](https://ckeditor.com/docs/cs/latest/guides/collaboration/editor-bundle.html) are not supported. Using
		 * lazy roots will lead to unexpected behavior and data loss.**
		 * * **Revision history feature will read and process the whole document on editor initialization, possibly defeating the purpose
		 * of using the lazy roots loading. Additionally, when the document is loaded for the first time, all roots need to be loaded,
		 * to make sure that the initial revision data includes all roots. Otherwise, you may experience data loss.**
		 * * **Multiple features, that require full document data to be loaded, will produce incorrect or confusing results if not all
		 * roots are loaded. These include: bookmarks, find and replace, word count, pagination, document exports, document outline,
		 * and table of contents.**
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
