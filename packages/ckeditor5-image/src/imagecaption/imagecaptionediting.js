/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagecaption/imagecaptionediting
 */

import { Plugin } from 'ckeditor5/src/core';
import ImageCaptionToggleCommand from './imagecaptiontogglecommand';

import { enablePlaceholder } from 'ckeditor5/src/engine';
import { toWidgetEditable } from 'ckeditor5/src/widget';
import { isImage } from '../image/utils';
import { matchImageCaptionViewElement } from './utils';
import ImageInlineEditing from '../image/imageinlineediting';
import ImageBlockEditing from '../image/imageblockediting';

/**
 * The image caption engine plugin. It is responsible for:
 *
 * * registering converters for the caption element,
 * * registering converters for the caption model attribute,
 * * registering the {@link model:image/imagecaption/imagecaptiontogglecommand~ImageCaptionToggleCommand `imageCaptionToggle`} command.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageCaptionEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageCaptionEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const view = editor.editing.view;
		const schema = editor.model.schema;
		const t = editor.t;

		// Schema configuration.
		schema.register( 'caption', {
			allowIn: 'image',
			allowContentOf: '$block',
			isLimit: true
		} );

		if ( editor.plugins.has( ImageBlockEditing ) ) {
			schema.extend( 'image', {
				allowAttributes: [ 'caption' ]
			} );
		}

		if ( editor.plugins.has( ImageInlineEditing ) ) {
			schema.extend( 'imageInline', {
				allowAttributes: [ 'caption' ]
			} );
		}

		editor.commands.add( 'imageCaptionToggle', new ImageCaptionToggleCommand( this.editor ) );

		// View -> model converter for the data pipeline.
		editor.conversion.for( 'upcast' ).elementToElement( {
			view: matchImageCaptionViewElement,
			model: 'caption'
		} );

		// Model -> view converter for the data pipeline.
		editor.conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'caption',
			view: ( modelElement, { writer } ) => {
				if ( !isImage( modelElement.parent ) ) {
					return null;
				}

				return writer.createContainerElement( 'figcaption' );
			}
		} );

		// Model -> view converter for the editing pipeline.
		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'caption',
			view: ( modelElement, { writer } ) => {
				if ( !isImage( modelElement.parent ) ) {
					return null;
				}

				const figcaptionElement = writer.createEditableElement( 'figcaption' );
				writer.setCustomProperty( 'imageCaption', true, figcaptionElement );

				enablePlaceholder( {
					view,
					element: figcaptionElement,
					text: t( 'Enter image caption' )
				} );

				return toWidgetEditable( figcaptionElement, writer );
			}
		} );

		editor.editing.mapper.on( 'modelToViewPosition', mapModelPositionToView( view ) );
		editor.data.mapper.on( 'modelToViewPosition', mapModelPositionToView( view ) );
	}
}

// Creates a mapper callback that reverses the order of `<img>` and `<figcaption>` in the image.
// Without it, `<figcaption>` would precede the `<img>` in the conversion.
//
// <image>^</image> -> <figure><img>^<caption></caption></figure>
//
// @private
// @param {module:engine/view/view~View} editingView
// @returns {Function}
function mapModelPositionToView( editingView ) {
	return ( evt, data ) => {
		const modelPosition = data.modelPosition;
		const parent = modelPosition.parent;

		if ( !parent.is( 'element', 'image' ) ) {
			return;
		}

		const viewElement = data.mapper.toViewElement( parent );

		data.viewPosition = editingView.createPositionAt( viewElement, modelPosition.offset + 1 );
	};
}
