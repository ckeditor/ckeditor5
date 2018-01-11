/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module basic-styles/strikethrough
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import StrikethroughEngine from './strikethroughengine';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import strikethroughIcon from '../theme/icons/strikethrough.svg';

/**
 * The strikethrough feature. It introduces the Strikethrough button and the <kbd>Ctrl+Shift+X</kbd> keystroke.
 *
 * It uses the {@link module:basic-styles/strikethroughengine~StrikethroughEngine strikethrough engine feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Strikethrough extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ StrikethroughEngine ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Strikethrough';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;
		const command = editor.commands.get( 'strikethrough' );
		const keystroke = 'CTRL+SHIFT+X';

		// Add strikethrough button to feature components.
		editor.ui.componentFactory.add( 'strikethrough', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Strikethrough' ),
				icon: strikethroughIcon,
				keystroke,
				tooltip: true
			} );

			view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			// Execute command.
			this.listenTo( view, 'execute', () => editor.execute( 'strikethrough' ) );

			return view;
		} );

		// Set the Ctrl+Shift+X keystroke.
		editor.keystrokes.set( keystroke, 'strikethrough' );
	}
}
