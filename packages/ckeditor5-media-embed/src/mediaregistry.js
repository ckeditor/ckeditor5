/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module media-embed/mediaregistry
 */

import mediaPlaceholderIcon from '../theme/icons/media-placeholder.svg';
import log from '@ckeditor/ckeditor5-utils/src/log';
import TooltipView from '@ckeditor/ckeditor5-ui/src/tooltip/tooltipview';
import IconView from '@ckeditor/ckeditor5-ui/src/icon/iconview';
import Template from '@ckeditor/ckeditor5-ui/src/template';

const mediaPlaceholderIconViewBox = '0 0 64 42';

/**
 * A bridge between the raw media content provider definitions and editor view content.
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
					 * One of the providers (or extraProviders) specified in the mediaEmbed configuration
					 * has no name and will not be used by the editor. In order to get this media
					 * provider working, double check your editor configuration.
					 *
					 * @warning media-embed-no-provider-name
					 */
					log.warn( 'media-embed-no-provider-name: The configured media provider has no name and cannot be used.',
						{ provider } );

					return false;
				}

				return !removedProviders.has( name );
			} );

		/**
		 * The locale {@link module:utils/locale~Locale} instance.
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
	 * @param {String} url The url to be checked
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
	 * @param {module:engine/view/writer~Writer} writer The view writer used to produce a view element.
	 * @param {String} url The url to be translated into a view element.
	 * @param {Object} options
	 * @param {String} [options.renderContent]
	 * @param {String} [options.useSemanticWrapper]
	 * @param {String} [options.renderForEditingView]
	 * @returns {module:engine/view/element~Element}
	 */
	getMediaViewElement( writer, url, options ) {
		return this._getMedia( url ).getViewElement( writer, options );
	}

	/**
	 * Returns a `Media` instance for the given URL.
	 *
	 * @private
	 * @param {String} url The url of the media.
	 * @returns {module:media-embed/mediaregistry~Media|null} The `Media` instance or `null` when there's none.
	 */
	_getMedia( url ) {
		if ( !url ) {
			return new Media( this.locale );
		}

		url = url.trim();

		for ( const definition of this.providerDefinitions ) {
			const contentRenderer = definition.html;
			let pattern = definition.url;

			if ( !Array.isArray( pattern ) ) {
				pattern = [ pattern ];
			}

			for ( const subPattern of pattern ) {
				const match = this._getUrlMatches( url, subPattern );

				if ( match ) {
					return new Media( this.locale, url, match, contentRenderer );
				}
			}
		}

		return null;
	}

	/**
	 * Tries to match `url` to `pattern`.
	 *
	 * @private
	 * @param {String} url The url of the media.
	 * @param {RegExp} pattern The pattern that should accept the media url.
	 * @returns {Array|null}
	 */
	_getUrlMatches( url, pattern ) {
		// 1. Try to match without stripping the protocol and "www" sub-domain.
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

		// 3. Try to match after stripping the "www" sub-domain.
		rawUrl = rawUrl.replace( /^www\./, '' );
		match = rawUrl.match( pattern );

		if ( match ) {
			return match;
		}

		return null;
	}
}

/**
 * Represents a media defined by the provider configuration.
 *
 * It can be rendered to the {@link module:engine/view/element~Element view element} and used in editing or data pipeline.
 *
 * @private
 */
class Media {
	constructor( locale, url, match, contentRenderer ) {
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
		this._contentRenderer = contentRenderer;
	}

	/**
	 * Returns view element representation of the media.
	 *
	 * @param {module:engine/view/writer~Writer} writer The view writer used to produce a view element.
	 * @param {Object} options
	 * @param {String} [options.renderContent]
	 * @param {String} [options.useSemanticWrapper]
	 * @param {String} [options.renderForEditingView]
	 * @returns {module:engine/view/element~Element}
	 */
	getViewElement( writer, options ) {
		const attributes = {};

		if ( options.useSemanticWrapper || ( this.url && !this._contentRenderer && !options.renderForEditingView ) ) {
			if ( this.url ) {
				attributes.url = this.url;
			}

			return writer.createEmptyElement( 'oembed', attributes );
		} else {
			if ( this.url ) {
				attributes[ 'data-oembed-url' ] = this.url;
			}

			if ( options.renderForEditingView ) {
				attributes.class = 'ck-media__wrapper';
			}

			const mediaHtml = this._getContentHtml( options );

			return writer.createUIElement( 'div', attributes, function( domDocument ) {
				const domElement = this.toDomElement( domDocument );

				domElement.innerHTML = mediaHtml;

				return domElement;
			} );
		}
	}

	/**
	 * Returns the HTML string of the media content preview.
	 *
	 * @param {module:engine/view/writer~Writer} writer The view writer used to produce a view element.
	 * @param {Object} options
	 * @param {String} [options.renderForEditingView]
	 * @returns {String}
	 */
	_getContentHtml( options ) {
		if ( this._contentRenderer ) {
			return this._contentRenderer( this._match );
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
	 * Returns the placeholder HTML when media has no content preview.
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
						target: 'new',
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
	 * Returns full url to specified media.
	 *
	 * @param {String} url The url of the media.
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
