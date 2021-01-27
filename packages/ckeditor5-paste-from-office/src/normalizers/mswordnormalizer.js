/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module paste-from-office/normalizers/mswordnormalizer
 */

import { parseHtml } from '../filters/parse';
import { transformListItemLikeElementsIntoLists } from '../filters/list';
import { replaceImagesSourceWithBase64 } from '../filters/image';

const msWordMatch1 = /<meta\s*name="?generator"?\s*content="?microsoft\s*word\s*\d+"?\/?>/i;
const msWordMatch2 = /xmlns:o="urn:schemas-microsoft-com/i;

/**
 * Normalizer for the content pasted from Microsoft Word.
 *
 * @implements module:paste-from-office/normalizer~Normalizer
 */
export default class MSWordNormalizer {
	/**
	 * Creates a new `MSWordNormalizer` instance.
	 *
	 * @param {module:engine/view/document~Document} document View document.
	 */
	constructor( document ) {
		/**
		 * @readonly
		 * @type {module:engine/view/document~Document}
		 */
		this.document = document;
	}

	/**
	 * @inheritDoc
	 */
	isActive( htmlString ) {
		return msWordMatch1.test( htmlString ) || msWordMatch2.test( htmlString );
	}

	/**
	 * @inheritDoc
	 */
	execute( data ) {
		const { body, stylesString } = parseHtml( data.dataTransfer.getData( 'text/html' ), this.document.stylesProcessor );

		transformListItemLikeElementsIntoLists( body, stylesString );
		replaceImagesSourceWithBase64( body, data.dataTransfer.getData( 'text/rtf' ) );

		data.content = body;
	}
}
