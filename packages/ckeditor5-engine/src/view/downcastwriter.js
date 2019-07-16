/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module module:engine/view/downcastwriter
 */

import Position from './position';
import Range from './range';
import Selection from './selection';
import ContainerElement from './containerelement';
import AttributeElement from './attributeelement';
import EmptyElement from './emptyelement';
import UIElement from './uielement';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import DocumentFragment from './documentfragment';
import isIterable from '@ckeditor/ckeditor5-utils/src/isiterable';
import Text from './text';
import EditableElement from './editableelement';
import { isPlainObject } from 'lodash-es';

/**
 * View downcast writer.
 *
 * It provides a set of methods used to manipulate view nodes.
 *
 * Do not create an instance of this writer manually. To modify a view structure, use
 * the {@link module:engine/view/view~View#change `View#change()`} block.
 *
 * The `DowncastWriter` is designed to work with semantic views which are the views that were/are being downcasted from the model.
 * To work with ordinary views (e.g. parsed from a pasted content) use the
 * {@link module:engine/view/upcastwriter~UpcastWriter upcast writer}.
 *
 * Read more about changing the view in the {@glink framework/guides/architecture/editing-engine#changing-the-view Changing the view}
 * section of the {@glink framework/guides/architecture/editing-engine Editing engine architecture} guide.
 */
export default class DowncastWriter {
	constructor( document ) {
		/**
		 * @readonly
		 * @type {module:engine/view/document~Document}
		 */
		this.document = document;

		/**
		 * Holds references to the attribute groups that share the same {@link module:engine/view/attributeelement~AttributeElement#id id}.
		 * The keys are `id`s, the values are `Set`s holding {@link module:engine/view/attributeelement~AttributeElement}s.
		 *
		 * @private
		 * @type {Map.<String,Set>}
		 */
		this._cloneGroups = new Map();
	}

	/**
	 * Sets {@link module:engine/view/documentselection~DocumentSelection selection's} ranges and direction to the
	 * specified location based on the given {@link module:engine/view/selection~Selectable selectable}.
	 *
	 * Usage:
	 *
	 *		// Sets selection to the given range.
	 *		const range = writer.createRange( start, end );
	 *		writer.setSelection( range );
	 *
	 *		// Sets backward selection to the given range.
	 *		const range = writer.createRange( start, end );
	 *		writer.setSelection( range );
	 *
	 *		// Sets selection to given ranges.
	 * 		const ranges = [ writer.createRange( start1, end2 ), writer.createRange( star2, end2 ) ];
	 *		writer.setSelection( range );
	 *
	 *		// Sets selection to the other selection.
	 *		const otherSelection = writer.createSelection();
	 *		writer.setSelection( otherSelection );
	 *
	 * 		// Sets collapsed selection at the given position.
	 *		const position = writer.createPositionFromPath( root, path );
	 *		writer.setSelection( position );
	 *
	 * 		// Sets collapsed selection at the position of given item and offset.
	 *		const paragraph = writer.createContainerElement( 'paragraph' );
	 *		writer.setSelection( paragraph, offset );
	 *
	 * Creates a range inside an {@link module:engine/view/element~Element element} which starts before the first child of
 	 * that element and ends after the last child of that element.
	 *
	 * 		writer.setSelection( paragraph, 'in' );
	 *
	 * Creates a range on the {@link module:engine/view/item~Item item} which starts before the item and ends just after the item.
	 *
	 *		writer.setSelection( paragraph, 'on' );
	 *
	 * 		// Removes all ranges.
	 *		writer.setSelection( null );
	 *
	 * `DowncastWriter#setSelection()` allow passing additional options (`backward`, `fake` and `label`) as the last argument.
	 *
	 *		// Sets selection as backward.
	 *		writer.setSelection( range, { backward: true } );
	 *
	 *		// Sets selection as fake.
	 *		// Fake selection does not render as browser native selection over selected elements and is hidden to the user.
	 * 		// This way, no native selection UI artifacts are displayed to the user and selection over elements can be
	 * 		// represented in other way, for example by applying proper CSS class.
	 *		writer.setSelection( range, { fake: true } );
	 *
	 * 		// Additionally fake's selection label can be provided. It will be used to describe fake selection in DOM
	 * 		// (and be  properly handled by screen readers).
	 *		writer.setSelection( range, { fake: true, label: 'foo' } );
	 *
	 * @param {module:engine/view/selection~Selectable} selectable
	 * @param {Number|'before'|'end'|'after'|'on'|'in'} [placeOrOffset] Sets place or offset of the selection.
	 * @param {Object} [options]
	 * @param {Boolean} [options.backward] Sets this selection instance to be backward.
	 * @param {Boolean} [options.fake] Sets this selection instance to be marked as `fake`.
	 * @param {String} [options.label] Label for the fake selection.
	 */
	setSelection( selectable, placeOrOffset, options ) {
		this.document.selection._setTo( selectable, placeOrOffset, options );
	}

	/**
	 * Moves {@link module:engine/view/documentselection~DocumentSelection#focus selection's focus} to the specified location.
	 *
	 * The location can be specified in the same form as {@link module:engine/view/view~View#createPositionAt view.createPositionAt()}
	 * parameters.
	 *
	 * @param {module:engine/view/item~Item|module:engine/view/position~Position} itemOrPosition
	 * @param {Number|'end'|'before'|'after'} [offset] Offset or one of the flags. Used only when
	 * first parameter is a {@link module:engine/view/item~Item view item}.
	 */
	setSelectionFocus( itemOrPosition, offset ) {
		this.document.selection._setFocus( itemOrPosition, offset );
	}

	/**
	 * Creates a new {@link module:engine/view/text~Text text node}.
	 *
	 *		writer.createText( 'foo' );
	 *
	 * @param {String} data The text's data.
	 * @returns {module:engine/view/text~Text} The created text node.
	 */
	createText( data ) {
		return new Text( data );
	}

	/**
	 * Creates new {@link module:engine/view/attributeelement~AttributeElement}.
	 *
	 *		writer.createAttributeElement( 'strong' );
	 *		writer.createAttributeElement( 'strong', { alignment: 'center' } );
	 *
	 *		// Make `<a>` element contain other attributes element so the `<a>` element is not broken.
	 *		writer.createAttributeElement( 'a', { href: 'foo.bar' }, { priority: 5 } );
	 *
	 *		// Set `id` of a marker element so it is not joined or merged with "normal" elements.
	 *		writer.createAttributeElement( 'span', { class: 'myMarker' }, { id: 'marker:my' } );
	 *
	 * @param {String} name Name of the element.
	 * @param {Object} [attributes] Element's attributes.
	 * @param {Object} [options] Element's options.
	 * @param {Number} [options.priority] Element's {@link module:engine/view/attributeelement~AttributeElement#priority priority}.
	 * @param {Number|String} [options.id] Element's {@link module:engine/view/attributeelement~AttributeElement#id id}.
	 * @returns {module:engine/view/attributeelement~AttributeElement} Created element.
	 */
	createAttributeElement( name, attributes, options = {} ) {
		const attributeElement = new AttributeElement( name, attributes );

		if ( options.priority ) {
			attributeElement._priority = options.priority;
		}

		if ( options.id ) {
			attributeElement._id = options.id;
		}

		return attributeElement;
	}

	/**
	 * Creates new {@link module:engine/view/containerelement~ContainerElement}.
	 *
	 *		writer.createContainerElement( 'paragraph' );
	 *		writer.createContainerElement( 'paragraph', { alignment: 'center' } );
	 *
	 * @param {String} name Name of the element.
	 * @param {Object} [attributes] Elements attributes.
	 * @returns {module:engine/view/containerelement~ContainerElement} Created element.
	 */
	createContainerElement( name, attributes ) {
		return new ContainerElement( name, attributes );
	}

	/**
	 * Creates new {@link module:engine/view/editableelement~EditableElement}.
	 *
	 *		writer.createEditableElement( 'div' );
	 *		writer.createEditableElement( 'div', { alignment: 'center' } );
	 *
	 * @param {String} name Name of the element.
	 * @param {Object} [attributes] Elements attributes.
	 * @returns {module:engine/view/editableelement~EditableElement} Created element.
	 */
	createEditableElement( name, attributes ) {
		const editableElement = new EditableElement( name, attributes );
		editableElement._document = this.document;

		return editableElement;
	}

	/**
	 * Creates new {@link module:engine/view/emptyelement~EmptyElement}.
	 *
	 *		writer.createEmptyElement( 'img' );
	 *		writer.createEmptyElement( 'img', { alignment: 'center' } );
	 *
	 * @param {String} name Name of the element.
	 * @param {Object} [attributes] Elements attributes.
	 * @returns {module:engine/view/emptyelement~EmptyElement} Created element.
	 */
	createEmptyElement( name, attributes ) {
		return new EmptyElement( name, attributes );
	}

	/**
	 * Creates new {@link module:engine/view/uielement~UIElement}.
	 *
	 *		writer.createUIElement( 'span' );
	 *		writer.createUIElement( 'span', { alignment: 'center' } );
	 *
	 * Custom render function can be provided as third parameter:
	 *
	 *		writer.createUIElement( 'span', null, function( domDocument ) {
	 *			const domElement = this.toDomElement( domDocument );
	 *			domElement.innerHTML = '<b>this is ui element</b>';
	 *
	 *			return domElement;
	 *		} );
	 *
	 * @param {String} name Name of the element.
	 * @param {Object} [attributes] Elements attributes.
	 * @param {Function} [renderFunction] Custom render function.
	 * @returns {module:engine/view/uielement~UIElement} Created element.
	 */
	createUIElement( name, attributes, renderFunction ) {
		const uiElement = new UIElement( name, attributes );

		if ( renderFunction ) {
			uiElement.render = renderFunction;
		}

		return uiElement;
	}

	/**
	 * Adds or overwrite element's attribute with a specified key and value.
	 *
	 *		writer.setAttribute( 'href', 'http://ckeditor.com', linkElement );
	 *
	 * @param {String} key Attribute key.
	 * @param {String} value Attribute value.
	 * @param {module:engine/view/element~Element} element
	 */
	setAttribute( key, value, element ) {
		element._setAttribute( key, value );
	}

	/**
	 * Removes attribute from the element.
	 *
	 *		writer.removeAttribute( 'href', linkElement );
	 *
	 * @param {String} key Attribute key.
	 * @param {module:engine/view/element~Element} element
	 */
	removeAttribute( key, element ) {
		element._removeAttribute( key );
	}

	/**
	 * Adds specified class to the element.
	 *
	 *		writer.addClass( 'foo', linkElement );
	 *		writer.addClass( [ 'foo', 'bar' ], linkElement );
	 *
	 * @param {Array.<String>|String} className
	 * @param {module:engine/view/element~Element} element
	 */
	addClass( className, element ) {
		element._addClass( className );
	}

	/**
	 * Removes specified class from the element.
	 *
	 *		writer.removeClass( 'foo', linkElement );
	 *		writer.removeClass( [ 'foo', 'bar' ], linkElement );
	 *
	 * @param {Array.<String>|String} className
	 * @param {module:engine/view/element~Element} element
	 */
	removeClass( className, element ) {
		element._removeClass( className );
	}

	/**
	 * Adds style to the element.
	 *
	 *		writer.setStyle( 'color', 'red', element );
	 *		writer.setStyle( {
	 *			color: 'red',
	 *			position: 'fixed'
	 *		}, element );
	 *
	 * @param {String|Object} property Property name or object with key - value pairs.
	 * @param {String} [value] Value to set. This parameter is ignored if object is provided as the first parameter.
	 * @param {module:engine/view/element~Element} element Element to set styles on.
	 */
	setStyle( property, value, element ) {
		if ( isPlainObject( property ) && element === undefined ) {
			element = value;
		}

		element._setStyle( property, value );
	}

	/**
	 * Removes specified style from the element.
	 *
	 *		writer.removeStyle( 'color', element );  // Removes 'color' style.
	 *		writer.removeStyle( [ 'color', 'border-top' ], element ); // Removes both 'color' and 'border-top' styles.
	 *
	 * @param {Array.<String>|String} property
	 * @param {module:engine/view/element~Element} element
	 */
	removeStyle( property, element ) {
		element._removeStyle( property );
	}

	/**
	 * Sets a custom property on element. Unlike attributes, custom properties are not rendered to the DOM,
	 * so they can be used to add special data to elements.
	 *
	 * @param {String|Symbol} key
	 * @param {*} value
	 * @param {module:engine/view/element~Element} element
	 */
	setCustomProperty( key, value, element ) {
		element._setCustomProperty( key, value );
	}

	/**
	 * Removes a custom property stored under the given key.
	 *
	 * @param {String|Symbol} key
	 * @param {module:engine/view/element~Element} element
	 * @returns {Boolean} Returns true if property was removed.
	 */
	removeCustomProperty( key, element ) {
		return element._removeCustomProperty( key );
	}

	/**
	 * Breaks attribute nodes at provided position or at boundaries of provided range. It breaks attribute elements inside
	 * up to a container element.
	 *
	 * In following examples `<p>` is a container, `<b>` and `<u>` are attribute nodes:
	 *
	 *        <p>foo<b><u>bar{}</u></b></p> -> <p>foo<b><u>bar</u></b>[]</p>
	 *        <p>foo<b><u>{}bar</u></b></p> -> <p>foo{}<b><u>bar</u></b></p>
	 *        <p>foo<b><u>b{}ar</u></b></p> -> <p>foo<b><u>b</u></b>[]<b><u>ar</u></b></p>
	 *        <p><b>fo{o</b><u>ba}r</u></p> -> <p><b>fo</b><b>o</b><u>ba</u><u>r</u></b></p>
	 *
	 * **Note:** {@link module:engine/view/documentfragment~DocumentFragment DocumentFragment} is treated like a container.
	 *
	 * **Note:** Difference between {@link module:engine/view/downcastwriter~DowncastWriter#breakAttributes breakAttributes} and
	 * {@link module:engine/view/downcastwriter~DowncastWriter#breakContainer breakContainer} is that `breakAttributes` breaks all
	 * {@link module:engine/view/attributeelement~AttributeElement attribute elements} that are ancestors of given `position`,
	 * up to the first encountered {@link module:engine/view/containerelement~ContainerElement container element}.
	 * `breakContainer` assumes that given `position` is directly in container element and breaks that container element.
	 *
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-writer-invalid-range-container`
	 * when {@link module:engine/view/range~Range#start start}
	 * and {@link module:engine/view/range~Range#end end} positions of a passed range are not placed inside same parent container.
	 *
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-writer-cannot-break-empty-element`
	 * when trying to break attributes
	 * inside {@link module:engine/view/emptyelement~EmptyElement EmptyElement}.
	 *
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-writer-cannot-break-ui-element`
	 * when trying to break attributes
	 * inside {@link module:engine/view/uielement~UIElement UIElement}.
	 *
	 * @see module:engine/view/attributeelement~AttributeElement
	 * @see module:engine/view/containerelement~ContainerElement
	 * @see module:engine/view/downcastwriter~DowncastWriter#breakContainer
	 * @param {module:engine/view/position~Position|module:engine/view/range~Range} positionOrRange Position where
	 * to break attribute elements.
	 * @returns {module:engine/view/position~Position|module:engine/view/range~Range} New position or range, after breaking the attribute
	 * elements.
	 */
	breakAttributes( positionOrRange ) {
		if ( positionOrRange instanceof Position ) {
			return this._breakAttributes( positionOrRange );
		} else {
			return this._breakAttributesRange( positionOrRange );
		}
	}

	/**
	 * Breaks {@link module:engine/view/containerelement~ContainerElement container view element} into two, at the given position. Position
	 * has to be directly inside container element and cannot be in root. Does not break if position is at the beginning
	 * or at the end of it's parent element.
	 *
	 *        <p>foo^bar</p> -> <p>foo</p><p>bar</p>
	 *        <div><p>foo</p>^<p>bar</p></div> -> <div><p>foo</p></div><div><p>bar</p></div>
	 *        <p>^foobar</p> -> ^<p>foobar</p>
	 *        <p>foobar^</p> -> <p>foobar</p>^
	 *
	 * **Note:** Difference between {@link module:engine/view/downcastwriter~DowncastWriter#breakAttributes breakAttributes} and
	 * {@link module:engine/view/downcastwriter~DowncastWriter#breakContainer breakContainer} is that `breakAttributes` breaks all
	 * {@link module:engine/view/attributeelement~AttributeElement attribute elements} that are ancestors of given `position`,
	 * up to the first encountered {@link module:engine/view/containerelement~ContainerElement container element}.
	 * `breakContainer` assumes that given `position` is directly in container element and breaks that container element.
	 *
	 * @see module:engine/view/attributeelement~AttributeElement
	 * @see module:engine/view/containerelement~ContainerElement
	 * @see module:engine/view/downcastwriter~DowncastWriter#breakAttributes
	 * @param {module:engine/view/position~Position} position Position where to break element.
	 * @returns {module:engine/view/position~Position} Position between broken elements. If element has not been broken,
	 * the returned position is placed either before it or after it.
	 */
	breakContainer( position ) {
		const element = position.parent;

		if ( !( element.is( 'containerElement' ) ) ) {
			/**
			 * Trying to break an element which is not a container element.
			 *
			 * @error view-writer-break-non-container-element
			 */
			throw new CKEditorError(
				'view-writer-break-non-container-element: Trying to break an element which is not a container element.',
				this.document
			);
		}

		if ( !element.parent ) {
			/**
			 * Trying to break root element.
			 *
			 * @error view-writer-break-root
			 */
			throw new CKEditorError( 'view-writer-break-root: Trying to break root element.', this.document );
		}

		if ( position.isAtStart ) {
			return Position._createBefore( element );
		} else if ( !position.isAtEnd ) {
			const newElement = element._clone( false );

			this.insert( Position._createAfter( element ), newElement );

			const sourceRange = new Range( position, Position._createAt( element, 'end' ) );
			const targetPosition = new Position( newElement, 0 );

			this.move( sourceRange, targetPosition );
		}

		return Position._createAfter( element );
	}

	/**
	 * Merges {@link module:engine/view/attributeelement~AttributeElement attribute elements}. It also merges text nodes if needed.
	 * Only {@link module:engine/view/attributeelement~AttributeElement#isSimilar similar} attribute elements can be merged.
	 *
	 * In following examples `<p>` is a container and `<b>` is an attribute element:
	 *
	 *        <p>foo[]bar</p> -> <p>foo{}bar</p>
	 *        <p><b>foo</b>[]<b>bar</b></p> -> <p><b>foo{}bar</b></p>
	 *        <p><b foo="bar">a</b>[]<b foo="baz">b</b></p> -> <p><b foo="bar">a</b>[]<b foo="baz">b</b></p>
	 *
	 * It will also take care about empty attributes when merging:
	 *
	 *        <p><b>[]</b></p> -> <p>[]</p>
	 *        <p><b>foo</b><i>[]</i><b>bar</b></p> -> <p><b>foo{}bar</b></p>
	 *
	 * **Note:** Difference between {@link module:engine/view/downcastwriter~DowncastWriter#mergeAttributes mergeAttributes} and
	 * {@link module:engine/view/downcastwriter~DowncastWriter#mergeContainers mergeContainers} is that `mergeAttributes` merges two
	 * {@link module:engine/view/attributeelement~AttributeElement attribute elements} or {@link module:engine/view/text~Text text nodes}
	 * while `mergeContainer` merges two {@link module:engine/view/containerelement~ContainerElement container elements}.
	 *
	 * @see module:engine/view/attributeelement~AttributeElement
	 * @see module:engine/view/containerelement~ContainerElement
	 * @see module:engine/view/downcastwriter~DowncastWriter#mergeContainers
	 * @param {module:engine/view/position~Position} position Merge position.
	 * @returns {module:engine/view/position~Position} Position after merge.
	 */
	mergeAttributes( position ) {
		const positionOffset = position.offset;
		const positionParent = position.parent;

		// When inside text node - nothing to merge.
		if ( positionParent.is( 'text' ) ) {
			return position;
		}

		// When inside empty attribute - remove it.
		if ( positionParent.is( 'attributeElement' ) && positionParent.childCount === 0 ) {
			const parent = positionParent.parent;
			const offset = positionParent.index;

			positionParent._remove();
			this._removeFromClonedElementsGroup( positionParent );

			return this.mergeAttributes( new Position( parent, offset ) );
		}

		const nodeBefore = positionParent.getChild( positionOffset - 1 );
		const nodeAfter = positionParent.getChild( positionOffset );

		// Position should be placed between two nodes.
		if ( !nodeBefore || !nodeAfter ) {
			return position;
		}

		// When position is between two text nodes.
		if ( nodeBefore.is( 'text' ) && nodeAfter.is( 'text' ) ) {
			return mergeTextNodes( nodeBefore, nodeAfter );
		}
		// When position is between two same attribute elements.
		else if ( nodeBefore.is( 'attributeElement' ) && nodeAfter.is( 'attributeElement' ) && nodeBefore.isSimilar( nodeAfter ) ) {
			// Move all children nodes from node placed after selection and remove that node.
			const count = nodeBefore.childCount;
			nodeBefore._appendChild( nodeAfter.getChildren() );

			nodeAfter._remove();
			this._removeFromClonedElementsGroup( nodeAfter );

			// New position is located inside the first node, before new nodes.
			// Call this method recursively to merge again if needed.
			return this.mergeAttributes( new Position( nodeBefore, count ) );
		}

		return position;
	}

	/**
	 * Merges two {@link module:engine/view/containerelement~ContainerElement container elements} that are before and after given position.
	 * Precisely, the element after the position is removed and it's contents are moved to element before the position.
	 *
	 *        <p>foo</p>^<p>bar</p> -> <p>foo^bar</p>
	 *        <div>foo</div>^<p>bar</p> -> <div>foo^bar</div>
	 *
	 * **Note:** Difference between {@link module:engine/view/downcastwriter~DowncastWriter#mergeAttributes mergeAttributes} and
	 * {@link module:engine/view/downcastwriter~DowncastWriter#mergeContainers mergeContainers} is that `mergeAttributes` merges two
	 * {@link module:engine/view/attributeelement~AttributeElement attribute elements} or {@link module:engine/view/text~Text text nodes}
	 * while `mergeContainer` merges two {@link module:engine/view/containerelement~ContainerElement container elements}.
	 *
	 * @see module:engine/view/attributeelement~AttributeElement
	 * @see module:engine/view/containerelement~ContainerElement
	 * @see module:engine/view/downcastwriter~DowncastWriter#mergeAttributes
	 * @param {module:engine/view/position~Position} position Merge position.
	 * @returns {module:engine/view/position~Position} Position after merge.
	 */
	mergeContainers( position ) {
		const prev = position.nodeBefore;
		const next = position.nodeAfter;

		if ( !prev || !next || !prev.is( 'containerElement' ) || !next.is( 'containerElement' ) ) {
			/**
			 * Element before and after given position cannot be merged.
			 *
			 * @error view-writer-merge-containers-invalid-position
			 */
			throw new CKEditorError( 'view-writer-merge-containers-invalid-position: ' +
				'Element before and after given position cannot be merged.', this.document );
		}

		const lastChild = prev.getChild( prev.childCount - 1 );
		const newPosition = lastChild instanceof Text ? Position._createAt( lastChild, 'end' ) : Position._createAt( prev, 'end' );

		this.move( Range._createIn( next ), Position._createAt( prev, 'end' ) );
		this.remove( Range._createOn( next ) );

		return newPosition;
	}

	/**
	 * Insert node or nodes at specified position. Takes care about breaking attributes before insertion
	 * and merging them afterwards.
	 *
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-writer-insert-invalid-node` when nodes to insert
	 * contains instances that are not {@link module:engine/view/text~Text Texts},
	 * {@link module:engine/view/attributeelement~AttributeElement AttributeElements},
	 * {@link module:engine/view/containerelement~ContainerElement ContainerElements},
	 * {@link module:engine/view/emptyelement~EmptyElement EmptyElements} or
	 * {@link module:engine/view/uielement~UIElement UIElements}.
	 *
	 * @param {module:engine/view/position~Position} position Insertion position.
	 * @param {module:engine/view/text~Text|module:engine/view/attributeelement~AttributeElement|
	 * module:engine/view/containerelement~ContainerElement|module:engine/view/emptyelement~EmptyElement|
	 * module:engine/view/uielement~UIElement|Iterable.<module:engine/view/text~Text|
	 * module:engine/view/attributeelement~AttributeElement|module:engine/view/containerelement~ContainerElement|
	 * module:engine/view/emptyelement~EmptyElement|module:engine/view/uielement~UIElement>} nodes Node or nodes to insert.
	 * @returns {module:engine/view/range~Range} Range around inserted nodes.
	 */
	insert( position, nodes ) {
		nodes = isIterable( nodes ) ? [ ...nodes ] : [ nodes ];

		// Check if nodes to insert are instances of AttributeElements, ContainerElements, EmptyElements, UIElements or Text.
		validateNodesToInsert( nodes, this.document );

		const container = getParentContainer( position );

		if ( !container ) {
			/**
			 * Position's parent container cannot be found.
			 *
			 * @error view-writer-invalid-position-container
			 */
			throw new CKEditorError( 'view-writer-invalid-position-container', this.document );
		}

		const insertionPosition = this._breakAttributes( position, true );
		const length = container._insertChild( insertionPosition.offset, nodes );

		for ( const node of nodes ) {
			this._addToClonedElementsGroup( node );
		}

		const endPosition = insertionPosition.getShiftedBy( length );
		const start = this.mergeAttributes( insertionPosition );

		// When no nodes were inserted - return collapsed range.
		if ( length === 0 ) {
			return new Range( start, start );
		} else {
			// If start position was merged - move end position.
			if ( !start.isEqual( insertionPosition ) ) {
				endPosition.offset--;
			}

			const end = this.mergeAttributes( endPosition );

			return new Range( start, end );
		}
	}

	/**
	 * Removes provided range from the container.
	 *
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-writer-invalid-range-container` when
	 * {@link module:engine/view/range~Range#start start} and {@link module:engine/view/range~Range#end end} positions are not placed inside
	 * same parent container.
	 *
	 * @param {module:engine/view/range~Range|module:engine/view/item~Item} rangeOrItem Range to remove from container
	 * or an {@link module:engine/view/item~Item item} to remove. If range is provided, after removing, it will be updated
	 * to a collapsed range showing the new position.
	 * @returns {module:engine/view/documentfragment~DocumentFragment} Document fragment containing removed nodes.
	 */
	remove( rangeOrItem ) {
		const range = rangeOrItem instanceof Range ? rangeOrItem : Range._createOn( rangeOrItem );

		validateRangeContainer( range, this.document );

		// If range is collapsed - nothing to remove.
		if ( range.isCollapsed ) {
			return new DocumentFragment();
		}

		// Break attributes at range start and end.
		const { start: breakStart, end: breakEnd } = this._breakAttributesRange( range, true );
		const parentContainer = breakStart.parent;

		const count = breakEnd.offset - breakStart.offset;

		// Remove nodes in range.
		const removed = parentContainer._removeChildren( breakStart.offset, count );

		for ( const node of removed ) {
			this._removeFromClonedElementsGroup( node );
		}

		// Merge after removing.
		const mergePosition = this.mergeAttributes( breakStart );
		range.start = mergePosition;
		range.end = mergePosition.clone();

		// Return removed nodes.
		return new DocumentFragment( removed );
	}

	/**
	 * Removes matching elements from given range.
	 *
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-writer-invalid-range-container` when
	 * {@link module:engine/view/range~Range#start start} and {@link module:engine/view/range~Range#end end} positions are not placed inside
	 * same parent container.
	 *
	 * @param {module:engine/view/range~Range} range Range to clear.
	 * @param {module:engine/view/element~Element} element Element to remove.
	 */
	clear( range, element ) {
		validateRangeContainer( range, this.document );

		// Create walker on given range.
		// We walk backward because when we remove element during walk it modifies range end position.
		const walker = range.getWalker( {
			direction: 'backward',
			ignoreElementEnd: true
		} );

		// Let's walk.
		for ( const current of walker ) {
			const item = current.item;
			let rangeToRemove;

			// When current item matches to the given element.
			if ( item.is( 'element' ) && element.isSimilar( item ) ) {
				// Create range on this element.
				rangeToRemove = Range._createOn( item );
				// When range starts inside Text or TextProxy element.
			} else if ( !current.nextPosition.isAfter( range.start ) && item.is( 'textProxy' ) ) {
				// We need to check if parent of this text matches to given element.
				const parentElement = item.getAncestors().find( ancestor => {
					return ancestor.is( 'element' ) && element.isSimilar( ancestor );
				} );

				// If it is then create range inside this element.
				if ( parentElement ) {
					rangeToRemove = Range._createIn( parentElement );
				}
			}

			// If we have found element to remove.
			if ( rangeToRemove ) {
				// We need to check if element range stick out of the given range and truncate if it is.
				if ( rangeToRemove.end.isAfter( range.end ) ) {
					rangeToRemove.end = range.end;
				}

				if ( rangeToRemove.start.isBefore( range.start ) ) {
					rangeToRemove.start = range.start;
				}

				// At the end we remove range with found element.
				this.remove( rangeToRemove );
			}
		}
	}

	/**
	 * Moves nodes from provided range to target position.
	 *
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-writer-invalid-range-container` when
	 * {@link module:engine/view/range~Range#start start} and {@link module:engine/view/range~Range#end end} positions are not placed inside
	 * same parent container.
	 *
	 * @param {module:engine/view/range~Range} sourceRange Range containing nodes to move.
	 * @param {module:engine/view/position~Position} targetPosition Position to insert.
	 * @returns {module:engine/view/range~Range} Range in target container. Inserted nodes are placed between
	 * {@link module:engine/view/range~Range#start start} and {@link module:engine/view/range~Range#end end} positions.
	 */
	move( sourceRange, targetPosition ) {
		let nodes;

		if ( targetPosition.isAfter( sourceRange.end ) ) {
			targetPosition = this._breakAttributes( targetPosition, true );

			const parent = targetPosition.parent;
			const countBefore = parent.childCount;

			sourceRange = this._breakAttributesRange( sourceRange, true );

			nodes = this.remove( sourceRange );

			targetPosition.offset += ( parent.childCount - countBefore );
		} else {
			nodes = this.remove( sourceRange );
		}

		return this.insert( targetPosition, nodes );
	}

	/**
     * Wraps elements within range with provided {@link module:engine/view/attributeelement~AttributeElement AttributeElement}.
     * If a collapsed range is provided, it will be wrapped only if it is equal to view selection.
     *
     * If a collapsed range was passed and is same as selection, the selection
     * will be moved to the inside of the wrapped attribute element.
     *
     * Throws {@link module:utils/ckeditorerror~CKEditorError} `view-writer-invalid-range-container`
     * when {@link module:engine/view/range~Range#start}
     * and {@link module:engine/view/range~Range#end} positions are not placed inside same parent container.
     *
     * Throws {@link module:utils/ckeditorerror~CKEditorError} `view-writer-wrap-invalid-attribute` when passed attribute element is not
     * an instance of {@link module:engine/view/attributeelement~AttributeElement AttributeElement}.
     *
     * Throws {@link module:utils/ckeditorerror~CKEditorError} `view-writer-wrap-nonselection-collapsed-range` when passed range
     * is collapsed and different than view selection.
     *
     * @param {module:engine/view/range~Range} range Range to wrap.
     * @param {module:engine/view/attributeelement~AttributeElement} attribute Attribute element to use as wrapper.
     * @returns {module:engine/view/range~Range} range Range after wrapping, spanning over wrapping attribute element.
    */
	wrap( range, attribute ) {
		if ( !( attribute instanceof AttributeElement ) ) {
			throw new CKEditorError( 'view-writer-wrap-invalid-attribute', this.document );
		}

		validateRangeContainer( range, this.document );

		if ( !range.isCollapsed ) {
			// Non-collapsed range. Wrap it with the attribute element.
			return this._wrapRange( range, attribute );
		} else {
			// Collapsed range. Wrap position.
			let position = range.start;

			if ( position.parent.is( 'element' ) && !_hasNonUiChildren( position.parent ) ) {
				position = position.getLastMatchingPosition( value => value.item.is( 'uiElement' ) );
			}

			position = this._wrapPosition( position, attribute );
			const viewSelection = this.document.selection;

			// If wrapping position is equal to view selection, move view selection inside wrapping attribute element.
			if ( viewSelection.isCollapsed && viewSelection.getFirstPosition().isEqual( range.start ) ) {
				this.setSelection( position );
			}

			return new Range( position );
		}
	}

	/**
	 * Unwraps nodes within provided range from attribute element.
	 *
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-writer-invalid-range-container` when
	 * {@link module:engine/view/range~Range#start start} and {@link module:engine/view/range~Range#end end} positions are not placed inside
	 * same parent container.
	 *
	 * @param {module:engine/view/range~Range} range
	 * @param {module:engine/view/attributeelement~AttributeElement} attribute
	 */
	unwrap( range, attribute ) {
		if ( !( attribute instanceof AttributeElement ) ) {
			/**
			 * Attribute element need to be instance of attribute element.
			 *
			 * @error view-writer-unwrap-invalid-attribute
			 */
			throw new CKEditorError( 'view-writer-unwrap-invalid-attribute', this.document );
		}

		validateRangeContainer( range, this.document );

		// If range is collapsed - nothing to unwrap.
		if ( range.isCollapsed ) {
			return range;
		}

		// Break attributes at range start and end.
		const { start: breakStart, end: breakEnd } = this._breakAttributesRange( range, true );
		const parentContainer = breakStart.parent;

		// Unwrap children located between break points.
		const newRange = this._unwrapChildren( parentContainer, breakStart.offset, breakEnd.offset, attribute );

		// Merge attributes at the both ends and return a new range.
		const start = this.mergeAttributes( newRange.start );

		// If start position was merged - move end position back.
		if ( !start.isEqual( newRange.start ) ) {
			newRange.end.offset--;
		}

		const end = this.mergeAttributes( newRange.end );

		return new Range( start, end );
	}

	/**
	 * Renames element by creating a copy of renamed element but with changed name and then moving contents of the
	 * old element to the new one. Keep in mind that this will invalidate all {@link module:engine/view/position~Position positions} which
	 * has renamed element as {@link module:engine/view/position~Position#parent a parent}.
	 *
	 * New element has to be created because `Element#tagName` property in DOM is readonly.
	 *
	 * Since this function creates a new element and removes the given one, the new element is returned to keep reference.
	 *
	 * @param {String} newName New name for element.
	 * @param {module:engine/view/containerelement~ContainerElement} viewElement Element to be renamed.
	 */
	rename( newName, viewElement ) {
		const newElement = new ContainerElement( newName, viewElement.getAttributes() );

		this.insert( Position._createAfter( viewElement ), newElement );
		this.move( Range._createIn( viewElement ), Position._createAt( newElement, 0 ) );
		this.remove( Range._createOn( viewElement ) );

		return newElement;
	}

	/**
	 * Cleans up memory by removing obsolete cloned elements group from the writer.
	 *
	 * Should be used whenever all {@link module:engine/view/attributeelement~AttributeElement attribute elements}
	 * with the same {@link module:engine/view/attributeelement~AttributeElement#id id} are going to be removed from the view and
	 * the group will no longer be needed.
	 *
	 * Cloned elements group are not removed automatically in case if the group is still needed after all its elements
	 * were removed from the view.
	 *
	 * Keep in mind that group names are equal to the `id` property of the attribute element.
	 *
	 * @param {String} groupName Name of the group to clear.
	 */
	clearClonedElementsGroup( groupName ) {
		this._cloneGroups.delete( groupName );
	}

	/**
	 * Creates position at the given location. The location can be specified as:
	 *
	 * * a {@link module:engine/view/position~Position position},
	 * * parent element and offset (offset defaults to `0`),
	 * * parent element and `'end'` (sets position at the end of that element),
	 * * {@link module:engine/view/item~Item view item} and `'before'` or `'after'` (sets position before or after given view item).
	 *
	 * This method is a shortcut to other constructors such as:
	 *
	 * * {@link #createPositionBefore},
	 * * {@link #createPositionAfter},
	 *
	 * @param {module:engine/view/item~Item|module:engine/model/position~Position} itemOrPosition
	 * @param {Number|'end'|'before'|'after'} [offset] Offset or one of the flags. Used only when
	 * first parameter is a {@link module:engine/view/item~Item view item}.
	 */
	createPositionAt( itemOrPosition, offset ) {
		return Position._createAt( itemOrPosition, offset );
	}

	/**
	 * Creates a new position after given view item.
	 *
	 * @param {module:engine/view/item~Item} item View item after which the position should be located.
	 * @returns {module:engine/view/position~Position}
	 */
	createPositionAfter( item ) {
		return Position._createAfter( item );
	}

	/**
	 * Creates a new position before given view item.
	 *
	 * @param {module:engine/view/item~Item} item View item before which the position should be located.
	 * @returns {module:engine/view/position~Position}
	 */
	createPositionBefore( item ) {
		return Position._createBefore( item );
	}

	/**
	 * Creates a range spanning from `start` position to `end` position.
	 *
	 * **Note:** This factory method creates it's own {@link module:engine/view/position~Position} instances basing on passed values.
	 *
	 * @param {module:engine/view/position~Position} start Start position.
	 * @param {module:engine/view/position~Position} [end] End position. If not set, range will be collapsed at `start` position.
	 * @returns {module:engine/view/range~Range}
	 */
	createRange( start, end ) {
		return new Range( start, end );
	}

	/**
	 * Creates a range that starts before given {@link module:engine/view/item~Item view item} and ends after it.
	 *
	 * @param {module:engine/view/item~Item} item
	 * @returns {module:engine/view/range~Range}
	 */
	createRangeOn( item ) {
		return Range._createOn( item );
	}

	/**
	 * Creates a range inside an {@link module:engine/view/element~Element element} which starts before the first child of
	 * that element and ends after the last child of that element.
	 *
	 * @param {module:engine/view/element~Element} element Element which is a parent for the range.
	 * @returns {module:engine/view/range~Range}
	 */
	createRangeIn( element ) {
		return Range._createIn( element );
	}

	/**
	 Creates new {@link module:engine/view/selection~Selection} instance.
	 *
	 * 		// Creates empty selection without ranges.
	 *		const selection = writer.createSelection();
	 *
	 *		// Creates selection at the given range.
	 *		const range = writer.createRange( start, end );
	 *		const selection = writer.createSelection( range );
	 *
	 *		// Creates selection at the given ranges
	 * 		const ranges = [ writer.createRange( start1, end2 ), writer.createRange( star2, end2 ) ];
	 *		const selection = writer.createSelection( ranges );
	 *
	 *		// Creates selection from the other selection.
	 *		const otherSelection = writer.createSelection();
	 *		const selection = writer.createSelection( otherSelection );
	 *
	 *		// Creates selection from the document selection.
	 *		const selection = writer.createSelection( editor.editing.view.document.selection );
	 *
	 * 		// Creates selection at the given position.
	 *		const position = writer.createPositionFromPath( root, path );
	 *		const selection = writer.createSelection( position );
	 *
	 *		// Creates collapsed selection at the position of given item and offset.
	 *		const paragraph = writer.createContainerElement( 'paragraph' );
	 *		const selection = writer.createSelection( paragraph, offset );
	 *
	 *		// Creates a range inside an {@link module:engine/view/element~Element element} which starts before the
	 *		// first child of that element and ends after the last child of that element.
	 *		const selection = writer.createSelection( paragraph, 'in' );
	 *
	 *		// Creates a range on an {@link module:engine/view/item~Item item} which starts before the item and ends
	 *		// just after the item.
	 *		const selection = writer.createSelection( paragraph, 'on' );
	 *
	 * `Selection`'s constructor allow passing additional options (`backward`, `fake` and `label`) as the last argument.
	 *
	 *		// Creates backward selection.
	 *		const selection = writer.createSelection( range, { backward: true } );
	 *
	 * Fake selection does not render as browser native selection over selected elements and is hidden to the user.
	 * This way, no native selection UI artifacts are displayed to the user and selection over elements can be
	 * represented in other way, for example by applying proper CSS class.
	 *
	 * Additionally fake's selection label can be provided. It will be used to describe fake selection in DOM
	 * (and be  properly handled by screen readers).
	 *
	 *		// Creates fake selection with label.
	 *		const selection = writer.createSelection( range, { fake: true, label: 'foo' } );
	 *
	 * @param {module:engine/view/selection~Selectable} [selectable=null]
	 * @param {Number|'before'|'end'|'after'|'on'|'in'} [placeOrOffset] Offset or place when selectable is an `Item`.
	 * @param {Object} [options]
	 * @param {Boolean} [options.backward] Sets this selection instance to be backward.
	 * @param {Boolean} [options.fake] Sets this selection instance to be marked as `fake`.
	 * @param {String} [options.label] Label for the fake selection.
	 * @returns {module:engine/view/selection~Selection}
	 */
	createSelection( selectable, placeOrOffset, options ) {
		return new Selection( selectable, placeOrOffset, options );
	}

	/**
	 * Wraps children with provided `wrapElement`. Only children contained in `parent` element between
	 * `startOffset` and `endOffset` will be wrapped.
	 *
	 * @private
	 * @param {module:engine/view/element~Element} parent
	 * @param {Number} startOffset
	 * @param {Number} endOffset
	 * @param {module:engine/view/element~Element} wrapElement
	 */
	_wrapChildren( parent, startOffset, endOffset, wrapElement ) {
		let i = startOffset;
		const wrapPositions = [];

		while ( i < endOffset ) {
			const child = parent.getChild( i );
			const isText = child.is( 'text' );
			const isAttribute = child.is( 'attributeElement' );
			const isEmpty = child.is( 'emptyElement' );
			const isUI = child.is( 'uiElement' );

			//
			// (In all examples, assume that `wrapElement` is `<span class="foo">` element.)
			//
			// Check if `wrapElement` can be joined with the wrapped element. One of requirements is having same name.
			// If possible, join elements.
			//
			// <p><span class="bar">abc</span></p>  -->  <p><span class="foo bar">abc</span></p>
			//
			if ( isAttribute && this._wrapAttributeElement( wrapElement, child ) ) {
				wrapPositions.push( new Position( parent, i ) );
			}
			//
			// Wrap the child if it is not an attribute element or if it is an attribute element that should be inside
			// `wrapElement` (due to priority).
			//
			// <p>abc</p>                   -->  <p><span class="foo">abc</span></p>
			// <p><strong>abc</strong></p>  -->  <p><span class="foo"><strong>abc</strong></span></p>
			//
			else if ( isText || isEmpty || isUI || ( isAttribute && shouldABeOutsideB( wrapElement, child ) ) ) {
				// Clone attribute.
				const newAttribute = wrapElement._clone();

				// Wrap current node with new attribute.
				child._remove();
				newAttribute._appendChild( child );

				parent._insertChild( i, newAttribute );
				this._addToClonedElementsGroup( newAttribute );

				wrapPositions.push( new Position( parent, i ) );
			}
			//
			// If other nested attribute is found and it wasn't wrapped (see above), continue wrapping inside it.
			//
			// <p><a href="foo.html">abc</a></p>  -->  <p><a href="foo.html"><span class="foo">abc</span></a></p>
			//
			else if ( isAttribute ) {
				this._wrapChildren( child, 0, child.childCount, wrapElement );
			}

			i++;
		}

		// Merge at each wrap.
		let offsetChange = 0;

		for ( const position of wrapPositions ) {
			position.offset -= offsetChange;

			// Do not merge with elements outside selected children.
			if ( position.offset == startOffset ) {
				continue;
			}

			const newPosition = this.mergeAttributes( position );

			// If nodes were merged - other merge offsets will change.
			if ( !newPosition.isEqual( position ) ) {
				offsetChange++;
				endOffset--;
			}
		}

		return Range._createFromParentsAndOffsets( parent, startOffset, parent, endOffset );
	}

	/**
	 * Unwraps children from provided `unwrapElement`. Only children contained in `parent` element between
	 * `startOffset` and `endOffset` will be unwrapped.
	 *
	 * @private
	 * @param {module:engine/view/element~Element} parent
	 * @param {Number} startOffset
	 * @param {Number} endOffset
	 * @param {module:engine/view/element~Element} unwrapElement
	 */
	_unwrapChildren( parent, startOffset, endOffset, unwrapElement ) {
		let i = startOffset;
		const unwrapPositions = [];

		// Iterate over each element between provided offsets inside parent.
		// We don't use tree walker or range iterator because we will be removing and merging potentially multiple nodes,
		// so it could get messy. It is safer to it manually in this case.
		while ( i < endOffset ) {
			const child = parent.getChild( i );

			// Skip all text nodes. There should be no container element's here either.
			if ( !child.is( 'attributeElement' ) ) {
				i++;

				continue;
			}

			//
			// (In all examples, assume that `unwrapElement` is `<span class="foo">` element.)
			//
			// If the child is similar to the given attribute element, unwrap it - it will be completely removed.
			//
			// <p><span class="foo">abc</span>xyz</p>  -->  <p>abcxyz</p>
			//
			if ( child.isSimilar( unwrapElement ) ) {
				const unwrapped = child.getChildren();
				const count = child.childCount;

				// Replace wrapper element with its children
				child._remove();
				parent._insertChild( i, unwrapped );

				this._removeFromClonedElementsGroup( child );

				// Save start and end position of moved items.
				unwrapPositions.push(
					new Position( parent, i ),
					new Position( parent, i + count )
				);

				// Skip elements that were unwrapped. Assuming there won't be another element to unwrap in child elements.
				i += count;
				endOffset += count - 1;

				continue;
			}

			//
			// If the child is not similar but is an attribute element, try partial unwrapping - remove the same attributes/styles/classes.
			// Partial unwrapping will happen only if the elements have the same name.
			//
			// <p><span class="foo bar">abc</span>xyz</p>  -->  <p><span class="bar">abc</span>xyz</p>
			// <p><i class="foo">abc</i>xyz</p>            -->  <p><i class="foo">abc</i>xyz</p>
			//
			if ( this._unwrapAttributeElement( unwrapElement, child ) ) {
				unwrapPositions.push(
					new Position( parent, i ),
					new Position( parent, i + 1 )
				);

				i++;

				continue;
			}

			//
			// If other nested attribute is found, look through it's children for elements to unwrap.
			//
			// <p><i><span class="foo">abc</span></i><p>  -->  <p><i>abc</i><p>
			//
			this._unwrapChildren( child, 0, child.childCount, unwrapElement );

			i++;
		}

		// Merge at each unwrap.
		let offsetChange = 0;

		for ( const position of unwrapPositions ) {
			position.offset -= offsetChange;

			// Do not merge with elements outside selected children.
			if ( position.offset == startOffset || position.offset == endOffset ) {
				continue;
			}

			const newPosition = this.mergeAttributes( position );

			// If nodes were merged - other merge offsets will change.
			if ( !newPosition.isEqual( position ) ) {
				offsetChange++;
				endOffset--;
			}
		}

		return Range._createFromParentsAndOffsets( parent, startOffset, parent, endOffset );
	}

	/**
	 * Helper function for `view.writer.wrap`. Wraps range with provided attribute element.
	 * This method will also merge newly added attribute element with its siblings whenever possible.
	 *
	 * Throws {@link module:utils/ckeditorerror~CKEditorError} `view-writer-wrap-invalid-attribute` when passed attribute element is not
	 * an instance of {@link module:engine/view/attributeelement~AttributeElement AttributeElement}.
	 *
	 * @private
	 * @param {module:engine/view/range~Range} range
	 * @param {module:engine/view/attributeelement~AttributeElement} attribute
	 * @returns {module:engine/view/range~Range} New range after wrapping, spanning over wrapping attribute element.
	 */
	_wrapRange( range, attribute ) {
		// Break attributes at range start and end.
		const { start: breakStart, end: breakEnd } = this._breakAttributesRange( range, true );
		const parentContainer = breakStart.parent;

		// Wrap all children with attribute.
		const newRange = this._wrapChildren( parentContainer, breakStart.offset, breakEnd.offset, attribute );

		// Merge attributes at the both ends and return a new range.
		const start = this.mergeAttributes( newRange.start );

		// If start position was merged - move end position back.
		if ( !start.isEqual( newRange.start ) ) {
			newRange.end.offset--;
		}
		const end = this.mergeAttributes( newRange.end );

		return new Range( start, end );
	}

	/**
	 * Helper function for {@link #wrap}. Wraps position with provided attribute element.
	 * This method will also merge newly added attribute element with its siblings whenever possible.
	 *
	 * Throws {@link module:utils/ckeditorerror~CKEditorError} `view-writer-wrap-invalid-attribute` when passed attribute element is not
	 * an instance of {@link module:engine/view/attributeelement~AttributeElement AttributeElement}.
	 *
	 * @private
	 * @param {module:engine/view/position~Position} position
	 * @param {module:engine/view/attributeelement~AttributeElement} attribute
	 * @returns {module:engine/view/position~Position} New position after wrapping.
	 */
	_wrapPosition( position, attribute ) {
		// Return same position when trying to wrap with attribute similar to position parent.
		if ( attribute.isSimilar( position.parent ) ) {
			return movePositionToTextNode( position.clone() );
		}

		// When position is inside text node - break it and place new position between two text nodes.
		if ( position.parent.is( 'text' ) ) {
			position = breakTextNode( position );
		}

		// Create fake element that will represent position, and will not be merged with other attributes.
		const fakePosition = this.createAttributeElement();
		fakePosition._priority = Number.POSITIVE_INFINITY;
		fakePosition.isSimilar = () => false;

		// Insert fake element in position location.
		position.parent._insertChild( position.offset, fakePosition );

		// Range around inserted fake attribute element.
		const wrapRange = new Range( position, position.getShiftedBy( 1 ) );

		// Wrap fake element with attribute (it will also merge if possible).
		this.wrap( wrapRange, attribute );

		// Remove fake element and place new position there.
		const newPosition = new Position( fakePosition.parent, fakePosition.index );
		fakePosition._remove();

		// If position is placed between text nodes - merge them and return position inside.
		const nodeBefore = newPosition.nodeBefore;
		const nodeAfter = newPosition.nodeAfter;

		if ( nodeBefore instanceof Text && nodeAfter instanceof Text ) {
			return mergeTextNodes( nodeBefore, nodeAfter );
		}

		// If position is next to text node - move position inside.
		return movePositionToTextNode( newPosition );
	}

	/**
	 * 	Wraps one {@link module:engine/view/attributeelement~AttributeElement AttributeElement} into another by
	 * 	merging them if possible. When merging is possible - all attributes, styles and classes are moved from wrapper
	 * 	element to element being wrapped.
	 *
	 * 	@private
	 * 	@param {module:engine/view/attributeelement~AttributeElement} wrapper Wrapper AttributeElement.
	 * 	@param {module:engine/view/attributeelement~AttributeElement} toWrap AttributeElement to wrap using wrapper element.
	 * 	@returns {Boolean} Returns `true` if elements are merged.
	 */
	_wrapAttributeElement( wrapper, toWrap ) {
		if ( !canBeJoined( wrapper, toWrap ) ) {
			return false;
		}

		// Can't merge if name or priority differs.
		if ( wrapper.name !== toWrap.name || wrapper.priority !== toWrap.priority ) {
			return false;
		}

		// Check if attributes can be merged.
		for ( const key of wrapper.getAttributeKeys() ) {
			// Classes and styles should be checked separately.
			if ( key === 'class' || key === 'style' ) {
				continue;
			}

			// If some attributes are different we cannot wrap.
			if ( toWrap.hasAttribute( key ) && toWrap.getAttribute( key ) !== wrapper.getAttribute( key ) ) {
				return false;
			}
		}

		// Check if styles can be merged.
		for ( const key of wrapper.getStyleNames() ) {
			if ( toWrap.hasStyle( key ) && toWrap.getStyle( key ) !== wrapper.getStyle( key ) ) {
				return false;
			}
		}

		// Move all attributes/classes/styles from wrapper to wrapped AttributeElement.
		for ( const key of wrapper.getAttributeKeys() ) {
			// Classes and styles should be checked separately.
			if ( key === 'class' || key === 'style' ) {
				continue;
			}

			// Move only these attributes that are not present - other are similar.
			if ( !toWrap.hasAttribute( key ) ) {
				this.setAttribute( key, wrapper.getAttribute( key ), toWrap );
			}
		}

		for ( const key of wrapper.getStyleNames() ) {
			if ( !toWrap.hasStyle( key ) ) {
				this.setStyle( key, wrapper.getStyle( key ), toWrap );
			}
		}

		for ( const key of wrapper.getClassNames() ) {
			if ( !toWrap.hasClass( key ) ) {
				this.addClass( key, toWrap );
			}
		}

		return true;
	}

	/**
	 * Unwraps {@link module:engine/view/attributeelement~AttributeElement AttributeElement} from another by removing
	 * corresponding attributes, classes and styles. All attributes, classes and styles from wrapper should be present
	 * inside element being unwrapped.
	 *
	 * @private
	 * @param {module:engine/view/attributeelement~AttributeElement} wrapper Wrapper AttributeElement.
	 * @param {module:engine/view/attributeelement~AttributeElement} toUnwrap AttributeElement to unwrap using wrapper element.
	 * @returns {Boolean} Returns `true` if elements are unwrapped.
	 **/
	_unwrapAttributeElement( wrapper, toUnwrap ) {
		if ( !canBeJoined( wrapper, toUnwrap ) ) {
			return false;
		}

		// Can't unwrap if name or priority differs.
		if ( wrapper.name !== toUnwrap.name || wrapper.priority !== toUnwrap.priority ) {
			return false;
		}

		// Check if AttributeElement has all wrapper attributes.
		for ( const key of wrapper.getAttributeKeys() ) {
			// Classes and styles should be checked separately.
			if ( key === 'class' || key === 'style' ) {
				continue;
			}

			// If some attributes are missing or different we cannot unwrap.
			if ( !toUnwrap.hasAttribute( key ) || toUnwrap.getAttribute( key ) !== wrapper.getAttribute( key ) ) {
				return false;
			}
		}

		// Check if AttributeElement has all wrapper classes.
		if ( !toUnwrap.hasClass( ...wrapper.getClassNames() ) ) {
			return false;
		}

		// Check if AttributeElement has all wrapper styles.
		for ( const key of wrapper.getStyleNames() ) {
			// If some styles are missing or different we cannot unwrap.
			if ( !toUnwrap.hasStyle( key ) || toUnwrap.getStyle( key ) !== wrapper.getStyle( key ) ) {
				return false;
			}
		}

		// Remove all wrapper's attributes from unwrapped element.
		for ( const key of wrapper.getAttributeKeys() ) {
			// Classes and styles should be checked separately.
			if ( key === 'class' || key === 'style' ) {
				continue;
			}

			this.removeAttribute( key, toUnwrap );
		}

		// Remove all wrapper's classes from unwrapped element.
		this.removeClass( Array.from( wrapper.getClassNames() ), toUnwrap );

		// Remove all wrapper's styles from unwrapped element.
		this.removeStyle( Array.from( wrapper.getStyleNames() ), toUnwrap );

		return true;
	}

	/**
	 * Helper function used by other `DowncastWriter` methods. Breaks attribute elements at the boundaries of given range.
	 *
	 * @private
	 * @param {module:engine/view/range~Range} range Range which `start` and `end` positions will be used to break attributes.
	 * @param {Boolean} [forceSplitText=false] If set to `true`, will break text nodes even if they are directly in container element.
	 * This behavior will result in incorrect view state, but is needed by other view writing methods which then fixes view state.
	 * @returns {module:engine/view/range~Range} New range with located at break positions.
	 */
	_breakAttributesRange( range, forceSplitText = false ) {
		const rangeStart = range.start;
		const rangeEnd = range.end;

		validateRangeContainer( range, this.document );

		// Break at the collapsed position. Return new collapsed range.
		if ( range.isCollapsed ) {
			const position = this._breakAttributes( range.start, forceSplitText );

			return new Range( position, position );
		}

		const breakEnd = this._breakAttributes( rangeEnd, forceSplitText );
		const count = breakEnd.parent.childCount;
		const breakStart = this._breakAttributes( rangeStart, forceSplitText );

		// Calculate new break end offset.
		breakEnd.offset += breakEnd.parent.childCount - count;

		return new Range( breakStart, breakEnd );
	}

	/**
	 * Helper function used by other `DowncastWriter` methods. Breaks attribute elements at given position.
	 *
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-writer-cannot-break-empty-element` when break position
	 * is placed inside {@link module:engine/view/emptyelement~EmptyElement EmptyElement}.
	 *
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-writer-cannot-break-ui-element` when break position
	 * is placed inside {@link module:engine/view/uielement~UIElement UIElement}.
	 *
	 * @private
	 * @param {module:engine/view/position~Position} position Position where to break attributes.
	 * @param {Boolean} [forceSplitText=false] If set to `true`, will break text nodes even if they are directly in container element.
	 * This behavior will result in incorrect view state, but is needed by other view writing methods which then fixes view state.
	 * @returns {module:engine/view/position~Position} New position after breaking the attributes.
	 */
	_breakAttributes( position, forceSplitText = false ) {
		const positionOffset = position.offset;
		const positionParent = position.parent;

		// If position is placed inside EmptyElement - throw an exception as we cannot break inside.
		if ( position.parent.is( 'emptyElement' ) ) {
			/**
			 * Cannot break inside EmptyElement instance.
			 *
			 * @error view-writer-cannot-break-empty-element
			 */
			throw new CKEditorError( 'view-writer-cannot-break-empty-element', this.document );
		}

		// If position is placed inside UIElement - throw an exception as we cannot break inside.
		if ( position.parent.is( 'uiElement' ) ) {
			/**
			 * Cannot break inside UIElement instance.
			 *
			 * @error view-writer-cannot-break-ui-element
			 */
			throw new CKEditorError( 'view-writer-cannot-break-ui-element', this.document );
		}

		// There are no attributes to break and text nodes breaking is not forced.
		if ( !forceSplitText && positionParent.is( 'text' ) && isContainerOrFragment( positionParent.parent ) ) {
			return position.clone();
		}

		// Position's parent is container, so no attributes to break.
		if ( isContainerOrFragment( positionParent ) ) {
			return position.clone();
		}

		// Break text and start again in new position.
		if ( positionParent.is( 'text' ) ) {
			return this._breakAttributes( breakTextNode( position ), forceSplitText );
		}

		const length = positionParent.childCount;

		// <p>foo<b><u>bar{}</u></b></p>
		// <p>foo<b><u>bar</u>[]</b></p>
		// <p>foo<b><u>bar</u></b>[]</p>
		if ( positionOffset == length ) {
			const newPosition = new Position( positionParent.parent, positionParent.index + 1 );

			return this._breakAttributes( newPosition, forceSplitText );
		} else {
			// <p>foo<b><u>{}bar</u></b></p>
			// <p>foo<b>[]<u>bar</u></b></p>
			// <p>foo{}<b><u>bar</u></b></p>
			if ( positionOffset === 0 ) {
				const newPosition = new Position( positionParent.parent, positionParent.index );

				return this._breakAttributes( newPosition, forceSplitText );
			}
			// <p>foo<b><u>b{}ar</u></b></p>
			// <p>foo<b><u>b[]ar</u></b></p>
			// <p>foo<b><u>b</u>[]<u>ar</u></b></p>
			// <p>foo<b><u>b</u></b>[]<b><u>ar</u></b></p>
			else {
				const offsetAfter = positionParent.index + 1;

				// Break element.
				const clonedNode = positionParent._clone();

				// Insert cloned node to position's parent node.
				positionParent.parent._insertChild( offsetAfter, clonedNode );
				this._addToClonedElementsGroup( clonedNode );

				// Get nodes to move.
				const count = positionParent.childCount - positionOffset;
				const nodesToMove = positionParent._removeChildren( positionOffset, count );

				// Move nodes to cloned node.
				clonedNode._appendChild( nodesToMove );

				// Create new position to work on.
				const newPosition = new Position( positionParent.parent, offsetAfter );

				return this._breakAttributes( newPosition, forceSplitText );
			}
		}
	}

	/**
	 * Stores the information that an {@link module:engine/view/attributeelement~AttributeElement attribute element} was
	 * added to the tree. Saves the reference to the group in the given element and updates the group, so other elements
	 * from the group now keep a reference to the given attribute element.
	 *
	 * The clones group can be obtained using {@link module:engine/view/attributeelement~AttributeElement#getElementsWithSameId}.
	 *
	 * Does nothing if added element has no {@link module:engine/view/attributeelement~AttributeElement#id id}.
	 *
	 * @private
	 * @param {module:engine/view/attributeelement~AttributeElement} element Attribute element to save.
	 */
	_addToClonedElementsGroup( element ) {
		// Add only if the element is in document tree.
		if ( !element.root.is( 'rootElement' ) ) {
			return;
		}

		// Traverse the element's children recursively to find other attribute elements that also might got inserted.
		// The loop is at the beginning so we can make fast returns later in the code.
		if ( element.is( 'element' ) ) {
			for ( const child of element.getChildren() ) {
				this._addToClonedElementsGroup( child );
			}
		}

		const id = element.id;

		if ( !id ) {
			return;
		}

		let group = this._cloneGroups.get( id );

		if ( !group ) {
			group = new Set();
			this._cloneGroups.set( id, group );
		}

		group.add( element );
		element._clonesGroup = group;
	}

	/**
	 * Removes all the information about the given {@link module:engine/view/attributeelement~AttributeElement attribute element}
	 * from its clones group.
	 *
	 * Keep in mind, that the element will still keep a reference to the group (but the group will not keep a reference to it).
	 * This allows to reference the whole group even if the element was already removed from the tree.
	 *
	 * Does nothing if the element has no {@link module:engine/view/attributeelement~AttributeElement#id id}.
	 *
	 * @private
	 * @param {module:engine/view/attributeelement~AttributeElement} element Attribute element to remove.
	 */
	_removeFromClonedElementsGroup( element ) {
		// Traverse the element's children recursively to find other attribute elements that also got removed.
		// The loop is at the beginning so we can make fast returns later in the code.
		if ( element.is( 'element' ) ) {
			for ( const child of element.getChildren() ) {
				this._removeFromClonedElementsGroup( child );
			}
		}

		const id = element.id;

		if ( !id ) {
			return;
		}

		const group = this._cloneGroups.get( id );

		if ( !group ) {
			return;
		}

		group.delete( element );
		// Not removing group from element on purpose!
		// If other parts of code have reference to this element, they will be able to get references to other elements from the group.
	}
}

// Helper function for `view.writer.wrap`. Checks if given element has any children that are not ui elements.
function _hasNonUiChildren( parent ) {
	return Array.from( parent.getChildren() ).some( child => !child.is( 'uiElement' ) );
}

/**
 * Attribute element need to be instance of attribute element.
 *
 * @error view-writer-wrap-invalid-attribute
 */

// Returns first parent container of specified {@link module:engine/view/position~Position Position}.
// Position's parent node is checked as first, then next parents are checked.
// Note that {@link module:engine/view/documentfragment~DocumentFragment DocumentFragment} is treated like a container.
//
// @param {module:engine/view/position~Position} position Position used as a start point to locate parent container.
// @returns {module:engine/view/containerelement~ContainerElement|module:engine/view/documentfragment~DocumentFragment|undefined}
// Parent container element or `undefined` if container is not found.
function getParentContainer( position ) {
	let parent = position.parent;

	while ( !isContainerOrFragment( parent ) ) {
		if ( !parent ) {
			return undefined;
		}
		parent = parent.parent;
	}

	return parent;
}

// Checks if first {@link module:engine/view/attributeelement~AttributeElement AttributeElement} provided to the function
// can be wrapped otuside second element. It is done by comparing elements'
// {@link module:engine/view/attributeelement~AttributeElement#priority priorities}, if both have same priority
// {@link module:engine/view/element~Element#getIdentity identities} are compared.
//
// @param {module:engine/view/attributeelement~AttributeElement} a
// @param {module:engine/view/attributeelement~AttributeElement} b
// @returns {Boolean}
function shouldABeOutsideB( a, b ) {
	if ( a.priority < b.priority ) {
		return true;
	} else if ( a.priority > b.priority ) {
		return false;
	}

	// When priorities are equal and names are different - use identities.
	return a.getIdentity() < b.getIdentity();
}

// Returns new position that is moved to near text node. Returns same position if there is no text node before of after
// specified position.
//
//		<p>foo[]</p>  ->  <p>foo{}</p>
//		<p>[]foo</p>  ->  <p>{}foo</p>
//
// @param {module:engine/view/position~Position} position
// @returns {module:engine/view/position~Position} Position located inside text node or same position if there is no text nodes
// before or after position location.
function movePositionToTextNode( position ) {
	const nodeBefore = position.nodeBefore;

	if ( nodeBefore && nodeBefore.is( 'text' ) ) {
		return new Position( nodeBefore, nodeBefore.data.length );
	}

	const nodeAfter = position.nodeAfter;

	if ( nodeAfter && nodeAfter.is( 'text' ) ) {
		return new Position( nodeAfter, 0 );
	}

	return position;
}

// Breaks text node into two text nodes when possible.
//
//		<p>foo{}bar</p> -> <p>foo[]bar</p>
//		<p>{}foobar</p> -> <p>[]foobar</p>
//		<p>foobar{}</p> -> <p>foobar[]</p>
//
// @param {module:engine/view/position~Position} position Position that need to be placed inside text node.
// @returns {module:engine/view/position~Position} New position after breaking text node.
function breakTextNode( position ) {
	if ( position.offset == position.parent.data.length ) {
		return new Position( position.parent.parent, position.parent.index + 1 );
	}

	if ( position.offset === 0 ) {
		return new Position( position.parent.parent, position.parent.index );
	}

	// Get part of the text that need to be moved.
	const textToMove = position.parent.data.slice( position.offset );

	// Leave rest of the text in position's parent.
	position.parent._data = position.parent.data.slice( 0, position.offset );

	// Insert new text node after position's parent text node.
	position.parent.parent._insertChild( position.parent.index + 1, new Text( textToMove ) );

	// Return new position between two newly created text nodes.
	return new Position( position.parent.parent, position.parent.index + 1 );
}

// Merges two text nodes into first node. Removes second node and returns merge position.
//
// @param {module:engine/view/text~Text} t1 First text node to merge. Data from second text node will be moved at the end of
// this text node.
// @param {module:engine/view/text~Text} t2 Second text node to merge. This node will be removed after merging.
// @returns {module:engine/view/position~Position} Position after merging text nodes.
function mergeTextNodes( t1, t2 ) {
	// Merge text data into first text node and remove second one.
	const nodeBeforeLength = t1.data.length;
	t1._data += t2.data;
	t2._remove();

	return new Position( t1, nodeBeforeLength );
}

// Checks if provided nodes are valid to insert. Checks if each node is an instance of
// {@link module:engine/view/text~Text Text} or {@link module:engine/view/attributeelement~AttributeElement AttributeElement},
// {@link module:engine/view/containerelement~ContainerElement ContainerElement},
// {@link module:engine/view/emptyelement~EmptyElement EmptyElement} or
// {@link module:engine/view/uielement~UIElement UIElement}.
//
// Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-writer-insert-invalid-node` when nodes to insert
// contains instances that are not {@link module:engine/view/text~Text Texts},
// {@link module:engine/view/emptyelement~EmptyElement EmptyElements},
// {@link module:engine/view/uielement~UIElement UIElements},
// {@link module:engine/view/attributeelement~AttributeElement AttributeElements} or
// {@link module:engine/view/containerelement~ContainerElement ContainerElements}.
//
// @param Iterable.<module:engine/view/text~Text|module:engine/view/attributeelement~AttributeElement
// |module:engine/view/containerelement~ContainerElement> nodes
// @param {Object} errorContext
function validateNodesToInsert( nodes, errorContext ) {
	for ( const node of nodes ) {
		if ( !validNodesToInsert.some( ( validNode => node instanceof validNode ) ) ) { // eslint-disable-line no-use-before-define
			/**
			 * Inserted nodes should be valid to insert. of {@link module:engine/view/attributeelement~AttributeElement AttributeElement},
			 * {@link module:engine/view/containerelement~ContainerElement ContainerElement},
			 * {@link module:engine/view/emptyelement~EmptyElement EmptyElement},
			 * {@link module:engine/view/uielement~UIElement UIElement}, {@link module:engine/view/text~Text Text}.
			 *
			 * @error view-writer-insert-invalid-node
			 */
			throw new CKEditorError( 'view-writer-insert-invalid-node', errorContext );
		}

		if ( !node.is( 'text' ) ) {
			validateNodesToInsert( node.getChildren(), errorContext );
		}
	}
}

const validNodesToInsert = [ Text, AttributeElement, ContainerElement, EmptyElement, UIElement ];

// Checks if node is ContainerElement or DocumentFragment, because in most cases they should be treated the same way.
//
// @param {module:engine/view/node~Node} node
// @returns {Boolean} Returns `true` if node is instance of ContainerElement or DocumentFragment.
function isContainerOrFragment( node ) {
	return node && ( node.is( 'containerElement' ) || node.is( 'documentFragment' ) );
}

// Checks if {@link module:engine/view/range~Range#start range start} and {@link module:engine/view/range~Range#end range end} are placed
// inside same {@link module:engine/view/containerelement~ContainerElement container element}.
// Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-writer-invalid-range-container` when validation fails.
//
// @param {module:engine/view/range~Range} range
// @param {Object} errorContext
function validateRangeContainer( range, errorContext ) {
	const startContainer = getParentContainer( range.start );
	const endContainer = getParentContainer( range.end );

	if ( !startContainer || !endContainer || startContainer !== endContainer ) {
		/**
		 * Range container is invalid. This can happen if {@link module:engine/view/range~Range#start range start} and
		 * {@link module:engine/view/range~Range#end range end} positions are not placed inside same container or
		 * parent container for these positions cannot be found.
		 *
		 * @error view-writer-invalid-range-container
		 */

		throw new CKEditorError( 'view-writer-invalid-range-container', errorContext );
	}
}

// Checks if two attribute elements can be joined together. Elements can be joined together if, and only if
// they do not have ids specified.
//
// @private
// @param {module:engine/view/element~Element} a
// @param {module:engine/view/element~Element} b
// @returns {Boolean}
function canBeJoined( a, b ) {
	return a.id === null && b.id === null;
}
