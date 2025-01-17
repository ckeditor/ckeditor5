/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module paste-from-office/normalizers/googledocsnormalizer
 */

import { UpcastWriter, type ViewDocument } from 'ckeditor5/src/engine.js';

import removeBoldWrapper from '../filters/removeboldwrapper.js';
import transformBlockBrsToParagraphs from '../filters/br.js';
import { unwrapParagraphInListItem } from '../filters/list.js';
import type { Normalizer, NormalizerData } from '../normalizer.js';

const googleDocsMatch = /id=("|')docs-internal-guid-[-0-9a-f]+("|')/i;

/**
 * Normalizer for the content pasted from Google Docs.
 */
export default class GoogleDocsNormalizer implements Normalizer {
	public readonly document: ViewDocument;

	/**
	 * Creates a new `GoogleDocsNormalizer` instance.
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
		return googleDocsMatch.test( htmlString );
	}

	/**
	 * @inheritDoc
	 */
	public execute( data: NormalizerData ): void {
		const writer = new UpcastWriter( this.document );
		const { body: documentFragment } = data._parsedData;

		removeBoldWrapper( documentFragment, writer );
		unwrapParagraphInListItem( documentFragment, writer );
		transformBlockBrsToParagraphs( documentFragment, writer );

		data.content = documentFragment;
	}
}
