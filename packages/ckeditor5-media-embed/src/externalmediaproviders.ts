/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module media-embed/externalmediaproviders
 */

import type { MediaEmbedProvider } from './mediaembedconfig.js';

interface ExternalProviderDefinition {
	name: string;
	url: string | Array<string>;
	embedUrl: string;
}

const PROVIDER_NAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/;
const TEMPLATE_REFERENCE_PATTERN = /\$(\d+)/g;

function escapeHtmlAttribute( value: string ): string {
	return value.replace( /&/g, '&amp;' ).replace( /"/g, '&quot;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' );
}

function compileExternalProvider( definition: ExternalProviderDefinition ): MediaEmbedProvider {
	if ( !definition || typeof definition.name !== 'string' || !PROVIDER_NAME_PATTERN.test( definition.name ) ||
		typeof definition.embedUrl !== 'string' ) {
		throw new Error( 'Invalid external media provider definition.' );
	}

	const patterns = Array.isArray( definition.url ) ? definition.url : [ definition.url ];

	if ( !patterns.length || patterns.some( pattern => typeof pattern !== 'string' || !pattern.length || pattern.length > 512 ||
		!pattern.startsWith( '^' ) ) ) {
		throw new Error( 'Invalid external media provider URL pattern.' );
	}

	const url = patterns.map( pattern => new RegExp( pattern ) );
	const templateUrl = new URL( definition.embedUrl.replace( TEMPLATE_REFERENCE_PATTERN, 'example' ) );

	if ( templateUrl.protocol !== 'https:' || templateUrl.username || templateUrl.password ) {
		throw new Error( 'External media provider embed URL must use HTTPS without credentials.' );
	}

	return {
		name: definition.name,
		url,
		html: match => {
			const embedUrl = definition.embedUrl.replace( TEMPLATE_REFERENCE_PATTERN, ( _, index: string ) => {
				const captured = match[ Number( index ) ];

				if ( captured === undefined ) {
					throw new Error( 'Missing capture group in external media provider embed URL.' );
				}

				return encodeURIComponent( captured );
			} );
			const resultUrl = new URL( embedUrl );

			if ( resultUrl.protocol !== 'https:' || resultUrl.origin !== templateUrl.origin ||
				resultUrl.username || resultUrl.password ) {
				throw new Error( 'Invalid external media provider embed URL.' );
			}

			return (
				'<div>' +
					`<iframe src="${ escapeHtmlAttribute( embedUrl ) }" ` +
						'width="1280" height="720" ' +
						'style="width: 100%; height: auto; aspect-ratio: 16 / 9; border: 0; display: block;" ' +
						'allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>' +
				'</div>'
			);
		}
	};
}

/**
 * Loads declarative provider definitions. No JavaScript or raw HTML from the JSON document is evaluated.
 *
 * If the optional resource is absent, the default media providers remain available.
 * Other errors deliberately reject editor initialization rather than silently ignoring invalid configuration.
 *
 * @internal
 */
export async function loadExternalMediaProviders(
	fetcher: typeof fetch,
	path: string
): Promise<Array<MediaEmbedProvider>> {
	const response = await fetcher( path, { credentials: 'same-origin' } );

	if ( response.status === 404 ) {
		return [];
	}

	if ( !response.ok ) {
		throw new Error( `External media provider configuration HTTP ${ response.status }.` );
	}

	const document: unknown = await response.json();

	if ( !document || typeof document !== 'object' || !( 'providers' in document ) ||
		!Array.isArray( document.providers ) ) {
		throw new Error( 'Invalid external media provider configuration.' );
	}

	return document.providers.map( ( definition: ExternalProviderDefinition ) => compileExternalProvider( definition ) );
}
