/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagestyle/imagestyleengine
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ImageStyleCommand from './imagestylecommand';
import ImageEngine from '../image/imageengine';
import { viewToModelStyleAttribute, modelToViewStyleAttribute } from './converters';
import fullSizeIcon from '@ckeditor/ckeditor5-core/theme/icons/object-center.svg';
import sideIcon from '@ckeditor/ckeditor5-core/theme/icons/object-right.svg';

/**
 * The image style engine plugin. It sets the default configuration, creates converters and registers
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
		const modelToViewConverter = modelToViewStyleAttribute( styles );
		editing.modelToView.on( 'addAttribute:imageStyle:image', modelToViewConverter );
		data.modelToView.on( 'addAttribute:imageStyle:image', modelToViewConverter );
		editing.modelToView.on( 'changeAttribute:imageStyle:image', modelToViewConverter );
		data.modelToView.on( 'changeAttribute:imageStyle:image', modelToViewConverter );
		editing.modelToView.on( 'removeAttribute:imageStyle:image', modelToViewConverter );
		data.modelToView.on( 'removeAttribute:imageStyle:image', modelToViewConverter );

		// Converter for figure element from view to model.
		data.viewToModel.on( 'element:figure', viewToModelStyleAttribute( styles ), { priority: 'low' } );

		// Register separate command for each style.
		for ( const style of styles ) {
			editor.commands.add( style.name, new ImageStyleCommand( editor, style ) );
		}
	}
}

/**
 * Image style format descriptor.
 *
 *		import fullIcon from 'path/to/icon.svg`;
 *
 *		const imageStyleFormat = {
 *			name: 'fullSizeImage',
 *			value: 'full',
 *			icon: fullIcon,
 *			title: 'Full size image',
 *			class: 'image-full-size'
 *		}
 *
 * @typedef {Object} module:image/imagestyle/imagestyleengine~ImageStyleFormat
 * @property {String} name The name of the style. It will be used to:
 * * register the {@link module:core/command~Command command} which will apply this style,
 * * store the style's button in the editor {@link module:ui/componentfactory~ComponentFactory}.
 * @property {String} value A value used to store this style in the model attribute.
 * When the value is `null`, the style will be used as the default one. A default style does not apply any CSS class to the view element.
 * @property {String} icon An SVG icon source (as XML string) to use when creating the style's button.
 * @property {String} title The style's title.
 * @property {String} className The CSS class used to represent the style in view.
 */
