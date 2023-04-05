/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * The inline autoformatting engine. It allows to format various inline patterns. For example,
 * it can be configured to make "foo" bold when typed `**foo**` (the `**` markers will be removed).
 *
 * The autoformatting operation is integrated with the undo manager,
 * so the autoformatting step can be undone if the user's intention was not to format the text.
 *
 * See the {@link module:autoformat/inlineautoformatediting~inlineAutoformatEditing `inlineAutoformatEditing`} documentation
 * to learn how to create custom inline autoformatters. You can also use
 * the {@link module:autoformat/autoformat~Autoformat} feature which enables a set of default autoformatters
 * (lists, headings, bold and italic).
 *
 * @module autoformat/inlineautoformatediting
 */

import type { Editor } from 'ckeditor5/src/core';
import type {
	DocumentChangeEvent,
	Model,
	Position,
	Range,
	Writer
} from 'ckeditor5/src/engine';
import type { Delete, LastTextLineData } from 'ckeditor5/src/typing';

import type Autoformat from './autoformat';

export type TestCallback = ( text: string ) => {
	remove: Array<Array<number>>;
	format: Array<Array<number>>;
};

/**
 * Enables autoformatting mechanism for a given {@link module:core/editor/editor~Editor}.
 *
 * It formats the matched text by applying the given model attribute or by running the provided formatting callback.
 * On every {@link module:engine/model/document~Document#event:change:data data change} in the model document
 * the autoformatting engine checks the text on the left of the selection
 * and executes the provided action if the text matches given criteria (regular expression or callback).
 *
 * @param editor The editor instance.
 * @param plugin The autoformat plugin instance.
 * @param testRegexpOrCallback The regular expression or callback to execute on text.
 * Provided regular expression *must* have three capture groups. The first and the third capture group
 * should match opening and closing delimiters. The second capture group should match the text to format.
 *
 * ```ts
 * // Matches the `**bold text**` pattern.
 * // There are three capturing groups:
 * // - The first to match the starting `**` delimiter.
 * // - The second to match the text to format.
 * // - The third to match the ending `**` delimiter.
 * inlineAutoformatEditing( editor, plugin, /(\*\*)([^\*]+?)(\*\*)$/g, formatCallback );
 * ```
 *
 * When a function is provided instead of the regular expression, it will be executed with the text to match as a parameter.
 * The function should return proper "ranges" to delete and format.
 *
 * ```ts
 * {
 * 	remove: [
 * 		[ 0, 1 ],	// Remove the first letter from the given text.
 * 		[ 5, 6 ]	// Remove the 6th letter from the given text.
 * 	],
 * 	format: [
 * 		[ 1, 5 ]	// Format all letters from 2nd to 5th.
 * 	]
 * }
 * ```
 *
 * @param formatCallback A callback to apply actual formatting.
 * It should return `false` if changes should not be applied (e.g. if a command is disabled).
 *
 * ```ts
 * inlineAutoformatEditing( editor, plugin, /(\*\*)([^\*]+?)(\*\*)$/g, ( writer, rangesToFormat ) => {
 * 	const command = editor.commands.get( 'bold' );
 *
 * 	if ( !command.isEnabled ) {
 * 		return false;
 * 	}
 *
 * 	const validRanges = editor.model.schema.getValidRanges( rangesToFormat, 'bold' );
 *
 * 	for ( let range of validRanges ) {
 * 		writer.setAttribute( 'bold', true, range );
 * 	}
 * } );
 * ```
 */
export default function inlineAutoformatEditing(
	editor: Editor,
	plugin: Autoformat,
	testRegexpOrCallback: RegExp | TestCallback,
	formatCallback: ( writer: Writer, rangesToFormat: Array<Range> ) => boolean | undefined
): void {
	let regExp: RegExp;
	let testCallback: TestCallback | undefined;

	if ( testRegexpOrCallback instanceof RegExp ) {
		regExp = testRegexpOrCallback;
	} else {
		testCallback = testRegexpOrCallback;
	}

	// A test callback run on changed text.
	testCallback = testCallback || ( text => {
		let result: RegExpExecArray | null;
		const remove: Array<Array<number>> = [];
		const format: Array<Array<number>> = [];

		while ( ( result = regExp.exec( text ) ) !== null ) {
			// There should be full match and 3 capture groups.
			if ( result && result.length < 4 ) {
				break;
			}

			let {
				index,
				'1': leftDel,
				'2': content,
				'3': rightDel
			} = result;

			// Real matched string - there might be some non-capturing groups so we need to recalculate starting index.
			const found = leftDel + content + rightDel;
			index += result[ 0 ].length - found.length;

			// Start and End offsets of delimiters to remove.
			const delStart = [
				index,
				index + leftDel.length
			];
			const delEnd = [
				index + leftDel.length + content.length,
				index + leftDel.length + content.length + rightDel.length
			];

			remove.push( delStart );
			remove.push( delEnd );

			format.push( [ index + leftDel.length, index + leftDel.length + content.length ] );
		}

		return {
			remove,
			format
		};
	} );

	editor.model.document.on<DocumentChangeEvent>( 'change:data', ( evt, batch ) => {
		if ( batch.isUndo || !batch.isLocal || !plugin.isEnabled ) {
			return;
		}

		const model = editor.model;
		const selection = model.document.selection;

		// Do nothing if selection is not collapsed.
		if ( !selection.isCollapsed ) {
			return;
		}

		const changes = Array.from( model.document.differ.getChanges() );
		const entry = changes[ 0 ];

		// Typing is represented by only a single change.
		if ( changes.length != 1 || entry.type !== 'insert' || entry.name != '$text' || entry.length != 1 ) {
			return;
		}

		const focus = selection.focus;
		const block = focus!.parent;
		const { text, range } = getTextAfterCode( model.createRange( model.createPositionAt( block, 0 ), focus! ), model );
		const testOutput = testCallback!( text );
		const rangesToFormat = testOutputToRanges( range.start, testOutput.format, model );
		const rangesToRemove = testOutputToRanges( range.start, testOutput.remove, model );

		if ( !( rangesToFormat.length && rangesToRemove.length ) ) {
			return;
		}

		// Use enqueueChange to create new batch to separate typing batch from the auto-format changes.
		model.enqueueChange( writer => {
			// Apply format.
			const hasChanged = formatCallback( writer, rangesToFormat );

			// Strict check on `false` to have backward compatibility (when callbacks were returning `undefined`).
			if ( hasChanged === false ) {
				return;
			}

			// Remove delimiters - use reversed order to not mix the offsets while removing.
			for ( const range of rangesToRemove.reverse() ) {
				writer.remove( range );
			}

			model.enqueueChange( () => {
				const deletePlugin: Delete = editor.plugins.get( 'Delete' );

				deletePlugin.requestUndoOnBackspace();
			} );
		} );
	} );
}

/**
 * Converts output of the test function provided to the inlineAutoformatEditing and converts it to the model ranges
 * inside provided block.
 */
function testOutputToRanges( start: Position, arrays: Array<Array<number>>, model: Model ) {
	return arrays
		.filter( array => ( array[ 0 ] !== undefined && array[ 1 ] !== undefined ) )
		.map( array => {
			return model.createRange( start.getShiftedBy( array[ 0 ] ), start.getShiftedBy( array[ 1 ] ) );
		} );
}

/**
 * Returns the last text line after the last code element from the given range.
 * It is similar to {@link module:typing/utils/getlasttextline.getLastTextLine `getLastTextLine()`},
 * but it ignores any text before the last `code`.
 */
function getTextAfterCode( range: Range, model: Model ): LastTextLineData {
	let start = range.start;

	const text = Array.from( range.getItems() ).reduce( ( rangeText, node ) => {
		// Trim text to a last occurrence of an inline element and update range start.
		if ( !( node.is( '$text' ) || node.is( '$textProxy' ) ) || node.getAttribute( 'code' ) ) {
			start = model.createPositionAfter( node );

			return '';
		}

		return rangeText + node.data;
	}, '' );

	return { text, range: model.createRange( start, range.end ) };
}
