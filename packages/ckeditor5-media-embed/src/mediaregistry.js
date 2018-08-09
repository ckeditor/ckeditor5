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
		if ( !url ) {
			return null;
		}

		return !!this._getMedia( url );
	}

	getHtml( url, options ) {
		if ( !url ) {
			return null;
		}

		const media = this._getMedia( url );

		if ( media ) {
			return media.getHtml( options );
		}
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

	getHtml( options ) {
		if ( this.renderer ) {
			return this.renderer( this.match.pop() );
		} else {
			if ( options.usePlaceholderAsFallback ) {
				return this._getPlaceholderHtml();
			} else {
				return '';
			}
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
