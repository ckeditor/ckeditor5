/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module restricted-editing/restrictededitingexceptioncommand
 */

import { Command } from 'ckeditor5/src/core.js';
import type { ModelTreeWalkerValue } from 'ckeditor5/src/engine.js';

/**
 * The command that toggles exceptions from the restricted editing on text.
 */
export class RestrictedEditingExceptionCommand extends Command {
	/**
	 * A flag indicating whether the command is active
	 *
	 * @readonly
	 */
	declare public value: boolean;

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const model = this.editor.model;
		const doc = model.document;

		this.value = !!doc.selection.getAttribute( 'restrictedEditingException' );

		this.isEnabled = model.schema.checkAttributeInSelection( doc.selection, 'restrictedEditingException' );
	}

	/**
	 * @inheritDoc
	 */
	public override execute( options: RestrictedEditingExceptionCommandParams = {} ): void {
		const model = this.editor.model;
		const document = model.document;
		const selection = document.selection;
		const valueToSet = ( options.forceValue === undefined ) ? !this.value : options.forceValue;

		model.change( writer => {
			const ranges = model.schema.getValidRanges( selection.getRanges(), 'restrictedEditingException' );

			if ( selection.isCollapsed ) {
				if ( valueToSet ) {
					writer.setSelectionAttribute( 'restrictedEditingException', valueToSet );
				} else {
					const isSameException = ( value: ModelTreeWalkerValue ) => {
						return value.item.getAttribute( 'restrictedEditingException' ) === this.value;
					};

					const focus = selection.focus!;
					const exceptionStart = focus.getLastMatchingPosition( isSameException, { direction: 'backward' } );
					const exceptionEnd = focus.getLastMatchingPosition( isSameException );

					writer.removeSelectionAttribute( 'restrictedEditingException' );

					if ( !( focus.isEqual( exceptionStart ) || focus.isEqual( exceptionEnd ) ) ) {
						writer.removeAttribute( 'restrictedEditingException', writer.createRange( exceptionStart, exceptionEnd ) );
					}
				}
			} else {
				for ( const range of ranges ) {
					if ( valueToSet ) {
						writer.setAttribute( 'restrictedEditingException', valueToSet, range );
					} else {
						writer.removeAttribute( 'restrictedEditingException', range );
					}
				}
			}
		} );
	}
}

export interface RestrictedEditingExceptionCommandParams {
	forceValue?: unknown;
}
