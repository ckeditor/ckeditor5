/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module code-block/codeblockcommand
 */

import type { Element, Writer } from 'ckeditor5/src/engine.js';
import { Command, type Editor } from 'ckeditor5/src/core.js';
import { first } from 'ckeditor5/src/utils.js';

import { getNormalizedAndLocalizedLanguageDefinitions, canBeCodeBlock } from './utils.js';

/**
 * The code block command plugin.
 */
export default class CodeBlockCommand extends Command {
	/**
	 * Contains the last used language.
	 */
	private _lastLanguage: string | null;

	/**
	 * Contains language if any is selected, false otherwise.
	 * @observable
	 * @readonly
	 */
	declare public value: string | false;

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		this._lastLanguage = null;
	}

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		this.value = this._getValue();
		this.isEnabled = this._checkEnabled();
	}

	/**
	 * Executes the command. When the command {@link #value is on}, all topmost code blocks within
	 * the selection will be removed. If it is off, all selected blocks will be flattened and
	 * wrapped by a code block.
	 *
	 * @fires execute
	 * @param options Command options.
	 * @param options.language The code block language.
	 * @param options.forceValue If set, it will force the command behavior. If `true`, the command will apply a code block,
	 * otherwise the command will remove the code block. If not set, the command will act basing on its current value.
	 * @param options.usePreviousLanguageChoice If set on `true` and the `options.language` is not specified, the command
	 * will apply the previous language (if the command was already executed) when inserting the `codeBlock` element.
	 */
	public override execute( options: {
		language?: string;
		forceValue?: boolean;
		usePreviousLanguageChoice?: boolean;
	} = {} ): void {
		const editor = this.editor;
		const model = editor.model;
		const selection = model.document.selection;
		const normalizedLanguagesDefs = getNormalizedAndLocalizedLanguageDefinitions( editor );
		const firstLanguageInConfig = normalizedLanguagesDefs[ 0 ];

		const blocks = Array.from( selection.getSelectedBlocks() );
		const value = options.forceValue == undefined ? !this.value : options.forceValue;
		const language = getLanguage( options, this._lastLanguage, firstLanguageInConfig.language );

		model.change( writer => {
			if ( value ) {
				this._applyCodeBlock( writer, blocks, language );
			} else {
				this._removeCodeBlock( writer, blocks );
			}
		} );
	}

	/**
	 * Checks the command's {@link #value}.
	 *
	 * @returns The current value.
	 */
	private _getValue(): string | false {
		const selection = this.editor.model.document.selection;
		const firstBlock = first( selection.getSelectedBlocks() );
		const isCodeBlock = !!firstBlock?.is( 'element', 'codeBlock' );

		return isCodeBlock ? firstBlock.getAttribute( 'language' ) as string : false;
	}

	/**
	 * Checks whether the command can be enabled in the current context.
	 *
	 * @returns Whether the command should be enabled.
	 */
	private _checkEnabled(): boolean {
		if ( this.value ) {
			return true;
		}

		const selection = this.editor.model.document.selection;
		const schema = this.editor.model.schema;

		const firstBlock = first( selection.getSelectedBlocks() );

		if ( !firstBlock ) {
			return false;
		}

		return canBeCodeBlock( schema, firstBlock );
	}

	private _applyCodeBlock( writer: Writer, blocks: Array<Element>, language: string ): void {
		this._lastLanguage = language;

		const schema = this.editor.model.schema;
		const allowedBlocks = blocks.filter( block => canBeCodeBlock( schema, block ) );

		for ( const block of allowedBlocks ) {
			writer.rename( block, 'codeBlock' );
			writer.setAttribute( 'language', language, block );
			schema.removeDisallowedAttributes( [ block ], writer );

			// Remove children of the  `codeBlock` element that are not allowed. See #9567.
			Array.from( block.getChildren() )
				.filter( child => !schema.checkChild( block, child ) )
				.forEach( child => writer.remove( child ) );
		}

		allowedBlocks.reverse().forEach( ( currentBlock, i ) => {
			const nextBlock = allowedBlocks[ i + 1 ];

			if ( currentBlock.previousSibling === nextBlock ) {
				writer.appendElement( 'softBreak', nextBlock );
				writer.merge( writer.createPositionBefore( currentBlock ) );
			}
		} );
	}

	private _removeCodeBlock( writer: Writer, blocks: Array<Element> ): void {
		const codeBlocks = blocks.filter( block => block.is( 'element', 'codeBlock' ) );

		for ( const block of codeBlocks ) {
			const range = writer.createRangeOn( block );

			for ( const item of Array.from( range.getItems() ).reverse() ) {
				if ( item.is( 'element', 'softBreak' ) && item.parent!.is( 'element', 'codeBlock' ) ) {
					const { position } = writer.split( writer.createPositionBefore( item ) );
					const elementAfter = position.nodeAfter as Element;

					writer.rename( elementAfter, 'paragraph' );
					writer.removeAttribute( 'language', elementAfter );
					writer.remove( item );
				}
			}

			writer.rename( block, 'paragraph' );
			writer.removeAttribute( 'language', block );
		}
	}
}

/**
 * Picks the language for the new code block. If any language is passed as an option,
 * it will be returned. Else, if option usePreviousLanguageChoice is true and some
 * code block was already created (lastLanguage is not null) then previously used
 * language will be returned. If not, it will return default language.
 */
function getLanguage(
	options: { usePreviousLanguageChoice?: boolean; language?: string },
	lastLanguage: string | null,
	defaultLanguage: string
): string {
	if ( options.language ) {
		return options.language;
	}

	if ( options.usePreviousLanguageChoice && lastLanguage ) {
		return lastLanguage;
	}

	return defaultLanguage;
}
