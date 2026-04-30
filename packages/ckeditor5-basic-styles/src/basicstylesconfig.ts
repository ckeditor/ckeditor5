/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module basic-styles/basicstylesconfig
 */

import type { BasicStyleSubscriptConfig } from './subscriptconfig.js';
import type { BasicStyleSuperscriptConfig } from './superscriptconfig.js';

/**
 * The configuration of the basic styles features (`Bold`, `Italic`, `Subscript`, `Superscript`, etc.).
 *
 * ```ts
 * ClassicEditor
 * 	.create( editorElement, {
 * 		basicStyles: {
 * 			superscript: {
 * 				allowNesting: true
 * 			},
 * 			subscript: {
 * 				allowNesting: true
 * 			}
 * 		}
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 */
export interface BasicStylesConfig {

	/**
	 * The configuration of the {@link module:basic-styles/superscript~Superscript superscript feature}.
	 *
	 * Read more in {@link module:basic-styles/superscriptconfig~BasicStyleSuperscriptConfig}.
	 */
	superscript?: BasicStyleSuperscriptConfig;

	/**
	 * The configuration of the {@link module:basic-styles/subscript~Subscript subscript feature}.
	 *
	 * Read more in {@link module:basic-styles/subscriptconfig~BasicStyleSubscriptConfig}.
	 */
	subscript?: BasicStyleSubscriptConfig;
}
