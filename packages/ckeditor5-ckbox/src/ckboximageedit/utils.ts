/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ckbox/ckboximageedit/utils
 */

import { toArray } from 'ckeditor5/src/utils';

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
	if ( !allowExternalImagesEditing ) {
		return () => false;
	}

	if ( typeof allowExternalImagesEditing == 'function' ) {
		return allowExternalImagesEditing;
	}

	const urlRegExps = toArray( allowExternalImagesEditing );

	return src => urlRegExps.some( pattern =>
		src.match( pattern ) ||
		src.replace( /^https?:\/\//, '' ).match( pattern )
	);
}

