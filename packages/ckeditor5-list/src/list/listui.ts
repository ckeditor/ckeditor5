/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/list/listui
 */

import { createUIComponent } from './utils';

import numberedListIcon from '../../theme/icons/numberedlist.svg';
import bulletedListIcon from '../../theme/icons/bulletedlist.svg';

import { Plugin } from 'ckeditor5/src/core';

/**
 * The list UI feature. It introduces the `'numberedList'` and `'bulletedList'` buttons that
 * allow to convert paragraphs to and from list items and indent or outdent them.
 */
export default class ListUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'ListUI' {
		return 'ListUI';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const t = this.editor.t;

		// Create two buttons and link them with numberedList and bulletedList commands.
		createUIComponent( this.editor, 'numberedList', t( 'Numbered List' ), numberedListIcon );
		createUIComponent( this.editor, 'bulletedList', t( 'Bulleted List' ), bulletedListIcon );
	}
}
