/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/listconfig
 */

/**
 * The configuration of the {@link module:list/list~List list} feature
 * and the {@link module:list/documentlist~DocumentList document list} feature.
 *
 * ```ts
 * ClassicEditor
 * 	.create( editorElement, {
 * 		list:  ... // The list feature configuration.
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface ListConfig
 */
export interface ListConfig {

	/**
	 * The configuration of the {@link module:list/listproperties~ListProperties} feature and the
	 * {@link module:list/documentlistproperties~DocumentListProperties document list properties} feature.
	 *
	 * Read more in {@link module:list/listconfig~ListPropertiesConfig}.
	 */
	properties?: ListPropertiesConfig;
}

/**
 * The configuration of the {@link module:list/listproperties~ListProperties list properties} feature and the
 * {@link module:list/documentlistproperties~DocumentListProperties document list properties} feature.
 *
 * This configuration controls the individual list properties. For instance, it enables or disables specific editor commands
 * operating on lists ({@link module:list/listproperties/liststylecommand~ListStyleCommand `'listStyle'`},
 * {@link module:list/listproperties/liststartcommand~ListStartCommand `'listStart'`},
 * {@link module:list/listproperties/listreversedcommand~ListReversedCommand `'listReversed'`}, or on the document lists
 * {@link module:list/documentlistproperties/documentliststylecommand~DocumentListStyleCommand `'listStyle'`},
 * {@link module:list/documentlistproperties/documentliststartcommand~DocumentListStartCommand `'listStart'`},
 * {@link module:list/documentlistproperties/documentlistreversedcommand~DocumentListReversedCommand `'listReversed'`}), the look of the UI
 * (`'numberedList'` and `'bulletedList'` dropdowns), and the editor data pipeline (allowed HTML attributes).
 *
 * ```ts
 * ClassicEditor
 * 	.create( editorElement, {
 * 		list: {
 * 			properties: {
 * 				styles: true,
 * 				startIndex: true,
 * 				reversed: true
 * 			}
 * 		}
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 */
export interface ListPropertiesConfig {

	/**
	 * When set, the list style feature will be enabled.
	 * It allows changing the `list-style-type` style or the `type` HTML attribute of a list.
	 *
	 * **Note**: Styling using the `type` HTML attribute is only available in
	 * {@link module:list/documentlistproperties~DocumentListProperties document list properties}
	 * ({@link module:list/listconfig~ListPropertiesStyleConfig learn more}).
	 *
	 * @default true
	 */
	styles?: boolean | ListPropertiesStyleConfig;

	/**
	 * When set, the list start index feature will be enabled. It allows changing the `start` HTML attribute of the numbered lists. As a
	 * result, it will be possible to specify the start value of the first item in an ordered list.
	 *
	 * **Note**: This configuration does not affect bulleted and to-do lists.
	 *
	 * @default false
	 */
	startIndex?: boolean;

	/**
	 * When set, the reversed list feature will be enabled. It allows changing the `reversed` HTML attribute of the numbered lists. As a
	 * result, it will be possible to make the list order descending instead of ascending.
	 *
	 * **Note**: This configuration does not affect bulleted and to-do lists.
	 *
	 * @default false
	 */
	reversed?: boolean;
}

export interface ListPropertiesStyleConfig {

	/**
	 * When set `true`, the list style feature will use the `type` attribute of `<ul>` and `<ol>` elements instead of the `list-style-type`
	 * style.
	 *
	 * ```ts
	 * {
	 * 	list: {
	 * 		properties: {
	 * 			styles: {
	 * 				useAttribute: true
	 * 			},
	 *
	 * 			// ...
	 * 		}
	 * 	},
	 *
	 * 	// ...
	 * }
	 * ```
	 *
	 * **Note**: Due to limitations of HTML, the "Decimal with leading zero" style is impossible to set using the `type` attribute.
	 *
	 * **Note**: This configuration works only with
	 * {@link module:list/documentlistproperties~DocumentListProperties document list properties}.
	 *
	 * @default false
	 */
	useAttribute?: boolean;
}
