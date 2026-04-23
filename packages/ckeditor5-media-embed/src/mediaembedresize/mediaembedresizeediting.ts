/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module media-embed/mediaembedresize/mediaembedresizeediting
 */

import type { ViewElement } from '@ckeditor/ckeditor5-engine';
import { Plugin } from '@ckeditor/ckeditor5-core';
import { MediaEmbedEditing } from '../mediaembedediting.js';
import { ResizeMediaEmbedCommand } from './resizemediaembedcommand.js';

const RESIZED_MEDIA_CLASS = 'media_resized';

/**
 * The media embed resize editing feature.
 *
 * It adds the ability to resize each media embed using handles.
 */
export class MediaEmbedResizeEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ MediaEmbedEditing ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'MediaEmbedResizeEditing' as const;
	}

	/**
	 * @inheritDoc
	 * @internal
	 */
	public static get licenseFeatureCode(): string {
		return 'MER';
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
	public static override get isPremiumPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		editor.commands.add( 'resizeMediaEmbed', new ResizeMediaEmbedCommand( editor ) );

		this._registerConverters();
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
		this._registerSchema();
	}

	private _registerSchema(): void {
		const schema = this.editor.model.schema;

		schema.extend( 'media', { allowAttributes: [ 'resizedWidth' ] } );
		schema.setAttributeProperties( 'resizedWidth', { isFormatting: true } );
	}

	/**
	 * Registers media embed resize converters.
	 */
	private _registerConverters(): void {
		const editor = this.editor;

		// Downcast (model → view): resizedWidth → style.width + class on <figure>.
		editor.conversion.for( 'downcast' ).add( dispatcher =>
			dispatcher.on( 'attribute:resizedWidth:media', ( evt, data, conversionApi ) => {
				if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
					return;
				}

				const viewWriter = conversionApi.writer;
				const figure = conversionApi.mapper.toViewElement( data.item );

				if ( data.attributeNewValue !== null ) {
					viewWriter.setStyle( 'width', data.attributeNewValue, figure );
					viewWriter.addClass( RESIZED_MEDIA_CLASS, figure );
				} else {
					viewWriter.removeStyle( 'width', figure );
					viewWriter.removeClass( RESIZED_MEDIA_CLASS, figure );
				}
			} )
		);

		// Upcast: style.width on <figure class="media"> → resizedWidth.
		editor.conversion.for( 'upcast' )
			.attributeToAttribute( {
				view: {
					name: 'figure',
					styles: {
						width: /.+/
					}
				},
				model: {
					key: 'resizedWidth',
					value: ( viewElement: ViewElement ) => viewElement.getStyle( 'width' )
				}
			} );

		// Consume the media_resized class during upcast so it does not cause conversion issues.
		editor.conversion.for( 'upcast' ).add( dispatcher => {
			dispatcher.on( 'element:figure', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.viewItem, { classes: [ RESIZED_MEDIA_CLASS ] } );
			} );
		} );
	}
}
