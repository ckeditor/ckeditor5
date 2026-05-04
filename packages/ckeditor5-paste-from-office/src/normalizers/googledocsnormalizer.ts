/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module paste-from-office/normalizers/googledocsnormalizer
 */

import { ViewUpcastWriter, type ViewDocument } from '@ckeditor/ckeditor5-engine';
import type { ClipboardInputTransformationData } from '@ckeditor/ckeditor5-clipboard';

import { removeBoldWrapper } from '../filters/removeboldwrapper.js';
import { transformBlockBrsToParagraphs } from '../filters/br.js';
import { unwrapParagraphInListItem } from '../filters/list.js';
import { replaceTabsWithinPreWithSpaces } from '../filters/replacetabswithinprewithspaces.js';
import type { PasteFromOfficeNormalizer } from '../normalizer.js';

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
	public execute( data: ClipboardInputTransformationData ): void {
		const writer = new ViewUpcastWriter( this.document );

		removeBoldWrapper( data.content, writer );
		unwrapParagraphInListItem( data.content, writer );
		transformBlockBrsToParagraphs( data.content, writer );
		replaceTabsWithinPreWithSpaces( data.content, writer, 8 );
	}
}
