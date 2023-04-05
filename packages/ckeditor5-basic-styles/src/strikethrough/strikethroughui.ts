/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/strikethrough/strikethroughui
 */

import { Plugin } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';
import type AttributeCommand from '../attributecommand';

import strikethroughIcon from '../../theme/icons/strikethrough.svg';

const STRIKETHROUGH = 'strikethrough';

/**
 * The strikethrough UI feature. It introduces the Strikethrough button.
 */
export default class StrikethroughUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'StrikethroughUI' {
		return 'StrikethroughUI';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = editor.t;

		// Add strikethrough button to feature components.
		editor.ui.componentFactory.add( STRIKETHROUGH, locale => {
			const command: AttributeCommand = editor.commands.get( STRIKETHROUGH )!;
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Strikethrough' ),
				icon: strikethroughIcon,
				keystroke: 'CTRL+SHIFT+X',
				tooltip: true,
				isToggleable: true
			} );

			view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			// Execute command.
			this.listenTo( view, 'execute', () => {
				editor.execute( STRIKETHROUGH );
				editor.editing.view.focus();
			} );

			return view;
		} );
	}
}
