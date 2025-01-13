/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module paste-from-office/pastefromoffice
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { priorities, insertToPriorityArray, type PriorityString } from 'ckeditor5/src/utils.js';

import {
	ClipboardPipeline,
	type ViewDocumentClipboardInputEvent,
	type ClipboardInputTransformationEvent
} from 'ckeditor5/src/clipboard.js';

import MSWordNormalizer from './normalizers/mswordnormalizer.js';
import GoogleDocsNormalizer from './normalizers/googledocsnormalizer.js';
import GoogleSheetsNormalizer from './normalizers/googlesheetsnormalizer.js';

import { parseHtml } from './filters/parse.js';
import type { Normalizer } from './normalizer.js';

/**
 * The Paste from Office plugin.
 *
 * This plugin handles content pasted from Office apps and transforms it (if necessary)
 * to a valid structure which can then be understood by the editor features.
 *
 * Transformation is made by a set of predefined {@link module:paste-from-office/normalizer~Normalizer normalizers}.
 * This plugin includes following normalizers:
 * * {@link module:paste-from-office/normalizers/mswordnormalizer~MSWordNormalizer Microsoft Word normalizer}
 * * {@link module:paste-from-office/normalizers/googledocsnormalizer~GoogleDocsNormalizer Google Docs normalizer}
 *
 * For more information about this feature check the {@glink api/paste-from-office package page}.
 */
export default class PasteFromOffice extends Plugin {
	/**
	 * The priority array of registered normalizers.
	 */
	private _normalizers = [] as Array<{
		normalizer: Normalizer;
		priority: PriorityString;
	}>;

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'PasteFromOffice' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ClipboardPipeline ] as const;
	}

	/**
	 * Registers a normalizer with the given priority.
	 */
	public registerNormalizer(
		normalizer: Normalizer,
		priority?: PriorityString
	): void {
		insertToPriorityArray( this._normalizers, {
			normalizer,
			priority: priorities.get( priority )
		} );
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const clipboardPipeline: ClipboardPipeline = editor.plugins.get( 'ClipboardPipeline' );
		const viewDocument = editor.editing.view.document;
		const hasMultiLevelListPlugin = this.editor.plugins.has( 'MultiLevelList' );

		this.registerNormalizer( new MSWordNormalizer( viewDocument, hasMultiLevelListPlugin ) );
		this.registerNormalizer( new GoogleDocsNormalizer( viewDocument ) );
		this.registerNormalizer( new GoogleSheetsNormalizer( viewDocument ) );

		viewDocument.on<ViewDocumentClipboardInputEvent>( 'clipboardInput', ( evt, data ) => {
			if ( typeof data.content != 'string' ) {
				return;
			}

			const htmlString = data.dataTransfer.getData( 'text/html' );
			const activeNormalizer = this._normalizers.find( ( { normalizer } ) => normalizer.isActive( htmlString ) );

			if ( activeNormalizer ) {
				const parsedData = parseHtml( data.content, viewDocument.stylesProcessor );

				data.content = parsedData.body;
				data.extraContent = { ...parsedData, isTransformedWithPasteFromOffice: true };
			}
		}, { priority: priorities.low + 10 } );

		clipboardPipeline.on<ClipboardInputTransformationEvent>( 'inputTransformation', ( evt, data ) => {
			if ( !data.extraContent || !( data.extraContent as any ).isTransformedWithPasteFromOffice ) {
				return;
			}

			const htmlString = data.dataTransfer.getData( 'text/html' );
			const normalizers = this._normalizers.filter( ( { normalizer } ) => normalizer.isActive( htmlString ) );

			for ( const { normalizer } of normalizers ) {
				normalizer.execute( data );
			}
		},
		{ priority: 'high' } );
	}
}
