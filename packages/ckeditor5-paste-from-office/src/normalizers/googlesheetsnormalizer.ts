/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module paste-from-office/normalizers/googlesheetsnormalizer
 */

import { ViewUpcastWriter, type ViewDocument } from '@ckeditor/ckeditor5-engine';
import type { ClipboardInputTransformationData } from '@ckeditor/ckeditor5-clipboard';

import { removeXmlns } from '../filters/removexmlns.js';
import { removeGoogleSheetsTag } from '../filters/removegooglesheetstag.js';
import { removeInvalidTableWidth } from '../filters/removeinvalidtablewidth.js';
import { removeStyleBlock } from '../filters/removestyleblock.js';
import type { PasteFromOfficeNormalizer } from '../normalizer.js';

const googleSheetsMatch = /<google-sheets-html-origin/i;

/**
 * Normalizer for the content pasted from Google Sheets.
 *
 * @internal
 */
export class GoogleSheetsNormalizer implements PasteFromOfficeNormalizer {
	public readonly document: ViewDocument;

	/**
	 * Creates a new `GoogleSheetsNormalizer` instance.
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
		return googleSheetsMatch.test( htmlString );
	}

	/**
	 * @inheritDoc
	 */
	public execute( data: ClipboardInputTransformationData ): void {
		const writer = new ViewUpcastWriter( this.document );

		removeGoogleSheetsTag( data.content, writer );
		removeXmlns( data.content, writer );
		removeInvalidTableWidth( data.content, writer );
		removeStyleBlock( data.content, writer );
	}
}
