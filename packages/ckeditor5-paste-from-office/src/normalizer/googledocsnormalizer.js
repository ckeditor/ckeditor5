/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module paste-from-office/normalizer/googledocsnormalizer
 */

import removeBoldTagWrapper from '../filters/removeboldtagwrapper';
import UpcastWriter from '@ckeditor/ckeditor5-engine/src/view/upcastwriter';

/**
 * Normalizer for the content pasted from Google Docs.
 *
 * @implements module:paste-from-office/normalizer~Normalizer
 */
export default class GoogleDocsNormalizer {
	/**
	 * @inheritDoc
	 */
	isActive( htmlString ) {
		return /id=("|')docs-internal-guid-[-0-9a-f]+("|')/.test( htmlString );
	}

	/**
	 * @inheritDoc
	 */
	exec( data ) {
		const writer = new UpcastWriter();

		removeBoldTagWrapper( {
			writer,
			documentFragment: data.content
		} );
	}
}
