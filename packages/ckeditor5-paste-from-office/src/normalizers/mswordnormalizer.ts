/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module paste-from-office/normalizers/mswordnormalizer
 */

import { transformListItemLikeElementsIntoLists } from '../filters/list';
import { replaceImagesSourceWithBase64 } from '../filters/image';
import type { Normalizer, NormalizerData } from '../normalizer';

import type { ViewDocument } from 'ckeditor5/src/engine';

const msWordMatch1 = /<meta\s*name="?generator"?\s*content="?microsoft\s*word\s*\d+"?\/?>/i;
const msWordMatch2 = /xmlns:o="urn:schemas-microsoft-com/i;

/**
 * Normalizer for the content pasted from Microsoft Word.
 */
export default class MSWordNormalizer implements Normalizer {
	public readonly document: ViewDocument;

	/**
	 * Creates a new `MSWordNormalizer` instance.
	 *
	 * @param document View document.
	 */
	constructor( document: ViewDocument ) {
		this.document = document;
	}

	/**
	 * @inheritDoc
	 */
	public isActive( htmlString: string ): boolean {
		return msWordMatch1.test( htmlString ) || msWordMatch2.test( htmlString );
	}

	/**
	 * @inheritDoc
	 */
	public execute( data: NormalizerData ): void {
		const { body: documentFragment, stylesString } = data._parsedData;

		transformListItemLikeElementsIntoLists( documentFragment, stylesString );
		replaceImagesSourceWithBase64( documentFragment, data.dataTransfer.getData( 'text/rtf' ) );

		data.content = documentFragment;
	}
}
