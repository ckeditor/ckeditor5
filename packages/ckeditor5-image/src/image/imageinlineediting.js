/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/image/imageinlineediting
 */

import { Plugin } from 'ckeditor5/src/core';

import { toImageWidget, createImageViewElement, getImageTypeMatcher } from './utils';
import { modelToViewAttributeConverter, srcsetAttributeConverter } from './converters';
import ImageEditing from './imageediting';
import ImageTypeCommand from './imagetypecommand';

/**
 * The image inline plugin.
 *
 * It registers:
 *
 * * `<imageInline>` as an inline element in the document schema, and allows `alt`, `src` and `srcset` attributes.
 * * converters for editing and data pipelines.
 * * {@link module:image/image/imagetypecommand~ImageTypeCommand `'imageTypeInline'`} command that converts block images into
 * inline images.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageInlineEditing extends Plugin {
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
		return 'ImageInlineEditing';
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
		schema.register( 'imageInline', {
			isObject: true,
			isInline: true,
			allowWhere: '$text',
			allowAttributes: [ 'alt', 'src', 'srcset' ]
		} );

		conversion.for( 'dataDowncast' )
			.elementToElement( {
				model: 'imageInline',
				view: ( modelElement, { writer } ) => writer.createEmptyElement( 'img' )
			} );

		conversion.for( 'editingDowncast' )
			.elementToElement( {
				model: 'imageInline',
				view: ( modelElement, { writer } ) => toImageWidget(
					createImageViewElement( writer, 'imageInline' ), writer, t( 'inline image widget' )
				)
			} );

		conversion.for( 'downcast' )
			.add( modelToViewAttributeConverter( 'imageInline', 'src' ) )
			.add( modelToViewAttributeConverter( 'imageInline', 'alt' ) )
			.add( srcsetAttributeConverter( 'imageInline' ) );

		// More image related upcasts are in 'ImageEditing' plugin.
		conversion.for( 'upcast' )
			.elementToElement( {
				view: getImageTypeMatcher( 'imageInline', editor ),
				model: ( viewImage, { writer } ) => writer.createElement( 'imageInline', { src: viewImage.getAttribute( 'src' ) } )
			} );

		if ( editor.plugins.has( 'ImageBlockEditing' ) ) {
			editor.commands.add( 'imageTypeInline', new ImageTypeCommand( this.editor, 'imageInline' ) );
		}
	}
}

