/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/listproperties
 */

import { Plugin } from 'ckeditor5/src/core';
import ListPropertiesEditing from './listproperties/listpropertiesediting';
import ListPropertiesUI from './listproperties/listpropertiesui';

/**
 * The list properties feature.
 *
 * This is a "glue" plugin that loads the {@link module:list/listproperties/listpropertiesediting~ListPropertiesEditing list properties
 * editing feature} and the {@link module:list/listproperties/listpropertiesui~ListPropertiesUI list properties UI feature}.
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
 * When set, the list style feature will be enabled. It allows changing the `list-style-type` style or the `type` HTML attribute of a list.
 *
 * **Note**: Styling using the `type` HTML attribute is only available in
 * {@link module:list/documentlistproperties~DocumentListProperties document list properties}
 * ({@link module:list/listproperties~ListPropertiesStyleConfig learn more}).
 *
 * @default true
 * @member {Boolean|module:list/listproperties~ListPropertiesStyleConfig} module:list/listproperties~ListPropertiesConfig#styles
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
 * The configuration of the {@link module:list/listproperties~ListProperties} feature and the
 * {@link module:list/documentlistproperties~DocumentListProperties document list properties} feature.
 *
 * Read more in {@link module:list/listproperties~ListPropertiesConfig}.
 *
 * @member {module:list/listproperties~ListPropertiesConfig} module:list/list~ListConfig#properties
 */

/**
 * @interface ListPropertiesStyleConfig
 */

/**
 * When set `true`, the list style feature will use the `type` attribute of `<ul>` and `<ol>` elements instead of the `list-style-type`
 * style.
 *
 *		{
 *			list: {
 *				properties: {
 *					styles: {
 *						useAttribute: true
 *					},
 *
 *					// ...
 *				}
 *			},
 *
 *			// ...
 *		}
 *
 * **Note**: Due to limitations of HTML, the "Decimal with leading zero" style is impossible to set using the `type` attribute.
 *
 * **Note**: This configuration works only with {@link module:list/documentlistproperties~DocumentListProperties document list properties}.
 *
 * @default false
 * @member {Boolean} module:list/listproperties~ListPropertiesStyleConfig#useAttribute
 */
