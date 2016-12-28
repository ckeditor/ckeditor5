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

/**
 * The image style plugin.
 *
 * Uses {@link module:image/imagestyle/imagestyleengine~ImageStyleEngine}.
 *
 * @extends module:core/plugin~Plugin
 */
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
		const styles = this.editor.config.get( 'image.styles' );

		for ( let style of styles ) {
			this._createButton( style );
		}

		// If there is no default image toolbar configuration, add all style buttons.
		const imageToolbarConfig = this.editor.config.get( 'image.toolbar' );

		if ( !imageToolbarConfig ) {
			this.editor.config.set( 'image.toolbar', styles.map( style => style.name ) );
		}
	}

	/**
	 * Creates button for each style and stores it in editor's {@link module:ui/componentfactory~ComponentFactory ComponentFactory}.
	 *
	 * @private
	 * @param {module:image/imagestyle/imagestyleengine~ImageStyleFormat} style
	 */
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

			this.listenTo( view, 'execute', () => editor.execute( 'imagestyle', { value: style.value } ) );

			return view;
		} );
	}
}
