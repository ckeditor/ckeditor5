/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module font/fontcommand
 */

import { Command, type Editor } from 'ckeditor5/src/core.js';
import { type Batch, type Writer } from 'ckeditor5/src/engine.js';

/**
 * The base font command.
 */
export default abstract class FontCommand extends Command {
	/**
	 * When set, it reflects the {@link #attributeKey} value of the selection.
	 *
	 * @observable
	 * @readonly
	 */
	declare public value: string;

	/**
	 * A model attribute on which this command operates.
	 */
	public readonly attributeKey: string;

	/**
	 * Creates an instance of the command.
	 *
	 * @param editor Editor instance.
	 * @param attributeKey The name of a model attribute on which this command operates.
	 */
	constructor( editor: Editor, attributeKey: string ) {
		super( editor );

		this.attributeKey = attributeKey;
	}

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const model = this.editor.model;
		const doc = model.document;

		this.value = doc.selection.getAttribute( this.attributeKey ) as string;
		this.isEnabled = model.schema.checkAttributeInSelection( doc.selection, this.attributeKey );
	}

	/**
	 * Executes the command. Applies the `value` of the {@link #attributeKey} to the selection.
	 * If no `value` is passed, it removes the attribute from the selection.
	 *
	 * @param options Options for the executed command.
	 * @param options.value The value to apply.
	 * @fires execute
	 */
	public override execute( options: { value?: string; batch?: Batch } = {} ): void {
		const model = this.editor.model;
		const document = model.document;
		const selection = document.selection;

		const value = options.value;
		const batch = options.batch;

		const updateAttribute = ( writer: Writer ) => {
			if ( selection.isCollapsed ) {
				if ( value ) {
					writer.setSelectionAttribute( this.attributeKey, value );
				} else {
					writer.removeSelectionAttribute( this.attributeKey );
				}
			} else {
				const ranges = model.schema.getValidRanges( selection.getRanges(), this.attributeKey );

				for ( const range of ranges ) {
					if ( value ) {
						writer.setAttribute( this.attributeKey, value, range );
					} else {
						writer.removeAttribute( this.attributeKey, range );
					}
				}
			}
		};

		// In some scenarios, you may want to use a single undo step for multiple changes (e.g. in color picker).
		if ( batch ) {
			model.enqueueChange( batch, writer => {
				updateAttribute( writer );
			} );
		} else {
			model.change( writer => {
				updateAttribute( writer );
			} );
		}
	}
}
