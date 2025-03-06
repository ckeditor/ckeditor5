/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module media-embed/mediaregistry
 */

import { IconView, Template } from 'ckeditor5/src/ui.js';
import { IconMediaPlaceholder } from 'ckeditor5/src/icons.js';
import { logWarning, toArray, type Locale } from 'ckeditor5/src/utils.js';

import type { DowncastWriter, ViewElement } from 'ckeditor5/src/engine.js';
import type { MediaEmbedConfig, MediaEmbedProvider } from './mediaembedconfig.js';
import type { MediaOptions } from './utils.js';

const mediaPlaceholderIconViewBox = '0 0 64 42';

/**
 * A bridge between the raw media content provider definitions and the editor view content.
 *
 * It helps translating media URLs to corresponding {@link module:engine/view/element~Element view elements}.
 *
 * Mostly used by the {@link module:media-embed/mediaembedediting~MediaEmbedEditing} plugin.
 */
export default class MediaRegistry {
	/**
	 * The {@link module:utils/locale~Locale} instance.
	 */
	public locale: Locale;

	/**
	 * The media provider definitions available for the registry. Usually corresponding with the
	 * {@link module:media-embed/mediaembedconfig~MediaEmbedConfig media configuration}.
	 */
	public providerDefinitions: Array<MediaEmbedProvider>;

	/**
	 * Creates an instance of the {@link module:media-embed/mediaregistry~MediaRegistry} class.
	 *
	 * @param locale The localization services instance.
	 * @param config The configuration of the media embed feature.
	 */
	constructor( locale: Locale, config: MediaEmbedConfig ) {
		const providers = config.providers!;
		const extraProviders = config.extraProviders || [];
		const removedProviders = new Set( config.removeProviders );
		const providerDefinitions = providers
			.concat( extraProviders )
			.filter( provider => {
				const name = provider.name;

				if ( !name ) {
					/**
					 * One of the providers (or extra providers) specified in the media embed configuration
					 * has no name and will not be used by the editor. In order to get this media
					 * provider working, double check your editor configuration.
					 *
					 * @error media-embed-no-provider-name
					 */
					logWarning( 'media-embed-no-provider-name', { provider } );

					return false;
				}

				return !removedProviders.has( name );
			} );

		this.locale = locale;
		this.providerDefinitions = providerDefinitions;
	}

	/**
	 * Checks whether the passed URL is representing a certain media type allowed in the editor.
	 *
	 * @param url The URL to be checked
	 */
	public hasMedia( url: string ): boolean {
		return !!this._getMedia( url );
	}

	/**
	 * For the given media URL string and options, it returns the {@link module:engine/view/element~Element view element}
	 * representing that media.
	 *
	 * **Note:** If no URL is specified, an empty view element is returned.
	 *
	 * @param writer The view writer used to produce a view element.
	 * @param url The URL to be translated into a view element.
	 */
	public getMediaViewElement(
		writer: DowncastWriter,
		url: string,
		options: MediaOptions
	): ViewElement {
		return this._getMedia( url )!.getViewElement( writer, options );
	}

	/**
	 * Returns a `Media` instance for the given URL.
	 *
	 * @param url The URL of the media.
	 * @returns The `Media` instance or `null` when there is none.
	 */
	private _getMedia( url: string ): Media | null {
		if ( !url ) {
			return new Media( this.locale );
		}

		url = url.trim();

		for ( const definition of this.providerDefinitions ) {
			const previewRenderer = definition.html!;
			const pattern = toArray( definition.url );

			for ( const subPattern of pattern ) {
				const match = this._getUrlMatches( url, subPattern );

				if ( match ) {
					return new Media( this.locale, url, match, previewRenderer );
				}
			}
		}

		return null;
	}

	/**
	 * Tries to match `url` to `pattern`.
	 *
	 * @param url The URL of the media.
	 * @param pattern The pattern that should accept the media URL.
	 */
	private _getUrlMatches( url: string, pattern: RegExp ): RegExpMatchArray | null {
		// 1. Try to match without stripping the protocol and "www" subdomain.
		let match = url.match( pattern );

		if ( match ) {
			return match;
		}

		// 2. Try to match after stripping the protocol.
		let rawUrl = url.replace( /^https?:\/\//, '' );
		match = rawUrl.match( pattern );

		if ( match ) {
			return match;
		}

		// 3. Try to match after stripping the "www" subdomain.
		rawUrl = rawUrl.replace( /^www\./, '' );
		match = rawUrl.match( pattern );

		if ( match ) {
			return match;
		}

		return null;
	}
}

/**
 * Represents media defined by the provider configuration.
 *
 * It can be rendered to the {@link module:engine/view/element~Element view element} and used in the editing or data pipeline.
 */
class Media {
	/**
	 * The URL this Media instance represents.
	 */
	public url: string | null;

	/**
	 * Shorthand for {@link module:utils/locale~Locale#t}.
	 *
	 * @see module:utils/locale~Locale#t
	 */
	private _locale: Locale;

	/**
	 * The output of the `RegExp.match` which validated the {@link #url} of this media.
	 */
	private _match?: RegExpMatchArray;

	/**
	 * The function returning the HTML string preview of this media.
	 */
	private _previewRenderer?: ( match: RegExpMatchArray ) => string;

	constructor( locale: Locale, url?: string, match?: RegExpMatchArray, previewRenderer?: ( match: RegExpMatchArray ) => string ) {
		this.url = this._getValidUrl( url );
		this._locale = locale;
		this._match = match;
		this._previewRenderer = previewRenderer;
	}

	/**
	 * Returns the view element representation of the media.
	 *
	 * @param writer The view writer used to produce a view element.
	 */
	public getViewElement(
		writer: DowncastWriter,
		options: MediaOptions
	): ViewElement {
		const attributes: Record<string, unknown> = {};
		let viewElement;

		if ( options.renderForEditingView || ( options.renderMediaPreview && this.url && this._previewRenderer ) ) {
			if ( this.url ) {
				attributes[ 'data-oembed-url' ] = this.url;
			}

			if ( options.renderForEditingView ) {
				attributes.class = 'ck-media__wrapper';
			}

			const mediaHtml = this._getPreviewHtml( options );

			viewElement = writer.createRawElement( 'div', attributes, ( domElement, domConverter ) => {
				domConverter!.setContentOf( domElement, mediaHtml );
			} );
		} else {
			if ( this.url ) {
				attributes.url = this.url;
			}

			viewElement = writer.createEmptyElement( options.elementName, attributes );
		}

		writer.setCustomProperty( 'media-content', true, viewElement );

		return viewElement;
	}

	/**
	 * Returns the HTML string of the media content preview.
	 */
	private _getPreviewHtml( options: { renderForEditingView?: boolean } ): string {
		if ( this._previewRenderer ) {
			return this._previewRenderer( this._match! );
		} else {
			// The placeholder only makes sense for editing view and media which have URLs.
			// Placeholder is never displayed in data and URL-less media have no content.
			if ( this.url && options.renderForEditingView ) {
				return this._getPlaceholderHtml();
			}

			return '';
		}
	}

	/**
	 * Returns the placeholder HTML when the media has no content preview.
	 */
	private _getPlaceholderHtml(): string {
		const icon = new IconView();
		const t = this._locale.t;

		icon.content = IconMediaPlaceholder;
		icon.viewBox = mediaPlaceholderIconViewBox;

		const placeholder = new Template( {
			tag: 'div',
			attributes: {
				class: 'ck ck-reset_all ck-media__placeholder'
			},
			children: [
				{
					tag: 'div',
					attributes: {
						class: 'ck-media__placeholder__icon'
					},
					children: [ icon ]
				},
				{
					tag: 'a',
					attributes: {
						class: 'ck-media__placeholder__url',
						target: '_blank',
						rel: 'noopener noreferrer',
						href: this.url,
						'data-cke-tooltip-text': t( 'Open media in new tab' )
					},
					children: [
						{
							tag: 'span',
							attributes: {
								class: 'ck-media__placeholder__url__text'
							},
							children: [ this.url ]
						}
					]
				}
			]
		} ).render() as HTMLElement;

		return placeholder.outerHTML;
	}

	/**
	 * Returns the full URL to the specified media.
	 *
	 * @param url The URL of the media.
	 */
	private _getValidUrl( url: string | undefined ): string | null {
		if ( !url ) {
			return null;
		}

		if ( url.match( /^https?/ ) ) {
			return url;
		}

		return 'https://' + url;
	}
}
