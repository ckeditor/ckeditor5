/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagestyle/imagestyleui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ImageStyleEditing from './imagestyleediting';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import '../../theme/imagestyle.css';

/**
 * The image style UI plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageStyleUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const styles = editor.plugins.get( ImageStyleEditing ).imageStyles;

		for ( const style of styles ) {
			this._createButton( style );
		}
	}

	/**
	 * Creates a button for each style and stores it in the editor {@link module:ui/componentfactory~ComponentFactory ComponentFactory}.
	 *
	 * @private
	 * @param {module:image/imagestyle/imagestyleediting~ImageStyleFormat} style
	 */
	_createButton( style ) {
		const editor = this.editor;

		editor.ui.componentFactory.add( style.name, locale => {
			const command = editor.commands.get( style.name );
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
