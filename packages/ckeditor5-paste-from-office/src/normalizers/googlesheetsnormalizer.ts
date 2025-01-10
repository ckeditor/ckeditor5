/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module paste-from-office/normalizers/googlesheetsnormalizer
 */

import { UpcastWriter, type ViewDocument } from 'ckeditor5/src/engine.js';

import removeXmlns from '../filters/removexmlns.js';
import removeGoogleSheetsTag from '../filters/removegooglesheetstag.js';
import removeInvalidTableWidth from '../filters/removeinvalidtablewidth.js';
import removeStyleBlock from '../filters/removestyleblock.js';
import type { Normalizer } from '../normalizer.js';
import type { ClipboardInputTransformationData } from 'ckeditor5/src/clipboard.js';

const googleSheetsMatch = /<google-sheets-html-origin/i;

/**
 * Normalizer for the content pasted from Google Sheets.
 */
export default class GoogleSheetsNormalizer implements Normalizer {
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
		const writer = new UpcastWriter( this.document );

		removeGoogleSheetsTag( data.content, writer );
		removeXmlns( data.content, writer );
		removeInvalidTableWidth( data.content, writer );
		removeStyleBlock( data.content, writer );
	}
}
