/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module paste-from-office/normalizers/googlesheetsnormalizer
 */

import {
	UpcastWriter,
	type ViewDocument,
	type DataTransfer,
	type ViewDocumentFragment
} from 'ckeditor5/src/engine.js';

import removeXmlns from '../filters/removexmlns.js';
import removeGoogleSheetsTag from '../filters/removegooglesheetstag.js';
import removeInvalidTableWidth from '../filters/removeinvalidtablewidth.js';
import removeStyleBlock from '../filters/removestyleblock.js';
import type { Normalizer } from '../normalizer.js';
import { parseHtml } from '../filters/parse.js';

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
	public execute( dataTransfer: DataTransfer ): ViewDocumentFragment {
		const writer = new UpcastWriter( this.document );
		const { body: documentFragment } = parseHtml(
			dataTransfer.getData( 'text/html' ),
			this.document.stylesProcessor
		);

		removeGoogleSheetsTag( documentFragment, writer );
		removeXmlns( documentFragment, writer );
		removeInvalidTableWidth( documentFragment, writer );
		removeStyleBlock( documentFragment, writer );

		return documentFragment;
	}
}
