/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/view/upcastwriter
 */

import DocumentFragment from './documentfragment.js';
import Element, { type ElementAttributes } from './element.js';
import Text from './text.js';
import { isPlainObject } from 'es-toolkit/compat';
import Position, { type PositionOffset } from './position.js';
import Range from './range.js';
import Selection, {
	type PlaceOrOffset,
	type Selectable,
	type SelectionOptions
} from './selection.js';

import type Document from './document.js';
import type Item from './item.js';
import type Node from './node.js';

/**
 * View upcast writer. It provides a set of methods used to manipulate non-semantic view trees.
 *
 * It should be used only while working on a non-semantic view
 * (e.g. a view created from HTML string on paste).
 * To manipulate a view which was or is being downcasted from the the model use the
 * {@link module:engine/view/downcastwriter~DowncastWriter downcast writer}.
 *
 * Read more about changing the view in the {@glink framework/architecture/editing-engine#changing-the-view Changing the view}
 * section of the {@glink framework/architecture/editing-engine Editing engine architecture} guide.
 *
 * Unlike `DowncastWriter`, which is available in the {@link module:engine/view/view~View#change `View#change()`} block,
 * `UpcastWriter` can be created wherever you need it:
 *
 * ```ts
 * const writer = new UpcastWriter( viewDocument );
 * const text = writer.createText( 'foo!' );
 *
 * writer.appendChild( text, someViewElement );
 * ```
 */
export default class UpcastWriter {
	/**
	 * The view document instance in which this upcast writer operates.
	 */
	public readonly document: Document;

	/**
	 * @param document The view document instance in which this upcast writer operates.
	 */
	constructor( document: Document ) {
		this.document = document;
	}

	/**
	 * Creates a new {@link module:engine/view/documentfragment~DocumentFragment} instance.
	 *
	 * @param children A list of nodes to be inserted into the created document fragment.
	 * @returns The created document fragment.
	 */
	public createDocumentFragment( children?: Node | Iterable<Node> ): DocumentFragment {
		return new DocumentFragment( this.document, children );
	}

	/**
	 * Creates a new {@link module:engine/view/element~Element} instance.
	 *
	 * Attributes can be passed in various formats:
	 *
	 * ```ts
	 * upcastWriter.createElement( 'div', { class: 'editor', contentEditable: 'true' } ); // object
	 * upcastWriter.createElement( 'div', [ [ 'class', 'editor' ], [ 'contentEditable', 'true' ] ] ); // map-like iterator
	 * upcastWriter.createElement( 'div', mapOfAttributes ); // map
	 * ```
	 *
	 * @param name Node name.
	 * @param attrs Collection of attributes.
	 * @param children A list of nodes to be inserted into created element.
	 * @returns Created element.
	 */
	public createElement(
		name: string,
		attrs?: ElementAttributes,
		children?: Node | Iterable<Node>
	): Element {
		return new Element( this.document, name, attrs, children );
	}

	/**
	 * Creates a new {@link module:engine/view/text~Text} instance.
	 *
	 * @param data The text's data.
	 * @returns The created text node.
	 */
	public createText( data: string ): Text {
		return new Text( this.document, data );
	}

	/**
	 * Clones the provided element.
	 *
	 * @see module:engine/view/element~Element#_clone
	 * @param element Element to be cloned.
	 * @param deep If set to `true` clones element and all its children recursively. When set to `false`,
	 * element will be cloned without any children.
	 * @returns Clone of this element.
	 */
	public clone( element: Element, deep: boolean = false ): Element {
		return element._clone( deep );
	}

	/**
	 * Appends a child node or a list of child nodes at the end of this node
	 * and sets the parent of these nodes to this element.
	 *
	 * @see module:engine/view/element~Element#_appendChild
	 * @param items Items to be inserted.
	 * @param element Element to which items will be appended.
	 * @returns Number of appended nodes.
	 */
	public appendChild( items: Item | string | Iterable<Item | string>, element: Element | DocumentFragment ): number {
		return element._appendChild( items );
	}

	/**
	 * Inserts a child node or a list of child nodes on the given index and sets the parent of these nodes to
	 * this element.
	 *
	 * @see module:engine/view/element~Element#_insertChild
	 * @param index Offset at which nodes should be inserted.
	 * @param items Items to be inserted.
	 * @param element Element to which items will be inserted.
	 * @returns Number of inserted nodes.
	 */
	public insertChild( index: number, items: Item | Iterable<Item>, element: Element | DocumentFragment ): number {
		return element._insertChild( index, items );
	}

	/**
	 * Removes the given number of child nodes starting at the given index and set the parent of these nodes to `null`.
	 *
	 * @see module:engine/view/element~Element#_removeChildren
	 * @param index Offset from which nodes will be removed.
	 * @param howMany Number of nodes to remove.
	 * @param element Element which children will be removed.
	 * @returns The array containing removed nodes.
	 */
	public removeChildren( index: number, howMany: number, element: Element | DocumentFragment ): Array<Node> {
		return element._removeChildren( index, howMany );
	}

	/**
	 * Removes given element from the view structure. Will not have effect on detached elements.
	 *
	 * @param element Element which will be removed.
	 * @returns The array containing removed nodes.
	 */
	public remove( element: Node ): Array<Node> {
		const parent = element.parent;

		if ( parent ) {
			return this.removeChildren( parent.getChildIndex( element ), 1, parent );
		}

		return [];
	}

	/**
	 * Replaces given element with the new one in the view structure. Will not have effect on detached elements.
	 *
	 * @param oldElement Element which will be replaced.
	 * @param newElement Element which will be inserted in the place of the old element.
	 * @returns Whether old element was successfully replaced.
	 */
	public replace( oldElement: Element, newElement: Element ): boolean {
		const parent = oldElement.parent;

		if ( parent ) {
			const index = parent.getChildIndex( oldElement )!;

			this.removeChildren( index, 1, parent );
			this.insertChild( index, newElement, parent );

			return true;
		}

		return false;
	}

	/**
	 * Removes given element from view structure and places its children in its position.
	 * It does nothing if element has no parent.
	 *
	 * @param element Element to unwrap.
	 */
	public unwrapElement( element: Element ): void {
		const parent = element.parent;

		if ( parent ) {
			const index = parent.getChildIndex( element )!;

			this.remove( element );
			this.insertChild( index, element.getChildren(), parent );
		}
	}

	/**
	 * Renames element by creating a copy of a given element but with its name changed and then moving contents of the
	 * old element to the new one.
	 *
	 * Since this function creates a new element and removes the given one, the new element is returned to keep reference.
	 *
	 * @param newName New element name.
	 * @param  element Element to be renamed.
	 * @returns New element or null if the old element was not replaced (happens for detached elements).
	 */
	public rename( newName: string, element: Element ): Element | null {
		const newElement = new Element( this.document, newName, element.getAttributes(), element.getChildren() );

		return this.replace( element, newElement ) ? newElement : null;
	}

	/**
	 * Adds or overwrites element's attribute with a specified key and value.
	 *
	 * ```ts
	 * writer.setAttribute( 'href', 'http://ckeditor.com', linkElement );
	 * ```
	 *
	 * @see module:engine/view/element~Element#_setAttribute
	 * @param key Attribute key.
	 * @param value Attribute value.
	 * @param element Element for which attribute will be set.
	 */
	public setAttribute( key: string, value: unknown, element: Element ): void {
		element._setAttribute( key, value );
	}

	/**
	 * Removes attribute from the element.
	 *
	 * ```ts
	 * writer.removeAttribute( 'href', linkElement );
	 * ```
	 *
	 * @see module:engine/view/element~Element#_removeAttribute
	 * @param key Attribute key.
	 * @param element Element from which attribute will be removed.
	 */
	public removeAttribute( key: string, element: Element ): void {
		element._removeAttribute( key );
	}

	/**
	 * Adds specified class to the element.
	 *
	 * ```ts
	 * writer.addClass( 'foo', linkElement );
	 * writer.addClass( [ 'foo', 'bar' ], linkElement );
	 * ```
	 *
	 * @see module:engine/view/element~Element#_addClass
	 * @param className Single class name or array of class names which will be added.
	 * @param element Element for which class will be added.
	 */
	public addClass( className: string | Array<string>, element: Element ): void {
		element._addClass( className );
	}

	/**
	 * Removes specified class from the element.
	 *
	 * ```ts
	 * writer.removeClass( 'foo', linkElement );
	 * writer.removeClass( [ 'foo', 'bar' ], linkElement );
	 * ```
	 *
	 * @see module:engine/view/element~Element#_removeClass
	 * @param className Single class name or array of class names which will be removed.
	 * @param element Element from which class will be removed.
	 */
	public removeClass( className: string | Array<string>, element: Element ): void {
		element._removeClass( className );
	}

	/**
	 * Adds style to the element.
	 *
	 * ```ts
	 * writer.setStyle( 'color', 'red', element );
	 * ```
	 *
	 * **Note**: This method can work with normalized style names if
	 * {@link module:engine/controller/datacontroller~DataController#addStyleProcessorRules a particular style processor rule is enabled}.
	 * See {@link module:engine/view/stylesmap~StylesMap#set `StylesMap#set()`} for details.
	 *
	 * @see module:engine/view/element~Element#_setStyle
	 * @label KEY_VALUE
	 * @param property Property name.
	 * @param value Value to set.
	 * @param element Element for which style will be added.
	 */
	public setStyle( property: string, value: string, element: Element ): void;

	/**
	 * Adds style to the element.
	 *
	 * ```ts
	 * writer.setStyle( {
	 * 	color: 'red',
	 * 	position: 'fixed'
	 * }, element );
	 * ```
	 *
	 * **Note**: This method can work with normalized style names if
	 * {@link module:engine/controller/datacontroller~DataController#addStyleProcessorRules a particular style processor rule is enabled}.
	 * See {@link module:engine/view/stylesmap~StylesMap#set `StylesMap#set()`} for details.
	 *
	 * @see module:engine/view/element~Element#_setStyle
	 * @label OBJECT
	 * @param properties Object with key - value pairs.
	 * @param element Element for which style will be added.
	 */
	public setStyle( properties: Record<string, string>, element: Element ): void;

	public setStyle( property: string | Record<string, string>, valueOrElement: string | Element, element?: Element ): void {
		if ( isPlainObject( property ) && element === undefined ) {
			( valueOrElement as Element )._setStyle( property as Record<string, string> );
		} else {
			element!._setStyle( property as string, valueOrElement as string );
		}
	}

	/**
	 * Removes specified style from the element.
	 *
	 * ```ts
	 * writer.removeStyle( 'color', element );  // Removes 'color' style.
	 * writer.removeStyle( [ 'color', 'border-top' ], element ); // Removes both 'color' and 'border-top' styles.
	 * ```
	 *
	 * **Note**: This method can work with normalized style names if
	 * {@link module:engine/controller/datacontroller~DataController#addStyleProcessorRules a particular style processor rule is enabled}.
	 * See {@link module:engine/view/stylesmap~StylesMap#remove `StylesMap#remove()`} for details.
	 *
	 * @see module:engine/view/element~Element#_removeStyle
	 * @param property Style property name or names to be removed.
	 * @param element Element from which style will be removed.
	 */
	public removeStyle( property: string | Array<string>, element: Element ): void {
		element._removeStyle( property );
	}

	/**
	 * Sets a custom property on element. Unlike attributes, custom properties are not rendered to the DOM,
	 * so they can be used to add special data to elements.
	 *
	 * @see module:engine/view/element~Element#_setCustomProperty
	 * @param key Custom property name/key.
	 * @param value Custom property value to be stored.
	 * @param element Element for which custom property will be set.
	 */
	public setCustomProperty( key: string | symbol, value: unknown, element: Element | DocumentFragment ): void {
		element._setCustomProperty( key, value );
	}

	/**
	 * Removes a custom property stored under the given key.
	 *
	 * @see module:engine/view/element~Element#_removeCustomProperty
	 * @param key Name/key of the custom property to be removed.
	 * @param element Element from which the custom property will be removed.
	 * @returns Returns true if property was removed.
	 */
	public removeCustomProperty( key: string | symbol, element: Element | DocumentFragment ): boolean {
		return element._removeCustomProperty( key );
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
	 * @param offset Offset or one of the flags. Used only when first parameter is a {@link module:engine/view/item~Item view item}.
	 */
	public createPositionAt( itemOrPosition: Item | Position, offset?: PositionOffset ): Position {
		return Position._createAt( itemOrPosition, offset );
	}

	/**
	 * Creates a new position after given view item.
	 *
	 * @param item View item after which the position should be located.
	 */
	public createPositionAfter( item: Item ): Position {
		return Position._createAfter( item );
	}

	/**
	 * Creates a new position before given view item.
	 *
	 * @param item View item before which the position should be located.
	 */
	public createPositionBefore( item: Item ): Position {
		return Position._createBefore( item );
	}

	/**
	 * Creates a range spanning from `start` position to `end` position.
	 *
	 * **Note:** This factory method creates it's own {@link module:engine/view/position~Position} instances basing on passed values.
	 *
	 * @param start Start position.
	 * @param end End position. If not set, range will be collapsed at `start` position.
	 */
	public createRange( start: Position, end: Position ): Range {
		return new Range( start, end );
	}

	/**
	 * Creates a range that starts before given {@link module:engine/view/item~Item view item} and ends after it.
	 */
	public createRangeOn( item: Item ): Range {
		return Range._createOn( item );
	}

	/**
	 * Creates a range inside an {@link module:engine/view/element~Element element} which starts before the first child of
	 * that element and ends after the last child of that element.
	 *
	 * @param element Element which is a parent for the range.
	 */
	public createRangeIn( element: Element | DocumentFragment ): Range {
		return Range._createIn( element );
	}

	/**
	 * Creates a new {@link module:engine/view/selection~Selection} instance.
	 *
	 * ```ts
	 * // Creates collapsed selection at the position of given item and offset.
	 * const paragraph = writer.createContainerElement( 'paragraph' );
	 * const selection = writer.createSelection( paragraph, offset );
	 *
	 * // Creates a range inside an {@link module:engine/view/element~Element element} which starts before the
	 * // first child of that element and ends after the last child of that element.
	 * const selection = writer.createSelection( paragraph, 'in' );
	 *
	 * // Creates a range on an {@link module:engine/view/item~Item item} which starts before the item and ends
	 * // just after the item.
	 * const selection = writer.createSelection( paragraph, 'on' );
	 * ```
	 *
	 * `Selection`'s constructor allow passing additional options (`backward`, `fake` and `label`) as the last argument.
	 *
	 * ```ts
	 * // Creates backward selection.
	 * const selection = writer.createSelection( element, 'in', { backward: true } );
	 * ```
	 *
	 * Fake selection does not render as browser native selection over selected elements and is hidden to the user.
	 * This way, no native selection UI artifacts are displayed to the user and selection over elements can be
	 * represented in other way, for example by applying proper CSS class.
	 *
	 * Additionally fake's selection label can be provided. It will be used to describe fake selection in DOM
	 * (and be  properly handled by screen readers).
	 *
	 * ```ts
	 * // Creates fake selection with label.
	 * const selection = writer.createSelection( element, 'in', { fake: true, label: 'foo' } );
	 * ```
	 *
	 * See also: {@link #createSelection:SELECTABLE `createSelection( selectable, options )`}.
	 *
	 * @label NODE_OFFSET
	 */
	public createSelection( selectable: Node, placeOrOffset: PlaceOrOffset, options?: SelectionOptions ): Selection;

	/**
	 * Creates a new {@link module:engine/view/selection~Selection} instance.
	 *
	 * ```ts
	 * // Creates empty selection without ranges.
	 * const selection = writer.createSelection();
	 *
	 * // Creates selection at the given range.
	 * const range = writer.createRange( start, end );
	 * const selection = writer.createSelection( range );
	 *
	 * // Creates selection at the given ranges
	 * const ranges = [ writer.createRange( start1, end2 ), writer.createRange( star2, end2 ) ];
	 * const selection = writer.createSelection( ranges );
	 *
	 * // Creates selection from the other selection.
	 * const otherSelection = writer.createSelection();
	 * const selection = writer.createSelection( otherSelection );
	 *
	 * // Creates selection from the document selection.
	 * const selection = writer.createSelection( editor.editing.view.document.selection );
	 *
	 * // Creates selection at the given position.
	 * const position = writer.createPositionFromPath( root, path );
	 * const selection = writer.createSelection( position );
	 * ```
	 *
	 * `Selection`'s constructor allow passing additional options (`backward`, `fake` and `label`) as the last argument.
	 *
	 * ```ts
	 * // Creates backward selection.
	 * const selection = writer.createSelection( range, { backward: true } );
	 * ```
	 *
	 * Fake selection does not render as browser native selection over selected elements and is hidden to the user.
	 * This way, no native selection UI artifacts are displayed to the user and selection over elements can be
	 * represented in other way, for example by applying proper CSS class.
	 *
	 * Additionally fake's selection label can be provided. It will be used to describe fake selection in DOM
	 * (and be  properly handled by screen readers).
	 *
	 * ```ts
	 * // Creates fake selection with label.
	 * const selection = writer.createSelection( range, { fake: true, label: 'foo' } );
	 * ```
	 *
	 * See also: {@link #createSelection:NODE_OFFSET `createSelection( node, placeOrOffset, options )`}.
	 *
	 * @label SELECTABLE
	 */
	public createSelection( selectable?: Exclude<Selectable, Node>, options?: SelectionOptions ): Selection;

	public createSelection( ...args: ConstructorParameters<typeof Selection> ): Selection {
		return new Selection( ...args );
	}
}
