/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ckbox/ckboximageedit/utils
 */

import { global } from 'ckeditor5/src/utils';

import type { Element } from 'ckeditor5/src/engine';
import type { CKBoxConfig } from '../ckboxconfig';

/**
 * @internal
 */
export function createEditabilityChecker(
	allowExternalImagesEditing: CKBoxConfig[ 'allowExternalImagesEditing' ]
): ( element: Element ) => boolean {
	const checkUrl = createUrlChecker( allowExternalImagesEditing );

	return element => {
		const isImageElement =
			element.is( 'element', 'imageInline' ) ||
			element.is( 'element', 'imageBlock' );

		if ( !isImageElement ) {
			return false;
		}

		if ( element.hasAttribute( 'ckboxImageId' ) ) {
			return true;
		}

		if ( element.hasAttribute( 'src' ) ) {
			return checkUrl( element.getAttribute( 'src' ) as string );
		}

		return false;
	};
}

function createUrlChecker(
	allowExternalImagesEditing: CKBoxConfig[ 'allowExternalImagesEditing' ]
): ( src: string ) => boolean {
	if ( Array.isArray( allowExternalImagesEditing ) ) {
		const urlMatchers = allowExternalImagesEditing.map( createUrlChecker );

		return src => urlMatchers.some( matcher => matcher( src ) );
	}

	if ( allowExternalImagesEditing == 'origin' ) {
		const origin = global.window.location.origin;

		return src => new URL( src, global.document.baseURI ).origin == origin;
	}

	if ( typeof allowExternalImagesEditing == 'function' ) {
		return allowExternalImagesEditing;
	}

	if ( allowExternalImagesEditing instanceof RegExp ) {
		return src => !!(
			src.match( allowExternalImagesEditing ) ||
			src.replace( /^https?:\/\//, '' ).match( allowExternalImagesEditing )
		);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const shouldBeUndefned: undefined = allowExternalImagesEditing;

	return () => false;
}
