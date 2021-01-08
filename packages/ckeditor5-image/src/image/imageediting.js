/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/image/imageediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ImageLoadObserver from './imageloadobserver';

import {
	viewFigureToModel,
	modelToViewAttributeConverter,
	srcsetAttributeConverter
} from './converters';

import { toImageWidget } from './utils';

import ImageInsertCommand from './imageinsertcommand';
import ImageTypeToggleCommand from './imagetypetogglecommand';

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

		conversion.for( 'dataDowncast' )
			.elementToElement( {
				model: 'image',
				view: ( modelElement, { writer } ) => createImageViewElement( writer, 'image' )
			} )
			.elementToElement( {
				model: 'imageInline',
				view: ( modelElement, { writer } ) => writer.createEmptyElement( 'img' )
			} );

		conversion.for( 'editingDowncast' )
			.elementToElement( {
				model: 'image',
				view: ( modelElement, { writer } ) => toImageWidget(
					createImageViewElement( writer, 'image' ), writer, t( 'image widget' )
				)
			} )
			.elementToElement( {
				model: 'imageInline',
				view: ( modelElement, { writer } ) => toImageWidget(
					createImageViewElement( writer, 'imageInline' ), writer, t( 'inline image widget' )
				)
			} );

		conversion.for( 'downcast' )
			.add( modelToViewAttributeConverter( 'src' ) )
			.add( modelToViewAttributeConverter( 'alt' ) )
			.add( srcsetAttributeConverter() );

		conversion.for( 'upcast' )
			.elementToElement( {
				view: getImageTypeMatcher( 'image' ),
				model: ( viewImage, { writer } ) => writer.createElement( 'image', { src: viewImage.getAttribute( 'src' ) } )
			} )
			.elementToElement( {
				view: getImageTypeMatcher( 'imageInline' ),
				model: ( viewImage, { writer } ) => writer.createElement( 'imageInline', { src: viewImage.getAttribute( 'src' ) } )
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
		editor.commands.add( 'imageTypeToggle', new ImageTypeToggleCommand( this.editor ) );
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
// @param {'image'|'imageInline'} imageType The type of created image.
// @returns {module:engine/view/containerelement~ContainerElement}
export function createImageViewElement( writer, imageType ) {
	const emptyElement = writer.createEmptyElement( 'img' );

	const container = imageType === 'image' ?
		writer.createContainerElement( 'figure', { class: 'image' } ) :
		writer.createContainerElement( 'span', { class: 'image-inline' } );

	writer.insert( writer.createPositionAt( container, 0 ), emptyElement );

	return container;
}

// A function returning a {@link module:engine/view/matcher~Matcher} callback for a particular type of View images.
//
// @param {'image'|'imageInline'} matchImageType The type of created image.
// @returns {Function}
function getImageTypeMatcher( matchImageType ) {
	return element => {
		// Convert only images with src attribute.
		if ( !element.is( 'element', 'img' ) || !element.hasAttribute( 'src' ) ) {
			return null;
		}

		const imageType = element.findAncestor( 'figure' ) ? 'image' : 'imageInline';

		if ( imageType !== matchImageType ) {
			return null;
		}

		return { name: true, attributes: [ 'src' ] };
	};
}
