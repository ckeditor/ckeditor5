/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module paste-from-office/normalizers/mswordnormalizer
 */

import { transformBookmarks } from '../filters/bookmark.js';
import { transformListItemLikeElementsIntoLists } from '../filters/list.js';
import { replaceImagesSourceWithBase64 } from '../filters/image.js';
import { removeMSAttributes } from '../filters/removemsattributes.js';
import { transformTables } from '../filters/table.js';
import { ViewUpcastWriter, type ViewDocument } from 'ckeditor5/src/engine.js';
import type { PasteFromOfficeNormalizer, PasteFromOfficeNormalizerData } from '../normalizer.js';

const msWordMatch1 = /<meta\s*name="?generator"?\s*content="?microsoft\s*word\s*\d+"?\/?>/i;
const msWordMatch2 = /xmlns:o="urn:schemas-microsoft-com/i;

/**
 * Normalizer for the content pasted from Microsoft Word.
 */
export class PasteFromOfficeMSWordNormalizer implements PasteFromOfficeNormalizer {
	public readonly document: ViewDocument;

	public readonly hasMultiLevelListPlugin: boolean;

	/**
	 * Creates a new `PasteFromOfficeMSWordNormalizer` instance.
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
	public execute( data: PasteFromOfficeNormalizerData ): void {
		const writer = new ViewUpcastWriter( this.document );
		const { body: documentFragment, stylesString } = data._parsedData;

		transformBookmarks( documentFragment, writer );
		transformListItemLikeElementsIntoLists( documentFragment, stylesString, this.hasMultiLevelListPlugin );
		replaceImagesSourceWithBase64( documentFragment, data.dataTransfer.getData( 'text/rtf' ) );
		transformTables( documentFragment, writer );
		removeMSAttributes( documentFragment );

		data.content = documentFragment;
	}
}
