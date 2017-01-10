/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagestyle/imagestyleengine
 */

import Plugin from 'ckeditor5-core/src/plugin';
import ImageStyleCommand from './imagestylecommand';
import ImageEngine from '../imageengine';
import { modelToViewSetStyle } from './converters';
import fullSizeIcon from 'ckeditor5-core/theme/icons/object-center.svg';
import sideIcon from 'ckeditor5-core/theme/icons/object-right.svg';
import buildViewConverter from 'ckeditor5-engine/src/conversion/buildviewconverter';

/**
 * The image style engine plugin. Sets default configuration, creates converters and registers
 * {@link module:image/imagestyle/imagestylecommand~ImageStyleCommand ImageStyleCommand}.
 *
 * @extends {module:core/plugin~Plugin}
 */
export default class ImageStyleEngine extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageEngine ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;
		const doc = editor.document;
		const schema = doc.schema;
		const data = editor.data;
		const editing = editor.editing;

		// Define default configuration.
		editor.config.define( 'image.styles', [
			// This option is equal to situation when no style is applied.
			{ name: 'imageStyleFull', title: t( 'Full size image' ), icon: fullSizeIcon, value: null },

			// This represents side image.
			{ name: 'imageStyleSide', title: t( 'Side image' ), icon: sideIcon, value: 'side', className: 'image-style-side' }
		] );

		// Get configuration.
		const styles = editor.config.get( 'image.styles' );

		// Allow imageStyle attribute in image.
		// We could call it 'style' but https://github.com/ckeditor/ckeditor5-engine/issues/559.
		schema.allow( { name: 'image', attributes: 'imageStyle', inside: '$root' } );

		// Converters for imageStyle attribute from model to view.
		const modelToViewConverter = modelToViewSetStyle( styles );
		editing.modelToView.on( 'addAttribute:imageStyle:image', modelToViewConverter );
		data.modelToView.on( 'addAttribute:imageStyle:image', modelToViewConverter );
		editing.modelToView.on( 'changeAttribute:imageStyle:image', modelToViewConverter );
		data.modelToView.on( 'changeAttribute:imageStyle:image', modelToViewConverter );
		editing.modelToView.on( 'removeAttribute:imageStyle:image', modelToViewConverter );
		data.modelToView.on( 'removeAttribute:imageStyle:image', modelToViewConverter );

		const viewConverter = buildViewConverter().for( data.viewToModel );

		for ( let style of styles ) {
			if ( style.value === null ) {
				continue;
			}

			viewConverter
				.from( { name: 'figure', class: [ 'image', style.className ] } )
				.consuming( { class: style.className } )
				.toAttribute( 'imageStyle', style.value );
		}

		// Register separate command for each style.
		for ( let style of styles ) {
			editor.commands.set( style.name, new ImageStyleCommand( editor, style ) );
		}
	}
}

/**
 * Image style format descriptor.
 *
 *	import fullIcon from 'path/to/icon.svg`;
 *
 *	const imageStyleFormat = {
 *		name: 'fullSizeImage',
 *		value: 'full',
 *		icon: fullIcon,
 *		title: `Full size image`,
 *		class: `image-full-size`
 *	}
 *
 * @typedef {Object} module:image/imagestyle/imagestyleengine~ImageStyleFormat
 * @property {String} name Name of the style. It will be used to:
 * * register {@link module:core/command/command~Command command} which will apply this style,
 * * store style's button in editor's {@link module:ui/componentfactory~ComponentFactory ComponentFactory}.
 * @property {String} value Value used to store this style in model attribute.
 * When value is `null` style will be used as default one. Default style does not apply any CSS class to the view element.
 * @property {String} icon SVG icon representation to use when creating style's button.
 * @property {String} title Style's title.
 * @property {String} className CSS class used to represent style in view.
 */
