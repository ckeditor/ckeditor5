/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module paste-from-office/normalizer
 */

import ContentNormalizer from '../contentnormalizer';
import { parseHtml } from '../filters/parse';
import { transformListItemLikeElementsIntoLists } from '../filters/list';
import { replaceImagesSourceWithBase64 } from '../filters/image';

export const mswordNormalizer = ( () => {
	const normalizer = new ContentNormalizer( {
		activationTrigger: contentString =>
			/<meta\s*name="?generator"?\s*content="?microsoft\s*word\s*\d+"?\/?>/i.test( contentString ) ||
			/xmlns:o="urn:schemas-microsoft-com/i.test( contentString )
	} );

	normalizer.addFilter( {
		fullContent: true,
		exec: data => {
			const html = data.dataTransfer.getData( 'text/html' );

			data.content = _normalizeWordInput( html, data.dataTransfer );
		}
	} );

	return normalizer;
} )();

//
// Normalizes input pasted from Word to format suitable for editor {@link module:engine/model/model~Model}.
//
// @private
// @param {String} input Word input.
// @param {module:clipboard/datatransfer~DataTransfer} dataTransfer Data transfer instance.
// @returns {module:engine/view/documentfragment~DocumentFragment} Normalized input.
//
function _normalizeWordInput( input, dataTransfer ) {
	const { body, stylesString } = parseHtml( input );

	transformListItemLikeElementsIntoLists( body, stylesString );
	replaceImagesSourceWithBase64( body, dataTransfer.getData( 'text/rtf' ) );

	return body;
}
