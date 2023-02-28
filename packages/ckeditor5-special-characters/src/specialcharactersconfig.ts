/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/specialcharactersconfig
 */

/**
 * The configuration of the special characters feature.
 *
 * Read more about {@glink features/special-characters#configuration configuring the special characters feature}.
 *
 * ```ts
 * ClassicEditor
 *   .create( editorElement, {
 *     specialCharacters: ... // Special characters feature options.
 *   } )
 *   .then( ... )
 *   .catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor configuration options}.
 */
export interface SpecialCharactersConfig {

	/**
	 * The configuration of the special characters category order.
	 *
	 * Special characters categories are displayed in the UI in the order in which they were registered. Using the `order` property
	 * allows to override this behaviour and enforce specific order. Categories not listed in the `order` property will be displayed
	 * in the default order below categories listed in the configuration.
	 *
	 * ```ts
	 * ClassicEditor
	 *   .create( editorElement, {
	 *     plugins: [ SpecialCharacters, SpecialCharactersEssentials, ... ],
	 *     specialCharacters: {
	 *       order: [
	 *         'Text',
	 *         'Latin',
	 *         'Mathematical',
	 *         'Currency',
	 *         'Arrows'
	 *       ]
	 *     }
	 *   } )
	 *   .then( ... )
	 *   .catch( ... );
	 * ```
	 */
	order?: Array<string>;
}

declare module '@ckeditor/ckeditor5-core' {

	/**
	 * The configuration of the {@link module:special-characters/specialcharacters~SpecialCharacters} feature.
	 *
	 * Read more in {@link module:special-characters/specialcharactersconfig~SpecialCharactersConfig}.
	 */
	interface EditorConfig {
		specialCharacters?: SpecialCharactersConfig;
	}
}
