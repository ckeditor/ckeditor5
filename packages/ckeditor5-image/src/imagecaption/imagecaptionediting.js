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
import { createCaptionElement, matchImageCaption } from './utils';

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

		editor.conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'caption',
			view: ( modelElement, { writer } ) => {
				if ( !isImage( modelElement.parent ) ) {
					return null;
				}

				return writer.createContainerElement( 'figcaption' );
			}
		} );

		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'caption',
			view: ( modelElement, { writer } ) => {
				if ( !isImage( modelElement.parent ) ) {
					return null;
				}

				return createCaptionElement( view, writer, t( 'Enter image caption' ) );
			}
		} );
	}
}
