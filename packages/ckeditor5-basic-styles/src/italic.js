/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module basic-styles/italic
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ItalicEditing from './italic/italicediting';
import ItalicUI from './italic/italicui';

/**
 * The italic feature.
 *
 * It loads the {@link module:basic-styles/italic/italicediting~ItalicEditing} and
 * {@link module:basic-styles/italic/italicui~ItalicUI} plugins.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Italic extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ItalicEditing, ItalicUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Italic';
	}
}
