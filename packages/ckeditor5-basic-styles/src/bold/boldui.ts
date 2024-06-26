/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/bold/boldui
 */

import { Plugin, icons } from 'ckeditor5/src/core.js';
import { ButtonView, MenuBarMenuListItemButtonView } from 'ckeditor5/src/ui.js';
import { getButtonCreator } from '../utils.js';

const BOLD = 'bold';

/**
 * The bold UI feature. It introduces the Bold button.
 */
export default class BoldUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'BoldUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = editor.locale.t;
		const createButton = getButtonCreator( {
			editor,
			commandName: BOLD,
			plugin: this,
			icon: icons.bold,
			label: t( 'Bold' ),
			keystroke: 'CTRL+B'
		} );

		// Add bold button to feature components.
		editor.ui.componentFactory.add( BOLD, () => createButton( ButtonView ) );
		editor.ui.componentFactory.add( 'menuBar:' + BOLD, () => createButton( MenuBarMenuListItemButtonView ) );
	}
}
