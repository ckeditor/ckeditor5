/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/list/listui
 */

import { createUIComponent } from '../list/utils';

import numberedListIcon from '../../theme/icons/numberedlist.svg';
import bulletedListIcon from '../../theme/icons/bulletedlist.svg';

import { Plugin } from 'ckeditor5/src/core';

/**
 * The document list UI feature. It introduces the `'numberedList'` and `'bulletedList'` buttons.
 *
 * @extends module:core/plugin~Plugin
 */
export default class DocumentListUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'DocumentListUI';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const t = this.editor.t;

		// Create two buttons and link them with numberedList and bulletedList commands.
		createUIComponent( this.editor, 'numberedList', t( 'Numbered List' ), numberedListIcon );
		createUIComponent( this.editor, 'bulletedList', t( 'Bulleted List' ), bulletedListIcon );
	}
}
