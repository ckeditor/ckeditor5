/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module media-embed/mediaregistry
 */

import { TooltipView, IconView, Template } from 'ckeditor5/src/ui';
import { logWarning, toArray } from 'ckeditor5/src/utils';

import mediaPlaceholderIcon from '../theme/icons/media-placeholder.svg';

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
	 * Creates an instance of the {@link module:media-embed/mediaregistry~MediaRegistry} class.
	 *
	 * @param {module:utils/locale~Locale} locale The localization services instance.
	 * @param {module:media-embed/mediaembed~MediaEmbedConfig} config The configuration of the media embed feature.
	 */
	constructor( locale, config ) {
		const providers = config.providers;
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

		/**
		 * The {@link module:utils/locale~Locale} instance.
		 *
		 * @member {module:utils/locale~Locale}
		 */
		this.locale = locale;

		/**
		 * The media provider definitions available for the registry. Usually corresponding with the
		 * {@link module:media-embed/mediaembed~MediaEmbedConfig media configuration}.
		 *
		 * @member {Array}
		 */
		this.providerDefinitions = providerDefinitions;
	}

	/**
	 * Checks whether the passed URL is representing a certain media type allowed in the editor.
	 *
	 * @param {String} url The URL to be checked
	 * @returns {Boolean}
	 */
	hasMedia( url ) {
		return !!this._getMedia( url );
	}

	/**
	 * For the given media URL string and options, it returns the {@link module:engine/view/element~Element view element}
	 * representing that media.
	 *
	 * **Note:** If no URL is specified, an empty view element is returned.
	 *
	 * @param {module:engine/view/downcastwriter~DowncastWriter} writer The view writer used to produce a view element.
	 * @param {String} url The URL to be translated into a view element.
	 * @param {Object} options
	 * @param {String} [options.elementName]
	 * @param {Boolean} [options.renderMediaPreview]
	 * @param {Boolean} [options.renderForEditingView]
	 * @returns {module:engine/view/element~Element}
	 */
	getMediaViewElement( writer, url, options ) {
		return this._getMedia( url ).getViewElement( writer, options );
	}

	/**
	 * Returns a `Media` instance for the given URL.
	 *
	 * @protected
	 * @param {String} url The URL of the media.
	 * @returns {module:media-embed/mediaregistry~Media|null} The `Media` instance or `null` when there is none.
	 */
	_getMedia( url ) {
		if ( !url ) {
			return new Media( this.locale );
		}

		url = url.trim();

		for ( const definition of this.providerDefinitions ) {
			const previewRenderer = definition.html;
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
	 * @private
	 * @param {String} url The URL of the media.
	 * @param {RegExp} pattern The pattern that should accept the media URL.
	 * @returns {Array|null}
	 */
	_getUrlMatches( url, pattern ) {
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
 *
 * @private
 */
class Media {
	constructor( locale, url, match, previewRenderer ) {
		/**
		 * The URL this Media instance represents.
		 *
		 * @member {String}
		 */
		this.url = this._getValidUrl( url );

		/**
		 * Shorthand for {@link module:utils/locale~Locale#t}.
		 *
		 * @see module:utils/locale~Locale#t
		 * @method
		 */
		this._t = locale.t;

		/**
		 * The output of the `RegExp.match` which validated the {@link #url} of this media.
		 *
		 * @member {Object}
		 */
		this._match = match;

		/**
		 * The function returning the HTML string preview of this media.
		 *
		 * @member {Function}
		 */
		this._previewRenderer = previewRenderer;
	}

	/**
	 * Returns the view element representation of the media.
	 *
	 * @param {module:engine/view/downcastwriter~DowncastWriter} writer The view writer used to produce a view element.
	 * @param {Object} options
	 * @param {String} [options.elementName]
	 * @param {Boolean} [options.renderMediaPreview]
	 * @param {Boolean} [options.renderForEditingView]
	 * @returns {module:engine/view/element~Element}
	 */
	getViewElement( writer, options ) {
		const attributes = {};
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
				domConverter.setContentOf( domElement, mediaHtml );
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
	 *
	 * @param {module:engine/view/downcastwriter~DowncastWriter} writer The view writer used to produce a view element.
	 * @param {Object} options
	 * @param {Boolean} [options.renderForEditingView]
	 * @returns {String}
	 */
	_getPreviewHtml( options ) {
		if ( this._previewRenderer ) {
			return this._previewRenderer( this._match );
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
	 *
	 * @returns {String}
	 */
	_getPlaceholderHtml() {
		const tooltip = new TooltipView();
		const icon = new IconView();

		tooltip.text = this._t( 'Open media in new tab' );
		icon.content = mediaPlaceholderIcon;
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
						href: this.url
					},
					children: [
						{
							tag: 'span',
							attributes: {
								class: 'ck-media__placeholder__url__text'
							},
							children: [ this.url ]
						},
						tooltip
					]
				}
			]
		} ).render();

		return placeholder.outerHTML;
	}

	/**
	 * Returns the full URL to the specified media.
	 *
	 * @param {String} url The URL of the media.
	 * @returns {String|null}
	 */
	_getValidUrl( url ) {
		if ( !url ) {
			return null;
		}

		if ( url.match( /^https?/ ) ) {
			return url;
		}

		return 'https://' + url;
	}
}
