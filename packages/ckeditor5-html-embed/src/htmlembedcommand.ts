/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module html-embed/htmlembedcommand
 */

import type { DocumentSelection, Element, Model, Schema, Selection } from 'ckeditor5/src/engine.js';
import { Command } from 'ckeditor5/src/core.js';
import { findOptimalInsertionRange } from 'ckeditor5/src/widget.js';

/**
 * The insert HTML embed element command.
 *
 * The command is registered by {@link module:html-embed/htmlembedediting~HtmlEmbedEditing} as `'htmlEmbed'`.
 *
 * To insert an empty HTML embed element at the current selection, execute the command:
 *
 * ```ts
 * editor.execute( 'htmlEmbed' );
 * ```
 *
 * You can specify the initial content of a new HTML embed in the argument:
 *
 * ```ts
 * editor.execute( 'htmlEmbed', '<b>Initial content.</b>' );
 * ```
 *
 * To update the content of the HTML embed, select it in the model and pass the content in the argument:
 *
 * ```ts
 * editor.execute( 'htmlEmbed', '<b>New content of an existing embed.</b>' );
 * ```
 */
export default class HtmlEmbedCommand extends Command {
	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const model = this.editor.model;
		const schema = model.schema;
		const selection = model.document.selection;
		const selectedRawHtmlElement = getSelectedRawHtmlModelWidget( selection );

		this.isEnabled = isHtmlEmbedAllowedInParent( selection, schema, model );
		this.value = selectedRawHtmlElement ? selectedRawHtmlElement.getAttribute( 'value' ) || '' : null;
	}

	/**
	 * Executes the command, which either:
	 *
	 * * creates and inserts a new HTML embed element if none was selected,
	 * * updates the content of the HTML embed if one was selected.
	 *
	 * @fires execute
	 * @param value When passed, the value (content) will be set on a new embed or a selected one.
	 */
	public override execute( value?: string ): void {
		const model = this.editor.model;
		const selection = model.document.selection;

		model.change( writer => {
			let htmlEmbedElement;

			// If the command has a non-null value, there must be some HTML embed selected in the model.
			if ( this.value !== null ) {
				htmlEmbedElement = getSelectedRawHtmlModelWidget( selection );
			} else {
				htmlEmbedElement = writer.createElement( 'rawHtml' );

				model.insertObject( htmlEmbedElement, null, null, { setSelection: 'on' } );
			}

			writer.setAttribute( 'value', value, htmlEmbedElement! );
		} );
	}
}

/**
 * Checks if an HTML embed is allowed by the schema in the optimal insertion parent.
 */
function isHtmlEmbedAllowedInParent( selection: DocumentSelection, schema: Schema, model: Model ): boolean {
	const parent = getInsertHtmlEmbedParent( selection, model );

	return schema.checkChild( parent, 'rawHtml' );
}

/**
 * Returns a node that will be used to insert a html embed with `model.insertContent` to check if a html embed element can be placed there.
 */
function getInsertHtmlEmbedParent( selection: Selection | DocumentSelection, model: Model ): Element {
	const insertionRange = findOptimalInsertionRange( selection, model );
	const parent = insertionRange.start.parent as Element;

	if ( parent.isEmpty && !parent.is( 'rootElement' ) ) {
		return parent.parent as Element;
	}

	return parent;
}

/**
 * Returns the selected HTML embed element in the model, if any.
 */
function getSelectedRawHtmlModelWidget( selection: DocumentSelection ): Element | null {
	const selectedElement = selection.getSelectedElement();

	if ( selectedElement && selectedElement.is( 'element', 'rawHtml' ) ) {
		return selectedElement;
	}

	return null;
}
