/**
 * @license Copyright (c) 2017, CKSource - Rémy Hubscher. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module basic-styles/strike
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import StrikeEngine from './strikeengine';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import strikeIcon from '../theme/icons/strike.svg';

/**
 * The strike feature. It introduces the Strike button and the <kbd>Ctrl+Shift+X</kbd> keystroke.
 *
 * It uses the {@link module:basic-styles/strikeengine~StrikeEngine strike engine feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Strike extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ StrikeEngine ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Strike';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;
		const command = editor.commands.get( 'strike' );
		const keystroke = 'CTRL+SHIFT+X';

		// Add strike button to feature components.
		editor.ui.componentFactory.add( 'strike', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Strike' ),
				icon: strikeIcon,
				keystroke,
				tooltip: true
			} );

			view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			// Execute command.
			this.listenTo( view, 'execute', () => editor.execute( 'strike' ) );

			return view;
		} );

		// Set the Ctrl+Shift+X keystroke.
		editor.keystrokes.set( keystroke, 'strike' );
	}
}
