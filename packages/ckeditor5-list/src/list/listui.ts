/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/list/listui
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { registerIcon } from 'ckeditor5/src/utils.js';
import { IconBulletedList, IconNumberedList } from 'ckeditor5/src/icons.js';
import { createUIComponents } from './utils.js';

const bulletedListIcon = /* #__PURE__ */ registerIcon( 'bulletedList', IconBulletedList );
const numberedListIcon = /* #__PURE__ */ registerIcon( 'numberedList', IconNumberedList );

/**
 * The list UI feature. It introduces the `'numberedList'` and `'bulletedList'` buttons that
 * allow to convert paragraphs to and from list items and indent or outdent them.
 */
export default class ListUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ListUI' as const;
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
	public init(): void {
		const t = this.editor.t;

		// Create button numberedList.
		if ( !this.editor.ui.componentFactory.has( 'numberedList' ) ) {
			createUIComponents( this.editor, 'numberedList', t( 'Numbered List' ), numberedListIcon() );
		}

		// Create button bulletedList.
		if ( !this.editor.ui.componentFactory.has( 'bulletedList' ) ) {
			createUIComponents( this.editor, 'bulletedList', t( 'Bulleted List' ), bulletedListIcon() );
		}
	}
}
