/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Feature from '../core/feature.js';
import ItalicEngine from './italicengine.js';
import ButtonView from '../ui/button/buttonview.js';

/**
 * The italic feature. It introduces the Italic button and the <kbd>Ctrl+I</kbd> keystroke.
 *
 * It uses the {@link basic-styles.ItalicEngine italic engine feature}.
 *
 * @memberOf basic-styles
 * @extends core.Feature
 */
export default class Italic extends Feature {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ItalicEngine ];
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
		editor.ui.featureComponents.add( 'italic', ( locale ) => {
			const view = new ButtonView( locale );

			view.set( {
				isEnabled: true,
				isOn: false,
				label: t( 'Italic' ),
				icon: 'italic',
				keystroke
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
