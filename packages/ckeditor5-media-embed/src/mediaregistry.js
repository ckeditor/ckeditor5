/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import mediaPlaceholderIcon from '../theme/icons/media-placeholder.svg';

export class MediaRegistry {
	constructor( editor ) {
		this.editor = editor;
		this.mediaProviders = editor.config.get( 'mediaEmbed.media' );
	}

	has( url ) {
		return !!this._getMedia( url );
	}

	getMediaViewElement( writer, url, options ) {
		let media;

		if ( url ) {
			media = this._getMedia( url );
		} else {
			// Generate a view for a renderer–less media.
			media = new Media( this.editor.t, url );
		}

		return media.getViewElement( writer, options );
	}

	_getMedia( url ) {
		const mediaProviders = this.mediaProviders;

		url = url.trim();

		for ( let { url: pattern, html: renderer } of mediaProviders ) {
			if ( !Array.isArray( pattern ) ) {
				pattern = [ pattern ];
			}

			for ( const subPattern of pattern ) {
				const match = url.match( subPattern );

				if ( match ) {
					return new Media( this.editor.t, url, match, renderer );
				}
			}
		}

		return null;
	}
}

class Media {
	constructor( t, url, match, renderer ) {
		this.t = t;
		this.url = url;
		this.match = match;
		this.renderer = renderer;
	}

	getViewElement( writer, options ) {
		let renderFunction;

		if ( options.renderContent ) {
			const mediaHtml = this._getContentHtml();

			renderFunction = function( domDocument ) {
				const domElement = this.toDomElement( domDocument );

				domElement.innerHTML = mediaHtml;

				return domElement;
			};
		}

		const attributes = {};

		if ( options.useSemanticWrapper ) {
			if ( this.url ) {
				attributes.url = this.url;
			}

			return writer.createEmptyElement( 'oembed', attributes, renderFunction );
		} else {
			if ( this.url ) {
				attributes[ 'data-oembed-url' ] = this.url;
			}

			if ( options.isViewPipeline ) {
				attributes.class = 'ck-media__wrapper';
			}

			return writer.createUIElement( 'div', attributes, renderFunction );
		}
	}

	_getContentHtml() {
		if ( this.renderer ) {
			return this.renderer( this.match.pop() );
		} else {
			if ( !this.url ) {
				return '';
			}

			return this._getPlaceholderHtml();
		}
	}

	_getPlaceholderHtml() {
		return '<div class="ck-media__placeholder">' +
			`<div class="ck-media__placeholder__icon">${ mediaPlaceholderIcon }</div>` +
			`<a class="ck-media__placeholder__url" target="new" href="${ this.url }" title="${ this.t( 'Open media in new tab' ) }">` +
				this.url +
			'</a>' +
		'</div>';
	}
}
