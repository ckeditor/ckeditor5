/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/image/imageengine
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import {
	viewFigureToModel,
	modelToViewAttributeConverter,
	srcsetAttributeConverter
} from './converters';

import { toImageWidget } from './utils';

import { downcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';
import { upcastElementToElement, upcastAttributeToAttribute } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';

import ViewContainerElement from '@ckeditor/ckeditor5-engine/src/view/containerelement';
import ViewEmptyElement from '@ckeditor/ckeditor5-engine/src/view/emptyelement';

/**
 * The image engine plugin.
 * Registers `<image>` as a block element in the document schema, and allows `alt`, `src` and `srcset` attributes.
 * Registers converters for editing and data pipelines.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageEngine extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const t = editor.t;
		const conversion = editor.conversion;

		// Configure schema.
		schema.register( 'image', {
			isObject: true,
			isBlock: true,
			allowWhere: '$block',
			allowAttributes: [ 'alt', 'src', 'srcset' ]
		} );

		editor.conversion.for( 'dataDowncast' ).add( downcastElementToElement( {
			model: 'image',
			view: () => createImageViewElement()
		} ) );

		editor.conversion.for( 'editingDowncast' ).add( downcastElementToElement( {
			model: 'image',
			view: () => toImageWidget( createImageViewElement(), t( 'image widget' ) )
		} ) );

		conversion.for( 'downcast' )
			.add( modelToViewAttributeConverter( 'src' ) )
			.add( modelToViewAttributeConverter( 'alt' ) )
			.add( srcsetAttributeConverter() );

		conversion.for( 'upcast' )
			.add( upcastElementToElement( {
				view: {
					name: 'img',
					attribute: {
						src: true
					}
				},
				model: ( viewImage, modelWriter ) => modelWriter.createElement( 'image', { src: viewImage.getAttribute( 'src' ) } )
			} ) )
			.add( upcastAttributeToAttribute( {
				view: {
					name: 'img',
					key: 'alt'
				},
				model: 'alt'
			} ) )
			.add( upcastAttributeToAttribute( {
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
			} ) )
			.add( viewFigureToModel() );
	}
}

// Creates a view element representing the image.
//
//		<figure class="image"><img></img></figure>
//
// Note that `alt` and `src` attributes are converted separately, so they are not included.
//
// @private
// @return {module:engine/view/containerelement~ContainerElement}
export function createImageViewElement() {
	return new ViewContainerElement( 'figure', { class: 'image' }, new ViewEmptyElement( 'img' ) );
}
