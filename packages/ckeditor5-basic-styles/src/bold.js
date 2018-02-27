/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module basic-styles/bold
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import BoldEditing from './bold/boldediting';
import BoldUI from './bold/boldui';

/**
 * The bold feature.
 *
 * It loads the {@link module:basic-styles/bold/boldediting~BoldEditing bold editing feature}
 * and {@link module:basic-styles/bold/boldui~BoldUI bold UI feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Bold extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ BoldEditing, BoldUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Bold';
	}
}
