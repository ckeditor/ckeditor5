/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module basic-styles/mutuallyexclusiveattributecommand
 */

import type { Editor } from '@ckeditor/ckeditor5-core';
import { ModelDocumentSelection, type ModelElement, type ModelRange } from '@ckeditor/ckeditor5-engine';

import { AttributeCommand } from './attributecommand.js';

/**
 * An {@link module:basic-styles/attributecommand~AttributeCommand} variant that removes a configured
 * opposite attribute from the affected ranges whenever the command turns its own attribute on.
 *
 * Used by the `superscript` and `subscript` commands to enforce their mutual exclusion. The opposite
 * attribute is removed in the same model change as the parent's toggle, so the operation is a single
 * undo step.
 *
 * The mutual exclusion can be disabled by setting either
 * {@link module:basic-styles/superscriptconfig~BasicStyleSuperscriptConfig#allowNesting `config.superscript.allowNesting`}
 * or {@link module:basic-styles/subscriptconfig~BasicStyleSubscriptConfig#allowNesting `config.subscript.allowNesting`}
 * to `true`. In that case, the command behaves exactly the same as the plain
 * {@link module:basic-styles/attributecommand~AttributeCommand}.
 *
 * The exclusion only applies to command execution. Content set through the data pipeline
 * (for example `editor.setData( '<sub><sup>x</sup></sub>' )`) is not modified by this command.
 *
 * @internal
 */
export class MutuallyExclusiveAttributeCommand extends AttributeCommand {
	private readonly _oppositeAttributeKey: string;

	constructor( editor: Editor, attributeKey: string, oppositeAttributeKey: string ) {
		super( editor, attributeKey );

		this._oppositeAttributeKey = oppositeAttributeKey;
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

		const oppositeKey = this._oppositeAttributeKey;

		model.change( writer => {
			super.execute( options );

			const selection = model.document.selection;

			if ( selection.isCollapsed ) {
				writer.removeSelectionAttribute( oppositeKey );

				return;
			}

			const ranges = model.schema.getValidRanges( selection.getRanges(), oppositeKey, {
				includeEmptyRanges: true
			} );

			for ( const range of ranges ) {
				let itemOrRange: ModelRange | ModelElement = range;
				let attributeKey = oppositeKey;

				if ( range.isCollapsed ) {
					itemOrRange = range.start.parent as ModelElement;
					attributeKey = ModelDocumentSelection._getStoreAttributeKey( oppositeKey );
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
