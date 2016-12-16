/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagestyle/imagestyle
 */

import Plugin from '../../core/plugin.js';
import ImageStyleEngine from './imagestyleengine.js';
import ButtonView from '../../ui/button/buttonview.js';

export default class ImageStyle extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageStyleEngine ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;
		const command = editor.commands.get( 'imagestyle' );

		// Add bold button to feature components.
		editor.ui.componentFactory.add( 'imagestyle', ( locale ) => {
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Image style' ),
				icon: 'bold'
			} );

			view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			// // Execute command.
			this.listenTo( view, 'execute', () => editor.execute( 'imagestyle' ) );

			return view;
		} );
	}
}
