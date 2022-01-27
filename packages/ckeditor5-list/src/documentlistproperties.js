/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/documentlistproperties
 */

import { Plugin } from 'ckeditor5/src/core';
import DocumentListPropertiesEditing from './documentlistproperties/documentlistpropertiesediting';
// import ListPropertiesUI from './listproperties/listpropertiesui';

/**
 * The document-list properties feature.
 *
 * This is a "glue" plugin that loads the
 * {@link module:list/documentlistproperties/documentlistpropertiesediting~DocumentListPropertiesEditing document list properties
 * editing feature} and the {@link module:list/listproperties/listpropertiesui~ListPropertiesUI list properties UI feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class DocumentListProperties extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ DocumentListPropertiesEditing/*, ListPropertiesUI*/ ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'DocumentListProperties';
	}
}

/**
 * The configuration of the {@link module:list/documentlistproperties~DocumentListProperties document list properties} feature.
 *
 * This configuration controls the individual list properties. For instance, it enables or disables specific editor commands
 * operating on lists ({@link module:list/documentlistproperties/documentliststylecommand~DocumentListStyleCommand `'listStyle'`},
 * {@link module:list/documentlistproperties/documentliststartcommand~DocumentListStartCommand `'listStart'`},
 * {@link module:list/documentlistproperties/documentlistreversedcommand~DocumentListReversedCommand `'listReversed'`}), the look of the UI
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
 * @interface DocumentListPropertiesConfig
 */

/**
 * When set, the list style feature will be enabled. It allows changing the `list-style-type` HTML attribute of the lists.
 *
 * @default true
 * @member {Boolean} module:list/documentlistproperties~DocumentListPropertiesConfig#styles
 */

/**
 * When set, the list start index feature will be enabled. It allows changing the `start` HTML attribute of the numbered lists.
 *
 * **Note**: This configuration doesn't affect bulleted and todo lists.
 *
 * @default false
 * @member {Boolean} module:list/documentlistproperties~DocumentListPropertiesConfig#startIndex
 */

/**
 * When set, the list reversed feature will be enabled. It allows changing the `reversed` HTML attribute of the numbered lists.
 *
 * **Note**: This configuration doesn't affect bulleted and todo lists.
 *
 * @default false
 * @member {Boolean} module:list/documentlistproperties~DocumentListPropertiesConfig#reversed
 */

/**
 * The configuration of the {@link module:list/documentlistproperties~DocumentListProperties} feature.
 *
 * Read more in {@link module:list/documentlistproperties~DocumentListPropertiesConfig}.
 *
 * @member {module:list/documentlistproperties~DocumentListPropertiesConfig} module:list/list~ListConfig#properties
 */
