/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/image/imageblockediting
 */

import { Plugin } from 'ckeditor5/src/core';
import { ClipboardPipeline } from 'ckeditor5/src/clipboard';
import { UpcastWriter } from 'ckeditor5/src/engine';

import {
	downcastImageAttribute,
	downcastSrcsetAttribute,
	upcastImageFigure
} from './converters';

import ImageEditing from './imageediting';
import ImageTypeCommand from './imagetypecommand';
import ImageUtils from '../imageutils';
import {
	getImgViewElementMatcher,
	createImageViewElement,
	determineImageTypeForInsertionAtSelection
} from '../image/utils';

/**
 * The image block plugin.
 *
 * It registers:
 *
 * * `<imageBlock>` as a block element in the document schema, and allows `alt`, `src` and `srcset` attributes.
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
		return [ ImageEditing, ImageUtils, ClipboardPipeline ];
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

		// Converters 'alt' and 'srcset' are added in 'ImageEditing' plugin.
		schema.register( 'imageBlock', {
			isObject: true,
			isBlock: true,
			allowWhere: '$block',
			allowAttributes: [ 'alt', 'src', 'srcset' ]
		} );

		this._setupConversion();

		if ( editor.plugins.has( 'ImageInlineEditing' ) ) {
			editor.commands.add( 'imageTypeBlock', new ImageTypeCommand( this.editor, 'imageBlock' ) );

			this._setupClipboardIntegration();
		}
	}

	/**
	 * Configures conversion pipelines to support upcasting and downcasting
	 * block images (block image widgets) and their attributes.
	 *
	 * @private
	 */
	_setupConversion() {
		const editor = this.editor;
		const t = editor.t;
		const conversion = editor.conversion;
		const imageUtils = editor.plugins.get( 'ImageUtils' );

		conversion.for( 'dataDowncast' )
			.elementToElement( {
				model: 'imageBlock',
				view: ( modelElement, { writer } ) => createImageViewElement( writer, 'imageBlock' )
			} );

		conversion.for( 'editingDowncast' )
			.elementToElement( {
				model: 'imageBlock',
				view: ( modelElement, { writer } ) => imageUtils.toImageWidget(
					createImageViewElement( writer, 'imageBlock' ), writer, t( 'image widget' )
				)
			} );

		conversion.for( 'downcast' )
			.add( downcastImageAttribute( imageUtils, 'imageBlock', 'src' ) )
			.add( downcastImageAttribute( imageUtils, 'imageBlock', 'alt' ) )
			.add( downcastSrcsetAttribute( imageUtils, 'imageBlock' ) );

		// More image related upcasts are in 'ImageEditing' plugin.
		conversion.for( 'upcast' )
			.elementToElement( {
				view: getImgViewElementMatcher( editor, 'imageBlock' ),
				model: ( viewImage, { writer } ) => writer.createElement(
					'imageBlock',
					viewImage.hasAttribute( 'src' ) ? { src: viewImage.getAttribute( 'src' ) } : null
				)
			} )
			.add( upcastImageFigure( imageUtils ) );
	}

	/**
	 * Integrates the plugin with the clipboard pipeline.
	 *
	 * Idea is that the feature should recognize the user's intent when an **inline** image is
	 * pasted or dropped. If such an image is pasted/dropped:
	 *
	 * * into an empty block (e.g. an empty paragraph),
	 * * on another object (e.g. some block widget).
	 *
	 * it gets converted into a block image on the fly. We assume this is the user's intent
	 * if they decided to put their image there.
	 *
	 * See the `ImageInlineEditing` for the similar integration that works in the opposite direction.
	 *
	 * @private
	 */
	_setupClipboardIntegration() {
		const editor = this.editor;
		const model = editor.model;
		const editingView = editor.editing.view;
		const imageUtils = editor.plugins.get( 'ImageUtils' );

		this.listenTo( editor.plugins.get( 'ClipboardPipeline' ), 'inputTransformation', ( evt, data ) => {
			const docFragmentChildren = Array.from( data.content.getChildren() );
			let modelRange;

			// Make sure only <img> elements are dropped or pasted. Otherwise, if there some other HTML
			// mixed up, this should be handled as a regular paste.
			if ( !docFragmentChildren.every( imageUtils.isInlineImageView ) ) {
				return;
			}

			// When drag and dropping, data.targetRanges specifies where to drop because
			// this is usually a different place than the current model selection (the user
			// uses a drop marker to specify the drop location).
			if ( data.targetRanges ) {
				modelRange = editor.editing.mapper.toModelRange( data.targetRanges[ 0 ] );
			}
			// Pasting, however, always occurs at the current model selection.
			else {
				modelRange = model.document.selection.getFirstRange();
			}

			const selection = model.createSelection( modelRange );

			// Convert inline images into block images only when the currently selected block is empty
			// (e.g. an empty paragraph) or some object is selected (to replace it).
			if ( determineImageTypeForInsertionAtSelection( model.schema, selection ) === 'imageBlock' ) {
				const writer = new UpcastWriter( editingView.document );

				// Wrap <img ... /> -> <figure class="image"><img .../></figure>
				const blockViewImages = docFragmentChildren.map(
					inlineViewImage => writer.createElement( 'figure', { class: 'image' }, inlineViewImage )
				);

				data.content = writer.createDocumentFragment( blockViewImages );
			}
		} );
	}
}
