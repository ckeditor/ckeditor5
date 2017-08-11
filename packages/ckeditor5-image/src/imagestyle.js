/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagestyle
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ImageStyleEngine from './imagestyle/imagestyleengine';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

/**
 * The image style plugin.
 *
 * Uses the {@link module:image/imagestyle/imagestyleengine~ImageStyleEngine}.
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
	static get pluginName() {
		return 'ImageStyle';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const styles = this.editor.config.get( 'image.styles' );

		for ( const style of styles ) {
			this._createButton( style );
		}
	}

	/**
	 * Creates a button for each style and stores it in the editor {@link module:ui/componentfactory~ComponentFactory ComponentFactory}.
	 *
	 * @private
	 * @param {module:image/imagestyle/imagestyleengine~ImageStyleFormat} style
	 */
	_createButton( style ) {
		const editor = this.editor;
		const command = editor.commands.get( style.name );

		editor.ui.componentFactory.add( style.name, locale => {
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

/**
 * Available image styles.
 * The option is used by the {@link module:image/imagestyle/imagestyleengine~ImageStyleEngine} feature.
 *
 * The default value is:
 *
 *		import fullSizeIcon from '@ckeditor/ckeditor5-core/theme/icons/object-center.svg';
 *		import sideIcon from '@ckeditor/ckeditor5-core/theme/icons/object-right.svg';
 *
 *		// ...
 *
 *		const imageConfig = {
 *			styles: [
 *				// Option which defines a style which doesn't apply any class.
 *				// The style is titled "full" because such images are often styled to take 100% width of the content.
 *				{ name: 'imageStyleFull', title: t( 'Full size image' ), icon: fullSizeIcon, value: null },
 *
 *				// Option which represents a side image.
 *				{ name: 'imageStyleSide', title: t( 'Side image' ), icon: sideIcon, value: 'side', className: 'image-style-side' }
 *			]
 *		};
 *
 * Read more about styling images in the {@linkTODO Image styles guide}.
 *
 * The feature creates commands based on defined styles, so you can change the style of a selected image by executing
 * the following command:
 *
 *		editor.execute( 'imageStyleSide' );
 *
 * The features creates also buttons which execute the commands, so assuming that you use the
 * default image styles setting you can {@link module:image/image~ImageConfig#toolbar configure the image toolbar}
 * to contain these options:
 *
 *		const imageConfig = {
 *			toolbar: [ 'imageStyleFull', 'imageStyleSide' ]
 *		};
 *
 * @member {Array.<module:image/imagestyle/imagestyleengine~ImageStyleFormat>} module:image/image~ImageConfig#styles
 */
