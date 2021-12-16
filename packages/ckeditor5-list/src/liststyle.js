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
 * Wheter to enable list style feature (i.e. setting `list-style-type` style on lists).
 *
 * @default true
 * @member {Boolean} module:list/liststyle~ListPropertiesConfig#styles
 */

/**
 * Wheter to enable list start index feature.
 *
 * This configuration doesn't affect bulleted and todo lists.
 *
 * @default false
 * @member {Boolean} module:list/liststyle~ListPropertiesConfig#startIndex
 */

/**
 * Wheter to enable reversed list feature.
 *
 * This configuration doesn't affect bulleted and todo lists.
 *
 * @default false
 * @member {Boolean} module:list/liststyle~ListPropertiesConfig#reversed
 */

/**
 * The configuration of the {@link module:list/liststyle~ListStyle} feature.
 *
 * Read more in {@link module:list/liststyle~ListPropertiesConfig}.
 *
 * @member {module:list/liststyle~ListPropertiesConfig} module:list/lilst~ListConfig#properties
 */
