/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module paste-from-office/normalizer
 */

import ContentNormalizer from '../contentnormalizer';
import { removeBoldTagWrapper } from '../filters/common';

export const googleDocsNormalizer = ( () => {
	const normalizer = new ContentNormalizer( {
		activationTrigger: contentString => /id=("|')docs-internal-guid-[-0-9a-f]+("|')/.test( contentString )
	} );

	normalizer.addFilter( {
		fullContent: true,
		exec: data => {
			removeBoldTagWrapper( data.content );
		}
	} );

	return normalizer;
} )();
