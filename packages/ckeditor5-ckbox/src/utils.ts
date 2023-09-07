/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global atob */

/**
 * @module ckbox/utils
 */

import type { InitializedToken } from '@ckeditor/ckeditor5-cloud-services';
import type { CKBoxImageUrls } from './ckboxconfig';

/**
 * Converts image source set provided by the CKBox into an object containing:
 * - responsive URLs for the "webp" image format,
 * - one fallback URL for browsers that do not support the "webp" format.
 */
export function getImageUrls( imageUrls: CKBoxImageUrls ): {
	imageFallbackUrl: string;
	imageSources: Array<{
		srcset: string;
		sizes: string;
		type: string;
	}>;
} {
	const responsiveUrls: Array<string> = [];
	let maxWidth = 0;

	for ( const key in imageUrls ) {
		const width = parseInt( key, 10 );

		if ( !isNaN( width ) ) {
			if ( width > maxWidth ) {
				maxWidth = width;
			}

			responsiveUrls.push( `${ imageUrls[ key ] } ${ key }w` );
		}
	}

	const imageSources = [ {
		srcset: responsiveUrls.join( ',' ),
		sizes: `(max-width: ${ maxWidth }px) 100vw, ${ maxWidth }px`,
		type: 'image/webp'
	} ];

	return {
		imageFallbackUrl: imageUrls.default,
		imageSources
	};
}

/**
 * Returns a workspace id to use for communication with the CKBox service.
 *
 * @param defaultWorkspaceId The default workspace to use taken from editor config.
 */
export function getWorkspaceId( token: InitializedToken, defaultWorkspaceId?: string ): string | null {
	const [ , binaryTokenPayload ] = token.value.split( '.' );
	const payload = JSON.parse( atob( binaryTokenPayload ) );
	const workspaces = ( payload.auth && payload.auth.ckbox && payload.auth.ckbox.workspaces ) || [ payload.aud ];

	if ( !defaultWorkspaceId ) {
		return workspaces[ 0 ];
	}

	const role = payload.auth && payload.auth.ckbox && payload.auth.ckbox.role;

	if ( role == 'superadmin' || workspaces.includes( defaultWorkspaceId ) ) {
		return defaultWorkspaceId;
	}

	return null;
}
