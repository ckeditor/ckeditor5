/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module paste-from-office/normalizers/googledocsnormalizer
 */

import { ViewUpcastWriter, type ViewDocument } from 'ckeditor5/src/engine.js';

import { removeBoldWrapper } from '../filters/removeboldwrapper.js';
import { transformBlockBrsToParagraphs } from '../filters/br.js';
import { unwrapParagraphInListItem } from '../filters/list.js';
import { replaceTabsWithinPreWithSpaces } from '../filters/replacetabswithinprewithspaces.js';
import { insertGoogleDocsFootnotes, type GoogleDocsClipboardDocumentSliceData } from '../filters/insertgoogledocsfootnotes.js';
import type { PasteFromOfficeNormalizer, PasteFromOfficeNormalizerData } from '../normalizer.js';

const googleDocsMatch = /id=("|')docs-internal-guid-[-0-9a-f]+("|')/i;

/**
 * Normalizer for the content pasted from Google Docs.
 *
 * @internal
 */
export class GoogleDocsNormalizer implements PasteFromOfficeNormalizer {
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
	public execute( data: PasteFromOfficeNormalizerData ): void {
		const writer = new ViewUpcastWriter( this.document );
		const { body: documentFragment } = data._parsedData;
		const documentSlice = data.dataTransfer.getData( 'application/x-vnd.google-docs-document-slice-clip+wrapped' );

		removeBoldWrapper( documentFragment, writer );
		unwrapParagraphInListItem( documentFragment, writer );
		transformBlockBrsToParagraphs( documentFragment, writer );
		replaceTabsWithinPreWithSpaces( documentFragment, writer, 8 );

		// Since Google Docs slice data is not documented anywhere, we need to be defensive here.
		// The format might change without any notice and break the paste feature.
		// If we cannot parse the data, just skip footnotes insertion.
		try {
			if ( documentSlice ) {
				const { data } = JSON.parse( documentSlice );
				const parsedSliceData: GoogleDocsClipboardDocumentSliceData = JSON.parse( data ).resolved;

				insertGoogleDocsFootnotes( documentFragment, writer, parsedSliceData );
			}
		} catch ( err ) {
			console.warn( 'Could not parse Google Docs clipboard document slice.', err );
		}

		data.content = documentFragment;
	}
}
