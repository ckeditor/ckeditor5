/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module paste-from-office/normalizers/mswordnormalizer
 */

import transformBookmarks from '../filters/bookmark.js';
import { transformListItemLikeElementsIntoLists } from '../filters/list.js';
import { replaceImagesSourceWithBase64 } from '../filters/image.js';
import removeMSAttributes from '../filters/removemsattributes.js';
import {
	UpcastWriter,
	type ViewDocumentFragment,
	type DataTransfer,
	type ViewDocument
} from 'ckeditor5/src/engine.js';
import type { Normalizer } from '../normalizer.js';
import { parseHtml } from '../filters/parse.js';

const msWordMatch1 = /<meta\s*name="?generator"?\s*content="?microsoft\s*word\s*\d+"?\/?>/i;
const msWordMatch2 = /xmlns:o="urn:schemas-microsoft-com/i;

/**
 * Normalizer for the content pasted from Microsoft Word.
 */
export default class MSWordNormalizer implements Normalizer {
	public readonly document: ViewDocument;

	public readonly hasMultiLevelListPlugin: boolean;

	/**
	 * Creates a new `MSWordNormalizer` instance.
	 *
	 * @param document View document.
	 */
	constructor( document: ViewDocument, hasMultiLevelListPlugin: boolean = false ) {
		this.document = document;
		this.hasMultiLevelListPlugin = hasMultiLevelListPlugin;
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
	public execute( dataTransfer: DataTransfer ): ViewDocumentFragment {
		const writer = new UpcastWriter( this.document );
		const { body: documentFragment, stylesString } = parseHtml(
			dataTransfer.getData( 'text/html' ),
			this.document.stylesProcessor
		);

		transformBookmarks( documentFragment, writer );
		transformListItemLikeElementsIntoLists( documentFragment, stylesString, this.hasMultiLevelListPlugin );
		replaceImagesSourceWithBase64( documentFragment, dataTransfer.getData( 'text/rtf' ) );
		removeMSAttributes( documentFragment );

		return documentFragment;
	}
}
