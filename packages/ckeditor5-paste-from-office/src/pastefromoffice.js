/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module paste-from-office/pastefromoffice
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import GoogleDocsNormalizer from './normalizers/googledocsnormalizer';
import MSWordNormalizer from './normalizers/mswordnormalizer';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';

/**
 * The Paste from Office plugin.
 *
 * This plugin handles content pasted from Office apps and transforms it (if necessary)
 * to a valid structure which can then be understood by the editor features.
 *
 * Transformation is made by a set of predefined {@link module:paste-from-office/normalizer~Normalizer normalizers}.
 * This plugin includes following normalizers:
 *   * {@link module:paste-from-office/normalizers/mswordnormalizer~MSWordNormalizer Microsoft Word normalizer}
 *   * {@link module:paste-from-office/normalizers/googledocsnormalizer~GoogleDocsNormalizer Google Docs normalizer}
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
	static get requires() {
		return [ Clipboard ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const viewDocument = editor.editing.view.document;
		const normalizers = [];

		normalizers.push( new MSWordNormalizer( viewDocument ) );
		normalizers.push( new GoogleDocsNormalizer( viewDocument ) );

		editor.plugins.get( 'Clipboard' ).on(
			'inputTransformation',
			( evt, data ) => {
				if ( data.isTransformedWithPasteFromOffice ) {
					return;
				}

				const htmlString = data.dataTransfer.getData( 'text/html' );
				const activeNormalizer = normalizers.find( normalizer => normalizer.isActive( htmlString ) );

				if ( activeNormalizer ) {
					activeNormalizer.execute( data );

					data.isTransformedWithPasteFromOffice = true;
				}
			},
			{ priority: 'high' }
		);
	}
}
