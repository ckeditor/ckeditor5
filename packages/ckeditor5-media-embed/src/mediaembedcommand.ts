/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module media-embed/mediaembedcommand
 */

import type { DocumentSelection, Element, Model, Selection } from 'ckeditor5/src/engine';
import { Command } from 'ckeditor5/src/core';
import { findOptimalInsertionRange } from 'ckeditor5/src/widget';

import { getSelectedMediaModelWidget, insertMedia } from './utils';

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
export default class MediaEmbedCommand extends Command {
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
function isAllowedInParent( selection: Selection | DocumentSelection, model: Model ): boolean {
	const insertionRange = findOptimalInsertionRange( selection, model );
	let parent = insertionRange.start.parent as Element;

	// The model.insertContent() will remove empty parent (unless it is a $root or a limit).
	if ( parent.isEmpty && !model.schema.isLimit( parent ) ) {
		parent = parent.parent as Element;
	}

	return model.schema.checkChild( parent, 'media' );
}

/**
 * Checks if the media object is selected.
 */
function isMediaSelected( selection: Selection | DocumentSelection ): boolean {
	const element = selection.getSelectedElement();
	return !!element && element.name === 'media';
}
