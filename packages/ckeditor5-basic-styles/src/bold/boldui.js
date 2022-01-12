/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/bold/boldui
 */

import { Plugin } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';

import boldIcon from '../../theme/icons/bold.svg';

const BOLD = 'bold';

/**
 * The bold UI feature. It introduces the Bold button.
 *
 * @extends module:core/plugin~Plugin
 */
export default class BoldUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'BoldUI';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		// Add bold button to feature components.
		editor.ui.componentFactory.add( BOLD, locale => {
			const command = editor.commands.get( BOLD );
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Bold' ),
				icon: boldIcon,
				keystroke: 'CTRL+B',
				tooltip: true,
				isToggleable: true
			} );

			view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			// Execute command.
			this.listenTo( view, 'execute', () => {
				editor.execute( BOLD );
				editor.editing.view.focus();
			} );

			return view;
		} );
	}
}
