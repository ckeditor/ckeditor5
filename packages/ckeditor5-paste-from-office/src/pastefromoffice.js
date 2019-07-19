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
import ContentNormalizer from './contentnormalizer';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';

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
	constructor( editor ) {
		super( editor );

		this._normalizers = new Collection();

		this._normalizers.add( this._getWordNormalizer() );
		this._normalizers.add( this._getGoogleDocsNormalizer() );
	}

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
			this._inputTransformationListener.bind( this ),
			{ priority: 'high' }
		);
	}

	_getWordNormalizer() {
		const wordNormalizer = new ContentNormalizer( {
			activationTrigger: contentString =>
				/<meta\s*name="?generator"?\s*content="?microsoft\s*word\s*\d+"?\/?>/i.test( contentString ) ||
				/xmlns:o="urn:schemas-microsoft-com/i.test( contentString )
		} );

		wordNormalizer.addFilter( {
			fullContent: true,
			exec: data => {
				const html = data.dataTransfer.getData( 'text/html' );

				data.content = PasteFromOffice._normalizeWordInput( html, data.dataTransfer );
			}
		} );

		return wordNormalizer;
	}

	_getGoogleDocsNormalizer() {
		const googleDocsNormalizer = new ContentNormalizer( {
			activationTrigger: contentString => /id=("|')docs-internal-guid-[-0-9a-f]+("|')/.test( contentString )
		} );

		googleDocsNormalizer.addFilter( {
			fullContent: true,
			exec: data => {
				removeBoldTagWrapper( data.content );
			}
		} );

		return googleDocsNormalizer;
	}

	/**
	 * Listener fired during {@link module:clipboard/clipboard~Clipboard#event:inputTransformation `inputTransformation` event}.
	 * Detects if content comes from a recognized source and normalize it.
	 *
	 * **Note**: this function was exposed mainly for testing purposes and should not be called directly.
	 *
	 * @private
	 * @param {module:utils/eventinfo~EventInfo} evt
	 * @param {Object} data same structure like {@link module:clipboard/clipboard~Clipboard#event:inputTransformation input transformation}
	 */
	_inputTransformationListener( evt, data ) {
		for ( const normalizer of this._normalizers ) {
			normalizer.addData( data );

			if ( normalizer.isActive ) {
				normalizer.filter();
			}
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
	 * Determines if given paste data came from the specific office-like application.
	 * Currently recognized are:
	 * * `'msword'` for Microsoft Words desktop app
	 * * `'gdocs'` for Google Docs online app
	 *
	 * **Note**: this function is exposed mainly for testing purposes and should not be called directly.
	 *
	 * @private
	 * @param {String} html the `text/html` string from data transfer
	 * @return {String|null} name of source app of an html data or null
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
