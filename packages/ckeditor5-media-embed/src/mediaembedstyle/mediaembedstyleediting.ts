/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module media-embed/mediaembedstyle/mediaembedstyleediting
 */

import { first } from '@ckeditor/ckeditor5-utils';
import type { UpcastElementEvent } from '@ckeditor/ckeditor5-engine';
import { Plugin } from '@ckeditor/ckeditor5-core';
import { MediaEmbedEditing } from '../mediaembedediting.js';
import { MediaEmbedStyleCommand } from './mediaembedstylecommand.js';
import type { NormalizedMediaStyleOption } from '../mediaembedconfig.js';
import { DEFAULT_OPTIONS } from './constants.js';
import { normalizeStyles } from './utils.js';

/**
 * The media embed style engine plugin. It extends the schema with the `mediaStyle` attribute,
 * registers the {@link module:media-embed/mediaembedstyle/mediaembedstylecommand~MediaEmbedStyleCommand} command,
 * and adds the converters that apply alignment CSS classes to the figure.
 */
export class MediaEmbedStyleEditing extends Plugin {
	/**
	 * The resolved list of media style options. Built once from
	 * {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#styles `config.mediaEmbed.styles`}
	 * during {@link #init} and consumed by both the command and the UI plugin (single source of truth).
	 *
	 * @internal
	 * @readonly
	 */
	public normalizedStyles!: Array<NormalizedMediaStyleOption>;

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

		editor.config.define( 'mediaEmbed.styles', { options: Object.keys( DEFAULT_OPTIONS ) } );

		this.normalizedStyles = normalizeStyles( editor.config.get( 'mediaEmbed.styles' )! );

		schema.extend( 'media', { allowAttributes: [ 'mediaStyle' ] } );
		schema.setAttributeProperties( 'mediaStyle', { isFormatting: true } );

		editor.commands.add( 'mediaStyle', new MediaEmbedStyleCommand( editor, this.normalizedStyles ) );

		this._registerConverters();
	}

	/**
	 * Registers the downcast and upcast converters for the `mediaStyle` attribute.
	 */
	private _registerConverters(): void {
		const editor = this.editor;

		// Runtime lookup of style `name` → CSS `className`. Excludes the default style, which is
		// encoded as the absence of the attribute (no class). Iteration order follows the configured
		// options order — the upcast relies on this so the last matching class wins on a figure
		// that has multiple alignment classes.
		const styleClassMap = new Map(
			this.normalizedStyles
				.filter( style => !style.isDefault && style.className )
				.map( style => [ style.name, style.className! ] )
		);

		// Downcast: `mediaStyle` → CSS class on the <figure>. Covers both editing and data pipelines.
		editor.conversion.for( 'downcast' ).add( dispatcher =>
			dispatcher.on( 'attribute:mediaStyle:media', ( evt, data, conversionApi ) => {
				if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
					return;
				}

				const figure = conversionApi.mapper.toViewElement( data.item )!;
				const viewWriter = conversionApi.writer;
				const oldClass = styleClassMap.get( data.attributeOldValue as string );
				const newClass = styleClassMap.get( data.attributeNewValue as string );

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
				for ( const [ styleName, className ] of styleClassMap ) {
					if ( conversionApi.consumable.consume( data.viewItem, { classes: className } ) ) {
						conversionApi.writer.setAttribute( 'mediaStyle', styleName, modelElement );
					}
				}
			}, { priority: 'low' } );
		} );
	}
}
