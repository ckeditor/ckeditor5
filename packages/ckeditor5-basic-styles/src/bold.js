/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module basic-styles/bold
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import BoldEngine from './boldengine';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import boldIcon from '../theme/icons/bold.svg';

/**
 * The bold feature. It introduces the Bold button and the <kbd>Ctrl+B</kbd> keystroke.
 *
 * It uses the {@link module:basic-styles/boldengine~BoldEngine bold engine feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Bold extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ BoldEngine ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Bold';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;
		const command = editor.commands.get( 'bold' );
		const keystroke = 'CTRL+B';

		// Add bold button to feature components.
		editor.ui.componentFactory.add( 'bold', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Bold' ),
				icon: boldIcon,
				keystroke,
				tooltip: true
			} );

			view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			// Execute command.
			this.listenTo( view, 'execute', () => editor.execute( 'bold' ) );

			return view;
		} );

		// Set the Ctrl+B keystroke.
		editor.keystrokes.set( keystroke, 'bold' );
	}
}
