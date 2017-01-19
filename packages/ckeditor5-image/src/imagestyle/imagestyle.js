/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagestyle/imagestyle
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ImageStyleEngine from './imagestyleengine';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

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

		// Push buttons to default image toolbar if one exists.
		const defaultImageToolbarConfig = this.editor.config.get( 'image.defaultToolbar' );

		if ( defaultImageToolbarConfig ) {
			styles.forEach( style => defaultImageToolbarConfig.push( style.name ) );
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
		const command = editor.commands.get( style.name );

		editor.ui.componentFactory.add( style.name, ( locale ) => {
			const view = new ButtonView( locale );

			view.set( {
				label: style.title,
				icon: style.icon,
				tooltip: true
			} );

			view.bind( 'isEnabled' ).to( command, 'isEnabled' );
			view.bind( 'isOn' ).to( command, 'value' );

			this.listenTo( view, 'execute', () => editor.execute( style.name ) );

			return view;
		} );
	}
}
