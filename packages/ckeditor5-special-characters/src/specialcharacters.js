/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/specialcharacters
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import SpecialCharactersUI from './specialcharactersui';

/**
 * The special characters feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class SpecialCharacters extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ SpecialCharactersUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'SpecialCharacters';
	}
}
