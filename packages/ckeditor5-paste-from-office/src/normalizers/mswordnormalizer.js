/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module paste-from-office/normalizers/mswordnormalizer
 */

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
		const { body: documentFragment, stylesString } = data._parsedData;

		transformListItemLikeElementsIntoLists( documentFragment, stylesString );
		replaceImagesSourceWithBase64( documentFragment, data.dataTransfer.getData( 'text/rtf' ) );

		data.content = documentFragment;
	}
}
