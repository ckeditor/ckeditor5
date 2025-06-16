/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module media-embed/mediaembedcommand
 */

import type { ModelDocumentSelection, ModelElement, Model, ModelSelection } from 'ckeditor5/src/engine.js';
import { Command } from 'ckeditor5/src/core.js';
import { findOptimalInsertionRange } from 'ckeditor5/src/widget.js';

import { getSelectedMediaModelWidget, insertMedia } from './utils.js';

/**
 * The insert media command.
 *
 * The command is registered by the {@link module:media-embed/mediaembedediting~MediaEmbedEditing} as `'mediaEmbed'`.
 *
 * To insert media at the current selection, execute the command and specify the URL:
 *
 * ```ts
 * editor.execute( 'mediaEmbed', 'http://url.to.the/media' );
 * ```
 */
export class MediaEmbedCommand extends Command {
	/**
	 * Media url.
	 */
	declare public value: string | undefined;

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const model = this.editor.model;
		const selection = model.document.selection;
		const selectedMedia = getSelectedMediaModelWidget( selection );

		this.value = selectedMedia ? selectedMedia.getAttribute( 'url' ) as string : undefined;

		this.isEnabled = isMediaSelected( selection ) || isAllowedInParent( selection, model );
	}

	/**
	 * Executes the command, which either:
	 *
	 * * updates the URL of the selected media,
	 * * inserts the new media into the editor and puts the selection around it.
	 *
	 * @fires execute
	 * @param url The URL of the media.
	 */
	public override execute( url: string ): void {
		const model = this.editor.model;
		const selection = model.document.selection;
		const selectedMedia = getSelectedMediaModelWidget( selection );

		if ( selectedMedia ) {
			model.change( writer => {
				writer.setAttribute( 'url', url, selectedMedia );
			} );
		} else {
			insertMedia( model, url, selection, true );
		}
	}
}

/**
 * Checks if the media embed is allowed in the parent.
 */
function isAllowedInParent( selection: ModelSelection | ModelDocumentSelection, model: Model ): boolean {
	const insertionRange = findOptimalInsertionRange( selection, model );
	let parent = insertionRange.start.parent as ModelElement;

	// The model.insertContent() will remove empty parent (unless it is a $root or a limit).
	if ( parent.isEmpty && !model.schema.isLimit( parent ) ) {
		parent = parent.parent as ModelElement;
	}

	return model.schema.checkChild( parent, 'media' );
}

/**
 * Checks if the media object is selected.
 */
function isMediaSelected( selection: ModelSelection | ModelDocumentSelection ): boolean {
	const element = selection.getSelectedElement();
	return !!element && element.name === 'media';
}
