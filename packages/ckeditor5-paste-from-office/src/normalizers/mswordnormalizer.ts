/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module paste-from-office/normalizers/mswordnormalizer
 */

import { transformListItemLikeElementsIntoLists } from '../filters/list.js';
import { replaceImagesSourceWithBase64 } from '../filters/image.js';
import removeMSAttributes from '../filters/removemsattributes.js';
import type { ViewDocument } from 'ckeditor5/src/engine.js';
import type { Normalizer, NormalizerData } from '../normalizer.js';
import type { Editor } from 'ckeditor5/src/core.js';

const msWordMatch1 = /<meta\s*name="?generator"?\s*content="?microsoft\s*word\s*\d+"?\/?>/i;
const msWordMatch2 = /xmlns:o="urn:schemas-microsoft-com/i;

/**
 * Normalizer for the content pasted from Microsoft Word.
 */
export default class MSWordNormalizer implements Normalizer {
	public readonly document: ViewDocument;

	public readonly editor: Editor;

	/**
	 * Creates a new `MSWordNormalizer` instance.
	 *
	 * @param document View document.
	 */
	constructor( document: ViewDocument, edytor: Editor ) {
		this.document = document;
		this.editor = edytor;
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
		const multiLevelListPlugin = this.editor.plugins.has( 'MultiLevelList' );

		transformListItemLikeElementsIntoLists( documentFragment, stylesString, multiLevelListPlugin );
		replaceImagesSourceWithBase64( documentFragment, data.dataTransfer.getData( 'text/rtf' ) );
		removeMSAttributes( documentFragment );

		data.content = documentFragment;
	}
}
