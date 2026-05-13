/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module paste-from-office/normalizers/mswordnormalizer
 */

import type { ClipboardInputTransformationData } from '@ckeditor/ckeditor5-clipboard';

import { transformBookmarks } from '../filters/bookmark.js';
import { transformListItemLikeElementsIntoLists } from '../filters/list.js';
import { replaceImagesSourceWithBase64 } from '../filters/image.js';
import { removeMSAttributes } from '../filters/removemsattributes.js';
import { transformTables } from '../filters/table.js';
import { removeInvalidTableWidth } from '../filters/removeinvalidtablewidth.js';
import { replaceMSFootnotes } from '../filters/replacemsfootnotes.js';
import { ViewUpcastWriter, type ViewDocument } from '@ckeditor/ckeditor5-engine';
import type { PasteFromOfficeNormalizer } from '../normalizer.js';

const msWordMatch1 = /<meta\s*name="?generator"?\s*content="?microsoft\s*word\s*\d+"?\/?>/i;
const msWordMatch2 = /xmlns:o="urn:schemas-microsoft-com/i;

/**
 * Normalizer for the content pasted from Microsoft Word.
 */
export class PasteFromOfficeMSWordNormalizer implements PasteFromOfficeNormalizer {
	public readonly document: ViewDocument;

	public readonly hasMultiLevelListPlugin: boolean;

	public readonly hasTablePropertiesPlugin: boolean;

	/**
	 * Creates a new `PasteFromOfficeMSWordNormalizer` instance.
	 *
	 * @param document View document.
	 */
	constructor(
		document: ViewDocument,
		hasMultiLevelListPlugin: boolean = false,
		hasTablePropertiesPlugin: boolean = false
	) {
		this.document = document;
		this.hasMultiLevelListPlugin = hasMultiLevelListPlugin;
		this.hasTablePropertiesPlugin = hasTablePropertiesPlugin;
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
	public execute( data: ClipboardInputTransformationData ): void {
		const writer = new ViewUpcastWriter( this.document );
		const stylesString = ( data.extraContent as { stylesString: string } ).stylesString;

		transformBookmarks( data.content, writer );
		transformListItemLikeElementsIntoLists( data.content, stylesString, this.hasMultiLevelListPlugin );
		replaceImagesSourceWithBase64( data.content, data.dataTransfer.getData( 'text/rtf' ) );
		transformTables( data.content, writer, this.hasTablePropertiesPlugin );
		removeInvalidTableWidth( data.content, writer );
		replaceMSFootnotes( data.content, writer );
		removeMSAttributes( data.content );
	}
}
