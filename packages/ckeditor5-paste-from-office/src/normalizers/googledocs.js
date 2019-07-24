/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module paste-from-office/normalizer
 */

import ContentNormalizer from '../contentnormalizer';
import { removeBoldTagWrapper } from '../filters/common';

/**
 * {@link module:paste-from-office/contentnormalizer~ContentNormalizer} instance dedicated to transforming data obtained from Google Docs.
 * It stores filters which fix quirks detected in Google Docs content.
 *
 * @type {module:paste-from-office/contentnormalizer~ContentNormalizer}
 */
export const googleDocsNormalizer = ( () => {
	const normalizer = new ContentNormalizer( contentString =>
		/id=("|')docs-internal-guid-[-0-9a-f]+("|')/.test( contentString )
	);

	normalizer.addFilter( removeBoldTagWrapper );

	return normalizer;
} )();
