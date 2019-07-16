/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module paste-from-office/pastefromoffice
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import { parseHtml } from './filters/parse';
import { transformListItemLikeElementsIntoLists } from './filters/list';
import { replaceImagesSourceWithBase64 } from './filters/image';
import { removeBoldTagWrapper } from './filters/common';

/**
 * The Paste from Office plugin.
 *
 * This plugin handles content pasted from Office apps (for now only Word) and transforms it (if necessary)
 * to a valid structure which can then be understood by the editor features.
 *
 * For more information about this feature check the {@glink api/paste-from-office package page}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class PasteFromOffice extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'PasteFromOffice';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		this.listenTo(
			editor.plugins.get( 'Clipboard' ),
			'inputTransformation',
			PasteFromOffice._inputTransformationListener,
			{ priority: 'high' }
		);
	}

	/**
	 * Listener fired during {@link module:clipboard/clipboard~Clipboard#event:inputTransformation} event. Detects if content comes
	 * from recognized source and normalize it.
	 *
	 * **Note**: this function was exposed mainly for testing purposes and should not be called directly.
	 *
	 * @private
	 * @param {module:utils/eventinfo~EventInfo} evt
	 * @param {Object} data passed with {@link module:clipboard/clipboard~Clipboard#event:inputTransformation}
	 */
	static _inputTransformationListener( evt, data ) {
		const html = data.dataTransfer.getData( 'text/html' );

		if ( data.pasteFromOfficeProcessed !== true ) {
			switch ( PasteFromOffice._getInputType( html ) ) {
				case 'msword':
					data.content = PasteFromOffice._normalizeWordInput( html, data.dataTransfer );
					break;
				case 'gdocs':
					data.content = PasteFromOffice._normalizeGoogleDocsInput( data.content );
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
	static _normalizeWordInput( input, dataTransfer ) {
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
	static _normalizeGoogleDocsInput( documentFragment ) {
		return removeBoldTagWrapper( documentFragment );
	}

	/**
	 * Determines if given paste data came from specific office-like application
	 * Recognized are:
	 * * 'msword' for Microsoft Words desktop app
	 * * 'gdocs' for Google Docs online app
	 *
	 * @private
	 * @param {String} html `text/html` string from data transfer
	 * @return {String|null} type of app which is source of a data or null
	 */
	static _getInputType( html ) {
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

		return null;
	}
}
