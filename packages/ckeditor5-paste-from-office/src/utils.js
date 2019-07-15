/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module paste-from-office/pastefromoffice/utils
 */

import { parseHtml } from './filters/parse';
import { transformListItemLikeElementsIntoLists } from './filters/list';
import { replaceImagesSourceWithBase64 } from './filters/image';
import { removeBoldTagWrapper } from './filters/common';

/**
 * Listener fired during {@link module:clipboard/clipboard~Clipboard#event:inputTransformation} event. Detects if content comes
 * from recognized source and normalize it.
 *
 * **Note**: this function was exposed mainly for testing purposes and should not be called directly.
 *
 * @param {module:utils/eventinfo~EventInfo} evt
 * @param {Object} data passed with {@link module:clipboard/clipboard~Clipboard#event:inputTransformation}
 */
export function _inputTransformationListener( evt, data ) {
	const html = data.dataTransfer.getData( 'text/html' );

	if ( data.pasteFromOfficeProcessed !== true ) {
		switch ( getInputType( html ) ) {
			case 'msword':
				data.content = _normalizeWordInput( html, data.dataTransfer );
				break;
			case 'gdocs':
				data.content = _normalizeGDocsInput( data.content );
				break;
			default:
				break;
		}

		// Set the flag so if `inputTransformation` is re-fired, PFO will not process it again (#44).
		data.pasteFromOfficeProcessed = true;
	}
}

/**
 * Normalizes input pasted from Word to format suitable for editor {@link module:engine/model/model~Model}.
 *
 * **Note**: this function is exposed mainly for testing purposes and should not be called directly.
 *
 * @private
 * @param {String} input Word input.
 * @param {module:clipboard/datatransfer~DataTransfer} dataTransfer Data transfer instance.
 * @returns {module:engine/view/documentfragment~DocumentFragment} Normalized input.
 */
export function _normalizeWordInput( input, dataTransfer ) {
	const { body, stylesString } = parseHtml( input );

	transformListItemLikeElementsIntoLists( body, stylesString );
	replaceImagesSourceWithBase64( body, dataTransfer.getData( 'text/rtf' ) );

	return body;
}

/**
 * Normalizes input pasted from Google Docs to format suitable for editor {@link module:engine/model/model~Model}.
 *
 * **Note**: this function is exposed mainly for testing purposes and should not be called directly.
 *
 * @private
 * @param {module:engine/view/documentfragment~DocumentFragment} documentFragment normalized clipboard data
 * @returns {module:engine/view/documentfragment~DocumentFragment} document fragment normalized with set of filters dedicated
 * for Google Docs
 */
export function _normalizeGDocsInput( documentFragment ) {
	return removeBoldTagWrapper( documentFragment );
}

/** Determines if given paste data came from specific office-like application
 * Recognized are:
 * * 'msword' for Microsoft Words desktop app
 * * 'gdocs' for Google Docs online app
 *
 * @param {String} html `text/html` string from data transfer
 * @return {String|null} type of app which is source of a data or null
 */
export function getInputType( html ) {
	if ( html ) {
		if (
			/<meta\s*name="?generator"?\s*content="?microsoft\s*word\s*\d+"?\/?>/i.test( html ) ||
			/xmlns:o="urn:schemas-microsoft-com/i.test( html )
		) {
			// Microsoft Word detection
			return 'msword';
		} else if ( /id=("|')docs-internal-guid-[-0-9a-f]+("|')/.test( html ) ) {
			// Google Docs detection
			return 'gdocs';
		}
	}

	return null;
}
