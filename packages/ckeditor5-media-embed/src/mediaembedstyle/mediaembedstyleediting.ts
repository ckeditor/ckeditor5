/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module media-embed/mediaembedstyle/mediaembedstyleediting
 */

import { first } from '@ckeditor/ckeditor5-utils';
import type { UpcastElementEvent } from '@ckeditor/ckeditor5-engine';
import { Plugin, type PluginDependenciesOf } from '@ckeditor/ckeditor5-core';
import { MediaEmbedEditing } from '../mediaembedediting.js';
import { MediaEmbedStyleCommand } from './mediaembedstylecommand.js';
import type { MediaStyleName } from './constants.js';

/**
 * Style name → view class for the four class-bearing alignment options. `alignCenter` is
 * absent because the default style encodes as attribute-absence (no class). Iteration
 * order is load-bearing for the upcast — when multiple alignment classes are present on
 * a single figure, the last consumed wins.
 */
const MEDIA_STYLE_CLASSES = new Map<MediaStyleName, string>( [
	[ 'alignLeft', 'media-style-align-left' ],
	[ 'alignBlockLeft', 'media-style-block-align-left' ],
	[ 'alignBlockRight', 'media-style-block-align-right' ],
	[ 'alignRight', 'media-style-align-right' ]
] );

/**
 * The media embed style engine plugin. It extends the schema with the `mediaStyle` attribute,
 * registers the {@link module:media-embed/mediaembedstyle/mediaembedstylecommand~MediaEmbedStyleCommand} command,
 * and adds the converters that apply alignment CSS classes to the figure.
 */
export class MediaEmbedStyleEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependenciesOf<[ MediaEmbedEditing ]> {
		return [ MediaEmbedEditing ];
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'MediaEmbedStyleEditing' as const;
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

		schema.extend( 'media', { allowAttributes: [ 'mediaStyle' ] } );
		schema.setAttributeProperties( 'mediaStyle', { isFormatting: true } );

		editor.commands.add( 'mediaStyle', new MediaEmbedStyleCommand( editor ) );

		this._registerConverters();
	}

	/**
	 * Registers the downcast and upcast converters for the `mediaStyle` attribute.
	 */
	private _registerConverters(): void {
		const editor = this.editor;

		// Downcast: `mediaStyle` → CSS class on the <figure>. Covers both editing and data pipelines.
		editor.conversion.for( 'downcast' ).add( dispatcher =>
			dispatcher.on( 'attribute:mediaStyle:media', ( evt, data, conversionApi ) => {
				if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
					return;
				}

				const figure = conversionApi.mapper.toViewElement( data.item )!;
				const viewWriter = conversionApi.writer;
				const oldClass = MEDIA_STYLE_CLASSES.get( data.attributeOldValue as MediaStyleName );
				const newClass = MEDIA_STYLE_CLASSES.get( data.attributeNewValue as MediaStyleName );

				if ( oldClass ) {
					viewWriter.removeClass( oldClass, figure );
				}

				if ( newClass ) {
					viewWriter.addClass( newClass, figure );
				}
			} )
		);

		// Upcast: alignment class on a media <figure> → `mediaStyle` attribute. Runs at `low`
		// priority so the main media upcast creates the `media` model element first.
		editor.conversion.for( 'upcast' ).add( dispatcher => {
			dispatcher.on<UpcastElementEvent>( 'element:figure', ( _evt, data, conversionApi ) => {
				if ( !data.modelRange ) {
					return;
				}

				const modelElement = first( data.modelRange.getItems() );

				if ( !modelElement || !modelElement.is( 'element', 'media' ) ) {
					return;
				}

				// Iterate in insertion order — last consumed class wins when multiple
				// alignment classes are present on the same figure.
				for ( const [ styleName, className ] of MEDIA_STYLE_CLASSES ) {
					if ( conversionApi.consumable.consume( data.viewItem, { classes: className } ) ) {
						conversionApi.writer.setAttribute( 'mediaStyle', styleName, modelElement );
					}
				}
			}, { priority: 'low' } );
		} );
	}
}
