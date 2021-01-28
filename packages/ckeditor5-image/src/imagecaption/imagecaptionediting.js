/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagecaption/imagecaptionediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { isImage } from '../image/utils';
import ImageCaptionToggleCommand from './imagecaptiontogglecommand';
import { createCaptionElement, getCaptionFromImage, matchImageCaption } from './utils';

/**
 * The image caption engine plugin.
 *
 * It registers proper converters. It takes care of adding a caption element if the image without it is inserted
 * to the model document.
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
		const data = editor.data;
		const editing = editor.editing;
		const t = editor.t;

		/**
		 * The last selected caption editable.
		 * It is used for hiding the editable when it is empty and the image widget is no longer selected.
		 *
		 * @private
		 * @member {module:engine/view/editableelement~EditableElement} #_lastSelectedCaption
		 */

		// Schema configuration.
		schema.register( 'caption', {
			allowIn: 'image',
			allowContentOf: '$block',
			isLimit: true
		} );

		schema.extend( 'image', {
			allowAttributes: [ 'caption' ]
		} );

		schema.extend( 'imageInline', {
			allowAttributes: [ 'caption' ]
		} );

		editor.commands.add( 'imageCaptionToggle', new ImageCaptionToggleCommand( this.editor ) );

		// View to model converter for the data pipeline.
		editor.conversion.for( 'upcast' ).elementToElement( {
			view: matchImageCaption,
			model: 'caption'
		} );

		// Model to view converter for the data pipeline.
		const createCaptionForData = writer => writer.createContainerElement( 'figcaption' );
		data.downcastDispatcher.on( 'insert:caption', captionModelToView( createCaptionForData, false ) );

		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'caption',
			view: ( modelElement, { writer } ) => {
				if ( !isImage( modelElement.parent ) ) {

				}

				return createCaptionElement( view, writer, t( 'Enter image caption' ) );
			}
		} );
	}
}

// Creates a converter that converts image caption model element to view element.
//
// @private
// @param {Function} elementCreator
// @param {Boolean} [hide=true] When set to `false` view element will not be inserted when it's empty.
// @returns {Function}
function captionModelToView( elementCreator, shouldInsertWhenEmpty = true ) {
	return ( evt, data, conversionApi ) => {
		const captionElement = data.item;

		if ( !isImage( captionElement.parent ) ) {
			return;
		}

		if ( !conversionApi.consumable.consume( data.item, 'insert' ) ) {
			return;
		}

		const viewImage = conversionApi.mapper.toViewElement( data.range.start.parent );
		const viewCaption = elementCreator( conversionApi.writer );
		const viewWriter = conversionApi.writer;

		// Hide if empty.
		if ( !captionElement.childCount ) {
			viewWriter.addClass( 'ck-hidden', viewCaption );
		}

		insertViewCaptionAndBind( viewCaption, data.item, viewImage, conversionApi );
	};
}

// Inserts `viewCaption` at the end of `viewImage` and binds it to `modelCaption`.
//
// @private
// @param {module:engine/view/containerelement~ContainerElement} viewCaption
// @param {module:engine/model/element~Element} modelCaption
// @param {module:engine/view/containerelement~ContainerElement} viewImage
// @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi
function insertViewCaptionAndBind( viewCaption, modelCaption, viewImage, conversionApi ) {
	const viewPosition = conversionApi.writer.createPositionAt( viewImage, 'end' );

	conversionApi.writer.insert( viewPosition, viewCaption );
	conversionApi.mapper.bindElements( modelCaption, viewCaption );
}

// Checks if the provided node or one of its ancestors is a caption element, and returns it.
//
// @private
// @param {module:engine/model/node~Node} node
// @returns {module:engine/model/element~Element|null}
function getParentCaption( node ) {
	const ancestors = node.getAncestors( { includeSelf: true } );
	const caption = ancestors.find( ancestor => ancestor.name == 'caption' );

	if ( caption && caption.parent && caption.parent.name == 'image' ) {
		return caption;
	}

	return null;
}

// Hides a given caption in the view if it is empty.
//
// @private
// @param {module:engine/view/containerelement~ContainerElement} caption
// @param {module:engine/view/downcastwriter~DowncastWriter} viewWriter
// @returns {Boolean} Returns `true` if the view was modified.
function hideCaptionIfEmpty( caption, viewWriter ) {
	if ( !caption.childCount && !caption.hasClass( 'ck-hidden' ) ) {
		viewWriter.addClass( 'ck-hidden', caption );
		return true;
	}

	return false;
}

// Shows the caption.
//
// @private
// @param {module:engine/view/containerelement~ContainerElement} caption
// @param {module:engine/view/downcastwriter~DowncastWriter} viewWriter
// @returns {Boolean} Returns `true` if the view was modified.
function showCaption( caption, viewWriter ) {
	if ( caption.hasClass( 'ck-hidden' ) ) {
		viewWriter.removeClass( 'ck-hidden', caption );
		return true;
	}

	return false;
}
