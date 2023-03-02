/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type AttributeElement from './attributeelement';
import type ContainerElement from './containerelement';
import type DocumentFragment from './documentfragment';
import type DocumentSelection from './documentselection';
import type EditableElement from './editableelement';
import type Element from './element';
import type EmptyElement from './emptyelement';
import type Node from './node';
import type Position from './position';
import type Range from './range';
import type RawElement from './rawelement';
import type RootEditableElement from './rooteditableelement';
import type Selection from './selection';
import type Text from './text';
import type TextProxy from './textproxy';
import type UIElement from './uielement';

/**
 * @module engine/view/typecheckable
 */

export default abstract class TypeCheckable {
	/**
	 * Checks whether this object is of type {@link module:engine/view/node~Node} or its subclass.
	 *
	 * This method is useful when processing view objects that are of unknown type. For example, a function
	 * may return a {@link module:engine/view/documentfragment~DocumentFragment} or a {@link module:engine/view/node~Node}
	 * that can be either a text node or an element. This method can be used to check what kind of object is returned.
	 *
	 * ```ts
	 * someObject.is( 'element' ); // -> true if this is an element
	 * someObject.is( 'node' ); // -> true if this is a node (a text node or an element)
	 * someObject.is( 'documentFragment' ); // -> true if this is a document fragment
	 * ```
	 *
	 * Since this method is also available on a range of model objects, you can prefix the type of the object with
	 * `model:` or `view:` to check, for example, if this is the model's or view's element:
	 *
	 * ```ts
	 * viewElement.is( 'view:element' ); // -> true
	 * viewElement.is( 'model:element' ); // -> false
	 * ```
	 *
	 * By using this method it is also possible to check a name of an element:
	 *
	 * ```ts
	 * imgElement.is( 'element', 'img' ); // -> true
	 * imgElement.is( 'view:element', 'img' ); // -> same as above, but more precise
	 * ```
	 * @label NODE
	 */
	public is( type: 'node' | 'view:node' ): this is (
		Node |
		Text |
		Element |
		AttributeElement |
		ContainerElement |
		EditableElement |
		EmptyElement |
		RawElement |
		RootEditableElement |
		UIElement
	);

	/**
	 * Checks whether this object is of type {@link module:engine/view/element~Element} or its subclass.
	 *
	 * ```ts
	 * element.is( 'element' ); // -> true
	 * element.is( 'node' ); // -> true
	 * element.is( 'view:element' ); // -> true
	 * element.is( 'view:node' ); // -> true
	 *
	 * element.is( 'model:element' ); // -> false
	 * element.is( 'documentSelection' ); // -> false
	 * ```
	 *
	 * Assuming that the object being checked is an element, you can also check its
	 * {@link module:engine/view/element~Element#name name}:
	 *
	 * ```ts
	 * element.is( 'element', 'img' ); // -> true if this is an <img> element
	 * text.is( 'element', 'img' ); -> false
	 * ```
	 *
	 * @label ELEMENT
	 */
	public is( type: 'element' | 'view:element' ): this is (
		Element |
		AttributeElement |
		ContainerElement |
		EditableElement |
		EmptyElement |
		RawElement |
		RootEditableElement |
		UIElement
	);

	/**
	 * Checks whether this object is of type {@link module:engine/view/attributeelement~AttributeElement}.
	 *
	 * ```ts
	 * attributeElement.is( 'attributeElement' ); // -> true
	 * attributeElement.is( 'element' ); // -> true
	 * attributeElement.is( 'node' ); // -> true
	 * attributeElement.is( 'view:attributeElement' ); // -> true
	 * attributeElement.is( 'view:element' ); // -> true
	 * attributeElement.is( 'view:node' ); // -> true
	 *
	 * attributeElement.is( 'model:element' ); // -> false
	 * attributeElement.is( 'documentFragment' ); // -> false
	 * ```
	 *
	 * Assuming that the object being checked is an attribute element, you can also check its
	 * {@link module:engine/view/attributeelement~AttributeElement#name name}:
	 *
	 * ```ts
	 * attributeElement.is( 'element', 'b' ); // -> true if this is a bold element
	 * attributeElement.is( 'attributeElement', 'b' ); // -> same as above
	 * text.is( 'element', 'b' ); -> false
	 * ```
	 *
	 * @label ATTRIBUTE_ELEMENT
	 */
	public is( type: 'attributeElement' | 'view:attributeElement' ): this is AttributeElement;

	/**
	 * Checks whether this object is of type {@link module:engine/view/containerelement~ContainerElement} or its subclass.
	 *
	 * ```ts
	 * containerElement.is( 'containerElement' ); // -> true
	 * containerElement.is( 'element' ); // -> true
	 * containerElement.is( 'node' ); // -> true
	 * containerElement.is( 'view:containerElement' ); // -> true
	 * containerElement.is( 'view:element' ); // -> true
	 * containerElement.is( 'view:node' ); // -> true
	 *
	 * containerElement.is( 'model:element' ); // -> false
	 * containerElement.is( 'documentFragment' ); // -> false
	 * ```
	 *
	 * Assuming that the object being checked is a container element, you can also check its
	 * {@link module:engine/view/containerelement~ContainerElement#name name}:
	 *
	 * ```ts
	 * containerElement.is( 'element', 'div' ); // -> true if this is a div container element
	 * containerElement.is( 'contaienrElement', 'div' ); // -> same as above
	 * text.is( 'element', 'div' ); -> false
	 * ```
	 *
	 * @label CONTAINER_ELEMENT
	 */
	public is( type: 'containerElement' | 'view:containerElement' ): this is ContainerElement | EditableElement | RootEditableElement;

	/**
	 * Checks whether this object is of type {@link module:engine/view/editableelement~EditableElement} or its subclass.
	 *
	 * ```ts
	 * editableElement.is( 'editableElement' ); // -> true
	 * editableElement.is( 'element' ); // -> true
	 * editableElement.is( 'node' ); // -> true
	 * editableElement.is( 'view:editableElement' ); // -> true
	 * editableElement.is( 'view:element' ); // -> true
	 * editableElement.is( 'view:node' ); // -> true
	 *
	 * editableElement.is( 'model:element' ); // -> false
	 * editableElement.is( 'documentFragment' ); // -> false
	 * ```
	 *
	 * Assuming that the object being checked is an editbale element, you can also check its
	 * {@link module:engine/view/editableelement~EditableElement#name name}:
	 *
	 * ```ts
	 * editableElement.is( 'element', 'div' ); // -> true if this is a div element
	 * editableElement.is( 'editableElement', 'div' ); // -> same as above
	 * text.is( 'element', 'div' ); -> false
	 * ```
	 *
	 * @label EDITABLE_ELEMENT
	 */
	public is( type: 'editableElement' | 'view:editableElement' ): this is EditableElement | RootEditableElement;

	/**
	 * Checks whether this object is of type {@link module:engine/view/emptyelement~EmptyElement}.
	 *
	 * ```ts
	 * emptyElement.is( 'emptyElement' ); // -> true
	 * emptyElement.is( 'element' ); // -> true
	 * emptyElement.is( 'node' ); // -> true
	 * emptyElement.is( 'view:emptyElement' ); // -> true
	 * emptyElement.is( 'view:element' ); // -> true
	 * emptyElement.is( 'view:node' ); // -> true
	 *
	 * emptyElement.is( 'model:element' ); // -> false
	 * emptyElement.is( 'documentFragment' ); // -> false
	 * ```
	 *
	 * Assuming that the object being checked is an empty element, you can also check its
	 * {@link module:engine/view/emptyelement~EmptyElement#name name}:
	 *
	 * ```ts
	 * emptyElement.is( 'element', 'img' ); // -> true if this is a img element
	 * emptyElement.is( 'emptyElement', 'img' ); // -> same as above
	 * text.is( 'element', 'img' ); -> false
	 * ```
	 *
	 * @label EMPTY_ELEMENT
	 */
	public is( type: 'emptyElement' | 'view:emptyElement' ): this is EmptyElement;

	/**
	 * Checks whether this object is of type {@link module:engine/view/rawelement~RawElement}.
	 *
	 * ```ts
	 * rawElement.is( 'rawElement' ); // -> true
	 * rawElement.is( 'element' ); // -> true
	 * rawElement.is( 'node' ); // -> true
	 * rawElement.is( 'view:rawElement' ); // -> true
	 * rawElement.is( 'view:element' ); // -> true
	 * rawElement.is( 'view:node' ); // -> true
	 *
	 * rawElement.is( 'model:element' ); // -> false
	 * rawElement.is( 'documentFragment' ); // -> false
	 * ```
	 *
	 * Assuming that the object being checked is a raw element, you can also check its
	 * {@link module:engine/view/rawelement~RawElement#name name}:
	 *
	 * ```ts
	 * rawElement.is( 'img' ); // -> true if this is an img element
	 * rawElement.is( 'rawElement', 'img' ); // -> same as above
	 * text.is( 'img' ); -> false
	 * ```
	 *
	 * @label RAW_ELEMENT
	 */
	public is( type: 'rawElement' | 'view:rawElement' ): this is RawElement;

	/**
	 * Checks whether this object is of type {@link module:engine/view/rooteditableelement~RootEditableElement}.
	 *
	 * ```ts
	 * rootEditableElement.is( 'rootElement' ); // -> true
	 * rootEditableElement.is( 'editableElement' ); // -> true
	 * rootEditableElement.is( 'element' ); // -> true
	 * rootEditableElement.is( 'node' ); // -> true
	 * rootEditableElement.is( 'view:editableElement' ); // -> true
	 * rootEditableElement.is( 'view:element' ); // -> true
	 * rootEditableElement.is( 'view:node' ); // -> true
	 *
	 * rootEditableElement.is( 'model:element' ); // -> false
	 * rootEditableElement.is( 'documentFragment' ); // -> false
	 * ```
	 *
	 * Assuming that the object being checked is a root editable element, you can also check its
	 * {@link module:engine/view/rooteditableelement~RootEditableElement#name name}:
	 *
	 * ```ts
	 * rootEditableElement.is( 'element', 'div' ); // -> true if this is a div root editable element
	 * rootEditableElement.is( 'rootElement', 'div' ); // -> same as above
	 * text.is( 'element', 'div' ); -> false
	 * ```
	 *
	 * @label ROOT_ELEMENT
	 */
	public is( type: 'rootElement' | 'view:rootElement' ): this is RootEditableElement;

	/**
	 * Checks whether this object is of type {@link module:engine/view/uielement~UIElement}.
	 *
	 * ```ts
	 * uiElement.is( 'uiElement' ); // -> true
	 * uiElement.is( 'element' ); // -> true
	 * uiElement.is( 'node' ); // -> true
	 * uiElement.is( 'view:uiElement' ); // -> true
	 * uiElement.is( 'view:element' ); // -> true
	 * uiElement.is( 'view:node' ); // -> true
	 *
	 * uiElement.is( 'model:element' ); // -> false
	 * uiElement.is( 'documentFragment' ); // -> false
	 * ```
	 *
	 * Assuming that the object being checked is an ui element, you can also check its
	 * {@link module:engine/view/uielement~UIElement#name name}:
	 *
	 * ```ts
	 * uiElement.is( 'element', 'span' ); // -> true if this is a span ui element
	 * uiElement.is( 'uiElement', 'span' ); // -> same as above
	 * text.is( 'element', 'span' ); -> false
	 * ```
	 *
	 * @label UI_ELEMENT
	 */
	public is( type: 'uiElement' | 'view:uiElement' ): this is UIElement;

	/**
	 * Checks whether this object is of type {@link module:engine/view/text~Text}.
	 *
	 * ```ts
	 * text.is( '$text' ); // -> true
	 * text.is( 'node' ); // -> true
	 * text.is( 'view:$text' ); // -> true
	 * text.is( 'view:node' ); // -> true
	 *
	 * text.is( 'model:$text' ); // -> false
	 * text.is( 'element' ); // -> false
	 * text.is( 'range' ); // -> false
	 * ```
	 *
	 * @label TEXT
	 */
	public is( type: '$text' | 'view:$text' ): this is Text;

	/**
	 * hecks whether this object is of type {@link module:engine/view/documentfragment~DocumentFragment}.
	 *
	 * ```ts
	 * docFrag.is( 'documentFragment' ); // -> true
	 * docFrag.is( 'view:documentFragment' ); // -> true
	 *
	 * docFrag.is( 'model:documentFragment' ); // -> false
	 * docFrag.is( 'element' ); // -> false
	 * docFrag.is( 'node' ); // -> false
	 * ```
	 *
	 * @label DOCUMENT_FRAGMENT
	 */
	public is( type: 'documentFragment' | 'view:documentFragment' ): this is DocumentFragment;

	/**
	 * Checks whether this object is of type {@link module:engine/view/textproxy~TextProxy}.
	 *
	 * ```ts
	 * textProxy.is( '$textProxy' ); // -> true
	 * textProxy.is( 'view:$textProxy' ); // -> true
	 *
	 * textProxy.is( 'model:$textProxy' ); // -> false
	 * textProxy.is( 'element' ); // -> false
	 * textProxy.is( 'range' ); // -> false
	 * ```
	 *
	 * **Note:** Until version 20.0.0 this method wasn't accepting `'$textProxy'` type. The legacy `'textProxy'` type is still
	 * accepted for backward compatibility.
	 *
	 * @label TEXT_PROXY
	 */
	public is( type: '$textProxy' | 'view:$textProxy' ): this is TextProxy;

	/**
	 * Checks whether this object is of type {@link module:engine/view/position~Position}.
	 *
	 * ```ts
	 * position.is( 'position' ); // -> true
	 * position.is( 'view:position' ); // -> true
	 *
	 * position.is( 'model:position' ); // -> false
	 * position.is( 'element' ); // -> false
	 * position.is( 'range' ); // -> false
	 * ```
	 *
	 * @label POSITION
	 */
	public is( type: 'position' | 'view:position' ): this is Position;

	/**
	 * Checks whether this object is of type {@link module:engine/view/range~Range}.
	 *
	 * ```ts
	 * range.is( 'range' ); // -> true
	 * range.is( 'view:range' ); // -> true
	 *
	 * range.is( 'model:range' ); // -> false
	 * range.is( 'element' ); // -> false
	 * range.is( 'selection' ); // -> false
	 * ```
	 *
	 * @label RANGE
	 */
	public is( type: 'range' | 'view:range' ): this is Range;

	/**
	 * Checks whether this object is of type {@link module:engine/view/selection~Selection} or
	 * {@link module:engine/view/documentselection~DocumentSelection}.
	 *
	 * ```ts
	 * selection.is( 'selection' ); // -> true
	 * selection.is( 'view:selection' ); // -> true
	 *
	 * selection.is( 'model:selection' ); // -> false
	 * selection.is( 'element' ); // -> false
	 * selection.is( 'range' ); // -> false
	 * ```
	 *
	 * @label SELECTION
	 */
	public is( type: 'selection' | 'view:selection' ): this is Selection | DocumentSelection;

	/**
	 * Checks whether this object is of type {@link module:engine/view/documentselection~DocumentSelection}.
	 *
	 * ```ts
	 * `docSelection.is( 'selection' ); // -> true
	 * docSelection.is( 'documentSelection' ); // -> true
	 * docSelection.is( 'view:selection' ); // -> true
	 * docSelection.is( 'view:documentSelection' ); // -> true
	 *
	 * docSelection.is( 'model:documentSelection' ); // -> false
	 * docSelection.is( 'element' ); // -> false
	 * docSelection.is( 'node' ); // -> false
	 * ```
	 *
	 * @label DOCUMENT_SELECTION
	 */
	public is( type: 'documentSelection' | 'view:documentSelection' ): this is DocumentSelection;

	/**
	 * Checks whether the object is of type {@link module:engine/view/element~Element} or its subclass and has the specified `name`.
	 *
	 * @label ELEMENT_NAME
	 */
	public is<N extends string>( type: 'element' | 'view:element', name: N ): this is (
		Element |
		AttributeElement |
		ContainerElement |
		EditableElement |
		EmptyElement |
		RawElement |
		RootEditableElement |
		UIElement
	) & { name: N };

	/**
	 * Checks whether the object is of type {@link module:engine/view/attributeelement~AttributeElement} and has the specified `name`.
	 *
	 * @label ATTRIBUTE_ELEMENT_NAME
	 */
	public is<N extends string>( type: 'attributeElement' | 'view:attributeElement', name: N ): this is AttributeElement & { name: N };

	/**
	 * Checks whether the object is of type {@link module:engine/view/containerelement~ContainerElement}
	 * or its subclass and has the specified `name`.
	 *
	 * @label CONTAINER_ELEMENT_NAME
	 */
	public is<N extends string>( type: 'containerElement' | 'view:containerElement', name: N ): this is (
		ContainerElement |
		EditableElement |
		RootEditableElement
	) & { name: N };

	/**
	 * Checks whether the object is of type {@link module:engine/view/editableelement~EditableElement}
	 * or its subclass and has the specified `name`.
	 *
	 * @label EDITABLE_ELEMENT_NAME
	 */
	public is<N extends string>( type: 'editableElement' | 'view:editableElement', name: N ): this is (
		EditableElement |
		RootEditableElement
	) & { name: N };

	/**
	 * Checks whether the object is of type {@link module:engine/view/emptyelement~EmptyElement} has the specified `name`.
	 *
	 * @label EMPTY_ELEMENT_NAME
	 */
	public is<N extends string>( type: 'emptyElement' | 'view:emptyElement', name: N ): this is EmptyElement & { name: N };

	/**
	 * Checks whether the object is of type {@link module:engine/view/rawelement~RawElement} and has the specified `name`.
	 *
	 * @label RAW_ELEMENT_NAME
	 */
	public is<N extends string>( type: 'rawElement' | 'view:rawElement', name: N ): this is RawElement & { name: N };

	/**
	 * Checks whether the object is of type {@link module:engine/view/rooteditableelement~RootEditableElement} and has the specified `name`.
	 *
	 * @label ROOT_ELEMENT_NAME
	 */
	public is<N extends string>( type: 'rootElement' | 'view:rootElement', name: N ): this is RootEditableElement & { name: N };

	/**
	 * Checks whether the object is of type {@link module:engine/view/uielement~UIElement} and has the specified `name`.
	 *
	 * @label UI_ELEMENT_NAME
	 */
	public is<N extends string>( type: 'uiElement' | 'view:uiElement', name: N ): this is UIElement & { name: N };

	/* istanbul ignore next */
	public is(): boolean {
		// There are a lot of overloads above.
		// Overriding method in derived classes remove them and only `is( type: string ): boolean` is visible which we don't want.
		// One option would be to copy them all to all classes, but that's ugly.
		// It's best when TypeScript compiler doesn't see those overloads, except the one in the top base class.
		// To overload a method, but not let the compiler see it, do after class definition:
		// `MyClass.prototype.is = function( type: string ) {...}`
		throw new Error( 'is() method is abstract' );
	}
}
