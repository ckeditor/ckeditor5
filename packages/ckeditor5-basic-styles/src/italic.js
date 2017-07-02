/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module basic-styles/italic
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ItalicEngine from './italicengine';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import italicIcon from '../theme/icons/italic.svg';

/**
 * The italic feature. It introduces the Italic button and the <kbd>Ctrl+I</kbd> keystroke.
 *
 * It uses the {@link module:basic-styles/italicengine~ItalicEngine italic engine feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Italic extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ItalicEngine ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Italic';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;
		const command = editor.commands.get( 'italic' );
		const keystroke = 'CTRL+I';

		// Add bold button to feature components.
		editor.ui.componentFactory.add( 'italic', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Italic' ),
				icon: italicIcon,
				keystroke,
				tooltip: true
			} );

			view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			// Execute command.
			this.listenTo( view, 'execute', () => editor.execute( 'italic' ) );

			return view;
		} );

		// Set the Ctrl+I keystroke.
		editor.keystrokes.set( keystroke, 'italic' );
	}
}
