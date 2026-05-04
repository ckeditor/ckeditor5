/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module paste-from-office/pastefromoffice
 */

import { Plugin } from '@ckeditor/ckeditor5-core';
import { insertToPriorityArray, priorities, type PriorityString } from '@ckeditor/ckeditor5-utils';

import {
	ClipboardPipeline,
	type ClipboardInputTransformationEvent,
	type ViewDocumentClipboardInputEvent
} from '@ckeditor/ckeditor5-clipboard';

import { PasteFromOfficeMSWordNormalizer } from './normalizers/mswordnormalizer.js';
import { GoogleDocsNormalizer } from './normalizers/googledocsnormalizer.js';
import { GoogleSheetsNormalizer } from './normalizers/googlesheetsnormalizer.js';

import { parsePasteOfficeHtml } from './filters/parse.js';
import type { PasteFromOfficeNormalizer } from './normalizer.js';

/**
 * The Paste from Office plugin.
 *
 * This plugin handles content pasted from Office apps and transforms it (if necessary)
 * to a valid structure which can then be understood by the editor features.
 *
 * Transformation is made by a set of predefined {@link module:paste-from-office/normalizer~PasteFromOfficeNormalizer normalizers}.
 * This plugin includes following normalizers:
 * * {@link module:paste-from-office/normalizers/mswordnormalizer~PasteFromOfficeMSWordNormalizer Microsoft Word normalizer}
 * * {@link module:paste-from-office/normalizers/googledocsnormalizer~GoogleDocsNormalizer Google Docs normalizer}
 *
 * For more information about this feature check the {@glink api/paste-from-office package page}.
 */
export class PasteFromOffice extends Plugin {
	/**
	 * The priority array of registered normalizers.
	 */
	private _normalizers = [] as Array<{
		normalizer: PasteFromOfficeNormalizer;
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
	 * @internal
	 */
	public static get licenseFeatureCode(): string {
		return 'PFO';
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
	public static override get isPremiumPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ClipboardPipeline ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const clipboardPipeline: ClipboardPipeline = editor.plugins.get( 'ClipboardPipeline' );
		const viewDocument = editor.editing.view.document;
		const hasMultiLevelListPlugin = this.editor.plugins.has( 'MultiLevelListEditing' );
		const hasTablePropertiesPlugin = this.editor.plugins.has( 'TablePropertiesEditing' );

		this.registerNormalizer(
			new PasteFromOfficeMSWordNormalizer(
				viewDocument,
				hasMultiLevelListPlugin,
				hasTablePropertiesPlugin
			)
		);

		this.registerNormalizer( new GoogleDocsNormalizer( viewDocument ) );
		this.registerNormalizer( new GoogleSheetsNormalizer( viewDocument ) );

		viewDocument.on<ViewDocumentClipboardInputEvent>( 'clipboardInput', ( evt, data ) => {
			if ( typeof data.content != 'string' ) {
				return;
			}

			// The `htmlString` is used only to detect (match) the active normalizer.
			// The actual content processing is happening on `data.content` below.
			const htmlString = data.dataTransfer.getData( 'text/html' );
			const activeNormalizer = this._normalizers.find( ( { normalizer } ) => normalizer.isActive( htmlString ) );

			if ( activeNormalizer ) {
				const parsedData = parsePasteOfficeHtml( data.content, viewDocument.stylesProcessor );

				data.content = parsedData.body;
				data.extraContent = { ...parsedData, isTransformedWithPasteFromOffice: true };
			}
		}, { priority: priorities.low + 10 } );

		clipboardPipeline.on<ClipboardInputTransformationEvent>( 'inputTransformation', ( evt, data ) => {
			if ( !data.extraContent || !( data.extraContent as any ).isTransformedWithPasteFromOffice ) {
				return;
			}

			// The `htmlString` is used only to detect (match) the active normalizers, not for processing.
			const htmlString = data.dataTransfer.getData( 'text/html' );
			const normalizers = this._normalizers.filter( ( { normalizer } ) => normalizer.isActive( htmlString ) );

			for ( const { normalizer } of normalizers ) {
				normalizer.execute( data );
			}
		},
		{ priority: 'high' } );
	}

	/**
	 * Registers a normalizer with the given priority.
	 */
	public registerNormalizer(
		normalizer: PasteFromOfficeNormalizer,
		priority?: PriorityString
	): void {
		insertToPriorityArray( this._normalizers, {
			normalizer,
			priority: priorities.get( priority )
		} );
	}
}
