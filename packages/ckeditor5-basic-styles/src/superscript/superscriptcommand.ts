/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module basic-styles/superscript/superscriptcommand
 */

import type { Editor } from '@ckeditor/ckeditor5-core';
import { ModelDocumentSelection, type ModelElement, type ModelRange } from '@ckeditor/ckeditor5-engine';

import { AttributeCommand } from '../attributecommand.js';

const SUPERSCRIPT = 'superscript';
const SUBSCRIPT = 'subscript';

/**
 * The superscript command. It is registered as the `'superscript'` command
 * by {@link module:basic-styles/superscript/superscriptediting~SuperscriptEditing}.
 *
 * In addition to toggling the `superscript` attribute (the behavior provided by
 * {@link module:basic-styles/attributecommand~AttributeCommand}), the command enforces mutual exclusion
 * with the `subscript` attribute. When `superscript` is applied to a selection that already has
 * `subscript`, the `subscript` attribute is removed in the same model change so the operation is a
 * single undo step.
 *
 * The mutual exclusion can be disabled by setting either
 * {@link module:basic-styles/superscriptconfig~BasicStyleSuperscriptConfig#allowNesting `config.superscript.allowNesting`}
 * or {@link module:basic-styles/subscriptconfig~BasicStyleSubscriptConfig#allowNesting `config.subscript.allowNesting`}
 * to `true`. In that case the command behaves the same as the plain
 * {@link module:basic-styles/attributecommand~AttributeCommand}.
 *
 * The exclusion only applies to command execution. Content set through the data pipeline
 * (for example `editor.setData( '<sub><sup>x</sup></sub>' )`) is not modified by this command.
 */
export class SuperscriptCommand extends AttributeCommand {
	constructor( editor: Editor ) {
		super( editor, SUPERSCRIPT );
	}

	/**
	 * @inheritDoc
	 */
	public override execute( options: { forceValue?: boolean } = {} ): void {
		const editor = this.editor;
		const model = editor.model;
		const value = ( options.forceValue === undefined ) ? !this.value : options.forceValue;

		if ( !value || _isNestingAllowed( editor ) ) {
			super.execute( options );

			return;
		}

		model.change( writer => {
			super.execute( options );

			const selection = model.document.selection;

			if ( selection.isCollapsed ) {
				writer.removeSelectionAttribute( SUBSCRIPT );

				return;
			}

			const ranges = model.schema.getValidRanges( selection.getRanges(), SUBSCRIPT, {
				includeEmptyRanges: true
			} );

			for ( const range of ranges ) {
				let itemOrRange: ModelRange | ModelElement = range;
				let attributeKey = SUBSCRIPT;

				if ( range.isCollapsed ) {
					itemOrRange = range.start.parent as ModelElement;
					attributeKey = ModelDocumentSelection._getStoreAttributeKey( SUBSCRIPT );
				}

				writer.removeAttribute( attributeKey, itemOrRange );
			}
		} );
	}
}

function _isNestingAllowed( editor: Editor ): boolean {
	return Boolean(
		editor.config.get( 'superscript.allowNesting' ) ||
		editor.config.get( 'subscript.allowNesting' )
	);
}
