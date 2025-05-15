/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module image/image/imageblockediting
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { ClipboardPipeline, type ClipboardInputTransformationEvent, type ClipboardContentInsertionEvent } from 'ckeditor5/src/clipboard.js';
import { UpcastWriter, type ViewElement } from 'ckeditor5/src/engine.js';

import {
	downcastImageAttribute,
	downcastSrcsetAttribute,
	upcastImageFigure
} from './converters.js';

import ImageEditing from './imageediting.js';
import ImageSizeAttributes from '../imagesizeattributes.js';
import ImageTypeCommand from './imagetypecommand.js';
import ImageUtils from '../imageutils.js';
import {
	getImgViewElementMatcher,
	createBlockImageViewElement,
	determineImageTypeForInsertionAtSelection
} from './utils.js';
import ImagePlaceholder from './imageplaceholder.js';

/**
 * The image block plugin.
 *
 * It registers:
 *
 * * `<imageBlock>` as a block element in the document schema, and allows `alt`, `src` and `srcset` attributes.
 * * converters for editing and data pipelines.,
 * * {@link module:image/image/imagetypecommand~ImageTypeCommand `'imageTypeBlock'`} command that converts inline images into
 * block images.
 */
export default class ImageBlockEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ImageEditing, ImageSizeAttributes, ImageUtils, ImagePlaceholder, ClipboardPipeline ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ImageBlockEditing' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const schema = editor.model.schema;

		// Converters 'alt' and 'srcset' are added in 'ImageEditing' plugin.
		schema.register( 'imageBlock', {
			inheritAllFrom: '$blockObject',
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
	 */
	private _setupConversion(): void {
		const editor = this.editor;
		const t = editor.t;
		const conversion = editor.conversion;
		const imageUtils: ImageUtils = editor.plugins.get( 'ImageUtils' );

		conversion.for( 'dataDowncast' )
			.elementToStructure( {
				model: 'imageBlock',
				view: ( modelElement, { writer } ) => createBlockImageViewElement( writer )
			} );

		conversion.for( 'editingDowncast' )
			.elementToStructure( {
				model: 'imageBlock',
				view: ( modelElement, { writer } ) => imageUtils.toImageWidget(
					createBlockImageViewElement( writer ), writer, t( 'image widget' )
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
					viewImage.hasAttribute( 'src' ) ? { src: viewImage.getAttribute( 'src' ) } : undefined
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
	 * The feature also sets image `width` and `height` attributes on paste.
	 */
	private _setupClipboardIntegration(): void {
		const editor = this.editor;
		const model = editor.model;
		const editingView = editor.editing.view;
		const imageUtils: ImageUtils = editor.plugins.get( 'ImageUtils' );
		const clipboardPipeline: ClipboardPipeline = editor.plugins.get( 'ClipboardPipeline' );

		this.listenTo<ClipboardInputTransformationEvent>(
			clipboardPipeline,
			'inputTransformation',
			( evt, data ) => {
				const docFragmentChildren = Array.from( data.content.getChildren() as IterableIterator<ViewElement> );
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

		this.listenTo<ClipboardContentInsertionEvent>(
			clipboardPipeline,
			'contentInsertion',
			( evt, data ) => {
				if ( data.method !== 'paste' ) {
					return;
				}

				model.change( writer => {
					const range = writer.createRangeIn( data.content );

					for ( const item of range.getItems() ) {
						if ( item.is( 'element', 'imageBlock' ) ) {
							imageUtils.setImageNaturalSizeAttributes( item );
						}
					}
				} );
			} );
	}
}
