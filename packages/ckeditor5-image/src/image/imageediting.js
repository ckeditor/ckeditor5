/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/image/imageediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import ImageLoadObserver from './imageloadobserver';

import {
	viewFigureToModel,
	modelToViewAttributeConverter,
	srcsetAttributeConverter
} from './converters';

import { toImageWidget } from './utils';

import ImageInsertCommand from './imageinsertcommand';
import ImageBlockToInlineCommand from './imageblocktoinlinecommand';
import ImageInlineToBlockCommand from './imageinlinetoblockcommand';

/**
 * The image engine plugin.
 *
 * It registers:
 *
 * * `<image>` as a block element in the document schema, and allows `alt`, `src` and `srcset` attributes.
 * * converters for editing and data pipelines.
 * * `'imageInsert'` command.
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
		schema.register( 'imageInline', {
			isObject: true,
			isInline: true,
			allowWhere: '$text',
			allowAttributes: [ 'alt', 'src', 'srcset' ]
		} );

		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'image',
			view: ( modelElement, { writer } ) => createImageViewElement( writer )
		} ).elementToElement( {
			model: 'imageInline',
			view: ( modelElement, { writer } ) => writer.createContainerElement( 'img' )
		} );

		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'image',
			view: ( modelElement, { writer } ) => toImageWidget( createImageViewElement( writer ), writer, t( 'image widget' ) )
		} ).elementToElement( {
			model: 'imageInline',
			view: ( modelElement, { writer } ) => toWidget( writer.createContainerElement( 'img' ), writer )
		} ).attributeToAttribute( {
			model: {
				name: 'imageInline',
				key: 'src'
			},
			view: 'src'
		} );

		conversion.for( 'downcast' )
			.add( modelToViewAttributeConverter( 'src' ) )
			.add( modelToViewAttributeConverter( 'src', true ) )
			.add( modelToViewAttributeConverter( 'alt' ) )
			.add( modelToViewAttributeConverter( 'alt', true ) )
			.add( srcsetAttributeConverter() )
			.add( srcsetAttributeConverter( true ) );

		conversion.for( 'upcast' )
			.elementToElement( {
				view: matchImageInsideParent( 'p' ),
				model: ( viewImage, { writer } ) => writer.createElement( 'imageInline', { src: viewImage.getAttribute( 'src' ) } )
			} )
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

		editor.commands.add( 'imageInsert', new ImageInsertCommand( editor ) );
		editor.commands.add( 'imageBlockToInline', new ImageBlockToInlineCommand( this.editor ) );
		editor.commands.add( 'imageInlineToBlock', new ImageInlineToBlockCommand( this.editor ) );
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

/**
 * {@link module:engine/view/matcher~Matcher} pattern. Returns function which checks if a given element is `<image>` element that is placed
 * inside the element of a provided type.
 *
 * @param {string} parentType
 * @returns {Function}
 */
function matchImageInsideParent( parentType ) {
	return element => {
		const parent = element.parent;

		if ( element.name === 'img' && element.hasAttribute( 'src' ) && // Convert only images with src attribute.
			parent && parent.name === parentType // Convert only images inside paragraph.
		) {
			return { name: true };
		}

		return null;
	};
}
