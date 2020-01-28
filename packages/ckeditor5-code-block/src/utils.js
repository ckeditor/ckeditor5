/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module code-block/utils
 */

import first from '@ckeditor/ckeditor5-utils/src/first';

/**
 * Returns code block languages as defined in `config.codeBlock.languages` but processed:
 *
 * * To consider the editor localization, i.e. to display {@link module:code-block/codeblock~CodeBlockLanguageDefinition}
 * in the correct language. There is no way to use {@link module:utils/locale~Locale#t} when the user
 * configuration is defined because the editor does not exist yet.
 * * To make sure each definition has a CSS class associated with it even if not specified
 * in the original configuration.
 *
 * @param {module:core/editor/editor~Editor} editor
 * @returns {Array.<module:code-block/codeblock~CodeBlockLanguageDefinition>}.
 */
export function getNormalizedAndLocalizedLanguageDefinitions( editor ) {
	const t = editor.t;
	const languageDefs = editor.config.get( 'codeBlock.languages' );

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
 *		const definitions = {
 *			{ language: 'php', class: 'language-php', label: 'PHP' },
 *			{ language: 'javascript', class: 'js', label: 'JavaScript' },
 *		};
 *
 *		getPropertyAssociation( definitions, 'class', 'language' );
 *
 * returns:
 *
 *		{
 *			'language-php': 'php'
 *			'js': 'javascript'
 *		}
 *
 * and
 *
 *		getPropertyAssociation( definitions, 'language', 'label' );
 *
 * returns:
 *
 *		{
 *			'php': 'PHP'
 *			'javascript': 'JavaScript'
 *		}
 *
 * @param {Array.<module:code-block/codeblock~CodeBlockLanguageDefinition>}
 * @param {String} key
 * @param {String} value
 * @param {Object.<String,String>}
 */
export function getPropertyAssociation( languageDefs, key, value ) {
	const association = {};

	for ( const def of languageDefs ) {
		if ( key === 'class' ) {
			// Only the first class is considered.
			association[ def[ key ].split( ' ' ).shift() ] = def[ value ];
		} else {
			association[ def[ key ] ] = def[ value ];
		}
	}

	return association;
}

/**
 * For a given model text node, it returns white spaces that precede other characters in that node.
 * This corresponds to the indentation part of the code block line.
 *
 * @param {module:engine/model/text~Text} codeLineNodes
 * @returns {String}
 */
export function getLeadingWhiteSpaces( textNode ) {
	return textNode.data.match( /^(\s*)/ )[ 0 ];
}

/**
 * For a plain text containing the code (snippet), it returns a document fragment containing
 * model text nodes separated by soft breaks (in place of new line characters "\n"), for instance:
 *
 * Input:
 *
 *		"foo()\n
 *		bar()"
 *
 * Output:
 *
 *		<DocumentFragment>
 *			"foo()"
 *			<softBreak></softBreak>
 *			"bar()"
 *		</DocumentFragment>
 *
 * @param {module:engine/model/writer~Writer} writer
 * @param {String} text The raw code text to be converted.
 */
export function rawSnippetTextToModelDocumentFragment( writer, text ) {
	const fragment = writer.createDocumentFragment();
	const textLines = text.split( '\n' ).map( data => writer.createText( data ) );
	const lastLine = textLines[ textLines.length - 1 ];

	for ( const node of textLines ) {
		writer.append( node, fragment );

		if ( node !== lastLine ) {
			writer.appendElement( 'softBreak', fragment );
		}
	}

	return fragment;
}

/**
 * Returns an array of all model positions within the selection that represent code block lines.
 *
 * If the selection is collapsed, it returns the exact selection anchor position:
 *
 *		<codeBlock>[]foo</codeBlock>        ->     <codeBlock>^foo</codeBlock>
 *		<codeBlock>foo[]bar</codeBlock>     ->     <codeBlock>foo^bar</codeBlock>
 *
 * Otherwise, it returns positions **before** each text node belonging to all code blocks contained by the selection:
 *
 *		<codeBlock>                                <codeBlock>
 *		    foo[bar                                   ^foobar
 *		    <softBreak></softBreak>         ->        <softBreak></softBreak>
 *		    baz]qux                                   ^bazqux
 *		</codeBlock>                               </codeBlock>
 *
 * It also works across other non–code blocks:
 *
 *		<codeBlock>                                <codeBlock>
 *		    foo[bar                                   ^foobar
 *		</codeBlock>                               </codeBlock>
 *		<paragraph>text</paragraph>         ->     <paragraph>text</paragraph>
 *		<codeBlock>                                <codeBlock>
 *		    baz]qux                                   ^bazqux
 *		</codeBlock>                               </codeBlock>
 *
 * **Note:** The positions are in reverse order so they do not get outdated when iterating over them and
 * the writer inserts or removes things at the same time.
 *
 * **Note:** The position is situated after the leading white spaces in the text node.
 *
 * @param {module:engine/model/model~Model} model
 * @returns {Array.<module:engine/model/position~Position>}
 */
export function getIndentOutdentPositions( model ) {
	const selection = model.document.selection;
	const positions = [];

	// When the selection is collapsed, there's only one position we can indent or outdent.
	if ( selection.isCollapsed ) {
		positions.push( selection.anchor );
	}

	// When the selection is NOT collapsed, collect all positions starting before text nodes
	// (code lines) in any <codeBlock> within the selection.
	else {
		// Walk backward so positions we're about to collect here do not get outdated when
		// inserting or deleting using the writer.
		const walker = selection.getFirstRange().getWalker( {
			ignoreElementEnd: true,
			direction: 'backward'
		} );

		for ( const { item } of walker ) {
			if ( item.is( 'textProxy' ) && item.parent.is( 'codeBlock' ) ) {
				const leadingWhiteSpaces = getLeadingWhiteSpaces( item.textNode );
				const { parent, startOffset } = item.textNode;

				// Make sure the position is after all leading whitespaces in the text node.
				const position = model.createPositionAt( parent, startOffset + leadingWhiteSpaces.length );

				positions.push( position );
			}
		}
	}

	return positions;
}

/**
 * Checks if any of the blocks within the model selection is a code block.
 *
 * @param {module:engine/model/selection~Selection} selection
 * @returns {Boolean}
 */
export function isModelSelectionInCodeBlock( selection ) {
	const firstBlock = first( selection.getSelectedBlocks() );

	return firstBlock && firstBlock.is( 'codeBlock' );
}
