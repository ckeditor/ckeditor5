/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module markdown-gfm/markdown
 */

import { Plugin, type Editor } from 'ckeditor5/src/core';
import GFMDataProcessor from './gfmdataprocessor';
import type { ClipboardPipeline, ClipboardInputTransformationEvent } from 'ckeditor5/src/clipboard';
import type { ViewDocumentKeyDownEvent } from 'ckeditor5/src/engine';

/**
 * The GitHub Flavored Markdown (GFM) plugin.
 *
 * For a detailed overview, check the {@glink features/markdown Markdown feature} guide.
 */
export default class Markdown extends Plugin {
	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		editor.data.processor = new GFMDataProcessor( editor.data.viewDocument );
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'Markdown' as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const view = editor.editing.view;
		const viewDocument = view.document;

		// TODO think about adding the paste logic only if ClipboardPipeline pluggin is added or make it required
		const clipboardPipeline: ClipboardPipeline = editor.plugins.get( 'ClipboardPipeline' );

		let shiftPressed = false;

		this.listenTo<ViewDocumentKeyDownEvent>( viewDocument, 'keydown', ( evt, data ) => {
			shiftPressed = data.shiftKey;
		} );

		this.listenTo<ClipboardInputTransformationEvent>( clipboardPipeline, 'inputTransformation', ( evt, data ) => {
			if ( data.dataTransfer.getData( 'text/html' ) || shiftPressed ) {
				return;
			}

			const dataStr = data.dataTransfer.getData( 'text/plain' );

			data.content = editor.data.processor.toView( dataStr );
		} );
	}
}
