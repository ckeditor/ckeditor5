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
		const editor = this.editor;
		const styles = editor.plugins.get( ImageStyleEngine ).imageStyles;

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
 * 		const imageConfig = {
 *			styles: [ 'imageStyleFull', 'imageStyleSide' ]
 *		};
 *
 * which configures two default styles:
 *
 *  * the "full" style which doesn't apply any class, e.g. for images styled to span 100% width of the content,
 *  * the "side" style with the `.image-style-side` CSS class.
 *
 * See {@link module:image/imagestyle/imagestyleengine~ImageStyleEngine.defaultStyles} to learn more about default
 * styles provided by the image feature.
 *
 * The {@link module:image/imagestyle/imagestyleengine~ImageStyleEngine.defaultStyles default styles} can be customized,
 * e.g. to change the icon, title or CSS class of the style. The feature also provides several
 * {@link module:image/imagestyle/imagestyleengine~ImageStyleEngine.defaultIcons default icons} to chose from.
 *
 *		import customIcon from 'custom-icon.svg';
 *
 *		// ...
 *
 *		const imageConfig = {
 *			styles: [
 *				// This will only customize the icon of the "full" style.
 *				// Note: 'right' is one of default icons provided by the feature.
 *				{ name: 'imageStyleFull', icon: 'right' },
 *
 *				// This will customize the icon, title and CSS class of the default "side" style.
 *				{ name: 'imageStyleSide', icon: customIcon, title: 'My side style', class: 'custom-side-image' }
 *			]
 *		};
 *
 * If none of the default styles is good enough, it is possible to define independent custom styles too:
 *
 *		import fullSizeIcon from '@ckeditor/ckeditor5-core/theme/icons/object-center.svg';
 *		import sideIcon from '@ckeditor/ckeditor5-core/theme/icons/object-right.svg';
 *
 *		// ...
 *
 *		const imageConfig = {
 *			styles: [
 *				// A completely custom full size style with no class, used as a default.
 *				{ name: 'fullSize', title: 'Full size', icon: fullSizeIcon, isDefault: true },
 *
 *				{ name: 'side', title: 'To the side', icon: sideIcon, className: 'side-image' }
 *			]
 *		};
 *
 * Note: Setting `title` to one of {@link module:image/imagestyle/imagestyleengine~ImageStyleEngine#localizedDefaultStylesTitles}
 * will automatically translate it to the language of the editor.
 *
 * Read more about styling images in the {@glink features/image#Image-styles Image styles guide}.
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
