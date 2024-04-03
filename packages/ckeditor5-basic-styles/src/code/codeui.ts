/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/code/codeui
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { ButtonView, MenuBarMenuListItemButtonView } from 'ckeditor5/src/ui.js';
import { getButtonCreator } from '../utils.js';

import codeIcon from '../../theme/icons/code.svg';

import '../../theme/code.css';

const CODE = 'code';

/**
 * The code UI feature. It introduces the Code button.
 */
export default class CodeUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'CodeUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = editor.locale.t;
		const createButton = getButtonCreator( {
			editor,
			commandName: CODE,
			plugin: this,
			icon: codeIcon,
			label: t( 'Code' )
		} );

		// Add code button to feature components.
		editor.ui.componentFactory.add( CODE, () => {
			const buttonView = createButton( ButtonView );
			const command = editor.commands.get( CODE )!;

			buttonView.set( {
				tooltip: true
			} );

			// Bind button model to command.
			buttonView.bind( 'isOn' ).to( command, 'value' );

			return buttonView;
		} );

		editor.ui.componentFactory.add( 'menuBar:' + CODE, () => {
			return createButton( MenuBarMenuListItemButtonView );
		} );
	}
}
