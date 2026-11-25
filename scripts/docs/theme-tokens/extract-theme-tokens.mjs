/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * Extracts the tokens declared in the top-level `:root, :host` rules of a theme file, with their doc comments. It reads
 * the tokens and the tags by the rules of the theme token doc comment check, `scripts/check-css-token-docs.mjs`.
 */

import { readFileSync } from 'node:fs';
import { generate, parse, walk } from '@eslint/css-tree';

/**
 * Returns the file description and the tokens of the given CSS file.
 */
export function extractThemeTokens( filePath ) {
	const source = readFileSync( filePath, 'utf-8' );
	const docComments = [];
	const tokens = [];
	const topLevelRootRules = new Set();
	let firstRootRuleStart = null;

	const ast = parse( source, {
		positions: true,
		parseCustomProperty: false,
		onComment: ( value, loc ) => {
			// The license header is a doc comment too, but it never describes a file or a token.
			if ( value.startsWith( '*' ) && !value.includes( '@license' ) ) {
				docComments.push( { value, start: loc.start.offset, end: loc.end.offset } );
			}
		}
	} );

	// The walker visits a rule before its children, and `this.rule` is the closest rule that contains the visited node.
	walk( ast, function( node ) {
		if ( node.type === 'Rule' && this.stylesheet && !this.rule && !this.atrule && isRootSelectorList( node.prelude ) ) {
			topLevelRootRules.add( node );
			firstRootRuleStart ??= node.loc.start.offset;
		}

		// Only the top-level root rules declare tokens, as in the theme token doc comment check. A declaration in
		// an at-rule nested in a root rule, such as `@media`, is a conditional override, and a root rule nested in
		// another rule is not a root rule of the file.
		if ( node.type === 'Declaration' && node.property.startsWith( '--' ) && !this.atrule &&
			topLevelRootRules.has( this.rule ) ) {
			tokens.push( {
				name: node.property,
				// Multi-line values are joined into one line, because indented lines would become code blocks in Markdown.
				value: source.slice( node.value.loc.start.offset, node.value.loc.end.offset ).replace( /\s+/g, ' ' ).trim(),
				start: node.loc.start.offset,
				line: node.loc.start.line
			} );
		}
	} );

	const fileDescription = firstRootRuleStart === null ? null : findDescriptionBefore( firstRootRuleStart );

	return {
		description: fileDescription ? fileDescription.text : null,
		tokens: tokens.map( token => {
			const docComment = findDescriptionBefore( token.start );

			return {
				name: token.name,
				value: token.value,
				line: token.line,
				description: docComment ? docComment.text : null,
				pairs: docComment ? docComment.pairs : [],
				deprecated: docComment ? docComment.deprecated : null
			};
		} )
	};

	function findDescriptionBefore( offset ) {
		const candidate = docComments.filter( comment => comment.end <= offset ).at( -1 );

		if ( !candidate ) {
			return null;
		}

		// Only whitespace and plain comments can be between the doc comment and the declaration. The body of a plain
		// comment cannot contain its end, so a match cannot run over a declaration into a later comment.
		if ( !/^(\s|\/\*(?!\*)([^*]|\*(?!\/))*\*\/)*$/.test( source.slice( candidate.end, offset ) ) ) {
			return null;
		}

		const lines = candidate.value.slice( 1 ).split( '\n' ).map( line => line.replace( /^\s*\*\s?/, '' ).trim() );
		// The tags end as in the token docs check, so any separator, such as a tab, can follow them. A tag without
		// a name gives nothing.
		const tags = lines.map( line => /^@(pair|deprecated)(?![\w-])\s*(.*)$/.exec( line ) ).filter( Boolean );

		// The token docs check allows one `@deprecated` tag, which names the token to use instead.
		return {
			text: lines.filter( line => line && !line.startsWith( '@' ) ).join( ' ' ),
			pairs: tags.filter( ( [ , tag ] ) => tag === 'pair' ).map( ( [ , , name ] ) => name ).filter( Boolean ),
			deprecated: tags.find( ( [ , tag ] ) => tag === 'deprecated' )?.[ 2 ] || null
		};
	}
}

function isRootSelectorList( prelude ) {
	return prelude.type === 'SelectorList' && prelude.children.some( selector => {
		const text = generate( selector ).toLowerCase();

		return text === ':root' || text === ':host';
	} );
}
