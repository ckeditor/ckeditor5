/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module restricted-editing/standardeditingmode
 */

import { Plugin } from 'ckeditor5/src/core';

import StandardEditingModeEditing from './standardeditingmodeediting';
import StandardEditingModeUI from './standardeditingmodeui';

import '../theme/restrictedediting.css';

/**
 * The standard editing mode plugin.
 *
 * This is a "glue" plugin that loads the following plugins:
 *
 * * The {@link module:restricted-editing/standardeditingmodeediting~StandardEditingModeEditing standard mode editing feature}.
 * * The {@link module:restricted-editing/standardeditingmodeui~StandardEditingModeUI standard mode UI feature}.
 */
export default class StandardEditingMode extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'StandardEditingMode' {
		return 'StandardEditingMode';
	}

	public static get requires() {
		return [ StandardEditingModeEditing, StandardEditingModeUI ] as const;
	}
}

