/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/underline/underlineui
 */

import { Plugin } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';
import type AttributeCommand from '../attributecommand';

import underlineIcon from '../../theme/icons/underline.svg';

const UNDERLINE = 'underline';

/**
 * The underline UI feature. It introduces the Underline button.
 */
export default class UnderlineUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'UnderlineUI' {
		return 'UnderlineUI';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = editor.t;

		// Add bold button to feature components.
		editor.ui.componentFactory.add( UNDERLINE, locale => {
			const command: AttributeCommand = editor.commands.get( UNDERLINE )!;
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Underline' ),
				icon: underlineIcon,
				keystroke: 'CTRL+U',
				tooltip: true,
				isToggleable: true
			} );

			view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			// Execute command.
			this.listenTo( view, 'execute', () => {
				editor.execute( UNDERLINE );
				editor.editing.view.focus();
			} );

			return view;
		} );
	}
}
