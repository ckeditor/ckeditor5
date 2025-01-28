/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module image/image/imageplaceholder
 */

import { Plugin } from 'ckeditor5/src/core.js';
import type {
	DowncastAttributeEvent,
	Element,
	ViewElement
} from 'ckeditor5/src/engine.js';

import ImageUtils from '../imageutils.js';
import ImageLoadObserver, { type ImageLoadedEvent } from './imageloadobserver.js';

import '../../theme/imageplaceholder.css';

/**
 * Adds support for image placeholder that is automatically removed when the image is loaded.
 */
export default class ImagePlaceholder extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ImageUtils ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ImagePlaceholder' as const;
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
	public afterInit(): void {
		this._setupSchema();
		this._setupConversion();
		this._setupLoadListener();
	}

	/**
	 * Extends model schema.
	 */
	private _setupSchema(): void {
		const schema = this.editor.model.schema;

		// Wait for ImageBlockEditing or ImageInlineEditing to register their elements first,
		// that's why doing this in afterInit() instead of init().
		if ( schema.isRegistered( 'imageBlock' ) ) {
			schema.extend( 'imageBlock', {
				allowAttributes: [ 'placeholder' ]
			} );
		}

		if ( schema.isRegistered( 'imageInline' ) ) {
			schema.extend( 'imageInline', {
				allowAttributes: [ 'placeholder' ]
			} );
		}
	}

	/**
	 * Registers converters.
	 */
	private _setupConversion(): void {
		const editor = this.editor;
		const conversion = editor.conversion;
		const imageUtils: ImageUtils = editor.plugins.get( 'ImageUtils' );

		conversion.for( 'editingDowncast' ).add( dispatcher => {
			dispatcher.on<DowncastAttributeEvent<Element>>( 'attribute:placeholder', ( evt, data, conversionApi ) => {
				if ( !conversionApi.consumable.test( data.item, evt.name ) ) {
					return;
				}

				if ( !data.item.is( 'element', 'imageBlock' ) && !data.item.is( 'element', 'imageInline' ) ) {
					return;
				}

				conversionApi.consumable.consume( data.item, evt.name );

				const viewWriter = conversionApi.writer;
				const element = conversionApi.mapper.toViewElement( data.item )!;
				const img = imageUtils.findViewImgElement( element )!;

				if ( data.attributeNewValue ) {
					viewWriter.addClass( 'image_placeholder', img );
					viewWriter.setStyle( 'background-image', `url(${ data.attributeNewValue })`, img );
					viewWriter.setCustomProperty( 'editingPipeline:doNotReuseOnce', true, img );
				} else {
					viewWriter.removeClass( 'image_placeholder', img );
					viewWriter.removeStyle( 'background-image', img );
				}
			} );
		} );
	}

	/**
	 * Prepares listener for image load.
	 */
	private _setupLoadListener(): void {
		const editor = this.editor;
		const model = editor.model;
		const editing = editor.editing;
		const editingView = editing.view;
		const imageUtils: ImageUtils = editor.plugins.get( 'ImageUtils' );

		editingView.addObserver( ImageLoadObserver );

		this.listenTo<ImageLoadedEvent>( editingView.document, 'imageLoaded', ( evt, domEvent ) => {
			const imgViewElement = editingView.domConverter.mapDomToView( domEvent.target as HTMLElement );

			if ( !imgViewElement ) {
				return;
			}

			const viewElement = imageUtils.getImageWidgetFromImageView( imgViewElement as ViewElement );

			if ( !viewElement ) {
				return;
			}

			const modelElement = editing.mapper.toModelElement( viewElement );

			if ( !modelElement || !modelElement.hasAttribute( 'placeholder' ) ) {
				return;
			}

			model.enqueueChange( { isUndoable: false }, writer => {
				writer.removeAttribute( 'placeholder', modelElement );
			} );
		} );
	}
}
