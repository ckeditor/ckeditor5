/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module basic-styles/italic/italicui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import italicIcon from '../../theme/icons/italic.svg';

const ITALIC = 'italic';

/**
 * The italic UI feature. It introduces the Italic button.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ItalicUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		// Add bold button to feature components.
		editor.ui.componentFactory.add( ITALIC, locale => {
			const command = editor.commands.get( ITALIC );
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Italic' ),
				icon: italicIcon,
				keystroke: 'CTRL+I',
				tooltip: true
			} );

			view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			// Execute command.
			this.listenTo( view, 'execute', () => editor.execute( ITALIC ) );

			return view;
		} );
	}
}
