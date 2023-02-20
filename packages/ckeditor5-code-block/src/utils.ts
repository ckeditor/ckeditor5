/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module code-block/utils
 */

import type { Editor } from 'ckeditor5/src/core';
import type { CodeBlockLanguageDefinition } from './codeblockconfig';
import { first } from 'ckeditor5/src/utils';
import type {
	DocumentSelection,
	Element,
	Model,
	Position,
	Schema,
	Text,
	UpcastWriter,
	ViewDocumentFragment,
	ViewElement
} from 'ckeditor5/src/engine';

/**
 * Returns code block languages as defined in `config.codeBlock.languages` but processed:
 *
 * * To consider the editor localization, i.e. to display {@link module:code-block/codeblockconfig~CodeBlockLanguageDefinition}
 * in the correct language. There is no way to use {@link module:utils/locale~Locale#t} when the user
 * configuration is defined because the editor does not exist yet.
 * * To make sure each definition has a CSS class associated with it even if not specified
 * in the original configuration.
 */
export function getNormalizedAndLocalizedLanguageDefinitions( editor: Editor ): Array<CodeBlockLanguageDefinition> {
	const t = editor.t;
	const languageDefs = editor.config.get( 'codeBlock.languages' ) as Array<CodeBlockLanguageDefinition>;

	for ( const def of languageDefs ) {
		if ( def.label === 'Plain text' ) {
			def.label = t( 'Plain text' );
		}

		if ( def.class === undefined ) {
			def.class = `language-${ def.language }`;
		}
	}

	return languageDefs;
}

/**
 * Returns an object associating certain language definition properties with others. For instance:
 *
 * For:
 *
 * ```ts
 * const definitions = {
 * 	{ language: 'php', class: 'language-php', label: 'PHP' },
 * 	{ language: 'javascript', class: 'js', label: 'JavaScript' },
 * };
 *
 * getPropertyAssociation( definitions, 'class', 'language' );
 * ```
 *
 * returns:
 *
 * ```ts
 * {
 * 	'language-php': 'php',
 * 	'js': 'javascript'
 * }
 * ```
 *
 * and
 *
 * ```ts
 * getPropertyAssociation( definitions, 'language', 'label' );
 * ```
 *
 * returns:
 *
 * ```ts
 * {
 * 	'php': 'PHP',
 * 	'javascript': 'JavaScript'
 * }
 * ```
 */
export function getPropertyAssociation(
	languageDefs: Array<CodeBlockLanguageDefinition>,
	key: keyof CodeBlockLanguageDefinition,
	value: keyof CodeBlockLanguageDefinition
): Record<string, string> {
	const association: Record<string, string> = {};

	for ( const def of languageDefs ) {
		if ( key === 'class' ) {
			// Only the first class is considered.
			const newKey = ( def[ key ]! ).split( ' ' ).shift()!;

			association[ newKey ] = def[ value ]!;
		} else {
			association[ def[ key ]! ] = def[ value ]!;
		}
	}

	return association;
}

/**
 * For a given model text node, it returns white spaces that precede other characters in that node.
 * This corresponds to the indentation part of the code block line.
 */
export function getLeadingWhiteSpaces( textNode: Text ): string {
	return textNode.data.match( /^(\s*)/ )![ 0 ];
}

/**
 * For plain text containing the code (a snippet), it returns a document fragment containing
 * view text nodes separated by `<br>` elements (in place of new line characters "\n"), for instance:
 *
 * Input:
 *
 * ```ts
 * "foo()\n
 * bar()"
 * ```
 *
 * Output:
 *
 * ```html
 * <DocumentFragment>
 * 	"foo()"
 * 	<br/>
 * 	"bar()"
 * </DocumentFragment>
 * ```
 *
 * @param text The raw code text to be converted.
 */
export function rawSnippetTextToViewDocumentFragment( writer: UpcastWriter, text: string ): ViewDocumentFragment {
	const fragment = writer.createDocumentFragment();
	const textLines = text.split( '\n' );

	const items = textLines.reduce( ( nodes: Array<string | ViewElement>, line, lineIndex ) => {
		nodes.push( line );

		if ( lineIndex < textLines.length - 1 ) {
			nodes.push( writer.createElement( 'br' ) );
		}

		return nodes;
	}, [] );

	writer.appendChild( items, fragment );

	return fragment;
}

/**
 * Returns an array of all model positions within the selection that represent code block lines.
 *
 * If the selection is collapsed, it returns the exact selection anchor position:
 *
 * ```html
 * <codeBlock>[]foo</codeBlock>        ->     <codeBlock>^foo</codeBlock>
 * <codeBlock>foo[]bar</codeBlock>     ->     <codeBlock>foo^bar</codeBlock>
 * ```
 *
 * Otherwise, it returns positions **before** each text node belonging to all code blocks contained by the selection:
 *
 * ```html
 * <codeBlock>                                <codeBlock>
 *     foo[bar                                   ^foobar
 *     <softBreak></softBreak>         ->        <softBreak></softBreak>
 *     baz]qux                                   ^bazqux
 * </codeBlock>                               </codeBlock>
 * ```
 *
 * It also works across other non–code blocks:
 *
 * ```html
 * <codeBlock>                                <codeBlock>
 *     foo[bar                                   ^foobar
 * </codeBlock>                               </codeBlock>
 * <paragraph>text</paragraph>         ->     <paragraph>text</paragraph>
 * <codeBlock>                                <codeBlock>
 *     baz]qux                                   ^bazqux
 * </codeBlock>                               </codeBlock>
 * ```
 *
 * **Note:** The positions are in reverse order so they do not get outdated when iterating over them and
 * the writer inserts or removes elements at the same time.
 *
 * **Note:** The position is located after the leading white spaces in the text node.
 */
export function getIndentOutdentPositions( model: Model ): Array<Position> {
	const selection = model.document.selection;
	const positions: Array<Position> = [];

	// When the selection is collapsed, there's only one position we can indent or outdent.
	if ( selection.isCollapsed ) {
		return [ selection.anchor! ];
	}

	// When the selection is NOT collapsed, collect all positions starting before text nodes
	// (code lines) in any <codeBlock> within the selection.

	// Walk backward so positions we are about to collect here do not get outdated when
	// inserting or deleting using the writer.

	const walker = selection.getFirstRange()!.getWalker( {
		ignoreElementEnd: true,
		direction: 'backward'
	} );

	for ( const { item } of walker ) {
		if ( !item.is( '$textProxy' ) ) {
			continue;
		}

		const { parent, startOffset } = item.textNode;

		if ( !parent!.is( 'element', 'codeBlock' ) ) {
			continue;
		}

		const leadingWhiteSpaces = getLeadingWhiteSpaces( item.textNode );
		// Make sure the position is after all leading whitespaces in the text node.
		const position = model.createPositionAt( parent, startOffset! + leadingWhiteSpaces.length );

		positions.push( position );
	}

	return positions;
}

/**
 * Checks if any of the blocks within the model selection is a code block.
 */
export function isModelSelectionInCodeBlock( selection: DocumentSelection ): boolean {
	const firstBlock = first( selection.getSelectedBlocks() );

	return !!firstBlock && firstBlock.is( 'element', 'codeBlock' );
}

/**
 * Checks if an {@link module:engine/model/element~Element Element} can become a code block.
 *
 * @param schema Model's schema.
 * @param element The element to be checked.
 * @returns Check result.
 */
export function canBeCodeBlock( schema: Schema, element: Element ): boolean {
	if ( element.is( 'rootElement' ) || schema.isLimit( element ) ) {
		return false;
	}

	return schema.checkChild( element.parent as Element, 'codeBlock' );
}
