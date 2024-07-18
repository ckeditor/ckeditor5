/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/listconfig
 */

import { type ArrayOrItem } from 'ckeditor5/src/utils.js';

/**
 * The configuration of the {@link module:list/list~List list} feature
 * and the {@link module:list/legacylist~LegacyList legacy list} feature.
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
	 * {@link module:list/legacylistproperties~LegacyListProperties legacy list properties} feature.
	 *
	 * Read more in {@link module:list/listconfig~ListPropertiesConfig}.
	 */
	properties?: ListPropertiesConfig;

	/**
	 * Allows multiple blocks in single list item.
	 *
	 * With this option enabled you can have block widgets, for example images or even tables, within a list item.
	 *
	 * **Note:** This is enabled by default.
	 *
	 * @default true
	 */
	multiBlock?: boolean;
}

/**
 * The configuration of the {@link module:list/listproperties~ListProperties list properties} feature and the
 * {@link module:list/legacylistproperties~LegacyListProperties legacy list properties} feature.
 *
 * This configuration controls the individual list properties. For instance, it enables or disables specific editor commands
 * operating on lists ({@link module:list/listproperties/liststylecommand~ListStyleCommand `'listStyle'`},
 * {@link module:list/listproperties/liststartcommand~ListStartCommand `'listStart'`},
 * {@link module:list/listproperties/listreversedcommand~ListReversedCommand `'listReversed'`}, or on the legacy lists
 * {@link module:list/legacylistproperties/legacyliststylecommand~LegacyListStyleCommand `'listStyle'`},
 * {@link module:list/legacylistproperties/legacyliststartcommand~LegacyListStartCommand `'listStart'`},
 * {@link module:list/legacylistproperties/legacylistreversedcommand~LegacyListReversedCommand `'listReversed'`}), the look of the UI
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
	 * {@link module:list/listproperties~ListProperties list properties}
	 * ({@link module:list/listconfig~ListPropertiesStyleConfig learn more}).
	 *
	 * @default true
	 */
	styles?: boolean | ListPropertiesStyleConfig | ArrayOrItem<ListPropertiesStyleListType>;

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
	 * Enable style feature for the given list type only.
	 *
	 * ```ts
	 * {
	 * 	list: {
	 * 		properties: {
	 * 			styles: {
	 * 				listTypes: 'numbered'
	 * 			}
	 *
	 * 			// ...
	 * 		}
	 * 	},
	 *
	 * 	// ...
	 * }
	 * ```
	 *
     *
	 * **Note**: This configuration works only with
	 * {@link module:list/listproperties~ListProperties list properties}.
	 *
	 * @default ['bulleted','numbered']
	 */
	listTypes?: ArrayOrItem<ListPropertiesStyleListType>;

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
	 * {@link module:list/listproperties~ListProperties list properties}.
	 *
	 * @default false
	 */
	useAttribute?: boolean;
}

export type ListPropertiesStyleListType = 'numbered' | 'bulleted';
