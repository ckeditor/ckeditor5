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
 *		fastDiff( '12a', '12xyza' );
 *		// [ { index: 2, type: 'insert', values: [ 'x', 'y', 'z' ] } ]
 *
 *		fastDiff( '12a', '12aa' );
 *		// [ { index: 3, type: 'insert', values: [ 'a' ] } ]
 *
 *		fastDiff( '12xyza', '12a' );
 *		// [ { index: 2, type: 'delete', howMany: 3 } ]
 *
 *		fastDiff( '12aa', '12a' );
 *		// [ { index: 3, type: 'delete', howMany: 1 } ]
 *
 *		fastDiff( '12abc3', '2ab' );
 *		// [ { index: 0, type: 'insert', values: [ '2', 'a', 'b' ] }, { index: 3, type: 'delete', howMany: 6 } ]
 *
 * Using returned results you can modify `oldText` to transform it into `newText`:
 *
 * 		let input = '12abc3';
 * 		const output = '2ab';
 * 		const changes = fastDiff( input, output );
 *
 *		changes.forEach( change => {
 *			if ( change.type == 'insert' ) {
 *				input = input.substring( 0, change.index ) + change.values.join( '' ) + input.substring( change.index );
 *			} else if ( change.type == 'delete' ) {
 *				input = input.substring( 0, change.index ) + input.substring( change.index + change.howMany );
 *			}
 *		} );
 *
 *		input === output; // -> true
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
// old text to the new one can be generated.
//
// It is expected that `oldText` and `newText` are different.
//
// @param {String} oldText
// @param {String} newText
// @returns {Object}
// @returns {Number} return.firstIndex Index of the first change in both strings (always the same for both).
// @returns {Number} result.lastIndexOld Index of the last common character in `oldText` string.
// @returns {Number} result.lastIndexNew Index of the last common character in `newText` string.
function findChangeBoundaryIndexes( oldText, newText ) {
	// Find the first difference between texts.
	const firstIndex = findFirstDifferenceIndex( oldText, newText );

	// Remove the common part of texts and reverse them to make it simpler to find the last difference between texts.
	const oldTextReversed = cutAndReverse( oldText, firstIndex );
	const newTextReversed = cutAndReverse( newText, firstIndex );

	// Find the first difference between reversed texts.
	// It should be treated as "how many characters from the end the last difference occurred".
	//
	// For example:
	//
	// 			initial	->	after cut	-> reversed:
	// oldText:	'321ba'	->	'21ba'		-> 'ab12'
	// newText:	'31xba'	->	'1xba'		-> 'abx1'
	// lastIndex:						->    2
	//
	// So the last change occurred two characters from the end of the texts.
	const lastIndex = findFirstDifferenceIndex( oldTextReversed, newTextReversed );

	// Use `lastIndex` to calculate proper offset, starting from the beginning (`lastIndex` kind of starts from the end).
	const lastIndexOld = oldText.length - lastIndex;
	const lastIndexNew = newText.length - lastIndex;

	return { firstIndex, lastIndexOld, lastIndexNew };
}

// Returns a first index on which `oldText` and `newText` differ.
//
// @param {String} oldText
// @param {String} newText
// @returns {Number}
function findFirstDifferenceIndex( oldText, newText ) {
	for ( let i = 0; i < Math.max( oldText.length, newText.length ); i++ ) {
		if ( oldText[ i ] !== newText[ i ] ) {
			return i;
		}
	}
	// No "backup" return cause we assume that `oldText` and `newText` differ. This means that they either have a
	// difference or they have a different lengths. This means that the `if` condition will always be met eventually.
}

// Removes `howMany` characters from the given `text` string starting from the beginning, then reverses and returns it.
//
// @param {String} text Text to be processed.
// @param {Number} howMany How many characters from text beginning to cut.
// @returns {String} Shortened and reversed text.
function cutAndReverse( text, howMany ) {
	return text.substring( howMany ).split( '' ).reverse().join( '' );
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
