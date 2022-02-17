/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/listproperties
 */

import { Plugin } from 'ckeditor5/src/core';
import ListPropertiesEditing from './listpropertiesediting';
import ListPropertiesUI from './listpropertiesui';

/**
 * The list properties feature.
 *
 * This is a "glue" plugin that loads the {@link module:list/listpropertiesediting~ListPropertiesEditing list properties editing feature}
 * and the {@link module:list/listpropertiesui~ListPropertiesUI list properties UI feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ListProperties extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ListPropertiesEditing, ListPropertiesUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ListProperties';
	}
}

/**
 * The configuration of the {@link module:list/listproperties~ListProperties list properties} feature.
 *
 * This configuration controls the individual list properties. For instance, it enables or disables specific editor commands
 * operating on lists ({@link module:list/liststylecommand~ListStyleCommand `'listStyle'`},
 * {@link module:list/liststartcommand~ListStartCommand `'listStart'`},
 * {@link module:list/listreversedcommand~ListReversedCommand `'listReversed'`}), the look of the UI
 * (`'numberedList'` and `'bulletedList'` dropdowns), and the editor data pipeline (allowed HTML attributes).
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
 * @member {Boolean} module:list/listproperties~ListPropertiesConfig#styles
 */

/**
 * When set, the list start index feature will be enabled. It allows changing the `start` HTML attribute of the numbered lists. As a
 * result, it will be possible to specify the start value of the first item in an ordered list.
 *
 * **Note**: This configuration does not affect bulleted and to-do lists.
 *
 * @default false
 * @member {Boolean} module:list/listproperties~ListPropertiesConfig#startIndex
 */

/**
 * When set, the reversed list feature will be enabled. It allows changing the `reversed` HTML attribute of the numbered lists. As a
 * result, it will be possible to make the list order descending instead of ascending.
 *
 * **Note**: This configuration does not affect bulleted and to-do lists.
 *
 * @default false
 * @member {Boolean} module:list/listproperties~ListPropertiesConfig#reversed
 */

/**
 * The configuration of the {@link module:list/listproperties~ListProperties} feature.
 *
 * Read more in {@link module:list/listproperties~ListPropertiesConfig}.
 *
 * @member {module:list/listproperties~ListPropertiesConfig} module:list/list~ListConfig#properties
 */
