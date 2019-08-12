/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module paste-from-office/normalizers/googledocsnormalizer
 */

import removeBoldWrapper from '../filters/removeboldwrapper';
import { unwrapParagraphInListItem, fixListIndentation } from '../filters/list';
import UpcastWriter from '@ckeditor/ckeditor5-engine/src/view/upcastwriter';

const googleDocsMatch = /id=("|')docs-internal-guid-[-0-9a-f]+("|')/i;

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
		return googleDocsMatch.test( htmlString );
	}

	/**
	 * @inheritDoc
	 */
	execute( data ) {
		const writer = new UpcastWriter();

		removeBoldWrapper( data.content, writer );
		unwrapParagraphInListItem( data.content, writer );
	}
}
