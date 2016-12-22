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

		// Get configuration.
		const styles = editor.config.get( 'image.styles' );

		for ( let style of styles ) {
			this._createButton( style );
		}
	}

	_createButton( style ) {
		const editor = this.editor;
		const command = editor.commands.get( 'imagestyle' );
		const t = editor.t;

		// Add bold button to feature components.
		editor.ui.componentFactory.add( style.name, ( locale ) => {
			const view = new ButtonView( locale );

			view.set( {
				label: t( style.title ),
				icon: style.icon
			} );

			view.bind( 'isEnabled' ).to( command, 'isEnabled' );
			view.bind( 'isOn' ).to( command, 'value', ( commandValue ) => {
				return commandValue == style.value;
			} );

			// // Execute command.
			this.listenTo( view, 'execute', () => editor.execute( 'imagestyle', { value: style.value } ) );

			return view;
		} );
	}
}
