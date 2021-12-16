/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/liststyle
 */

import { Plugin } from 'ckeditor5/src/core';
import ListStyleEditing from './liststyleediting';
import ListStyleUI from './liststyleui';

/**
 * The list style feature.
 *
 * This is a "glue" plugin that loads the {@link module:list/liststyleediting~ListStyleEditing list style editing feature}
 * and the {@link module:list/liststyleui~ListStyleUI list style UI feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ListStyle extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ListStyleEditing, ListStyleUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ListStyle';
	}
}

/**
 * The configuration of the {@link module:list/liststyle~ListStyle list properties} feature.
 *
 * This configuration controls the individual list properties. For instance, it enables or disables specific editor commands
 * operating on lists ({@link module:list/liststylecommand~ListStyleCommand `'listStyle'`},
 * {@link module:list/liststartcommand~ListStartCommand `'listStart'`},
 * {@link module:list/listreversedcommand~ListReversedCommand `'listReversed'`}), the look of the UI
 * (`'numberedList'` and `'bulletedList'` dropdowns), and editor data pipeline (allowed HTML attributes).
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				list: {
 *					properties: {
 *						styles: true,
 *						startIndex: true,
 *						reversed: true
 *					}
 *				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * @interface ListPropertiesConfig
 */

/**
 * When set, the list style feature will be enabled. It allows changing the `list-style-type` HTML attribute of the lists.
 *
 * @default true
 * @member {Boolean} module:list/liststyle~ListPropertiesConfig#styles
 */

/**
 * When set, the list start index feature will be enabled. It allows changing the `start` HTML attribute of the numbered lists.
 *
 * **Note**: This configuration doesn't affect bulleted and todo lists.
 *
 * @default false
 * @member {Boolean} module:list/liststyle~ListPropertiesConfig#startIndex
 */

/**
 * When set, the list reversed feature will be enabled. It allows changing the `reversed` HTML attribute of the numbered lists.
 *
 * **Note**: This configuration doesn't affect bulleted and todo lists.
 *
 * @default false
 * @member {Boolean} module:list/liststyle~ListPropertiesConfig#reversed
 */

/**
 * The configuration of the {@link module:list/liststyle~ListStyle} feature.
 *
 * Read more in {@link module:list/liststyle~ListPropertiesConfig}.
 *
 * @member {module:list/liststyle~ListPropertiesConfig} module:list/list~ListConfig#properties
 */
