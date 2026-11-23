/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * Validates the doc comments that describe the theme tokens (CSS custom properties). The format is described in
 * the "Describing tokens" section of `packages/ckeditor5-ui/docs/framework/theme-token-naming.md`:
 *
 * 1. A doc comment (`/** … *\/`) describes the declaration or the rule that follows it. Only whitespace and plain
 *    comments can be between them, so a doc comment followed by anything else, such as `;`, `}`, or another doc
 *    comment, describes nothing and is an error. The same association decides which token or file has a description.
 * 2. A doc comment must not be placed inside a value, because comments inside values are kept in the built styles.
 * 3. A doc comment must use the multi-line form, also for a single sentence.
 * 4. A doc comment above a token is read only in the top-level `:root, :host` rules (direct children of the
 *    stylesheet), outside the at-rules nested in them, such as `@media`. It must not describe a token declared
 *    anywhere else.
 * 5. A doc comment can use only the `@pair` and `@deprecated` tags. Every tag must name a declared token and must not
 *    end with a dot. A doc comment can have many `@pair` tags, but only one `@deprecated` tag.
 * 6. The tags belong to a token, so they can only be used in a doc comment that describes a token declaration.
 * 7. Every file in `ckeditor5-ui/theme/globals/` with a top-level `:root, :host` rule, except the files in
 *    `FILES_WITHOUT_DOC_COMMENTS`, must have a doc comment above its first top-level `:root, :host` rule.
 * 8. Every token in the top-level `:root, :host` rules of these files must have a doc comment, except the steps of
 *    a scale listed in `FILES_WITHOUT_TOKEN_DESCRIPTIONS`, which the file description explains.
 * 9. Every file in `FILES_WITHOUT_DOC_COMMENTS` and `FILES_WITHOUT_TOKEN_DESCRIPTIONS` must be in
 *    `ckeditor5-ui/theme/globals/`, exist, and have a top-level `:root, :host` rule, so that a moved or renamed file is
 *    not skipped without a warning.
 * 10. A file must not be listed in both maps.
 * 11. The `steps` pattern of a file in `FILES_WITHOUT_TOKEN_DESCRIPTIONS`, matched against the whole token name, must
 *     match at least one token in the top-level `:root, :host` rules of the file, and at least one of the matched
 *     tokens must have no doc comment, so that a stale pattern or an exception that is no longer needed is removed.
 *
 * Rules 7 to 11 apply to the files of `ckeditor5-ui`, so they are checked only when the validated packages include it.
 *
 * Options:
 *   --base-packages <path>  Path to another packages directory whose tokens can be named by tags, while its
 *                           own files are not validated by this run. Used by repositories that build on top of the
 *                           open-source packages.
 */

import { globSync, readFileSync } from 'node:fs';
import { styleText } from 'node:util';
import upath from 'upath';
import minimist from 'minimist';
import { generate, parse, walk } from '@eslint/css-tree';
import { PACKAGES_DIRECTORY } from './release/utils/constants.mjs';

// The directory, relative to the packages directory, whose files with tokens must have doc comments.
const DESCRIBED_DIRECTORY = 'ckeditor5-ui/theme/globals/';

/**
 * Files in `ckeditor5-ui/theme/globals/`, relative to the packages directory, that declare tokens on `:root, :host` but
 * need no doc comments, with the reason for each.
 */
const FILES_WITHOUT_DOC_COMMENTS = new Map( [
	[ 'ckeditor5-ui/theme/globals/colors/_legacy-misc.css', 'Legacy color tokens kept for backward compatibility.' ],
	[ 'ckeditor5-ui/theme/globals/_evaluationbadge.css', 'Component tokens of the evaluation badge.' ],
	[ 'ckeditor5-ui/theme/globals/_legacy-foundation-aliases.css', 'Aliases of renamed tokens, listed in the migration guide.' ],
	[ 'ckeditor5-ui/theme/globals/_poweredby.css', 'Component tokens of the "Powered by" badge.' ],
	[ 'ckeditor5-ui/theme/globals/_reset.css', 'The reset styles, with one size token explained by a plain comment.' ],
	[ 'ckeditor5-ui/theme/globals/_scrollbars.css', 'Component tokens of the scrollbars.' ]
] );

/**
 * Files in `ckeditor5-ui/theme/globals/`, relative to the packages directory, that must have a file description, but
 * whose scale steps do not need one. Unlike `FILES_WITHOUT_DOC_COMMENTS`, an entry does not exempt the whole file:
 * `steps` is a pattern that lists the exempted steps, so every other token of the file still needs a doc comment.
 * The check matches the whole token name against it (see `matchesSteps()`), so a top-level alternation cannot exempt
 * a token that only starts or ends with a step.
 */
const FILES_WITHOUT_TOKEN_DESCRIPTIONS = new Map( [
	[ 'ckeditor5-ui/theme/globals/_border.css', {
		reason: 'The steps of the border width scale, described by the file description.',
		steps: /--ck-border-width-(thin|thick)/
	} ],
	[ 'ckeditor5-ui/theme/globals/_fonts.css', {
		reason: 'The steps of the font size and weight scales, described by the file description.',
		steps: /--ck-font-(size-(base|xs|sm|md|lg|xl|2xl)|weight-(normal|medium|semibold|bold))/
	} ],
	[ 'ckeditor5-ui/theme/globals/_rounded.css', {
		reason: 'The steps of the radius scale, described by the file description.',
		steps: /--ck-radius-(base|xs|sm|md|lg|xl)/
	} ],
	[ 'ckeditor5-ui/theme/globals/_semantic-spacing.css', {
		reason: 'The padding and gap tiers, described by the file description.',
		steps: /--ck-spacing-(padding|gap)(-(tight|compact|snug|comfortable|spacious))?/
	} ],
	[ 'ckeditor5-ui/theme/globals/_shadow.css', {
		reason: 'The steps of the shadow scale, described by the file description.',
		steps: /--ck-shadow-(md|lg|xl)/
	} ],
	[ 'ckeditor5-ui/theme/globals/_spacing.css', {
		reason: 'The steps of the spacing scale, described by the file description.',
		steps: /--ck-spacing-(base|2xs|xs|sm|md|lg|xl)/
	} ],
	[ 'ckeditor5-ui/theme/globals/_transition.css', {
		reason: 'The steps of the duration scale, described by the file description.',
		steps: /--ck-duration-(fast|base|slow|slower)/
	} ],
	[ 'ckeditor5-ui/theme/globals/_width.css', {
		reason: 'The steps of the width scale, described by the file description.',
		steps: /--ck-width-(xs|sm|md|lg|xl|2xl)/
	} ],
	[ 'ckeditor5-ui/theme/globals/_zindex.css', {
		reason: 'The steps of the z-index scale, described by the file description.',
		steps: /--ck-z-(base|overlay|modal)/
	} ]
] );

// The tags whose value is the name of a token, with an example of each.
const TOKEN_TAG_EXAMPLES = {
	pair: '@pair --ck-color-text-primary',
	deprecated: '@deprecated --ck-spacing-md'
};

// Built from the examples, so that a tag added there is also validated. A tag such as `@pair-foo` does not match.
const TOKEN_TAG_PATTERN = new RegExp( `^\\s*\\*?\\s*@(${ Object.keys( TOKEN_TAG_EXAMPLES ).join( '|' ) })(?![\\w-])(.*)$`, 'gm' );

// Any tag at the start of a line, so that a misspelled tag is reported instead of skipped.
const TAG_PATTERN = /^\s*\*?\s*@([\w-]+)/gm;

// What can be between a doc comment and the declaration or the rule it describes: whitespace and plain comments.
// The body of a plain comment cannot contain `*\/`, so the pattern does not join two comments with code between them.
const GAP_PATTERN = /^(\s|\/\*(?!\*)([^*]|\*(?!\/))*\*\/)*$/;

const { 'base-packages': basePackages } = minimist( process.argv.slice( 2 ), {
	string: [ 'base-packages' ]
} );

const errors = [];
const declaredTokens = new Set();
const tokenTags = [];
// The tokens of the top-level `:root, :host` rules of the validated files, by the file path relative to the packages
// directory, each with the information whether it has a doc comment.
const rootTokensByFile = new Map();
const files = collectFiles( upath.join( process.cwd(), PACKAGES_DIRECTORY ) );

for ( const file of files ) {
	analyzeFile( file, { validate: true } );
}

if ( basePackages ) {
	// The base packages only extend the tokens that tags can name. Their files are validated by their
	// own repository.
	for ( const file of collectFiles( upath.join( process.cwd(), basePackages ) ) ) {
		analyzeFile( file, { validate: false } );
	}
}

validateTokenTags();
validateExceptionMaps();

if ( errors.length ) {
	console.log( styleText( [ 'red', 'bold' ], 'Found problems with the theme token doc comments:' ) );
	errors.forEach( error => console.log( styleText( 'red', ` - ${ error }` ) ) );
	process.exit( 1 );
} else {
	console.log( styleText( 'green', 'The theme token doc comments follow the format.' ) );
}

function collectFiles( packagesDir ) {
	return globSync( upath.join( packagesDir, '*', 'theme', '**', '*.css' ) )
		.map( filePath => ( {
			path: upath.normalize( filePath ),
			id: upath.relative( packagesDir, upath.normalize( filePath ) )
		} ) )
		.sort( ( a, b ) => a.path.localeCompare( b.path ) );
}

function analyzeFile( file, { validate } ) {
	const source = readFileSync( file.path, 'utf-8' );
	const comments = [];
	const declarations = [];
	// The declarations and the rules that a doc comment can describe, by their start offset.
	const targets = new Map();
	const topLevelRootRules = new Set();

	const ast = parse( source, {
		positions: true,
		parseCustomProperty: true,
		onComment: ( value, loc ) => comments.push( { value, start: loc.start.offset, end: loc.end.offset, line: loc.start.line } )
	} );

	// The walker visits a rule before its children, and `this.rule` is the closest rule that contains the visited node.
	walk( ast, function( node ) {
		if ( node.type === 'Declaration' ) {
			const isToken = node.property.startsWith( '--' );
			const declaration = {
				property: node.property,
				start: node.loc.start.offset,
				end: node.loc.end.offset,
				line: node.loc.start.line,
				isToken,
				// A declaration in an at-rule nested in a root rule, such as `@media`, is a conditional override,
				// not the declaration of the token.
				isInRootRule: !this.atrule && !!this.rule && topLevelRootRules.has( this.rule )
			};

			if ( isToken ) {
				declaredTokens.add( node.property );
			}

			declarations.push( declaration );
			targets.set( declaration.start, declaration );
		}

		if ( node.type === 'Rule' || node.type === 'Atrule' ) {
			targets.set( node.loc.start.offset, { isToken: false } );

			const isTopLevel = !!this.stylesheet && !this.rule && !this.atrule;

			if ( isTopLevel && node.type === 'Rule' && node.prelude.type === 'SelectorList' && isRootSelectorList( node.prelude ) ) {
				topLevelRootRules.add( node );
			}
		}
	} );

	const docComments = comments.filter( comment => comment.value.startsWith( '*' ) );

	for ( const comment of docComments ) {
		const location = formatLocation( file.path, comment.line );
		const matches = [ ...comment.value.matchAll( TOKEN_TAG_PATTERN ) ];

		for ( const [ , tag, value ] of matches ) {
			tokenTags.push( { tag, value: value.trim(), location, validate } );
		}

		if ( !validate ) {
			continue;
		}

		// A token has a single replacement.
		if ( matches.filter( ( [ , tag ] ) => tag === 'deprecated' ).length > 1 ) {
			errors.push( `The doc comment in ${ location } has more than one @deprecated tag.` );
		}

		for ( const [ , tag ] of comment.value.matchAll( TAG_PATTERN ) ) {
			if ( !Object.hasOwn( TOKEN_TAG_EXAMPLES, tag ) ) {
				const knownTags = Object.keys( TOKEN_TAG_EXAMPLES ).map( name => `@${ name }` ).join( ', ' );

				errors.push( `The doc comment in ${ location } has an unknown @${ tag } tag. Use one of: ${ knownTags }.` );
			}
		}
	}

	if ( !validate ) {
		return;
	}

	// The start offsets of the declarations and the rules that have a doc comment.
	const describedOffsets = new Set();

	for ( const comment of docComments ) {
		const location = formatLocation( file.path, comment.line );

		if ( declarations.some( declaration => comment.start > declaration.start && comment.start < declaration.end ) ) {
			errors.push( `The doc comment in ${ location } is placed inside a value. Move it above the declaration.` );
			continue;
		}

		if ( !comment.value.includes( '\n' ) ) {
			errors.push( `The doc comment in ${ location } must use the multi-line form.` );
		}

		const targetOffset = findCommentTarget( comment, [ ...targets.keys() ], source );

		if ( targetOffset === null ) {
			errors.push( `The doc comment in ${ location } does not describe anything. Put a declaration or a rule below it.` );
			continue;
		}

		const target = targets.get( targetOffset );

		describedOffsets.add( targetOffset );

		const isTokenDeclaration = target.isToken;

		if ( isTokenDeclaration && !target.isInRootRule ) {
			errors.push(
				`The doc comment in ${ location } describes "${ target.property }" outside the top-level ` +
				'":root, :host" rules, where tools do not read it. Describe the token where it is declared on ":root, :host".'
			);
		}

		const tags = new Set( [ ...comment.value.matchAll( TOKEN_TAG_PATTERN ) ].map( ( [ , tag ] ) => `@${ tag }` ) );

		if ( tags.size && !isTokenDeclaration ) {
			errors.push(
				`The doc comment in ${ location } has the ${ [ ...tags ].join( ' and ' ) } ${ tags.size > 1 ? 'tags' : 'tag' }, ` +
				'but it does not describe a token. Move the tags to the doc comment of the token that they belong to.'
			);
		}
	}

	const rootRule = [ ...topLevelRootRules ][ 0 ];

	if ( !rootRule ) {
		return;
	}

	const rootTokens = declarations
		.filter( declaration => declaration.isToken && declaration.isInRootRule )
		.map( declaration => ( { ...declaration, isDescribed: describedOffsets.has( declaration.start ) } ) );

	rootTokensByFile.set( file.id, rootTokens );

	if ( !file.id.startsWith( DESCRIBED_DIRECTORY ) || FILES_WITHOUT_DOC_COMMENTS.has( file.id ) ) {
		return;
	}

	if ( !describedOffsets.has( rootRule.loc.start.offset ) ) {
		errors.push(
			`${ formatLocation( file.path, rootRule.loc.start.line ) }: the file has no description. ` +
			'Add a doc comment above its first ":root, :host" rule, or list the file in FILES_WITHOUT_DOC_COMMENTS ' +
			'with the reason.'
		);
	}

	const steps = FILES_WITHOUT_TOKEN_DESCRIPTIONS.get( file.id )?.steps;

	for ( const token of rootTokens ) {
		if ( token.isDescribed || ( steps && matchesSteps( token.property, steps ) ) ) {
			continue;
		}

		errors.push(
			`"${ token.property }" has no description (${ formatLocation( file.path, token.line ) }). ` +
			'Add a doc comment above it, or, if it is a step of the scale that the file description explains, ' +
			'add it to the `steps` of the file in FILES_WITHOUT_TOKEN_DESCRIPTIONS.'
		);
	}
}

/**
 * Finds the start offset of the declaration or the rule that the given doc comment describes: the first one that
 * starts at the end of the comment or after it, with only whitespace and plain comments between them. Returns `null`
 * when the comment is followed by anything else, such as `;`, the end of a block, another doc comment, or the end of
 * the file.
 */
function findCommentTarget( comment, targetOffsets, source ) {
	const offset = Math.min( Infinity, ...targetOffsets.filter( start => start >= comment.end ) );

	if ( offset === Infinity || !GAP_PATTERN.test( source.slice( comment.end, offset ) ) ) {
		return null;
	}

	return offset;
}

/**
 * Checks whether the given selector list declares the root scope, which either `:root` or `:host` does.
 * The stylesheets pair the two (`:root,\n:host { … }`), so either selector on its own marks the root scope.
 */
function isRootSelectorList( prelude ) {
	return prelude.children.some( selector => {
		const text = generate( selector ).toLowerCase();

		return text === ':root' || text === ':host';
	} );
}

/**
 * Checks that every `@pair` and `@deprecated` tag names a single declared token and does not end with a dot.
 */
function validateTokenTags() {
	for ( const { tag, value, location, validate } of tokenTags ) {
		if ( !validate ) {
			continue;
		}

		if ( value.endsWith( '.' ) ) {
			errors.push( `The @${ tag } tag in ${ location } must not end with a dot.` );
		}

		const name = value.replace( /\.$/, '' );

		if ( !/^--[\w-]+$/.test( name ) ) {
			errors.push( `The @${ tag } tag in ${ location } must name a single token, as in "${ TOKEN_TAG_EXAMPLES[ tag ] }".` );
		} else if ( !declaredTokens.has( name ) ) {
			errors.push( `The @${ tag } tag in ${ location } names "${ name }", which is not declared.` );
		}
	}
}

/**
 * Checks the maps of exceptions (rules 9 to 11): every listed file was validated and has a top-level `:root, :host`
 * rule, no file is listed in both maps, and the `steps` pattern of every file in `FILES_WITHOUT_TOKEN_DESCRIPTIONS`
 * matches a token of the file and at least one token without a doc comment. The maps name files
 * of `ckeditor5-ui`, so the check is skipped in repositories that validate other packages and pass `ckeditor5-ui` as
 * a base package.
 */
function validateExceptionMaps() {
	if ( !files.some( file => file.id.startsWith( 'ckeditor5-ui/' ) ) ) {
		return;
	}

	for ( const [ mapName, map ] of [
		[ 'FILES_WITHOUT_DOC_COMMENTS', FILES_WITHOUT_DOC_COMMENTS ],
		[ 'FILES_WITHOUT_TOKEN_DESCRIPTIONS', FILES_WITHOUT_TOKEN_DESCRIPTIONS ]
	] ) {
		for ( const id of map.keys() ) {
			if ( !id.startsWith( DESCRIBED_DIRECTORY ) ) {
				errors.push( `"${ id }" is listed in ${ mapName }, but only the files in "${ DESCRIBED_DIRECTORY }" are checked.` );
			} else if ( !rootTokensByFile.has( id ) ) {
				errors.push( `"${ id }" is listed in ${ mapName }, but it does not exist or has no ":root, :host" rule.` );
			}
		}
	}

	for ( const [ id, { steps } ] of FILES_WITHOUT_TOKEN_DESCRIPTIONS ) {
		if ( FILES_WITHOUT_DOC_COMMENTS.has( id ) ) {
			errors.push( `"${ id }" is listed both in FILES_WITHOUT_DOC_COMMENTS and in FILES_WITHOUT_TOKEN_DESCRIPTIONS.` );
			continue;
		}

		// A file that does not exist or has no root rule is already reported above.
		if ( !rootTokensByFile.has( id ) ) {
			continue;
		}

		const steppedTokens = rootTokensByFile.get( id ).filter( token => matchesSteps( token.property, steps ) );

		if ( !steppedTokens.length ) {
			errors.push(
				`The steps of "${ id }" in FILES_WITHOUT_TOKEN_DESCRIPTIONS match no token of the file. Update the pattern ` +
				'or remove the file from the map.'
			);
		} else if ( steppedTokens.every( token => token.isDescribed ) ) {
			errors.push(
				`Every step of "${ id }" in FILES_WITHOUT_TOKEN_DESCRIPTIONS has a description. Remove the file from ` +
				'FILES_WITHOUT_TOKEN_DESCRIPTIONS.'
			);
		}
	}
}

/**
 * Checks whether the whole token name matches the `steps` pattern of a file in `FILES_WITHOUT_TOKEN_DESCRIPTIONS`.
 * The pattern is wrapped in anchors, so a top-level alternation such as `--ck-a|--ck-b` matches only the two names.
 */
function matchesSteps( property, steps ) {
	return new RegExp( `^(?:${ steps.source })$`, steps.flags ).test( property );
}

function formatLocation( filePath, line ) {
	return `${ upath.relative( process.cwd(), filePath ) }:${ line }`;
}
