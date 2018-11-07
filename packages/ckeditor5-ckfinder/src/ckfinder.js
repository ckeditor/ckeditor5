/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ckfinder/ckfinder
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import CKFinderUI from './ckfinderui';
import CKFinderEditing from './ckfinderediting';

/**
 * The CKFinder feature.
 *
 *
 * This is a "glue" plugin which enables:
 *
 * * {@link module:ckfinder/ckfinder~CKFinder},
 * * {@link module:ckfinder/ckfinderediting~CKFinderEditing},
 * * {@link module:ckfinder/ckfinderui~CKFinderUI}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class CKFinder extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'CKFinder';
	}

	static get requires() {
		return [ CKFinderEditing, CKFinderUI ];
	}
}
