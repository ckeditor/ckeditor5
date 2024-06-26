/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/strikethrough/strikethroughui
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { ButtonView, MenuBarMenuListItemButtonView } from 'ckeditor5/src/ui.js';
import { getButtonCreator } from '../utils.js';

import strikethroughIcon from '../../theme/icons/strikethrough.svg';

const STRIKETHROUGH = 'strikethrough';

/**
 * The strikethrough UI feature. It introduces the Strikethrough button.
 */
export default class StrikethroughUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'StrikethroughUI' as const;
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
			icon: strikethroughIcon,
			keystroke: 'CTRL+SHIFT+X',
			label: t( 'Strikethrough' )
		} );

		// Add strikethrough button to feature components.
		editor.ui.componentFactory.add( STRIKETHROUGH, () => createButton( ButtonView ) );
		editor.ui.componentFactory.add( 'menuBar:' + STRIKETHROUGH, () => createButton( MenuBarMenuListItemButtonView ) );
	}
}
