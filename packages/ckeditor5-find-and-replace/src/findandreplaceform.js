// import { scrollViewportToShowTarget } from 'ckeditor5/src/utils';
// import React, { useState } from 'react';
// import PropTypes from 'prop-types';
// import { rangeToText } from './findandreplace';
// import FindResults from './findresult';

// /**
//  * Highlight search result with given id.
//  *
//  * @param {String} searchResultId
//  * @param editor
//  */
// const highlightResult = ( searchResultId, editor ) => {
// 	if ( searchResultId ) {
// 		const marker = editor.model.markers.get( searchResultId );

// 		if ( !marker ) {
// 			return;
// 		}

// 		// Set selection to search result marker - it will be highlighted by the F&R editing plugin.
// 		const markerRange = marker.getRange();
// 		editor.model.change( writer => writer.setSelection( markerRange ) );

// 		// Scroll to the search result marker.
// 		const viewRange = editor.editing.mapper.toViewRange( markerRange );
// 		const domRange = editor.editing.view.domConverter.viewRangeToDom( viewRange );

// 		scrollViewportToShowTarget( {
// 			target: domRange,
// 			viewportOffset: 40 // last result is hidden by CKInspector
// 		} );
// 	}
// };

// /**
//  * Turn tree walker value to a simplified "compare object".
//  *
//  * For text nodes it will return
//  *
//  *		{
//  *			// Text of the node:
//  *			text: 'Text node value',
//  *			// Attributes set on node:
//  *			attributes: {
//  *				bold: true
//  *			}
//  *		}
//  *
//  * @param treeWalkerValue
//  * @returns {Object}
//  */
// function toCompareObject( { item } ) {
// 	if ( item.is( 'text' ) || item.is( 'textProxy' ) ) {
// 		return {
// 			text: item.data,
// 			attributes: Object.fromEntries( item.getAttributes() )
// 		};
// 	}

// 	return {
// 		text: false,
// 		name: item.name,
// 		attributes: Object.fromEntries( item.getAttributes() )
// 	};
// }

// /**
//  * Returns true if text nodes have the same text and attributes.
//  *
//  * This function works on "compare objects".
//  *
//  * @param {Object} reference
//  * @param {Object} compared
//  * @returns {Boolean}
//  */
// function areTextNodesEqual( reference, compared ) {
// 	if ( reference.text !== compared.text ) {
// 		return false;
// 	}
// 	const referenceKeys = Object.keys( reference.attributes || {} );
// 	const comparedKeys = Object.keys( compared.attributes || {} );

// 	if ( referenceKeys.length !== comparedKeys.length ) {
// 		return false;
// 	}

// 	return referenceKeys.every( attribute => {
// 		return reference.attributes[ attribute ] === compared.attributes[ attribute ];
// 	} );
// }

// /**
//  * Provides exact matching of "compare objects".
//  *
//  * The idea behind is that items returned by tree walker must have the same attributes as in reference. CKEditor groups characters from
//  * block with the same attributes in one text node. For instance
//  *
//  *		<b>CK<i>Source</i></b>
//  *
//  * will be represented as two simplified nodes:
//  *
//  *		[
//  *			{ text: 'CK', attributes: { strong: true } },
//  *			{ text: 'Source', attributes: { strong: true, italic: true } }
//  *		]
//  *
//  * Comparing by "any" attributes requires more work to create a compare function.
//  *
//  * @param {Array.<Object>} reference
//  * @param {Array.<Object>} compare
//  * @returns {Boolean}
//  */
// function areTextAndAttributesMatching( reference, compare ) {
// 	if ( reference.length !== compare.length ) {
// 		return false;
// 	}

// 	for ( let i = 0; i < reference.length; i += 1 ) {
// 		if ( !areTextNodesEqual( reference[ i ], compare[ i ] ) ) {
// 			return false;
// 		}
// 	}

// 	return true;
// }

// function getShiftedStart( position, shiftBy ) {
// 	const offset = position.offset > shiftBy ? shiftBy : shiftBy - position.offset;

// 	return position.getShiftedBy( -offset );
// }

// function getShiftedEnd( position, shiftBy ) {
// 	const { maxOffset } = position.parent;
// 	const offset = position.offset + shiftBy > maxOffset ? maxOffset - position.offset : shiftBy;

// 	return position.getShiftedBy( offset );
// }

// function regexpMatchToFindResult( matchResult, isExact ) {
// 	const matchStart = matchResult.index;

// 	if ( !isExact ) {
// 		const matchResultElement = matchResult[ 0 ];

// 		return {
// 			label: matchResultElement,
// 			start: matchStart,
// 			end: matchStart + matchResultElement.length
// 		};
// 	}

// 	const resultElement = matchResult[ 2 ];
// 	const whiteSpaceLength = matchResult[ 1 ].length;

// 	const start = matchStart + whiteSpaceLength;
// 	const end = start + resultElement.length;

// 	return {
// 		label: resultElement,
// 		start,
// 		end
// 	};
// }

// function wildcardToRegExpPattern( pattern ) {
// 	return pattern.replace( /\*+/g, '[\\S]+' ).replace( /\?/g, '[\\S]?' );
// }

// function createFindByTextCallback( searchTerm, isExact ) {
// 	const pattern = wildcardToRegExpPattern( isExact ? `(\\s|^)(${ searchTerm })(\\s|$)` : `${ searchTerm }` );

// 	const regExp = new RegExp( pattern, 'igu' );

// 	function searchCallback( { text } ) {
// 		const matches = [ ...text.matchAll( regExp ) ];

// 		return matches.map( result => regexpMatchToFindResult( result, isExact ) );
// 	}

// 	return searchCallback;
// }

// /**
//  * Find by HTML input is done as a two-step search:
//  *
//  * 1. Broad search by text match.
//  * 2. Narrow results by comparing text attributes on found text chunks.
//  *
//  * @param editor
//  * @returns {Function}
//  */
// // eslint-disable-next-line no-unused-vars
// function createFindByHTMLCallback( editor ) {
// 	const { model } = editor;

// 	// Hardcoded search input.
// 	// a. Nodes
// 	const referenceTextNodes = [
// 		{ text: 'ca', attributes: { bold: true } },
// 		{ text: 'n' },
// 		{ text: 'dy', attributes: { italic: true } }
// 	];
// 	// b. text representation for broad search.
// 	const searchTerm = referenceTextNodes.reduce( ( term, { text } ) => term + text, '' );

// 	// Step 1: Broad search.
// 	const broadSearchCallback = createFindByTextCallback( searchTerm );

// 	function searchCallback( { item, text } ) {
// 		// Step 2: Narrow search results by comparing text nodes attributes.
// 		return broadSearchCallback( { item, text } ).filter( ( { start, end } ) => {
// 			const matchedRange = model.createRange( model.createPositionAt( item, start ), model.createPositionAt( item, end ) );

// 			return areTextAndAttributesMatching( referenceTextNodes, [ ...matchedRange ].map( toCompareObject ) );
// 		} );
// 	}

// 	return searchCallback;
// }

// function getNextSearchResultId( activeSearch, currentResultId ) {
// 	const currentIndex = activeSearch.getIndex( currentResultId );
// 	const nextItemIndex = ( currentIndex + 1 ) % activeSearch.length;

// 	const item = activeSearch.get( nextItemIndex );

// 	return item ? item.id : null;
// }

const FindAndReplaceForm = ( /* { editor } */ ) => {
	// const { model } = editor;
	// const findAndReplaceApi = editor.plugins.get( 'FindAndReplace' );

	// const [ searchTerm, setSearchTerm ] = useState( 'cupcake' );
	// const [ replaceWith, setReplaceWith ] = useState( '' );
	// const [ isExact, setIsExact ] = useState( false );
	// const [ currentResultId, setCurrentResultId ] = useState( null );
	// const [ activeSearch, setActiveSearch ] = useState( null );

	// const findByCallback = callback => {
	// 	if ( activeSearch ) {
	// 		findAndReplaceApi.stop();
	// 	}
	// 	const findResults = findAndReplaceApi.find( callback );

	// 	if ( findResults.length ) {
	// 		setCurrentResultId( findResults.get( 0 ).id );
	// 	}

	// 	setActiveSearch( findResults );
	// };

	// const onFindByText = () => {
	// 	if ( searchTerm.length < 3 ) {
	// 		console.warn( 'Search term should be at least 3 characters long.' );

	// 		return;
	// 	}

	// 	if ( currentResultId !== null ) {
	// 		const nextItemId = getNextSearchResultId( activeSearch, currentResultId );
	// 		setCurrentResultId( nextItemId );
	// 		highlightResult( nextItemId, editor );

	// 		return;
	// 	}

	// 	findByCallback( createFindByTextCallback( searchTerm, isExact ) );
	// };

	// const onFindByHTML = () => findByCallback( createFindByHTMLCallback( editor ) );

	// const onReplaceAll = () => {
	// 	findAndReplaceApi.replaceAll( replaceWith ); // text or callback support...
	// };

	// const onReplaceAllBolded = () => {
	// 	findAndReplaceApi.replaceAll( writer => {
	// 		return writer.createText( replaceWith, { bold: true } );
	// 	} );
	// };

	// const onReplaceClick = result => {
	// 	findAndReplaceApi.replace( result, writer => {
	// 		return writer.createText( replaceWith );
	// 	} );
	// };

	// const handleSearchChange = event => {
	// 	setSearchTerm( event.target.value );
	// 	setCurrentResultId( null );
	// };
	// const handleExactMatchChange = event => setIsExact( !!event.target.checked );
	// const handleReplaceWithChange = event => setReplaceWith( event.target.value );

	// const markerToText = marker => {
	// 	const markerRange = marker.getRange();

	// 	const start = getShiftedStart( markerRange.start, 10 );
	// 	const end = getShiftedEnd( markerRange.end, 10 );

	// 	const expandedRange = model.createRange( start, end );

	// 	return rangeToText( expandedRange );
	// };

	// 	return (
	// 		<div className="find-and-replace">
	// 			<h3 className="find-title">Find and Replace</h3>
	// 			<div className="find-form">
	// 				<div className="find-form_section">
	// 					<input type="text" onChange={handleSearchChange} value={searchTerm} />
	// 					<button type="button" onClick={onFindByText}>
	// 						Find
	// 					</button>
	// 				</div>

	// 				<div className="find-form_section">
	// 					<label>
	// 						<input type="checkbox" onChange={handleExactMatchChange} />
	// 						Exact match
	// 					</label>

	// 					<div className="find-form-info">
	// 						<p>Supported wildcards:</p>
	// 						<ul>
	// 							<li>&quot;*&quot; - many characters.</li>
	// 							<li>&quot;?&quot; one character.</li>
	// 						</ul>
	// 					</div>
	// 				</div>

	// 			<div className="find-form_section">
	// 				<input type="text" onChange={handleReplaceWithChange} />
	// 				<br />
	// 				<button type="button" onClick={onReplaceAll}>
	// 					Replace All
	// 				</button>
	// 				<button type="button" onClick={onReplaceAllBolded}>
	// 					Replace All (bolded)
	// 				</button>
	// 			</div>
	// 			<div className="find-form_section">
	// 				<button type="button" onClick={onFindByHTML}>
	// 					Find &quot;<strong>ca</strong>n<i>dy</i>&quot; by HTML
	// 				</button>
	// 			</div>
	// 		</div>
	// 		<FindResults
	// 			searchTerm={searchTerm}
	// 			activeSearch={activeSearch}
	// 			scrollTo={(id) => {
	// 				setCurrentResultId(id);
	// 				highlightResult(id, editor);
	// 			}}
	// 			replaceWith={onReplaceClick}
	// 			markerToText={markerToText}
	// 			currentResultId={currentResultId}
	// 		/>
	// 	</div>
	// );
};

// FindAndReplaceForm.propTypes = {
// 	// eslint-disable-next-line react/require-default-props
// 	editor: PropTypes.shape( {
// 		plugins: PropTypes.shape( {
// 			get: PropTypes.func
// 		} ),
// 		model: PropTypes.shape( {
// 			createRange: PropTypes.func
// 		} )
// 	} )
// };

export default FindAndReplaceForm;
