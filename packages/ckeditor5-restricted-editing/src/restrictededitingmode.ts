/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module restricted-editing/restrictededitingmode
 */

import { Plugin } from 'ckeditor5/src/core.js';

import RestrictedEditingModeEditing from './restrictededitingmodeediting.js';
import RestrictedEditingModeUI from './restrictededitingmodeui.js';

import '../theme/restrictedediting.css';

/**
 * The restricted editing mode plugin.
 *
 * This is a "glue" plugin which loads the following plugins:
 *
 * * The {@link module:restricted-editing/restrictededitingmodeediting~RestrictedEditingModeEditing restricted mode editing feature}.
 * * The {@link module:restricted-editing/restrictededitingmodeui~RestrictedEditingModeUI restricted mode UI feature}.
 */
export default class RestrictedEditingMode extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'RestrictedEditingMode' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ RestrictedEditingModeEditing, RestrictedEditingModeUI ] as const;
	}
}
