/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module alignment/alignment
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import AlignmentEditing from './alignmentediting';
import AlignmentUI from './alignmentui';

/**
 * The alignment plugin.
 *
 *
 * It requires {@link module:alignment/alignmentediting~AlignmentEditing} and {@link module:alignment/alignmentui~AlignmentUI} plugins.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Alignment extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ AlignmentEditing, AlignmentUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Alignment';
	}
}
