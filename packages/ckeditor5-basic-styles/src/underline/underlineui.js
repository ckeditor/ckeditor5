/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/underline/underlineui
 */

import { Plugin } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';

import underlineIcon from '../../theme/icons/underline.svg';

const UNDERLINE = 'underline';

/**
 * The underline UI feature. It introduces the Underline button.
 *
 * @extends module:core/plugin~Plugin
 */
export default class UnderlineUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'UnderlineUI';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		// Add bold button to feature components.
		editor.ui.componentFactory.add( UNDERLINE, locale => {
			const command = editor.commands.get( UNDERLINE );
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
