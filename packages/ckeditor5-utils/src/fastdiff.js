/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module utils/fastdiff
 */

/**
 * Finds position of the first and last change in the given strings and generates set of changes. Set of changes
 * can be applied to the input text in order to transform it into the output text, for example:
 *
 *		let input = '12abc3';
 *		const output = '2ab';
 *		const changes = fastDiff( input, output );
 *
 *		console.log( changes );
 *		// [ { index: 0, type: 'insert', values: [ '2', 'a', 'b' ] }, { index: 3, type: 'delete', howMany: 6 } ]
 *
 *		changes.forEach( change => {
 *			if ( change.type == 'insert' ) {
 *				input = input.substring( 0, change.index ) + change.values.join( '' ) + input.substring( change.index );
 *			} else if ( change.type == 'delete' ) {
 *				input = input.substring( 0, change.index ) + input.substring( change.index + change.howMany );
 *			}
 *		} );
 *
 *		input == output; // -> true
 *
 * The output format of this function is compatible with {@link module:utils/difftochanges~diffToChanges} output format.
 *
 * @param {String} oldText Input string.
 * @param {String} newText Input string.
 * @returns {Array} Array of changes.
 */
export default function fastDiff( oldText, newText ) {
	// Check if both texts are equal.
	if ( oldText === newText ) {
		return [];
	}

	const changeIndexes = findChangeBoundaryIndexes( oldText, newText );

	return changeIndexesToChanges( newText, changeIndexes );
}

// Finds position of the first and last change in the given strings. For example:
//
//		const indexes = findChangeBoundaryIndexes( '1234', '13424' );
//		console.log( indexes ); // { firstIndex: 1, lastIndexOld: 3, lastIndexNew: 4 }
//
// The above indexes means that in `oldText` modified part is `1[23]4` and in the `newText` it is `1[342]4`.
// Based on such indexes, array with `insert`/`delete` operations which allows transforming
// old text to the new one could be generated.
//
// @param {String} oldText
// @param {String} newText
// @returns {Object}
// @returns {Number} return.firstIndex Position of the first change in both strings (always the same for both).
// @returns {Number} result.lastIndexOld Position of the last change in `oldText` string.
// @returns {Number} result.lastIndexNew Position of the last change in `newText` string.
function findChangeBoundaryIndexes( oldText, newText ) {
	const oldTextLength = oldText.length;
	const newTextLength = newText.length;

	// Find first change.
	// Iterate over both strings starting from the beginning to find position of the first different character.
	// If not found, it means first change is at the end of the string.
	let firstIndex = oldTextLength;

	for ( let i = 0; i < oldTextLength; i++ ) {
		if ( oldText[ i ] !== newText[ i ] ) {
			firstIndex = i;
			break;
		}
	}

	// Find last change.
	// Iterate over both strings starting from the end to find position of the first different character.
	// We remove identical part from both strings and reverse them so it is easier to iterate. The identical part
	// needs to be removed to properly handle cases like:
	//		oldText = '123';
	//		newText = '123123;
	// After removing identical part we have:
	//		oldText = '';
	//		newText = '123';
	//		// { firstIndex: 3, lastIndexOld: 3, lastIndexNew: 6 }
	const oldTextReversed = oldText.substring( firstIndex ).split( '' ).reverse().join( '' );
	const newTextReversed = newText.substring( firstIndex ).split( '' ).reverse().join( '' );

	let lastIndexOld;
	let lastIndexNew;

	for ( let i = 0; i < Math.max( oldTextReversed.length, newTextReversed.length ); i++ ) {
		// Initial text -> after removing identical part -> reversed:
		// oldText: '321ba' -> '21ba' -> 'ab12'
		// newText: '31ba'  -> '1ba'  -> 'ab1'
		// { firstIndex: 1, lastIndexOld: 2, lastIndexNew: 1 }
		if ( i >= newTextReversed.length ) {
			lastIndexOld = oldTextLength - i;
			lastIndexNew = firstIndex;
			break;
		}

		// Initial text -> after removing identical part -> reversed:
		// oldText: '31ba'  -> '1ba'  -> 'ab1'
		// newText: '321ba' -> '21ba' -> 'ab12'
		// { firstIndex: 1, lastIndexOld: 1, lastIndexNew: 2 }
		if ( i >= oldTextReversed.length ) {
			lastIndexOld = firstIndex;
			lastIndexNew = newTextLength - i;
			break;
		}

		if ( oldTextReversed[ i ] !== newTextReversed[ i ] ) {
			lastIndexOld = oldTextLength - i;
			lastIndexNew = newTextLength - i;
			break;
		}
	}

	return { firstIndex, lastIndexOld, lastIndexNew };
}

// Generates changes array based on change indexes from `findChangeBoundaryIndexes` function. This function will
// generate array with 0 (no changes), 1 (deletion or insertion) or 2 records (insertion and deletion).
//
// @param {String} newText New text for which change indexes were calculated.
// @param {Object} changeIndexes Change indexes object from `findChangeBoundaryIndexes` function.
// @returns {Array.<Object>} Array of changes compatible with {@link module:utils/difftochanges~diffToChanges} format.
function changeIndexesToChanges( newText, changeIndexes ) {
	const result = [];
	const { firstIndex, lastIndexOld, lastIndexNew } = changeIndexes;

	// Order operations as 'insert', 'delete' array to keep compatibility with {@link module:utils/difftochanges~diffToChanges}
	// in most cases. However, 'diffToChanges' does not stick to any order so in some cases
	// (for example replacing '12345' with 'abcd') it will generate 'delete', 'insert' order.
	if ( lastIndexNew - firstIndex > 0 ) {
		result.push( {
			index: firstIndex,
			type: 'insert',
			values: newText.substring( firstIndex, lastIndexNew ).split( '' )
		} );
	}

	if ( lastIndexOld - firstIndex > 0 ) {
		result.push( {
			index: firstIndex + ( lastIndexNew - firstIndex ), // Increase index of what was inserted.
			type: 'delete',
			howMany: lastIndexOld - firstIndex
		} );
	}

	return result;
}
