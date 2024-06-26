/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/italic/italicui
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { MenuBarMenuListItemButtonView, ButtonView } from 'ckeditor5/src/ui.js';
import { getButtonCreator } from '../utils.js';

import italicIcon from '../../theme/icons/italic.svg';

const ITALIC = 'italic';

/**
 * The italic UI feature. It introduces the Italic button.
 */
export default class ItalicUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ItalicUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = editor.locale.t;
		const createButton = getButtonCreator( {
			editor,
			commandName: ITALIC,
			plugin: this,
			icon: italicIcon,
			keystroke: 'CTRL+I',
			label: t( 'Italic' )
		} );

		// Add bold button to feature components.
		editor.ui.componentFactory.add( ITALIC, () => createButton( ButtonView ) );
		editor.ui.componentFactory.add( 'menuBar:' + ITALIC, () => createButton( MenuBarMenuListItemButtonView ) );
	}
}
