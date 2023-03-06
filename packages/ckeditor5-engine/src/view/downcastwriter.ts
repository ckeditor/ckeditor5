/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/downcastwriter
 */

import Position, { type PositionOffset } from './position';
import Range from './range';
import Selection, {
	type PlaceOrOffset,
	type Selectable,
	type SelectionOptions
} from './selection';
import ContainerElement from './containerelement';
import AttributeElement from './attributeelement';
import EmptyElement from './emptyelement';
import UIElement from './uielement';
import RawElement from './rawelement';
import { CKEditorError, isIterable } from '@ckeditor/ckeditor5-utils';
import DocumentFragment from './documentfragment';
import Text from './text';
import EditableElement from './editableelement';
import { isPlainObject } from 'lodash-es';

import type Document from './document';
import type Node from './node';
import type { default as Element, ElementAttributes } from './element';
import type DomConverter from './domconverter';
import type Item from './item';
import type { SlotFilter } from '../conversion/downcasthelpers';

type DomDocument = globalThis.Document;
type DomElement = globalThis.HTMLElement;

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
 * Read more about changing the view in the {@glink framework/architecture/editing-engine#changing-the-view Changing the view}
 * section of the {@glink framework/architecture/editing-engine Editing engine architecture} guide.
 */
export default class DowncastWriter {
	/**
	 * The view document instance in which this writer operates.
	 */
	public readonly document: Document;

	/**
	 * Holds references to the attribute groups that share the same {@link module:engine/view/attributeelement~AttributeElement#id id}.
	 * The keys are `id`s, the values are `Set`s holding {@link module:engine/view/attributeelement~AttributeElement}s.
	 */
	private readonly _cloneGroups = new Map<string | number, Set<AttributeElement>>();

	/**
	 * The slot factory used by the `elementToStructure` downcast helper.
	 */
	private _slotFactory: ( ( writer: DowncastWriter, modeOrFilter: string | SlotFilter ) => Element ) | null = null;

	/**
	 * @param document The view document instance.
	 */
	constructor( document: Document ) {
		this.document = document;
	}

	/**
	 * Sets {@link module:engine/view/documentselection~DocumentSelection selection's} ranges and direction to the
	 * specified location based on the given {@link module:engine/view/selection~Selectable selectable}.
	 *
	 * Usage:
	 *
	 * ```ts
	 * // Sets collapsed selection at the position of given item and offset.
	 * const paragraph = writer.createContainerElement( 'p' );
	 * writer.setSelection( paragraph, offset );
	 * ```
	 *
	 * Creates a range inside an {@link module:engine/view/element~Element element} which starts before the first child of
	 * that element and ends after the last child of that element.
	 *
	 * ```ts
	 * writer.setSelection( paragraph, 'in' );
	 * ```
	 *
	 * Creates a range on the {@link module:engine/view/item~Item item} which starts before the item and ends just after the item.
	 *
	 * ```ts
	 * writer.setSelection( paragraph, 'on' );
	 * ```
	 *
	 * `DowncastWriter#setSelection()` allow passing additional options (`backward`, `fake` and `label`) as the last argument.
	 *
	 * ```ts
	 * // Sets selection as backward.
	 * writer.setSelection( element, 'in', { backward: true } );
	 *
	 * // Sets selection as fake.
	 * // Fake selection does not render as browser native selection over selected elements and is hidden to the user.
	 * // This way, no native selection UI artifacts are displayed to the user and selection over elements can be
	 * // represented in other way, for example by applying proper CSS class.
	 * writer.setSelection( element, 'in', { fake: true } );
	 *
	 * // Additionally fake's selection label can be provided. It will be used to describe fake selection in DOM
	 * // (and be  properly handled by screen readers).
	 * writer.setSelection( element, 'in', { fake: true, label: 'foo' } );
	 * ```
	 *
	 * See also: {@link #setSelection:SELECTABLE `setSelection( selectable, options )`}.
	 *
	 * @label NODE_OFFSET
	 */
	public setSelection( selectable: Node, placeOrOffset: PlaceOrOffset, options?: SelectionOptions ): void;

	/**
	 * Sets {@link module:engine/view/documentselection~DocumentSelection selection's} ranges and direction to the
	 * specified location based on the given {@link module:engine/view/selection~Selectable selectable}.
	 *
	 * Usage:
	 *
	 * ```ts
	 * // Sets selection to the given range.
	 * const range = writer.createRange( start, end );
	 * writer.setSelection( range );
	 *
	 * // Sets backward selection to the given range.
	 * const range = writer.createRange( start, end );
	 * writer.setSelection( range );
	 *
	 * // Sets selection to given ranges.
	 * const ranges = [ writer.createRange( start1, end2 ), writer.createRange( start2, end2 ) ];
	 * writer.setSelection( range );
	 *
	 * // Sets selection to the other selection.
	 * const otherSelection = writer.createSelection();
	 * writer.setSelection( otherSelection );
	 *
	 * // Sets collapsed selection at the given position.
	 * const position = writer.createPositionFromPath( root, path );
	 * writer.setSelection( position );
	 *
	 * // Removes all ranges.
	 * writer.setSelection( null );
	 * ```
	 *
	 * `DowncastWriter#setSelection()` allow passing additional options (`backward`, `fake` and `label`) as the last argument.
	 *
	 * ```ts
	 * // Sets selection as backward.
	 * writer.setSelection( range, { backward: true } );
	 *
	 * // Sets selection as fake.
	 * // Fake selection does not render as browser native selection over selected elements and is hidden to the user.
	 * // This way, no native selection UI artifacts are displayed to the user and selection over elements can be
	 * // represented in other way, for example by applying proper CSS class.
	 * writer.setSelection( range, { fake: true } );
	 *
	 * // Additionally fake's selection label can be provided. It will be used to describe fake selection in DOM
	 * // (and be  properly handled by screen readers).
	 * writer.setSelection( range, { fake: true, label: 'foo' } );
	 * ```
	 *
	 * See also: {@link #setSelection:NODE_OFFSET `setSelection( node, placeOrOffset, options )`}.
	 *
	 * @label SELECTABLE
	 */
	public setSelection( selectable: Exclude<Selectable, Node>, options?: SelectionOptions ): void;

	public setSelection( ...args: Parameters<Selection[ 'setTo' ]> ): void {
		this.document.selection._setTo( ...args );
	}

	/**
	 * Moves {@link module:engine/view/documentselection~DocumentSelection#focus selection's focus} to the specified location.
	 *
	 * The location can be specified in the same form as {@link module:engine/view/view~View#createPositionAt view.createPositionAt()}
	 * parameters.
	 *
	 * @param Offset or one of the flags. Used only when the first parameter is a {@link module:engine/view/item~Item view item}.
	 */
	public setSelectionFocus( itemOrPosition: Item | Position, offset?: PositionOffset ): void {
		this.document.selection._setFocus( itemOrPosition, offset );
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
	 * Creates a new {@link module:engine/view/text~Text text node}.
	 *
	 * ```ts
	 * writer.createText( 'foo' );
	 * ```
	 *
	 * @param data The text's data.
	 * @returns The created text node.
	 */
	public createText( data: string ): Text {
		return new Text( this.document, data );
	}

	/**
	 * Creates a new {@link module:engine/view/attributeelement~AttributeElement}.
	 *
	 * ```ts
	 * writer.createAttributeElement( 'strong' );
	 * writer.createAttributeElement( 'a', { href: 'foo.bar' } );
	 *
	 * // Make `<a>` element contain other attributes element so the `<a>` element is not broken.
	 * writer.createAttributeElement( 'a', { href: 'foo.bar' }, { priority: 5 } );
	 *
	 * // Set `id` of a marker element so it is not joined or merged with "normal" elements.
	 * writer.createAttributeElement( 'span', { class: 'my-marker' }, { id: 'marker:my' } );
	 * ```
	 *
	 * @param name Name of the element.
	 * @param attributes Element's attributes.
	 * @param options Element's options.
	 * @param options.priority Element's {@link module:engine/view/attributeelement~AttributeElement#priority priority}.
	 * @param options.id Element's {@link module:engine/view/attributeelement~AttributeElement#id id}.
	 * @param options.renderUnsafeAttributes A list of attribute names that should be rendered in the editing
	 * pipeline even though they would normally be filtered out by unsafe attribute detection mechanisms.
	 * @returns Created element.
	 */
	public createAttributeElement(
		name: string,
		attributes?: ElementAttributes,
		options: {
			priority?: number;
			id?: number | string;
			renderUnsafeAttributes?: Array<string>;
		} = {}
	): AttributeElement {
		const attributeElement = new AttributeElement( this.document, name, attributes );

		if ( typeof options.priority === 'number' ) {
			attributeElement._priority = options.priority;
		}

		if ( options.id ) {
			attributeElement._id = options.id;
		}

		if ( options.renderUnsafeAttributes ) {
			attributeElement._unsafeAttributesToRender.push( ...options.renderUnsafeAttributes );
		}

		return attributeElement;
	}

	/**
	 * Creates a new {@link module:engine/view/containerelement~ContainerElement}.
	 *
	 * ```ts
	 * writer.createContainerElement( 'p' );
	 *
	 * // Create element with custom attributes.
	 * writer.createContainerElement( 'div', { id: 'foo-bar', 'data-baz': '123' } );
	 *
	 * // Create element with custom styles.
	 * writer.createContainerElement( 'p', { style: 'font-weight: bold; padding-bottom: 10px' } );
	 *
	 * // Create element with custom classes.
	 * writer.createContainerElement( 'p', { class: 'foo bar baz' } );
	 *
	 * // Create element with specific options.
	 * writer.createContainerElement( 'span', { class: 'placeholder' }, { renderUnsafeAttributes: [ 'foo' ] } );
	 * ```
	 *
	 * @label WITHOUT_CHILDREN
	 * @param name Name of the element.
	 * @param attributes Elements attributes.
	 * @param options Element's options.
	 * @param options.renderUnsafeAttributes A list of attribute names that should be rendered in the editing
	 * pipeline even though they would normally be filtered out by unsafe attribute detection mechanisms.
	 * @returns Created element.
	 */
	public createContainerElement(
		name: string,
		attributes?: ElementAttributes,
		options?: { renderUnsafeAttributes?: Array<string> }
	): ContainerElement;

	/**
	 * Creates a new {@link module:engine/view/containerelement~ContainerElement} with children.
	 *
	 * ```ts
	 * // Create element with children.
	 * writer.createContainerElement( 'figure', { class: 'image' }, [
	 * 	writer.createEmptyElement( 'img' ),
	 * 	writer.createContainerElement( 'figcaption' )
	 * ] );
	 *
	 * // Create element with specific options.
	 * writer.createContainerElement( 'figure', { class: 'image' }, [
	 * 	writer.createEmptyElement( 'img' ),
	 * 	writer.createContainerElement( 'figcaption' )
	 * ], { renderUnsafeAttributes: [ 'foo' ] } );
	 * ```
	 *
	 * @label WITH_CHILDREN
	 * @param name Name of the element.
	 * @param attributes Elements attributes.
	 * @param children A node or a list of nodes to be inserted into the created element.
	 * If no children were specified, element's `options` can be passed in this argument.
	 * @param options Element's options.
	 * @param options.renderUnsafeAttributes A list of attribute names that should be rendered in the editing
	 * pipeline even though they would normally be filtered out by unsafe attribute detection mechanisms.
	 * @returns Created element.
	 */
	public createContainerElement(
		name: string,
		attributes: ElementAttributes,
		children: Node | Iterable<Node>,
		options?: { renderUnsafeAttributes?: Array<string> }
	): ContainerElement;

	public createContainerElement(
		name: string,
		attributes?: ElementAttributes,
		childrenOrOptions: Node | Iterable<Node> | { renderUnsafeAttributes?: Array<string> } = {},
		options: { renderUnsafeAttributes?: Array<string> } = {}
	): ContainerElement {
		let children = null;

		if ( isPlainObject( childrenOrOptions ) ) {
			options = childrenOrOptions as { renderUnsafeAttributes?: Array<string> };
		} else {
			children = childrenOrOptions;
		}

		const containerElement = new ContainerElement( this.document, name, attributes, children as Node | Iterable<Node> );

		if ( options.renderUnsafeAttributes ) {
			containerElement._unsafeAttributesToRender.push( ...options.renderUnsafeAttributes );
		}

		return containerElement;
	}

	/**
	 * Creates a new {@link module:engine/view/editableelement~EditableElement}.
	 *
	 * ```ts
	 * writer.createEditableElement( 'div' );
	 * writer.createEditableElement( 'div', { id: 'foo-1234' } );
	 * ```
	 *
	 * Note: The editable element is to be used in the editing pipeline. Usually, together with
	 * {@link module:widget/utils~toWidgetEditable `toWidgetEditable()`}.
	 *
	 * @param name Name of the element.
	 * @param attributes Elements attributes.
	 * @param options Element's options.
	 * @param options.renderUnsafeAttributes A list of attribute names that should be rendered in the editing
	 * pipeline even though they would normally be filtered out by unsafe attribute detection mechanisms.
	 * @returns Created element.
	 */
	public createEditableElement(
		name: string,
		attributes?: ElementAttributes,
		options: {
			renderUnsafeAttributes?: Array<string>;
		} = {}
	): EditableElement {
		const editableElement = new EditableElement( this.document, name, attributes );

		if ( options.renderUnsafeAttributes ) {
			editableElement._unsafeAttributesToRender.push( ...options.renderUnsafeAttributes );
		}

		return editableElement;
	}

	/**
	 * Creates a new {@link module:engine/view/emptyelement~EmptyElement}.
	 *
	 * ```ts
	 * writer.createEmptyElement( 'img' );
	 * writer.createEmptyElement( 'img', { id: 'foo-1234' } );
	 * ```
	 *
	 * @param name Name of the element.
	 * @param attributes Elements attributes.
	 * @param options Element's options.
	 * @param options.renderUnsafeAttributes A list of attribute names that should be rendered in the editing
	 * pipeline even though they would normally be filtered out by unsafe attribute detection mechanisms.
	 * @returns Created element.
	 */
	public createEmptyElement(
		name: string,
		attributes?: ElementAttributes,
		options: {
			renderUnsafeAttributes?: Array<string>;
		} = {}
	): EmptyElement {
		const emptyElement = new EmptyElement( this.document, name, attributes );

		if ( options.renderUnsafeAttributes ) {
			emptyElement._unsafeAttributesToRender.push( ...options.renderUnsafeAttributes );
		}

		return emptyElement;
	}

	/**
	 * Creates a new {@link module:engine/view/uielement~UIElement}.
	 *
	 * ```ts
	 * writer.createUIElement( 'span' );
	 * writer.createUIElement( 'span', { id: 'foo-1234' } );
	 * ```
	 *
	 * A custom render function can be provided as the third parameter:
	 *
	 * ```ts
	 * writer.createUIElement( 'span', null, function( domDocument ) {
	 * 	const domElement = this.toDomElement( domDocument );
	 * 	domElement.innerHTML = '<b>this is ui element</b>';
	 *
	 * 	return domElement;
	 * } );
	 * ```
	 *
	 * Unlike {@link #createRawElement raw elements}, UI elements are by no means editor content, for instance,
	 * they are ignored by the editor selection system.
	 *
	 * You should not use UI elements as data containers. Check out {@link #createRawElement} instead.
	 *
	 * @param name The name of the element.
	 * @param attributes Element attributes.
	 * @param renderFunction A custom render function.
	 * @returns The created element.
	 */
	public createUIElement(
		name: string,
		attributes?: ElementAttributes,
		renderFunction?: ( this: UIElement, domDocument: DomDocument, domConverter: DomConverter ) => DomElement
	): UIElement {
		const uiElement = new UIElement( this.document, name, attributes );

		if ( renderFunction ) {
			uiElement.render = renderFunction;
		}

		return uiElement;
	}

	/**
	 * Creates a new {@link module:engine/view/rawelement~RawElement}.
	 *
	 * ```ts
	 * writer.createRawElement( 'span', { id: 'foo-1234' }, function( domElement ) {
	 * 	domElement.innerHTML = '<b>This is the raw content of the raw element.</b>';
	 * } );
	 * ```
	 *
	 * Raw elements work as data containers ("wrappers", "sandboxes") but their children are not managed or
	 * even recognized by the editor. This encapsulation allows integrations to maintain custom DOM structures
	 * in the editor content without, for instance, worrying about compatibility with other editor features.
	 * Raw elements are a perfect tool for integration with external frameworks and data sources.
	 *
	 * Unlike {@link #createUIElement UI elements}, raw elements act like "real" editor content (similar to
	 * {@link module:engine/view/containerelement~ContainerElement} or {@link module:engine/view/emptyelement~EmptyElement}),
	 * and they are considered by the editor selection.
	 *
	 * You should not use raw elements to render the UI in the editor content. Check out {@link #createUIElement `#createUIElement()`}
	 * instead.
	 *
	 * @param name The name of the element.
	 * @param attributes Element attributes.
	 * @param renderFunction A custom render function.
	 * @param options Element's options.
	 * @param options.renderUnsafeAttributes A list of attribute names that should be rendered in the editing
	 * pipeline even though they would normally be filtered out by unsafe attribute detection mechanisms.
	 * @returns The created element.
	 */
	public createRawElement(
		name: string,
		attributes?: ElementAttributes,
		renderFunction?: ( domElement: DomElement, domConverter: DomConverter ) => void,
		options: {
			renderUnsafeAttributes?: Array<string>;
		} = {}
	): RawElement {
		const rawElement = new RawElement( this.document, name, attributes );

		if ( renderFunction ) {
			rawElement.render = renderFunction;
		}

		if ( options.renderUnsafeAttributes ) {
			rawElement._unsafeAttributesToRender.push( ...options.renderUnsafeAttributes );
		}

		return rawElement;
	}

	/**
	 * Adds or overwrites the element's attribute with a specified key and value.
	 *
	 * ```ts
	 * writer.setAttribute( 'href', 'http://ckeditor.com', linkElement );
	 * ```
	 *
	 * @param key The attribute key.
	 * @param value The attribute value.
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
	 * @param key Attribute key.
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
	 * **Note**: The passed style can be normalized if
	 * {@link module:engine/controller/datacontroller~DataController#addStyleProcessorRules a particular style processor rule is enabled}.
	 * See {@link module:engine/view/stylesmap~StylesMap#set `StylesMap#set()`} for details.
	 *
	 * @label KEY_VALUE
	 * @param property Property name.
	 * @param value Value to set.
	 * @param element Element to set styles on.
	 */
	public setStyle( property: string, value: string, element: Element ): void;

	/**
	 * Adds many styles to the element.
	 *
	 * ```ts
	 * writer.setStyle( {
	 * 	color: 'red',
	 * 	position: 'fixed'
	 * }, element );
	 * ```
	 *
	 * **Note**: The passed style can be normalized if
	 * {@link module:engine/controller/datacontroller~DataController#addStyleProcessorRules a particular style processor rule is enabled}.
	 * See {@link module:engine/view/stylesmap~StylesMap#set `StylesMap#set()`} for details.
	 *
	 * @label OBJECT
	 * @param property Object with key - value pairs.
	 * @param element Element to set styles on.
	 */
	public setStyle( property: Record<string, string>, element: Element ): void;

	public setStyle(
		property: string | Record<string, string>,
		value: string | Element,
		element?: Element
	): void
	{
		if ( isPlainObject( property ) && element === undefined ) {
			( value as Element )._setStyle( property as Record<string, string> );
		} else {
			element!._setStyle( property as string, value as string );
		}
	}

	/**
	 * Removes specified style from the element.
	 *
	 * ```ts
	 * writer.removeStyle( 'color', element ); // Removes 'color' style.
	 * writer.removeStyle( [ 'color', 'border-top' ], element ); // Removes both 'color' and 'border-top' styles.
	 * ```
	 *
	 * **Note**: This method can work with normalized style names if
	 * {@link module:engine/controller/datacontroller~DataController#addStyleProcessorRules a particular style processor rule is enabled}.
	 * See {@link module:engine/view/stylesmap~StylesMap#remove `StylesMap#remove()`} for details.
	 */
	public removeStyle( property: string | Array<string>, element: Element ): void {
		element._removeStyle( property );
	}

	/**
	 * Sets a custom property on element. Unlike attributes, custom properties are not rendered to the DOM,
	 * so they can be used to add special data to elements.
	 */
	public setCustomProperty( key: string | symbol, value: unknown, element: Element | DocumentFragment ): void {
		element._setCustomProperty( key, value );
	}

	/**
	 * Removes a custom property stored under the given key.
	 *
	 * @returns Returns true if property was removed.
	 */
	public removeCustomProperty( key: string | symbol, element: Element | DocumentFragment ): boolean {
		return element._removeCustomProperty( key );
	}

	/**
	 * Breaks attribute elements at the provided position or at the boundaries of a provided range. It breaks attribute elements
	 * up to their first ancestor that is a container element.
	 *
	 * In following examples `<p>` is a container, `<b>` and `<u>` are attribute elements:
	 *
	 * ```html
	 * <p>foo<b><u>bar{}</u></b></p> -> <p>foo<b><u>bar</u></b>[]</p>
	 * <p>foo<b><u>{}bar</u></b></p> -> <p>foo{}<b><u>bar</u></b></p>
	 * <p>foo<b><u>b{}ar</u></b></p> -> <p>foo<b><u>b</u></b>[]<b><u>ar</u></b></p>
	 * <p><b>fo{o</b><u>ba}r</u></p> -> <p><b>fo</b><b>o</b><u>ba</u><u>r</u></b></p>
	 * ```
	 *
	 * **Note:** {@link module:engine/view/documentfragment~DocumentFragment DocumentFragment} is treated like a container.
	 *
	 * **Note:** The difference between {@link module:engine/view/downcastwriter~DowncastWriter#breakAttributes breakAttributes()} and
	 * {@link module:engine/view/downcastwriter~DowncastWriter#breakContainer breakContainer()} is that `breakAttributes()` breaks all
	 * {@link module:engine/view/attributeelement~AttributeElement attribute elements} that are ancestors of a given `position`,
	 * up to the first encountered {@link module:engine/view/containerelement~ContainerElement container element}.
	 * `breakContainer()` assumes that a given `position` is directly in the container element and breaks that container element.
	 *
	 * Throws the `view-writer-invalid-range-container` {@link module:utils/ckeditorerror~CKEditorError CKEditorError}
	 * when the {@link module:engine/view/range~Range#start start}
	 * and {@link module:engine/view/range~Range#end end} positions of a passed range are not placed inside same parent container.
	 *
	 * Throws the `view-writer-cannot-break-empty-element` {@link module:utils/ckeditorerror~CKEditorError CKEditorError}
	 * when trying to break attributes inside an {@link module:engine/view/emptyelement~EmptyElement EmptyElement}.
	 *
	 * Throws the `view-writer-cannot-break-ui-element` {@link module:utils/ckeditorerror~CKEditorError CKEditorError}
	 * when trying to break attributes inside a {@link module:engine/view/uielement~UIElement UIElement}.
	 *
	 * @see module:engine/view/attributeelement~AttributeElement
	 * @see module:engine/view/containerelement~ContainerElement
	 * @see module:engine/view/downcastwriter~DowncastWriter#breakContainer
	 * @param positionOrRange The position where to break attribute elements.
	 * @returns The new position or range, after breaking the attribute elements.
	 */
	public breakAttributes( positionOrRange: Position | Range ): Position | Range {
		if ( positionOrRange instanceof Position ) {
			return this._breakAttributes( positionOrRange );
		} else {
			return this._breakAttributesRange( positionOrRange );
		}
	}

	/**
	 * Breaks a {@link module:engine/view/containerelement~ContainerElement container view element} into two, at the given position.
	 * The position has to be directly inside the container element and cannot be in the root. It does not break the conrainer view element
	 * if the position is at the beginning or at the end of its parent element.
	 *
	 * ```html
	 * <p>foo^bar</p> -> <p>foo</p><p>bar</p>
	 * <div><p>foo</p>^<p>bar</p></div> -> <div><p>foo</p></div><div><p>bar</p></div>
	 * <p>^foobar</p> -> ^<p>foobar</p>
	 * <p>foobar^</p> -> <p>foobar</p>^
	 * ```
	 *
	 * **Note:** The difference between {@link module:engine/view/downcastwriter~DowncastWriter#breakAttributes breakAttributes()} and
	 * {@link module:engine/view/downcastwriter~DowncastWriter#breakContainer breakContainer()} is that `breakAttributes()` breaks all
	 * {@link module:engine/view/attributeelement~AttributeElement attribute elements} that are ancestors of a given `position`,
	 * up to the first encountered {@link module:engine/view/containerelement~ContainerElement container element}.
	 * `breakContainer()` assumes that the given `position` is directly in the container element and breaks that container element.
	 *
	 * @see module:engine/view/attributeelement~AttributeElement
	 * @see module:engine/view/containerelement~ContainerElement
	 * @see module:engine/view/downcastwriter~DowncastWriter#breakAttributes
	 * @param position The position where to break the element.
	 * @returns The position between broken elements. If an element has not been broken,
	 * the returned position is placed either before or after it.
	 */
	public breakContainer( position: Position ): Position {
		const element = position.parent;

		if ( !( element.is( 'containerElement' ) ) ) {
			/**
			 * Trying to break an element which is not a container element.
			 *
			 * @error view-writer-break-non-container-element
			 */
			throw new CKEditorError( 'view-writer-break-non-container-element', this.document );
		}

		if ( !element.parent ) {
			/**
			 * Trying to break root element.
			 *
			 * @error view-writer-break-root
			 */
			throw new CKEditorError( 'view-writer-break-root', this.document );
		}

		if ( position.isAtStart ) {
			return Position._createBefore( element );
		} else if ( !position.isAtEnd ) {
			const newElement = element._clone( false );

			this.insert( Position._createAfter( element ), newElement as any );

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
	 * ```html
	 * <p>foo[]bar</p> -> <p>foo{}bar</p>
	 * <p><b>foo</b>[]<b>bar</b></p> -> <p><b>foo{}bar</b></p>
	 * <p><b foo="bar">a</b>[]<b foo="baz">b</b></p> -> <p><b foo="bar">a</b>[]<b foo="baz">b</b></p>
	 * ```
	 *
	 * It will also take care about empty attributes when merging:
	 *
	 * ```html
	 * <p><b>[]</b></p> -> <p>[]</p>
	 * <p><b>foo</b><i>[]</i><b>bar</b></p> -> <p><b>foo{}bar</b></p>
	 * ```
	 *
	 * **Note:** Difference between {@link module:engine/view/downcastwriter~DowncastWriter#mergeAttributes mergeAttributes} and
	 * {@link module:engine/view/downcastwriter~DowncastWriter#mergeContainers mergeContainers} is that `mergeAttributes` merges two
	 * {@link module:engine/view/attributeelement~AttributeElement attribute elements} or {@link module:engine/view/text~Text text nodes}
	 * while `mergeContainer` merges two {@link module:engine/view/containerelement~ContainerElement container elements}.
	 *
	 * @see module:engine/view/attributeelement~AttributeElement
	 * @see module:engine/view/containerelement~ContainerElement
	 * @see module:engine/view/downcastwriter~DowncastWriter#mergeContainers
	 * @param position Merge position.
	 * @returns Position after merge.
	 */
	public mergeAttributes( position: Position ): Position {
		const positionOffset = position.offset;
		const positionParent = position.parent;

		// When inside text node - nothing to merge.
		if ( positionParent.is( '$text' ) ) {
			return position;
		}

		// When inside empty attribute - remove it.
		if ( positionParent.is( 'attributeElement' ) && positionParent.childCount === 0 ) {
			const parent = positionParent.parent;
			const offset = positionParent.index;

			positionParent._remove();
			this._removeFromClonedElementsGroup( positionParent );

			return this.mergeAttributes( new Position( parent!, offset! ) );
		}

		const nodeBefore = ( positionParent as Element ).getChild( positionOffset - 1 );
		const nodeAfter = ( positionParent as Element ).getChild( positionOffset );

		// Position should be placed between two nodes.
		if ( !nodeBefore || !nodeAfter ) {
			return position;
		}

		// When position is between two text nodes.
		if ( nodeBefore.is( '$text' ) && nodeAfter.is( '$text' ) ) {
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
	 * ```html
	 * <p>foo</p>^<p>bar</p> -> <p>foo^bar</p>
	 * <div>foo</div>^<p>bar</p> -> <div>foo^bar</div>
	 * ```
	 *
	 * **Note:** Difference between {@link module:engine/view/downcastwriter~DowncastWriter#mergeAttributes mergeAttributes} and
	 * {@link module:engine/view/downcastwriter~DowncastWriter#mergeContainers mergeContainers} is that `mergeAttributes` merges two
	 * {@link module:engine/view/attributeelement~AttributeElement attribute elements} or {@link module:engine/view/text~Text text nodes}
	 * while `mergeContainer` merges two {@link module:engine/view/containerelement~ContainerElement container elements}.
	 *
	 * @see module:engine/view/attributeelement~AttributeElement
	 * @see module:engine/view/containerelement~ContainerElement
	 * @see module:engine/view/downcastwriter~DowncastWriter#mergeAttributes
	 * @param position Merge position.
	 * @returns Position after merge.
	 */
	public mergeContainers( position: Position ): Position {
		const prev = position.nodeBefore;
		const next = position.nodeAfter;

		if ( !prev || !next || !prev.is( 'containerElement' ) || !next.is( 'containerElement' ) ) {
			/**
			 * Element before and after given position cannot be merged.
			 *
			 * @error view-writer-merge-containers-invalid-position
			 */
			throw new CKEditorError( 'view-writer-merge-containers-invalid-position', this.document );
		}

		const lastChild = prev.getChild( prev.childCount - 1 );
		const newPosition = lastChild instanceof Text ? Position._createAt( lastChild, 'end' ) : Position._createAt( prev, 'end' );

		this.move( Range._createIn( next ), Position._createAt( prev, 'end' ) );
		this.remove( Range._createOn( next ) );

		return newPosition;
	}

	/**
	 * Inserts a node or nodes at specified position. Takes care about breaking attributes before insertion
	 * and merging them afterwards.
	 *
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-writer-insert-invalid-node` when nodes to insert
	 * contains instances that are not {@link module:engine/view/text~Text Texts},
	 * {@link module:engine/view/attributeelement~AttributeElement AttributeElements},
	 * {@link module:engine/view/containerelement~ContainerElement ContainerElements},
	 * {@link module:engine/view/emptyelement~EmptyElement EmptyElements},
	 * {@link module:engine/view/rawelement~RawElement RawElements} or
	 * {@link module:engine/view/uielement~UIElement UIElements}.
	 *
	 * @param position Insertion position.
	 * @param nodes Node or nodes to insert.
	 * @returns Range around inserted nodes.
	 */
	public insert( position: Position, nodes: Node | Iterable<Node> ): Range {
		nodes = isIterable( nodes ) ? [ ...nodes ] : [ nodes ];

		// Check if nodes to insert are instances of AttributeElements, ContainerElements, EmptyElements, UIElements or Text.
		validateNodesToInsert( nodes, this.document );

		// Group nodes in batches of nodes that require or do not require breaking an AttributeElements.
		const nodeGroups = ( nodes as Array<Node> ).reduce( ( groups: Array<{ breakAttributes: boolean; nodes: Array<Node> }>, node ) => {
			const lastGroup = groups[ groups.length - 1 ];

			// Break attributes on nodes that do exist in the model tree so they can have attributes, other elements
			// can't have an attribute in model and won't get wrapped with an AttributeElement while down-casted.
			const breakAttributes = !node.is( 'uiElement' );

			if ( !lastGroup || lastGroup.breakAttributes != breakAttributes ) {
				groups.push( {
					breakAttributes,
					nodes: [ node ]
				} );
			} else {
				lastGroup.nodes.push( node );
			}

			return groups;
		}, [] );

		// Insert nodes in batches.
		let start = null;
		let end = position;

		for ( const { nodes, breakAttributes } of nodeGroups ) {
			const range = this._insertNodes( end, nodes, breakAttributes );

			if ( !start ) {
				start = range.start;
			}

			end = range.end;
		}

		// When no nodes were inserted - return collapsed range.
		if ( !start ) {
			return new Range( position );
		}

		return new Range( start, end );
	}

	/**
	 * Removes provided range from the container.
	 *
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-writer-invalid-range-container` when
	 * {@link module:engine/view/range~Range#start start} and {@link module:engine/view/range~Range#end end} positions are not placed inside
	 * same parent container.
	 *
	 * @param rangeOrItem Range to remove from container
	 * or an {@link module:engine/view/item~Item item} to remove. If range is provided, after removing, it will be updated
	 * to a collapsed range showing the new position.
	 * @returns Document fragment containing removed nodes.
	 */
	public remove( rangeOrItem: Range | Item ): DocumentFragment {
		const range = rangeOrItem instanceof Range ? rangeOrItem : Range._createOn( rangeOrItem );

		validateRangeContainer( range, this.document );

		// If range is collapsed - nothing to remove.
		if ( range.isCollapsed ) {
			return new DocumentFragment( this.document );
		}

		// Break attributes at range start and end.
		const { start: breakStart, end: breakEnd } = this._breakAttributesRange( range, true );
		const parentContainer = breakStart.parent as Element;

		const count = breakEnd.offset - breakStart.offset;

		// Remove nodes in range.
		const removed = parentContainer._removeChildren( breakStart.offset, count );

		for ( const node of removed ) {
			this._removeFromClonedElementsGroup( node );
		}

		// Merge after removing.
		const mergePosition = this.mergeAttributes( breakStart );
		( range as any ).start = mergePosition;
		( range as any ).end = mergePosition.clone();

		// Return removed nodes.
		return new DocumentFragment( this.document, removed );
	}

	/**
	 * Removes matching elements from given range.
	 *
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-writer-invalid-range-container` when
	 * {@link module:engine/view/range~Range#start start} and {@link module:engine/view/range~Range#end end} positions are not placed inside
	 * same parent container.
	 *
	 * @param range Range to clear.
	 * @param element Element to remove.
	 */
	public clear( range: Range, element: Element ): void {
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
			} else if ( !current.nextPosition.isAfter( range.start ) && item.is( '$textProxy' ) ) {
				// We need to check if parent of this text matches to given element.
				const parentElement = item.getAncestors().find( ancestor => {
					return ancestor.is( 'element' ) && element.isSimilar( ancestor );
				} );

				// If it is then create range inside this element.
				if ( parentElement ) {
					rangeToRemove = Range._createIn( parentElement as Element );
				}
			}

			// If we have found element to remove.
			if ( rangeToRemove ) {
				// We need to check if element range stick out of the given range and truncate if it is.
				if ( rangeToRemove.end.isAfter( range.end ) ) {
					( rangeToRemove as any ).end = range.end;
				}

				if ( rangeToRemove.start.isBefore( range.start ) ) {
					( rangeToRemove as any ).start = range.start;
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
	 * @param sourceRange Range containing nodes to move.
	 * @param targetPosition Position to insert.
	 * @returns Range in target container. Inserted nodes are placed between
	 * {@link module:engine/view/range~Range#start start} and {@link module:engine/view/range~Range#end end} positions.
	 */
	public move( sourceRange: Range, targetPosition: Position ): Range {
		let nodes;

		if ( targetPosition.isAfter( sourceRange.end ) ) {
			targetPosition = this._breakAttributes( targetPosition, true );

			const parent = targetPosition.parent as Element;
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
	 * @param range Range to wrap.
	 * @param attribute Attribute element to use as wrapper.
	 * @returns range Range after wrapping, spanning over wrapping attribute element.
	 */
	public wrap( range: Range, attribute: AttributeElement ): Range {
		if ( !( attribute instanceof AttributeElement ) ) {
			throw new CKEditorError(
				'view-writer-wrap-invalid-attribute',
				this.document
			);
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
			if ( viewSelection.isCollapsed && viewSelection.getFirstPosition()!.isEqual( range.start ) ) {
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
	 */
	public unwrap( range: Range, attribute: AttributeElement ): Range {
		if ( !( attribute instanceof AttributeElement ) ) {
			/**
			 * The `attribute` passed to {@link module:engine/view/downcastwriter~DowncastWriter#unwrap `DowncastWriter#unwrap()`}
			 * must be an instance of {@link module:engine/view/attributeelement~AttributeElement `AttributeElement`}.
			 *
			 * @error view-writer-unwrap-invalid-attribute
			 */
			throw new CKEditorError(
				'view-writer-unwrap-invalid-attribute',
				this.document
			);
		}

		validateRangeContainer( range, this.document );

		// If range is collapsed - nothing to unwrap.
		if ( range.isCollapsed ) {
			return range;
		}

		// Break attributes at range start and end.
		const { start: breakStart, end: breakEnd } = this._breakAttributesRange( range, true );
		const parentContainer = breakStart.parent as Element;

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
	 * @param newName New name for element.
	 * @param viewElement Element to be renamed.
	 * @returns Element created due to rename.
	 */
	public rename( newName: string, viewElement: ContainerElement ): ContainerElement {
		const newElement = new ContainerElement( this.document, newName, viewElement.getAttributes() );

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
	 * @param groupName Name of the group to clear.
	 */
	public clearClonedElementsGroup( groupName: string ): void {
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
	 * @param offset Offset or one of the flags. Used only when the first parameter is a {@link module:engine/view/item~Item view item}.
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
	 * **Note:** This factory method creates its own {@link module:engine/view/position~Position} instances basing on passed values.
	 *
	 * @param start Start position.
	 * @param end End position. If not set, range will be collapsed at `start` position.
	 */
	public createRange( start: Position, end?: Position | null ): Range {
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
	 * Creates new {@link module:engine/view/selection~Selection} instance.
	 *
	 * ```ts
	 * // Creates collapsed selection at the position of given item and offset.
	 * const paragraph = writer.createContainerElement( 'p' );
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
	 * Creates new {@link module:engine/view/selection~Selection} instance.
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
	public createSelection( selectable?: Exclude<Selectable, Node>, option?: SelectionOptions ): Selection;

	public createSelection( ...args: ConstructorParameters<typeof Selection> ): Selection {
		return new Selection( ...args );
	}

	/**
	 * Creates placeholders for child elements of the {@link module:engine/conversion/downcasthelpers~DowncastHelpers#elementToStructure
	 * `elementToStructure()`} conversion helper.
	 *
	 * ```ts
	 * const viewSlot = conversionApi.writer.createSlot();
	 * const viewPosition = conversionApi.writer.createPositionAt( viewElement, 0 );
	 *
	 * conversionApi.writer.insert( viewPosition, viewSlot );
	 * ```
	 *
	 * It could be filtered down to a specific subset of children (only `<foo>` model elements in this case):
	 *
	 * ```ts
	 * const viewSlot = conversionApi.writer.createSlot( node => node.is( 'element', 'foo' ) );
	 * const viewPosition = conversionApi.writer.createPositionAt( viewElement, 0 );
	 *
	 * conversionApi.writer.insert( viewPosition, viewSlot );
	 * ```
	 *
	 * While providing a filtered slot, make sure to provide slots for all child nodes. A single node can not be downcasted into
	 * multiple slots.
	 *
	 * **Note**: You should not change the order of nodes. View elements should be in the same order as model nodes.
	 *
	 * @param modeOrFilter The filter for child nodes.
	 * @returns The slot element to be placed in to the view structure while processing
	 * {@link module:engine/conversion/downcasthelpers~DowncastHelpers#elementToStructure `elementToStructure()`}.
	 */
	public createSlot( modeOrFilter: 'children' | SlotFilter = 'children' ): Element {
		if ( !this._slotFactory ) {
			/**
			 * The `createSlot()` method is only allowed inside the `elementToStructure` downcast helper callback.
			 *
			 * @error view-writer-invalid-create-slot-context
			 */
			throw new CKEditorError( 'view-writer-invalid-create-slot-context', this.document );
		}

		return this._slotFactory( this, modeOrFilter );
	}

	/**
	 * Registers a slot factory.
	 *
	 * @internal
	 * @param slotFactory The slot factory.
	 */
	public _registerSlotFactory( slotFactory: ( writer: DowncastWriter, modeOrFilter: string | SlotFilter ) => Element ): void {
		this._slotFactory = slotFactory;
	}

	/**
	 * Clears the registered slot factory.
	 *
	 * @internal
	 */
	public _clearSlotFactory(): void {
		this._slotFactory = null;
	}

	/**
	 * Inserts a node or nodes at the specified position. Takes care of breaking attributes before insertion
	 * and merging them afterwards if requested by the breakAttributes param.
	 *
	 * @param position Insertion position.
	 * @param nodes Node or nodes to insert.
	 * @param breakAttributes Whether attributes should be broken.
	 * @returns Range around inserted nodes.
	 */
	private _insertNodes( position: Position, nodes: Iterable<Node>, breakAttributes: boolean ): Range {
		let parentElement;

		// Break attributes on nodes that do exist in the model tree so they can have attributes, other elements
		// can't have an attribute in model and won't get wrapped with an AttributeElement while down-casted.
		if ( breakAttributes ) {
			parentElement = getParentContainer( position );
		} else {
			parentElement = position.parent.is( '$text' ) ? position.parent.parent : position.parent;
		}

		if ( !parentElement ) {
			/**
			 * Position's parent container cannot be found.
			 *
			 * @error view-writer-invalid-position-container
			 */
			throw new CKEditorError(
				'view-writer-invalid-position-container',
				this.document
			);
		}

		let insertionPosition;

		if ( breakAttributes ) {
			insertionPosition = this._breakAttributes( position, true );
		} else {
			insertionPosition = position.parent.is( '$text' ) ? breakTextNode( position ) : position;
		}

		const length = ( parentElement as Element | DocumentFragment )._insertChild( insertionPosition.offset, nodes );

		for ( const node of nodes ) {
			this._addToClonedElementsGroup( node );
		}

		const endPosition = insertionPosition.getShiftedBy( length );
		const start = this.mergeAttributes( insertionPosition );

		// If start position was merged - move end position.
		if ( !start.isEqual( insertionPosition ) ) {
			endPosition.offset--;
		}

		const end = this.mergeAttributes( endPosition );

		return new Range( start, end );
	}

	/**
	 * Wraps children with provided `wrapElement`. Only children contained in `parent` element between
	 * `startOffset` and `endOffset` will be wrapped.
	 */
	private _wrapChildren( parent: Element, startOffset: number, endOffset: number, wrapElement: AttributeElement ) {
		let i = startOffset;
		const wrapPositions: Array<Position> = [];

		while ( i < endOffset ) {
			const child = parent.getChild( i )!;
			const isText = child.is( '$text' );
			const isAttribute = child.is( 'attributeElement' );

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
			else if ( isText || !isAttribute || shouldABeOutsideB( wrapElement, child ) ) {
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
			else /* if ( isAttribute ) */ {
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
	 */
	private _unwrapChildren( parent: Element, startOffset: number, endOffset: number, unwrapElement: AttributeElement ) {
		let i = startOffset;
		const unwrapPositions: Array<Position> = [];

		// Iterate over each element between provided offsets inside parent.
		// We don't use tree walker or range iterator because we will be removing and merging potentially multiple nodes,
		// so it could get messy. It is safer to it manually in this case.
		while ( i < endOffset ) {
			const child = parent.getChild( i )!;

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
	 * @returns New range after wrapping, spanning over wrapping attribute element.
	 */
	private _wrapRange( range: Range, attribute: AttributeElement ): Range {
		// Break attributes at range start and end.
		const { start: breakStart, end: breakEnd } = this._breakAttributesRange( range, true );
		const parentContainer = breakStart.parent as Element;

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
	 * @returns New position after wrapping.
	 */
	private _wrapPosition( position: Position, attribute: AttributeElement ): Position {
		// Return same position when trying to wrap with attribute similar to position parent.
		if ( attribute.isSimilar( position.parent as any ) ) {
			return movePositionToTextNode( position.clone() );
		}

		// When position is inside text node - break it and place new position between two text nodes.
		if ( position.parent.is( '$text' ) ) {
			position = breakTextNode( position );
		}

		// Create fake element that will represent position, and will not be merged with other attributes.
		const fakeElement = this.createAttributeElement( '_wrapPosition-fake-element' );
		( fakeElement as any )._priority = Number.POSITIVE_INFINITY;
		fakeElement.isSimilar = () => false;

		// Insert fake element in position location.
		( position.parent as Element )._insertChild( position.offset, fakeElement );

		// Range around inserted fake attribute element.
		const wrapRange = new Range( position, position.getShiftedBy( 1 ) );

		// Wrap fake element with attribute (it will also merge if possible).
		this.wrap( wrapRange, attribute );

		// Remove fake element and place new position there.
		const newPosition = new Position( fakeElement.parent!, fakeElement.index! );
		fakeElement._remove();

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
	 * Wraps one {@link module:engine/view/attributeelement~AttributeElement AttributeElement} into another by
	 * merging them if possible. When merging is possible - all attributes, styles and classes are moved from wrapper
	 * element to element being wrapped.
	 *
	 * @param wrapper Wrapper AttributeElement.
	 * @param toWrap AttributeElement to wrap using wrapper element.
	 * @returns Returns `true` if elements are merged.
	 */
	private _wrapAttributeElement( wrapper: AttributeElement, toWrap: AttributeElement ): boolean {
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
				this.setAttribute( key, wrapper.getAttribute( key )!, toWrap );
			}
		}

		for ( const key of wrapper.getStyleNames() ) {
			if ( !toWrap.hasStyle( key ) ) {
				this.setStyle( key, wrapper.getStyle( key )!, toWrap );
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
	 * @param wrapper Wrapper AttributeElement.
	 * @param toUnwrap AttributeElement to unwrap using wrapper element.
	 * @returns Returns `true` if elements are unwrapped.
	 **/
	private _unwrapAttributeElement( wrapper: AttributeElement, toUnwrap: AttributeElement ): boolean {
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
	 * @param range Range which `start` and `end` positions will be used to break attributes.
	 * @param forceSplitText If set to `true`, will break text nodes even if they are directly in container element.
	 * This behavior will result in incorrect view state, but is needed by other view writing methods which then fixes view state.
	 * @returns New range with located at break positions.
	 */
	private _breakAttributesRange( range: Range, forceSplitText: boolean = false ) {
		const rangeStart = range.start;
		const rangeEnd = range.end;

		validateRangeContainer( range, this.document );

		// Break at the collapsed position. Return new collapsed range.
		if ( range.isCollapsed ) {
			const position = this._breakAttributes( range.start, forceSplitText );

			return new Range( position, position );
		}

		const breakEnd = this._breakAttributes( rangeEnd, forceSplitText );
		const count = ( breakEnd.parent as Element ).childCount;
		const breakStart = this._breakAttributes( rangeStart, forceSplitText );

		// Calculate new break end offset.
		breakEnd.offset += ( breakEnd.parent as Element ).childCount - count;

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
	 * @param position Position where to break attributes.
	 * @param forceSplitText If set to `true`, will break text nodes even if they are directly in container element.
	 * This behavior will result in incorrect view state, but is needed by other view writing methods which then fixes view state.
	 * @returns New position after breaking the attributes.
	 */
	private _breakAttributes( position: Position, forceSplitText: boolean = false ): Position {
		const positionOffset = position.offset;
		const positionParent = position.parent;

		// If position is placed inside EmptyElement - throw an exception as we cannot break inside.
		if ( position.parent.is( 'emptyElement' ) ) {
			/**
			 * Cannot break an `EmptyElement` instance.
			 *
			 * This error is thrown if
			 * {@link module:engine/view/downcastwriter~DowncastWriter#breakAttributes `DowncastWriter#breakAttributes()`}
			 * was executed in an incorrect position.
			 *
			 * @error view-writer-cannot-break-empty-element
			 */
			throw new CKEditorError( 'view-writer-cannot-break-empty-element', this.document );
		}

		// If position is placed inside UIElement - throw an exception as we cannot break inside.
		if ( position.parent.is( 'uiElement' ) ) {
			/**
			 * Cannot break a `UIElement` instance.
			 *
			 * This error is thrown if
			 * {@link module:engine/view/downcastwriter~DowncastWriter#breakAttributes `DowncastWriter#breakAttributes()`}
			 * was executed in an incorrect position.
			 *
			 * @error view-writer-cannot-break-ui-element
			 */
			throw new CKEditorError( 'view-writer-cannot-break-ui-element', this.document );
		}

		// If position is placed inside RawElement - throw an exception as we cannot break inside.
		if ( position.parent.is( 'rawElement' ) ) {
			/**
			 * Cannot break a `RawElement` instance.
			 *
			 * This error is thrown if
			 * {@link module:engine/view/downcastwriter~DowncastWriter#breakAttributes `DowncastWriter#breakAttributes()`}
			 * was executed in an incorrect position.
			 *
			 * @error view-writer-cannot-break-raw-element
			 */
			throw new CKEditorError( 'view-writer-cannot-break-raw-element', this.document );
		}

		// There are no attributes to break and text nodes breaking is not forced.
		if ( !forceSplitText && positionParent.is( '$text' ) && isContainerOrFragment( positionParent.parent! ) ) {
			return position.clone();
		}

		// Position's parent is container, so no attributes to break.
		if ( isContainerOrFragment( positionParent ) ) {
			return position.clone();
		}

		// Break text and start again in new position.
		if ( positionParent.is( '$text' ) ) {
			return this._breakAttributes( breakTextNode( position ), forceSplitText );
		}

		const length = ( positionParent as any ).childCount;

		// <p>foo<b><u>bar{}</u></b></p>
		// <p>foo<b><u>bar</u>[]</b></p>
		// <p>foo<b><u>bar</u></b>[]</p>
		if ( positionOffset == length ) {
			const newPosition = new Position( positionParent.parent as any, ( positionParent as any ).index + 1 );

			return this._breakAttributes( newPosition, forceSplitText );
		} else {
			// <p>foo<b><u>{}bar</u></b></p>
			// <p>foo<b>[]<u>bar</u></b></p>
			// <p>foo{}<b><u>bar</u></b></p>
			if ( positionOffset === 0 ) {
				const newPosition = new Position( positionParent.parent as Element, ( positionParent as any ).index );

				return this._breakAttributes( newPosition, forceSplitText );
			}
			// <p>foo<b><u>b{}ar</u></b></p>
			// <p>foo<b><u>b[]ar</u></b></p>
			// <p>foo<b><u>b</u>[]<u>ar</u></b></p>
			// <p>foo<b><u>b</u></b>[]<b><u>ar</u></b></p>
			else {
				const offsetAfter = ( positionParent as any ).index + 1;

				// Break element.
				const clonedNode = ( positionParent as any )._clone();

				// Insert cloned node to position's parent node.
				( positionParent.parent as any )._insertChild( offsetAfter, clonedNode );
				this._addToClonedElementsGroup( clonedNode );

				// Get nodes to move.
				const count = ( positionParent as any ).childCount - positionOffset;
				const nodesToMove = ( positionParent as any )._removeChildren( positionOffset, count );

				// Move nodes to cloned node.
				clonedNode._appendChild( nodesToMove );

				// Create new position to work on.
				const newPosition = new Position( ( positionParent as any ).parent, offsetAfter );

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
	 * @param element Attribute element to save.
	 */
	private _addToClonedElementsGroup( element: Node ): void {
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

		const id = ( element as any ).id;

		if ( !id ) {
			return;
		}

		let group = this._cloneGroups.get( id );

		if ( !group ) {
			group = new Set();
			this._cloneGroups.set( id, group );
		}

		group.add( element as AttributeElement );
		( element as any )._clonesGroup = group;
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
	 * @param element Attribute element to remove.
	 */
	private _removeFromClonedElementsGroup( element: Node ) {
		// Traverse the element's children recursively to find other attribute elements that also got removed.
		// The loop is at the beginning so we can make fast returns later in the code.
		if ( element.is( 'element' ) ) {
			for ( const child of element.getChildren() ) {
				this._removeFromClonedElementsGroup( child );
			}
		}

		const id = ( element as any ).id;

		if ( !id ) {
			return;
		}

		const group = this._cloneGroups.get( id );

		if ( !group ) {
			return;
		}

		group.delete( element as AttributeElement );
		// Not removing group from element on purpose!
		// If other parts of code have reference to this element, they will be able to get references to other elements from the group.
	}
}

// Helper function for `view.writer.wrap`. Checks if given element has any children that are not ui elements.
function _hasNonUiChildren( parent: Element ): boolean {
	return Array.from( parent.getChildren() ).some( child => !child.is( 'uiElement' ) );
}

/**
 * The `attribute` passed to {@link module:engine/view/downcastwriter~DowncastWriter#wrap `DowncastWriter#wrap()`}
 * must be an instance of {@link module:engine/view/attributeelement~AttributeElement `AttributeElement`}.
 *
 * @error view-writer-wrap-invalid-attribute
 */

/**
 * Returns first parent container of specified {@link module:engine/view/position~Position Position}.
 * Position's parent node is checked as first, then next parents are checked.
 * Note that {@link module:engine/view/documentfragment~DocumentFragment DocumentFragment} is treated like a container.
 *
 * @param position Position used as a start point to locate parent container.
 * @returns Parent container element or `undefined` if container is not found.
 */
function getParentContainer( position: Position ): ContainerElement | DocumentFragment | undefined {
	let parent = position.parent;

	while ( !isContainerOrFragment( parent ) ) {
		if ( !parent ) {
			return undefined;
		}

		parent = parent.parent as any;
	}

	return ( parent as ContainerElement | DocumentFragment );
}

/**
 * Checks if first {@link module:engine/view/attributeelement~AttributeElement AttributeElement} provided to the function
 * can be wrapped outside second element. It is done by comparing elements'
 * {@link module:engine/view/attributeelement~AttributeElement#priority priorities}, if both have same priority
 * {@link module:engine/view/element~Element#getIdentity identities} are compared.
 */
function shouldABeOutsideB( a: AttributeElement, b: AttributeElement ): boolean {
	if ( a.priority < b.priority ) {
		return true;
	} else if ( a.priority > b.priority ) {
		return false;
	}

	// When priorities are equal and names are different - use identities.
	return a.getIdentity() < b.getIdentity();
}

/**
 * Returns new position that is moved to near text node. Returns same position if there is no text node before of after
 * specified position.
 *
 * ```html
 * <p>foo[]</p>  ->  <p>foo{}</p>
 * <p>[]foo</p>  ->  <p>{}foo</p>
 * ```
 *
 * @returns Position located inside text node or same position if there is no text nodes
 * before or after position location.
 */
function movePositionToTextNode( position: Position ): Position {
	const nodeBefore = position.nodeBefore;

	if ( nodeBefore && nodeBefore.is( '$text' ) ) {
		return new Position( nodeBefore, nodeBefore.data.length );
	}

	const nodeAfter = position.nodeAfter;

	if ( nodeAfter && nodeAfter.is( '$text' ) ) {
		return new Position( nodeAfter, 0 );
	}

	return position;
}

/**
 * Breaks text node into two text nodes when possible.
 *
 * ```html
 * <p>foo{}bar</p> -> <p>foo[]bar</p>
 * <p>{}foobar</p> -> <p>[]foobar</p>
 * <p>foobar{}</p> -> <p>foobar[]</p>
 * ```
 *
 * @param position Position that need to be placed inside text node.
 * @returns New position after breaking text node.
 */
function breakTextNode( position: Position ): Position {
	if ( position.offset == ( position.parent as Text ).data.length ) {
		return new Position( position.parent.parent as any, ( position.parent as Text ).index! + 1 );
	}

	if ( position.offset === 0 ) {
		return new Position( position.parent.parent as any, ( position.parent as Text ).index! );
	}

	// Get part of the text that need to be moved.
	const textToMove = ( position.parent as Text ).data.slice( position.offset );

	// Leave rest of the text in position's parent.
	( position.parent as Text )._data = ( position.parent as Text ).data.slice( 0, position.offset );

	// Insert new text node after position's parent text node.
	( position.parent.parent as any )._insertChild(
		( position.parent as Text ).index! + 1,
		new Text( position.root.document, textToMove )
	);

	// Return new position between two newly created text nodes.
	return new Position( position.parent.parent as any, ( position.parent as Text ).index! + 1 );
}

/**
 * Merges two text nodes into first node. Removes second node and returns merge position.
 *
 * @param t1 First text node to merge. Data from second text node will be moved at the end of this text node.
 * @param t2 Second text node to merge. This node will be removed after merging.
 * @returns Position after merging text nodes.
 */
function mergeTextNodes( t1: Text, t2: Text ): Position {
	// Merge text data into first text node and remove second one.
	const nodeBeforeLength = t1.data.length;
	t1._data += t2.data;
	t2._remove();

	return new Position( t1, nodeBeforeLength );
}

const validNodesToInsert = [ Text, AttributeElement, ContainerElement, EmptyElement, RawElement, UIElement ];

/**
 * Checks if provided nodes are valid to insert.
 *
 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-writer-insert-invalid-node` when nodes to insert
 * contains instances that are not supported ones (see error description for valid ones.
 */
function validateNodesToInsert( nodes: Iterable<Node>, errorContext: Document ): void {
	for ( const node of nodes ) {
		if ( !validNodesToInsert.some( ( validNode => node instanceof validNode ) ) ) { // eslint-disable-line no-use-before-define
			/**
			 * One of the nodes to be inserted is of an invalid type.
			 *
			 * Nodes to be inserted with {@link module:engine/view/downcastwriter~DowncastWriter#insert `DowncastWriter#insert()`} should be
			 * of the following types:
			 *
			 * * {@link module:engine/view/attributeelement~AttributeElement AttributeElement},
			 * * {@link module:engine/view/containerelement~ContainerElement ContainerElement},
			 * * {@link module:engine/view/emptyelement~EmptyElement EmptyElement},
			 * * {@link module:engine/view/uielement~UIElement UIElement},
			 * * {@link module:engine/view/rawelement~RawElement RawElement},
			 * * {@link module:engine/view/text~Text Text}.
			 *
			 * @error view-writer-insert-invalid-node-type
			 */
			throw new CKEditorError( 'view-writer-insert-invalid-node-type', errorContext );
		}

		if ( !node.is( '$text' ) ) {
			validateNodesToInsert( ( node as Element ).getChildren(), errorContext );
		}
	}
}

/**
 * Checks if node is ContainerElement or DocumentFragment, because in most cases they should be treated the same way.
 *
 * @returns Returns `true` if node is instance of ContainerElement or DocumentFragment.
 */
function isContainerOrFragment( node: Node | DocumentFragment ): boolean {
	return node && ( node.is( 'containerElement' ) || node.is( 'documentFragment' ) );
}

/**
 * Checks if {@link module:engine/view/range~Range#start range start} and {@link module:engine/view/range~Range#end range end} are placed
 * inside same {@link module:engine/view/containerelement~ContainerElement container element}.
 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-writer-invalid-range-container` when validation fails.
 */
function validateRangeContainer( range: Range, errorContext: Document ) {
	const startContainer = getParentContainer( range.start );
	const endContainer = getParentContainer( range.end );

	if ( !startContainer || !endContainer || startContainer !== endContainer ) {
		/**
		 * The container of the given range is invalid.
		 *
		 * This may happen if {@link module:engine/view/range~Range#start range start} and
		 * {@link module:engine/view/range~Range#end range end} positions are not placed inside the same container element or
		 * a parent container for these positions cannot be found.
		 *
		 * Methods like {@link module:engine/view/downcastwriter~DowncastWriter#wrap `DowncastWriter#remove()`},
		 * {@link module:engine/view/downcastwriter~DowncastWriter#wrap `DowncastWriter#clean()`},
		 * {@link module:engine/view/downcastwriter~DowncastWriter#wrap `DowncastWriter#wrap()`},
		 * {@link module:engine/view/downcastwriter~DowncastWriter#wrap `DowncastWriter#unwrap()`} need to be called
		 * on a range that has its start and end positions located in the same container element. Both positions can be
		 * nested within other elements (e.g. an attribute element) but the closest container ancestor must be the same.
		 *
		 * @error view-writer-invalid-range-container
		 */
		throw new CKEditorError( 'view-writer-invalid-range-container', errorContext );
	}
}

/**
 * Checks if two attribute elements can be joined together. Elements can be joined together if, and only if
 * they do not have ids specified.
 */
function canBeJoined( a: AttributeElement, b: AttributeElement ) {
	return a.id === null && b.id === null;
}
