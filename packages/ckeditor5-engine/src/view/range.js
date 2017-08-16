/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/view/range
 */

import Position from './position';
import TreeWalker from './treewalker';

/**
 * Tree view range.
 */
export default class Range {
	/**
	 * Creates a range spanning from `start` position to `end` position.
	 *
	 * **Note:** Constructor creates it's own {@link module:engine/view/position~Position} instances basing on passed values.
	 *
	 * @param {module:engine/view/position~Position} start Start position.
	 * @param {module:engine/view/position~Position} [end] End position. If not set, range will be collapsed at `start` position.
	 */
	constructor( start, end = null ) {
		/**
		 * Start position.
		 *
		 * @member {module:engine/view/position~Position}
		 */
		this.start = Position.createFromPosition( start );

		/**
		 * End position.
		 *
		 * @member {module:engine/view/position~Position}
		 */
		this.end = end ? Position.createFromPosition( end ) : Position.createFromPosition( start );
	}

	/**
	 * Returns an iterator that iterates over all {@link module:engine/view/item~Item view items} that are in this range and returns
	 * them together with additional information like length or {@link module:engine/view/position~Position positions},
	 * grouped as {@link module:engine/view/treewalker~TreeWalkerValue}.
	 *
	 * This iterator uses {@link module:engine/view/treewalker~TreeWalker TreeWalker} with `boundaries` set to this range and
	 * `ignoreElementEnd` option
	 * set to `true`.
	 *
	 * @returns {Iterable.<module:engine/view/treewalker~TreeWalkerValue>}
	 */
	* [ Symbol.iterator ]() {
		yield* new TreeWalker( { boundaries: this, ignoreElementEnd: true } );
	}

	/**
	 * Returns whether the range is collapsed, that is it start and end positions are equal.
	 *
	 * @type {Boolean}
	 */
	get isCollapsed() {
		return this.start.isEqual( this.end );
	}

	/**
	 * Returns whether this range is flat, that is if {@link module:engine/view/range~Range#start start} position and
	 * {@link module:engine/view/range~Range#end end} position are in the same {@link module:engine/view/position~Position#parent parent}.
	 *
	 * @type {Boolean}
	 */
	get isFlat() {
		return this.start.parent === this.end.parent;
	}

	/**
	 * Range root element.
	 *
	 * @type {module:engine/view/element~Element|module:engine/view/documentfragment~DocumentFragment}
	 */
	get root() {
		return this.start.root;
	}

	/**
	 * Creates a maximal range that has the same content as this range but is expanded in both ways (at the beginning
	 * and at the end).
	 *
	 * For example:
	 *
	 * 		<p>Foo</p><p><b>{Bar}</b></p> -> <p>Foo</p>[<p><b>Bar</b>]</p>
	 * 		<p><b>foo</b>{bar}<span></span></p> -> <p><b>foo[</b>bar<span></span>]</p>
	 *
	 * Note that in the sample above:
	 *  - `<p>` have type of {@link module:engine/view/containerelement~ContainerElement},
	 *  - `<b>` have type of {@link module:engine/view/attributeelement~AttributeElement},
	 *  - `<span>` have type of {@link module:engine/view/uielement~UIElement}.
	 *
	 * @returns {module:engine/view/range~Range} Enlarged range.
	 */
	getEnlarged() {
		let start = this.start.getLastMatchingPosition( enlargeTrimSkip, { direction: 'backward' } );
		let end = this.end.getLastMatchingPosition( enlargeTrimSkip );

		// Fix positions, in case if they are in Text node.
		if ( start.parent.is( 'text' ) && start.isAtStart ) {
			start = Position.createBefore( start.parent );
		}

		if ( end.parent.is( 'text' ) && end.isAtEnd ) {
			end = Position.createAfter( end.parent );
		}

		return new Range( start, end );
	}

	/**
	 * Creates a minimum range that has the same content as this range but is trimmed in both ways (at the beginning
	 * and at the end).
	 *
	 * For example:
	 *
	 * 		<p>Foo</p>[<p><b>Bar</b>]</p> -> <p>Foo</p><p><b>{Bar}</b></p>
	 * 		<p><b>foo[</b>bar<span></span>]</p> -> <p><b>foo</b>{bar}<span></span></p>
	 *
	 * Note that in the sample above:
	 *  - `<p>` have type of {@link module:engine/view/containerelement~ContainerElement},
	 *  - `<b>` have type of {@link module:engine/view/attributeelement~AttributeElement},
	 *  - `<span>` have type of {@link module:engine/view/uielement~UIElement}.
	 *
	 * @returns {module:engine/view/range~Range} Shrink range.
	 */
	getTrimmed() {
		let start = this.start.getLastMatchingPosition( enlargeTrimSkip );

		if ( start.isAfter( this.end ) || start.isEqual( this.end ) ) {
			return new Range( start, start );
		}

		let end = this.end.getLastMatchingPosition( enlargeTrimSkip, { direction: 'backward' } );
		const nodeAfterStart = start.nodeAfter;
		const nodeBeforeEnd = end.nodeBefore;

		// Because TreeWalker prefers positions next to text node, we need to move them manually into these text nodes.
		if ( nodeAfterStart && nodeAfterStart.is( 'text' ) ) {
			start = new Position( nodeAfterStart, 0 );
		}

		if ( nodeBeforeEnd && nodeBeforeEnd.is( 'text' ) ) {
			end = new Position( nodeBeforeEnd, nodeBeforeEnd.data.length );
		}

		return new Range( start, end );
	}

	/**
	 * Two ranges are equal if their start and end positions are equal.
	 *
	 * @param {module:engine/view/range~Range} otherRange Range to compare with.
	 * @returns {Boolean} `true` if ranges are equal, `false` otherwise
	 */
	isEqual( otherRange ) {
		return this == otherRange || ( this.start.isEqual( otherRange.start ) && this.end.isEqual( otherRange.end ) );
	}

	/**
	 * Checks whether this range contains given {@link module:engine/view/position~Position position}.
	 *
	 * @param {module:engine/view/position~Position} position Position to check.
	 * @returns {Boolean} `true` if given {@link module:engine/view/position~Position position} is contained in this range,
	 * `false` otherwise.
	 */
	containsPosition( position ) {
		return position.isAfter( this.start ) && position.isBefore( this.end );
	}

	/**
	 * Checks whether this range contains given {@link module:engine/view/range~Range range}.
	 *
	 * @param {module:engine/view/range~Range} otherRange Range to check.
	 * @param {Boolean} [loose=false] Whether the check is loose or strict. If the check is strict (`false`), compared range cannot
	 * start or end at the same position as this range boundaries. If the check is loose (`true`), compared range can start, end or
	 * even be equal to this range. Note that collapsed ranges are always compared in strict mode.
	 * @returns {Boolean} `true` if given {@link module:engine/view/range~Range range} boundaries are contained by this range, `false`
	 * otherwise.
	 */
	containsRange( otherRange, loose = false ) {
		if ( otherRange.isCollapsed ) {
			loose = false;
		}

		const containsStart = this.containsPosition( otherRange.start ) || ( loose && this.start.isEqual( otherRange.start ) );
		const containsEnd = this.containsPosition( otherRange.end ) || ( loose && this.end.isEqual( otherRange.end ) );

		return containsStart && containsEnd;
	}

	/**
	 * Computes which part(s) of this {@link module:engine/view/range~Range range} is not a part of given
	 * {@link module:engine/view/range~Range range}.
	 * Returned array contains zero, one or two {@link module:engine/view/range~Range ranges}.
	 *
	 * Examples:
	 *
	 *		let foo = new Text( 'foo' );
	 *		let img = new ContainerElement( 'img' );
	 *		let bar = new Text( 'bar' );
	 *		let p = new ContainerElement( 'p', null, [ foo, img, bar ] );
	 *
	 *		let range = new Range( new Position( foo, 2 ), new Position( bar, 1 ); // "o", img, "b" are in range.
	 *		let otherRange = new Range( new Position( foo, 1 ), new Position( bar, 2 ); "oo", img, "ba" are in range.
	 *		let transformed = range.getDifference( otherRange );
	 *		// transformed array has no ranges because `otherRange` contains `range`
	 *
	 *		otherRange = new Range( new Position( foo, 1 ), new Position( p, 2 ); // "oo", img are in range.
	 *		transformed = range.getDifference( otherRange );
	 *		// transformed array has one range: from ( p, 2 ) to ( bar, 1 )
	 *
	 *		otherRange = new Range( new Position( p, 1 ), new Position( p, 2 ) ); // img is in range.
	 *		transformed = range.getDifference( otherRange );
	 *		// transformed array has two ranges: from ( foo, 1 ) to ( p, 1 ) and from ( p, 2 ) to ( bar, 1 )
	 *
	 * @param {module:engine/view/range~Range} otherRange Range to differentiate against.
	 * @returns {Array.<module:engine/view/range~Range>} The difference between ranges.
	 */
	getDifference( otherRange ) {
		const ranges = [];

		if ( this.isIntersecting( otherRange ) ) {
			// Ranges intersect.

			if ( this.containsPosition( otherRange.start ) ) {
				// Given range start is inside this range. This means that we have to
				// add shrunken range - from the start to the middle of this range.
				ranges.push( new Range( this.start, otherRange.start ) );
			}

			if ( this.containsPosition( otherRange.end ) ) {
				// Given range end is inside this range. This means that we have to
				// add shrunken range - from the middle of this range to the end.
				ranges.push( new Range( otherRange.end, this.end ) );
			}
		} else {
			// Ranges do not intersect, return the original range.
			ranges.push( Range.createFromRange( this ) );
		}

		return ranges;
	}

	/**
	 * Returns an intersection of this {@link module:engine/view/range~Range range} and given {@link module:engine/view/range~Range range}.
	 * Intersection is a common part of both of those ranges. If ranges has no common part, returns `null`.
	 *
	 * Examples:
	 *
	 *		let foo = new Text( 'foo' );
	 *		let img = new ContainerElement( 'img' );
	 *		let bar = new Text( 'bar' );
	 *		let p = new ContainerElement( 'p', null, [ foo, img, bar ] );
	 *
	 *		let range = new Range( new Position( foo, 2 ), new Position( bar, 1 ); // "o", img, "b" are in range.
	 *		let otherRange = new Range( new Position( foo, 1 ), new Position( p, 2 ); // "oo", img are in range.
	 *		let transformed = range.getIntersection( otherRange ); // range from ( foo, 1 ) to ( p, 2 ).
	 *
	 *		otherRange = new Range( new Position( bar, 1 ), new Position( bar, 3 ); "ar" is in range.
	 *		transformed = range.getIntersection( otherRange ); // null - no common part.
	 *
	 * @param {module:engine/view/range~Range} otherRange Range to check for intersection.
	 * @returns {module:engine/view/range~Range|null} A common part of given ranges or `null` if ranges have no common part.
	 */
	getIntersection( otherRange ) {
		if ( this.isIntersecting( otherRange ) ) {
			// Ranges intersect, so a common range will be returned.
			// At most, it will be same as this range.
			let commonRangeStart = this.start;
			let commonRangeEnd = this.end;

			if ( this.containsPosition( otherRange.start ) ) {
				// Given range start is inside this range. This means thaNt we have to
				// shrink common range to the given range start.
				commonRangeStart = otherRange.start;
			}

			if ( this.containsPosition( otherRange.end ) ) {
				// Given range end is inside this range. This means that we have to
				// shrink common range to the given range end.
				commonRangeEnd = otherRange.end;
			}

			return new Range( commonRangeStart, commonRangeEnd );
		}

		// Ranges do not intersect, so they do not have common part.
		return null;
	}

	/**
	 * Creates a {@link module:engine/view/treewalker~TreeWalker TreeWalker} instance with this range as a boundary.
	 *
	 * @param {Object} options Object with configuration options. See {@link module:engine/view/treewalker~TreeWalker}.
	 * @param {module:engine/view/position~Position} [options.startPosition]
	 * @param {Boolean} [options.singleCharacters=false]
	 * @param {Boolean} [options.shallow=false]
	 * @param {Boolean} [options.ignoreElementEnd=false]
	 */
	getWalker( options = {} ) {
		options.boundaries = this;

		return new TreeWalker( options );
	}

	/**
	 * Returns a {@link module:engine/view/node~Node} or {@link module:engine/view/documentfragment~DocumentFragment}
	 * which is a common ancestor of range's both ends (in which the entire range is contained).
	 *
	 * @returns {module:engine/view/node~Node|module:engine/view/documentfragment~DocumentFragment|null}
	 */
	getCommonAncestor() {
		return this.start.getCommonAncestor( this.end );
	}

	/**
	 * Returns an iterator that iterates over all {@link module:engine/view/item~Item view items} that are in this range and returns
	 * them.
	 *
	 * This method uses {@link module:engine/view/treewalker~TreeWalker} with `boundaries` set to this range and `ignoreElementEnd` option
	 * set to `true`. However it returns only {@link module:engine/view/item~Item items},
	 * not {@link module:engine/view/treewalker~TreeWalkerValue}.
	 *
	 * You may specify additional options for the tree walker. See {@link module:engine/view/treewalker~TreeWalker} for
	 * a full list of available options.
	 *
	 * @param {Object} options Object with configuration options. See {@link module:engine/view/treewalker~TreeWalker}.
	 * @returns {Iterable.<module:engine/view/item~Item>}
	 */
	* getItems( options = {} ) {
		options.boundaries = this;
		options.ignoreElementEnd = true;

		const treeWalker = new TreeWalker( options );

		for ( const value of treeWalker ) {
			yield value.item;
		}
	}

	/**
	 * Returns an iterator that iterates over all {@link module:engine/view/position~Position positions} that are boundaries or
	 * contained in this range.
	 *
	 * This method uses {@link module:engine/view/treewalker~TreeWalker} with `boundaries` set to this range. However it returns only
	 * {@link module:engine/view/position~Position positions}, not {@link module:engine/view/treewalker~TreeWalkerValue}.
	 *
	 * You may specify additional options for the tree walker. See {@link module:engine/view/treewalker~TreeWalker} for
	 * a full list of available options.
	 *
	 * @param {Object} options Object with configuration options. See {@link module:engine/view/treewalker~TreeWalker}.
	 * @returns {Iterable.<module:engine/view/position~Position>}
	 */
	* getPositions( options = {} ) {
		options.boundaries = this;

		const treeWalker = new TreeWalker( options );

		yield treeWalker.position;

		for ( const value of treeWalker ) {
			yield value.nextPosition;
		}
	}

	/**
	 * Checks and returns whether this range intersects with given range.
	 *
	 * @param {module:engine/view/range~Range} otherRange Range to compare with.
	 * @returns {Boolean} True if ranges intersect.
	 */
	isIntersecting( otherRange ) {
		return this.start.isBefore( otherRange.end ) && this.end.isAfter( otherRange.start );
	}

	/**
	 * Creates a range from given parents and offsets.
	 *
	 * @param {module:engine/view/element~Element} startElement Start position parent element.
	 * @param {Number} startOffset Start position offset.
	 * @param {module:engine/view/element~Element} endElement End position parent element.
	 * @param {Number} endOffset End position offset.
	 * @returns {module:engine/view/range~Range} Created range.
	 */
	static createFromParentsAndOffsets( startElement, startOffset, endElement, endOffset ) {
		return new this(
			new Position( startElement, startOffset ),
			new Position( endElement, endOffset )
		);
	}

	/**
	 * Creates and returns a new instance of Range which is equal to passed range.
	 *
	 * @param {module:engine/view/range~Range} range Range to clone.
	 * @returns {module:engine/view/range~Range}
	 */
	static createFromRange( range ) {
		return new this( range.start, range.end );
	}

	/**
	 * Creates a new range, spreading from specified {@link module:engine/view/position~Position position} to a position moved by
	 * given `shift`. If `shift` is a negative value, shifted position is treated as the beginning of the range.
	 *
	 * @param {module:engine/view/position~Position} position Beginning of the range.
	 * @param {Number} shift How long the range should be.
	 * @returns {module:engine/view/range~Range}
	 */
	static createFromPositionAndShift( position, shift ) {
		const start = position;
		const end = position.getShiftedBy( shift );

		return shift > 0 ? new this( start, end ) : new this( end, start );
	}

	/**
	 * Creates a range inside an {@link module:engine/view/element~Element element} which starts before the first child of
	 * that element and ends after the last child of that element.
	 *
	 * @param {module:engine/view/element~Element} element Element which is a parent for the range.
	 * @returns {module:engine/view/range~Range}
	 */
	static createIn( element ) {
		return this.createFromParentsAndOffsets( element, 0, element, element.childCount );
	}

	/**
	 * Creates a range that starts before given {@link module:engine/view/item~Item view item} and ends after it.
	 *
	 * @param {module:engine/view/item~Item} item
	 * @returns {module:engine/view/range~Range}
	 */
	static createOn( item ) {
		return this.createFromPositionAndShift( Position.createBefore( item ), 1 );
	}

	/**
	 * Creates a collapsed range at given {@link module:engine/view/position~Position position}
	 * or on the given {@link module:engine/view/item~Item item}.
	 *
	 * @param {module:engine/view/item~Item|module:engine/view/position~Position} itemOrPosition
	 * @param {Number|'end'|'before'|'after'} [offset=0] Offset or one of the flags. Used only when
	 * first parameter is a {@link module:engine/view/item~Item view item}.
	 */
	static createCollapsedAt( itemOrPosition, offset ) {
		const start = Position.createAt( itemOrPosition, offset );
		const end = Position.createFromPosition( start );

		return new Range( start, end );
	}
}

// Function used by getEnlarged and getTrimmed methods.
function enlargeTrimSkip( value ) {
	if ( value.item.is( 'attributeElement' ) || value.item.is( 'uiElement' ) ) {
		return true;
	}

	return false;
}
