/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/image/imageediting
 */

import { Plugin } from 'ckeditor5/src/core';
import ImageLoadObserver from './imageloadobserver';

import {
	viewFigureToModel,
	modelToViewAttributeConverter,
	srcsetAttributeConverter
} from './converters';

import { toImageWidget } from './utils';

import InsertImageCommand from './insertimagecommand';

/**
 * The image engine plugin.
 *
 * It registers:
 *
 * * `<image>` as a block element in the document schema, and allows `alt`, `src` and `srcset` attributes.
 * * converters for editing and data pipelines.
 * * `'insertImage'` command.
 * * `'imageInsert'` command as an alias for `insertImage` command.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const t = editor.t;
		const conversion = editor.conversion;

		// See https://github.com/ckeditor/ckeditor5-image/issues/142.
		editor.editing.view.addObserver( ImageLoadObserver );

		// Configure schema.
		schema.register( 'image', {
			isObject: true,
			isBlock: true,
			allowWhere: '$block',
			allowAttributes: [ 'alt', 'src', 'srcset' ]
		} );

		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'image',
			view: ( modelElement, { writer } ) => createImageViewElement( writer )
		} );

		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'image',
			view: ( modelElement, { writer } ) => toImageWidget( createImageViewElement( writer ), writer, t( 'image widget' ) )
		} );

		conversion.for( 'downcast' )
			.add( modelToViewAttributeConverter( 'src' ) )
			.add( modelToViewAttributeConverter( 'alt' ) )
			.add( srcsetAttributeConverter() );

		conversion.for( 'upcast' )
			.elementToElement( {
				view: {
					name: 'img',
					attributes: {
						src: true
					}
				},
				model: ( viewImage, { writer } ) => writer.createElement( 'image', { src: viewImage.getAttribute( 'src' ) } )
			} )
			.attributeToAttribute( {
				view: {
					name: 'img',
					key: 'alt'
				},
				model: 'alt'
			} )
			.attributeToAttribute( {
				view: {
					name: 'img',
					key: 'srcset'
				},
				model: {
					key: 'srcset',
					value: viewImage => {
						const value = {
							data: viewImage.getAttribute( 'srcset' )
						};

						if ( viewImage.hasAttribute( 'width' ) ) {
							value.width = viewImage.getAttribute( 'width' );
						}

						return value;
					}
				}
			} )
			.add( viewFigureToModel() );

		const insertImageCommand = new InsertImageCommand( editor );

		// Register `insertImage` command and add `imageInsert` command as an alias for backward compatibility.
		editor.commands.add( 'insertImage', insertImageCommand );
		editor.commands.add( 'imageInsert', insertImageCommand );
	}
}

// Creates a view element representing the image.
//
//		<figure class="image"><img></img></figure>
//
// Note that `alt` and `src` attributes are converted separately, so they are not included.
//
// @private
// @param {module:engine/view/downcastwriter~DowncastWriter} writer
// @returns {module:engine/view/containerelement~ContainerElement}
export function createImageViewElement( writer ) {
	const emptyElement = writer.createEmptyElement( 'img' );
	const figure = writer.createContainerElement( 'figure', { class: 'image' } );

	writer.insert( writer.createPositionAt( figure, 0 ), emptyElement );

	return figure;
}
