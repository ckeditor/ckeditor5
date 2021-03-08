/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/image/imageblockediting
 */

import { Plugin } from 'ckeditor5/src/core';

import { modelToViewAttributeConverter, srcsetAttributeConverter, viewFigureToModel } from './converters';
import { toImageWidget, createImageViewElement, getImageTypeMatcher } from './utils';
import ImageEditing from './imageediting';
import ImageTypeCommand from './imagetypecommand';

/**
 * The image block plugin.
 *
 * It registers:
 *
 * * `<image>` as a block element in the document schema, and allows `alt`, `src` and `srcset` attributes.
 * * converters for editing and data pipelines.,
 * * {@link module:image/image/imagetypecommand~ImageTypeCommand `'imageTypeBlock'`} command that converts inline images into
 * block images.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageBlockEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageEditing ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageBlockEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const t = editor.t;
		const conversion = editor.conversion;

		// Converters 'alt' and 'srcset' are added in 'ImageEditing' plugin.
		schema.register( 'image', {
			isObject: true,
			isBlock: true,
			allowWhere: '$block',
			allowAttributes: [ 'alt', 'src', 'srcset' ]
		} );

		conversion.for( 'dataDowncast' )
			.elementToElement( {
				model: 'image',
				view: ( modelElement, { writer } ) => createImageViewElement( writer, 'image' )
			} );

		conversion.for( 'editingDowncast' )
			.elementToElement( {
				model: 'image',
				view: ( modelElement, { writer } ) => toImageWidget(
					createImageViewElement( writer, 'image' ), writer, t( 'image widget' )
				)
			} );

		conversion.for( 'downcast' )
			.add( modelToViewAttributeConverter( 'image', 'src' ) )
			.add( modelToViewAttributeConverter( 'image', 'alt' ) )
			.add( srcsetAttributeConverter( 'image' ) );

		// More image related upcasts are in 'ImageEditing' plugin.
		conversion.for( 'upcast' )
			.elementToElement( {
				view: getImageTypeMatcher( 'image', editor ),
				model: ( viewImage, { writer } ) => writer.createElement( 'image', { src: viewImage.getAttribute( 'src' ) } )
			} )
			.add( viewFigureToModel() );

		if ( editor.plugins.has( 'ImageInlineEditing' ) ) {
			editor.commands.add( 'imageTypeBlock', new ImageTypeCommand( this.editor, 'image' ) );
		}
	}
}
