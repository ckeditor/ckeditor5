/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/texttransformation
 */

import {
	Plugin,
	type Editor
} from '@ckeditor/ckeditor5-core';

import type { Position } from '@ckeditor/ckeditor5-engine';

import TextWatcher, { type TextWatcherMatchedDataEvent } from './textwatcher';
import type { TextTransformationConfig, TextTransformationDescription } from './typingconfig';
import type Delete from './delete';

import { escapeRegExp } from 'lodash-es';

// All named transformations.
const TRANSFORMATIONS: Record<string, TextTransformationDescription> = {
	// Common symbols:
	copyright: { from: '(c)', to: '©' },
	registeredTrademark: { from: '(r)', to: '®' },
	trademark: { from: '(tm)', to: '™' },

	// Mathematical:
	oneHalf: { from: /(^|[^/a-z0-9])(1\/2)([^/a-z0-9])$/i, to: [ null, '½', null ] },
	oneThird: { from: /(^|[^/a-z0-9])(1\/3)([^/a-z0-9])$/i, to: [ null, '⅓', null ] },
	twoThirds: { from: /(^|[^/a-z0-9])(2\/3)([^/a-z0-9])$/i, to: [ null, '⅔', null ] },
	oneForth: { from: /(^|[^/a-z0-9])(1\/4)([^/a-z0-9])$/i, to: [ null, '¼', null ] },
	threeQuarters: { from: /(^|[^/a-z0-9])(3\/4)([^/a-z0-9])$/i, to: [ null, '¾', null ] },
	lessThanOrEqual: { from: '<=', to: '≤' },
	greaterThanOrEqual: { from: '>=', to: '≥' },
	notEqual: { from: '!=', to: '≠' },
	arrowLeft: { from: '<-', to: '←' },
	arrowRight: { from: '->', to: '→' },

	// Typography:
	horizontalEllipsis: { from: '...', to: '…' },
	enDash: { from: /(^| )(--)( )$/, to: [ null, '–', null ] },
	emDash: { from: /(^| )(---)( )$/, to: [ null, '—', null ] },
	// Quotations:
	// English, US
	quotesPrimary: { from: buildQuotesRegExp( '"' ), to: [ null, '“', null, '”' ] },
	quotesSecondary: { from: buildQuotesRegExp( '\'' ), to: [ null, '‘', null, '’' ] },

	// English, UK
	quotesPrimaryEnGb: { from: buildQuotesRegExp( '\'' ), to: [ null, '‘', null, '’' ] },
	quotesSecondaryEnGb: { from: buildQuotesRegExp( '"' ), to: [ null, '“', null, '”' ] },

	// Polish
	quotesPrimaryPl: { from: buildQuotesRegExp( '"' ), to: [ null, '„', null, '”' ] },
	quotesSecondaryPl: { from: buildQuotesRegExp( '\'' ), to: [ null, '‚', null, '’' ] }
};

// Transformation groups.
const TRANSFORMATION_GROUPS: Record<string, Array<string>> = {
	symbols: [ 'copyright', 'registeredTrademark', 'trademark' ],
	mathematical: [
		'oneHalf', 'oneThird', 'twoThirds', 'oneForth', 'threeQuarters',
		'lessThanOrEqual', 'greaterThanOrEqual', 'notEqual',
		'arrowLeft', 'arrowRight'
	],
	typography: [ 'horizontalEllipsis', 'enDash', 'emDash' ],
	quotes: [ 'quotesPrimary', 'quotesSecondary' ]
};

// A set of default transformations provided by the feature.
const DEFAULT_TRANSFORMATIONS = [
	'symbols',
	'mathematical',
	'typography',
	'quotes'
];

/**
 * The text transformation plugin.
 */
export default class TextTransformation extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ 'Delete', 'Input' ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'TextTransformation' {
		return 'TextTransformation';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		editor.config.define( 'typing', {
			transformations: {
				include: DEFAULT_TRANSFORMATIONS
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const model = this.editor.model;
		const modelSelection = model.document.selection;

		modelSelection.on( 'change:range', () => {
			// Disable plugin when selection is inside a code block.
			this.isEnabled = !modelSelection.anchor!.parent.is( 'element', 'codeBlock' );
		} );

		this._enableTransformationWatchers();
	}

	/**
	 * Create new TextWatcher listening to the editor for typing and selection events.
	 */
	private _enableTransformationWatchers(): void {
		const editor = this.editor;
		const model = editor.model;
		const deletePlugin: Delete = editor.plugins.get( 'Delete' );
		const normalizedTransformations = normalizeTransformations( editor.config.get( 'typing.transformations' )! );

		const testCallback = ( text: string ) => {
			for ( const normalizedTransformation of normalizedTransformations ) {
				const from = normalizedTransformation.from;
				const match = from.test( text );

				if ( match ) {
					return { normalizedTransformation };
				}
			}
		};

		const watcher = new TextWatcher( editor.model, testCallback );

		watcher.on<TextWatcherMatchedDataEvent<{
			normalizedTransformation: NormalizedTransformationConfig;
		}>>( 'matched:data', ( evt, data ) => {
			if ( !data.batch.isTyping ) {
				return;
			}

			const { from, to } = data.normalizedTransformation;

			const matches = from.exec( data.text )!;
			const replaces = to( matches.slice( 1 ) );

			const matchedRange = data.range;

			let changeIndex = matches.index;

			model.enqueueChange( writer => {
				for ( let i = 1; i < matches.length; i++ ) {
					const match = matches[ i ];
					const replaceWith = replaces[ i - 1 ];

					if ( replaceWith == null ) {
						changeIndex += match.length;

						continue;
					}

					const replacePosition = matchedRange.start.getShiftedBy( changeIndex );
					const replaceRange = model.createRange( replacePosition, replacePosition.getShiftedBy( match.length ) );
					const attributes = getTextAttributesAfterPosition( replacePosition );

					model.insertContent( writer.createText( replaceWith, attributes ), replaceRange );

					changeIndex += replaceWith.length;
				}

				model.enqueueChange( () => {
					deletePlugin.requestUndoOnBackspace();
				} );
			} );
		} );

		watcher.bind( 'isEnabled' ).to( this );
	}
}

/**
 * Normalizes the configuration `from` parameter value.
 * The normalized value for the `from` parameter is a RegExp instance. If the passed `from` is already a RegExp instance,
 * it is returned unchanged.
 */
function normalizeFrom( from: string | RegExp ): RegExp {
	if ( typeof from == 'string' ) {
		return new RegExp( `(${ escapeRegExp( from ) })$` );
	}

	// `from` is already a regular expression.
	return from;
}

/**
 * Normalizes the configuration `to` parameter value.
 * The normalized value for the `to` parameter is a function that takes an array and returns an array. See more in the
 * configuration description. If the passed `to` is already a function, it is returned unchanged.
 */
function normalizeTo( to: TextTransformationDescription[ 'to' ] ) {
	if ( typeof to == 'string' ) {
		return () => [ to ];
	} else if ( to instanceof Array ) {
		return () => to;
	}

	// `to` is already a function.
	return to;
}

/**
 * For given `position` returns attributes for the text that is after that position.
 * The text can be in the same text node as the position (`foo[]bar`) or in the next text node (`foo[]<$text bold="true">bar</$text>`).
 */
function getTextAttributesAfterPosition( position: Position ) {
	const textNode = position.textNode ? position.textNode : position.nodeAfter;

	return textNode!.getAttributes();
}

/**
 * Returns a RegExp pattern string that detects a sentence inside a quote.
 *
 * @param quoteCharacter The character to create a pattern for.
 */
function buildQuotesRegExp( quoteCharacter: string ): RegExp {
	return new RegExp( `(^|\\s)(${ quoteCharacter })([^${ quoteCharacter }]*)(${ quoteCharacter })$` );
}

/**
 * Reads text transformation config and returns normalized array of transformations objects.
 */
function normalizeTransformations( config: TextTransformationConfig ): Array<NormalizedTransformationConfig> {
	const extra = config.extra || [];
	const remove = config.remove || [];
	const isNotRemoved = ( transformation: TextTransformationDescription | string ) => !remove.includes( transformation );

	const configured = config.include.concat( extra ).filter( isNotRemoved );

	return expandGroupsAndRemoveDuplicates( configured )
		.filter( isNotRemoved ) // Filter out 'remove' transformations as they might be set in group.
		.map( transformation => (
			typeof transformation == 'string' && TRANSFORMATIONS[ transformation ] ? TRANSFORMATIONS[ transformation ] : transformation )
		)
		// Filter out transformations set as string that has not been found.
		.filter( ( transformation ): transformation is TextTransformationDescription => typeof transformation === 'object' )
		.map( transformation => ( {
			from: normalizeFrom( transformation.from ),
			to: normalizeTo( transformation.to )
		} ) );
}

/**
 * Reads definitions and expands named groups if needed to transformation names.
 * This method also removes duplicated named transformations if any.
 */
function expandGroupsAndRemoveDuplicates(
	definitions: Array<TextTransformationDescription | string>
): Array<TextTransformationDescription | string> {
	// Set is using to make sure that transformation names are not duplicated.
	const definedTransformations = new Set<TextTransformationDescription | string>();

	for ( const transformationOrGroup of definitions ) {
		if ( typeof transformationOrGroup == 'string' && TRANSFORMATION_GROUPS[ transformationOrGroup ] ) {
			for ( const transformation of TRANSFORMATION_GROUPS[ transformationOrGroup ] ) {
				definedTransformations.add( transformation );
			}
		} else {
			definedTransformations.add( transformationOrGroup );
		}
	}

	return Array.from( definedTransformations );
}

type NormalizedTransformationConfig = {
	from: RegExp;
	to: ( matches: Array<string> ) => Array<string | null>;
};
