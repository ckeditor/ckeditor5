/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/underline/underlineui
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { ButtonView, MenuBarMenuListItemButtonView } from 'ckeditor5/src/ui.js';
import { getButtonCreator } from '../utils.js';

import underlineIcon from '../../theme/icons/underline.svg';

const UNDERLINE = 'underline';

/**
 * The underline UI feature. It introduces the Underline button.
 */
export default class UnderlineUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'UnderlineUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = editor.locale.t;
		const createButton = getButtonCreator( {
			editor,
			commandName: UNDERLINE,
			plugin: this,
			icon: underlineIcon,
			label: t( 'Underline' ),
			keystroke: 'CTRL+U'
		} );

		// Add bold button to feature components.
		editor.ui.componentFactory.add( UNDERLINE, () => createButton( ButtonView ) );
		editor.ui.componentFactory.add( 'menuBar:' + UNDERLINE, () => createButton( MenuBarMenuListItemButtonView ) );
	}
}
