/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagecaption/imagecaptionediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ImageCaptionToggleCommand from './imagecaptiontogglecommand';

import { enablePlaceholder } from '@ckeditor/ckeditor5-engine/src/view/placeholder';
import { toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';
import { isImage } from '../image/utils';
import { matchImageCaptionViewElement } from './utils';
import ImageInlineEditing from '../image/imageinlineediting';
import ImageBlockEditing from '../image/imageblockediting';

/**
 * The image caption engine plugin. It is responsible for:
 *
 * * registering converters for the caption element,
 * * registering converters for the caption model attribute,
 * * registering the {@link model:image/imagecaption/imagecaptioncommand~ImageCaptionCommand `imageCaptionToggle`} command.
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
		editor.data.downcastDispatcher.on( 'insert:caption', captionModelToView( writer => {
			return writer.createContainerElement( 'figcaption' );
		} ) );

		// editor.conversion.for( 'dataDowncast' ).elementToElement( {
		// 	model: 'caption',
		// 	view: ( modelElement, { writer } ) => {
		// 		if ( !isImage( modelElement.parent ) ) {
		// 			return null;
		// 		}

		// 		return writer.createContainerElement( 'figcaption' );
		// 	}
		// } );

		// Model -> view converter for the editing pipeline.
		editor.editing.downcastDispatcher.on( 'insert:caption', captionModelToView( writer => {
			const figcaptionElement = writer.createEditableElement( 'figcaption' );
			writer.setCustomProperty( 'imageCaption', true, figcaptionElement );

			enablePlaceholder( {
				view,
				element: figcaptionElement,
				text: t( 'Enter image caption' )
			} );

			return toWidgetEditable( figcaptionElement, writer );
		} ) );

		// editor.conversion.for( 'editingDowncast' ).elementToElement( {
		// 	model: 'caption',
		// 	view: ( modelElement, { writer } ) => {
		// 		if ( !isImage( modelElement.parent ) ) {
		// 			return null;
		// 		}

		// 		const figcaptionElement = writer.createEditableElement( 'figcaption' );
		// 		writer.setCustomProperty( 'imageCaption', true, figcaptionElement );

		// 		enablePlaceholder( {
		// 			view,
		// 			element: figcaptionElement,
		// 			text: t( 'Enter image caption' )
		// 		} );

		// 		return toWidgetEditable( figcaptionElement, writer );
		// 	}
		// } );
	}
}

// Creates a converter that converts image caption model element to view element.
//
// @private
// @param {Function} elementCreator
// @param {Boolean} [hide=true] When set to `false` view element will not be inserted when it's empty.
// @returns {Function}
function captionModelToView( elementCreator ) {
	return ( evt, data, { consumable, mapper, writer } ) => {
		const captionElement = data.item;

		if ( isImage( captionElement.parent ) ) {
			if ( !consumable.consume( captionElement, 'insert' ) ) {
				return;
			}

			const viewImage = mapper.toViewElement( data.range.start.parent );
			const viewCaption = elementCreator( writer );
			const viewPosition = writer.createPositionAt( viewImage, 'end' );

			writer.insert( viewPosition, viewCaption );
			mapper.bindElements( captionElement, viewCaption );
		}
	};
}
