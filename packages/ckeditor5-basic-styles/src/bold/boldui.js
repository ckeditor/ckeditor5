/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module basic-styles/bold/boldui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

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
				tooltip: true
			} );

			view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			// Execute command.
			this.listenTo( view, 'execute', () => editor.execute( BOLD ) );

			return view;
		} );
	}
}
