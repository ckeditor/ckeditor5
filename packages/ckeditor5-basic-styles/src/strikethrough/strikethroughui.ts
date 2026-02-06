/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module basic-styles/strikethrough/strikethroughui
 */

import { Plugin } from '@ckeditor/ckeditor5-core';
import { IconStrikethrough } from '@ckeditor/ckeditor5-icons';
import { ButtonView, MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui';
import { getButtonCreator } from '../utils.js';

const STRIKETHROUGH = 'strikethrough';

/**
 * The strikethrough UI feature. It introduces the Strikethrough button.
 */
export class StrikethroughUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'StrikethroughUI' as const;
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
		const editor = this.editor;
		const t = editor.locale.t;
		const createButton = getButtonCreator( {
			editor,
			commandName: STRIKETHROUGH,
			plugin: this,
			icon: IconStrikethrough,
			keystroke: 'CTRL+SHIFT+X',
			label: t( 'Strikethrough' )
		} );

		// Add strikethrough button to feature components.
		editor.ui.componentFactory.add( STRIKETHROUGH, () => createButton( ButtonView ) );
		editor.ui.componentFactory.add( 'menuBar:' + STRIKETHROUGH, () => createButton( MenuBarMenuListItemButtonView ) );
	}
}
