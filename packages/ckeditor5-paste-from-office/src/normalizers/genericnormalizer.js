/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module paste-from-office/normalizers/genericnormalizer
 */

import { unwrapParagraph, moveNestedListToListItem } from '../filters/list';
import UpcastWriter from '@ckeditor/ckeditor5-engine/src/view/upcastwriter';

/**
 * Normalizer for the content pasted from different sources, where we can detect wrong syntax.
 *
 * @implements module:paste-from-office/normalizer~Normalizer
 */
export default class GenericNormalizer {
	/**
	 * @inheritDoc
	 */
	isActive() {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	execute( data ) {
		const writer = new UpcastWriter();

		moveNestedListToListItem( data.content, writer );
		unwrapParagraph( data.content, writer );
	}
}
