/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/range
 */

import Position from './position';
import TreeWalker from './treewalker';

/**
 * Range in the view tree. A range is represented by its start and end {@link module:engine/view/position~Position positions}.
 *
 * In order to create a new position instance use the `createPosition*()` factory methods available in:
 *
 * * {@link module:engine/view/view~View}
 * * {@link module:engine/view/downcastwriter~DowncastWriter}
 * * {@link module:engine/view/upcastwriter~UpcastWriter}
 */
export default class Range {
	/**
	 * Creates a range spanning from `start` position to `end` position.
	 *
	 * **Note:** Constructor creates it's own {@link module:engine/view/position~Position} instances basing on passed values.
	 *
	 * @param {module:engine/view/position~Position} start Start position.
	 * @param {module:engine/view/position~Position} [end] End position. If not set, range will be collapsed at the `start` position.
	 */
	constructor( start, end = null ) {
		/**
		 * Start position.
		 *
		 * @readonly
		 * @member {module:engine/view/position~Position}
		 */
		this.start = start.clone();

		/**
		 * End position.
		 *
		 * @readonly
		 * @member {module:engine/view/position~Position}
		 */
		this.end = end ? end.clone() : start.clone();
	}

	/**
	 * Iterable interface.
	 *
	 * Iterates over all {@link module:engine/view/item~Item view items} that are in this range and returns
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
	 *		<p>Foo</p><p><b>{Bar}</b></p> -> <p>Foo</p>[<p><b>Bar</b>]</p>
	 *		<p><b>foo</b>{bar}<span></span></p> -> <p><b>foo[</b>bar<span></span>]</p>
	 *
	 * Note that in the sample above:
	 *
	 * - `<p>` have type of {@link module:engine/view/containerelement~ContainerElement},
	 * - `<b>` have type of {@link module:engine/view/attributeelement~AttributeElement},
	 * - `<span>` have type of {@link module:engine/view/uielement~UIElement}.
	 *
	 * @returns {module:engine/view/range~Range} Enlarged range.
	 */
	getEnlarged() {
		let start = this.start.getLastMatchingPosition( enlargeTrimSkip, { direction: 'backward' } );
		let end = this.end.getLastMatchingPosition( enlargeTrimSkip );

		// Fix positions, in case if they are in Text node.
		if ( start.parent.is( '$text' ) && start.isAtStart ) {
			start = Position._createBefore( start.parent );
		}

		if ( end.parent.is( '$text' ) && end.isAtEnd ) {
			end = Position._createAfter( end.parent );
		}

		return new Range( start, end );
	}

	/**
	 * Creates a minimum range that has the same content as this range but is trimmed in both ways (at the beginning
	 * and at the end).
	 *
	 * For example:
	 *
	 *		<p>Foo</p>[<p><b>Bar</b>]</p> -> <p>Foo</p><p><b>{Bar}</b></p>
	 *		<p><b>foo[</b>bar<span></span>]</p> -> <p><b>foo</b>{bar}<span></span></p>
	 *
	 * Note that in the sample above:
	 *
	 * - `<p>` have type of {@link module:engine/view/containerelement~ContainerElement},
	 * - `<b>` have type of {@link module:engine/view/attributeelement~AttributeElement},
	 * - `<span>` have type of {@link module:engine/view/uielement~UIElement}.
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
		if ( nodeAfterStart && nodeAfterStart.is( '$text' ) ) {
			start = new Position( nodeAfterStart, 0 );
		}

		if ( nodeBeforeEnd && nodeBeforeEnd.is( '$text' ) ) {
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
	 *		let foo = downcastWriter.createText( 'foo' );
	 *		let img = downcastWriter.createContainerElement( 'img' );
	 *		let bar = downcastWriter.createText( 'bar' );
	 *		let p = downcastWriter.createContainerElement( 'p', null, [ foo, img, bar ] );
	 *
	 *		let range = view.createRange( view.createPositionAt( foo, 2 ), view.createPositionAt( bar, 1 ); // "o", img, "b" are in range.
	 *		let otherRange = view.createRange( // "oo", img, "ba" are in range.
	 *			view.createPositionAt( foo, 1 ),
	 *			view.createPositionAt( bar, 2 )
	 *		);
	 *		let transformed = range.getDifference( otherRange );
	 *		// transformed array has no ranges because `otherRange` contains `range`
	 *
	 *		otherRange = view.createRange( view.createPositionAt( foo, 1 ), view.createPositionAt( p, 2 ); // "oo", img are in range.
	 *		transformed = range.getDifference( otherRange );
	 *		// transformed array has one range: from ( p, 2 ) to ( bar, 1 )
	 *
	 *		otherRange = view.createRange( view.createPositionAt( p, 1 ), view.createPositionAt( p, 2 ) ); // img is in range.
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
			ranges.push( this.clone() );
		}

		return ranges;
	}

	/**
	 * Returns an intersection of this {@link module:engine/view/range~Range range} and given {@link module:engine/view/range~Range range}.
	 * Intersection is a common part of both of those ranges. If ranges has no common part, returns `null`.
	 *
	 * Examples:
	 *
	 *		let foo = downcastWriter.createText( 'foo' );
	 *		let img = downcastWriter.createContainerElement( 'img' );
	 *		let bar = downcastWriter.createText( 'bar' );
	 *		let p = downcastWriter.createContainerElement( 'p', null, [ foo, img, bar ] );
	 *
	 *		let range = view.createRange( view.createPositionAt( foo, 2 ), view.createPositionAt( bar, 1 ); // "o", img, "b" are in range.
	 *		let otherRange = view.createRange( view.createPositionAt( foo, 1 ), view.createPositionAt( p, 2 ); // "oo", img are in range.
	 *		let transformed = range.getIntersection( otherRange ); // range from ( foo, 1 ) to ( p, 2 ).
	 *
	 *		otherRange = view.createRange( view.createPositionAt( bar, 1 ), view.createPositionAt( bar, 3 ); "ar" is in range.
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
	 * @returns {module:engine/view/treewalker~TreeWalker}
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
	 * Returns an {@link module:engine/view/element~Element Element} contained by the range.
	 * The element will be returned when it is the **only** node within the range and **fully–contained**
	 * at the same time.
	 *
	 * @returns {module:engine/view/element~Element|null}
	 */
	getContainedElement() {
		if ( this.isCollapsed ) {
			return null;
		}

		let nodeAfterStart = this.start.nodeAfter;
		let nodeBeforeEnd = this.end.nodeBefore;

		// Handle the situation when the range position is at the beginning / at the end of a text node.
		// In such situation `.nodeAfter` and `.nodeBefore` are `null` but the range still might be spanning
		// over one element.
		//
		// <p>Foo{<span class="widget"></span>}bar</p> vs <p>Foo[<span class="widget"></span>]bar</p>
		//
		// These are basically the same range, only the difference is if the range position is at
		// at the end/at the beginning of a text node or just before/just after the text node.
		//
		if ( this.start.parent.is( '$text' ) && this.start.isAtEnd && this.start.parent.nextSibling ) {
			nodeAfterStart = this.start.parent.nextSibling;
		}

		if ( this.end.parent.is( '$text' ) && this.end.isAtStart && this.end.parent.previousSibling ) {
			nodeBeforeEnd = this.end.parent.previousSibling;
		}

		if ( nodeAfterStart && nodeAfterStart.is( 'element' ) && nodeAfterStart === nodeBeforeEnd ) {
			return nodeAfterStart;
		}

		return null;
	}

	/**
	 * Clones this range.
	 *
	 * @returns {module:engine/view/range~Range}
	 */
	clone() {
		return new Range( this.start, this.end );
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
	 * Checks whether this object is of the given type.
	 *
	 *		range.is( 'range' ); // -> true
	 *		range.is( 'view:range' ); // -> true
	 *
	 *		range.is( 'model:range' ); // -> false
	 *		range.is( 'element' ); // -> false
	 *		range.is( 'selection' ); // -> false
	 *
	 * {@link module:engine/view/node~Node#is Check the entire list of view objects} which implement the `is()` method.
	 *
	 * @param {String} type
	 * @returns {Boolean}
	 */
	is( type ) {
		return type === 'range' || type === 'view:range';
	}

	/**
	 * Checks and returns whether this range intersects with the given range.
	 *
	 * @param {module:engine/view/range~Range} otherRange Range to compare with.
	 * @returns {Boolean} True if ranges intersect.
	 */
	isIntersecting( otherRange ) {
		return this.start.isBefore( otherRange.end ) && this.end.isAfter( otherRange.start );
	}

	/**
	 * Creates a range from the given parents and offsets.
	 *
	 * @protected
	 * @param {module:engine/view/node~Node|module:engine/view/documentfragment~DocumentFragment} startElement Start position
	 * parent element.
	 * @param {Number} startOffset Start position offset.
	 * @param {module:engine/view/node~Node|module:engine/view/documentfragment~DocumentFragment} endElement End position
	 * parent element.
	 * @param {Number} endOffset End position offset.
	 * @returns {module:engine/view/range~Range} Created range.
	 */
	static _createFromParentsAndOffsets( startElement, startOffset, endElement, endOffset ) {
		return new this(
			new Position( startElement, startOffset ),
			new Position( endElement, endOffset )
		);
	}

	/**
	 * Creates a new range, spreading from specified {@link module:engine/view/position~Position position} to a position moved by
	 * given `shift`. If `shift` is a negative value, shifted position is treated as the beginning of the range.
	 *
	 * @protected
	 * @param {module:engine/view/position~Position} position Beginning of the range.
	 * @param {Number} shift How long the range should be.
	 * @returns {module:engine/view/range~Range}
	 */
	static _createFromPositionAndShift( position, shift ) {
		const start = position;
		const end = position.getShiftedBy( shift );

		return shift > 0 ? new this( start, end ) : new this( end, start );
	}

	/**
	 * Creates a range inside an {@link module:engine/view/element~Element element} which starts before the first child of
	 * that element and ends after the last child of that element.
	 *
	 * @protected
	 * @param {module:engine/view/element~Element} element Element which is a parent for the range.
	 * @returns {module:engine/view/range~Range}
	 */
	static _createIn( element ) {
		return this._createFromParentsAndOffsets( element, 0, element, element.childCount );
	}

	/**
	 * Creates a range that starts before given {@link module:engine/view/item~Item view item} and ends after it.
	 *
	 * @protected
	 * @param {module:engine/view/item~Item} item
	 * @returns {module:engine/view/range~Range}
	 */
	static _createOn( item ) {
		const size = item.is( '$textProxy' ) ? item.offsetSize : 1;

		return this._createFromPositionAndShift( Position._createBefore( item ), size );
	}
}

// Function used by getEnlarged and getTrimmed methods.
function enlargeTrimSkip( value ) {
	if ( value.item.is( 'attributeElement' ) || value.item.is( 'uiElement' ) ) {
		return true;
	}

	return false;
}
