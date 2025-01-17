/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/listproperties
 */

import { Plugin } from 'ckeditor5/src/core.js';
import ListPropertiesEditing from './listproperties/listpropertiesediting.js';
import ListPropertiesUI from './listproperties/listpropertiesui.js';

/**
 * The list properties feature.
 *
 * This is a "glue" plugin that loads the
 * {@link module:list/listproperties/listpropertiesediting~ListPropertiesEditing list properties
 * editing feature} and the {@link module:list/listproperties/listpropertiesui~ListPropertiesUI list properties UI feature}.
 */
export default class ListProperties extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ListPropertiesEditing, ListPropertiesUI ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ListProperties' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}
}
