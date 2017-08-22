/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module basic-styles/underline
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import UnderlineEngine from './underlineengine';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import underlineIcon from '../theme/icons/underline.svg';

/**
 * The underline feature. It introduces the Underline button and the <kbd>Ctrl+U</kbd> keystroke.
 *
 * It uses the {@link module:basic-styles/underlineengine~UnderlineEngine underline engine feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Underline extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ UnderlineEngine ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Underline';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;
		const command = editor.commands.get( 'underline' );
		const keystroke = 'CTRL+U';

		// Add bold button to feature components.
		editor.ui.componentFactory.add( 'underline', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Underline' ),
				icon: underlineIcon,
				keystroke,
				tooltip: true
			} );

			view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			// Execute command.
			this.listenTo( view, 'execute', () => editor.execute( 'underline' ) );

			return view;
		} );

		// Set the Ctrl+U keystroke.
		editor.keystrokes.set( keystroke, 'underline' );
	}
}
