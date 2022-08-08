/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
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
	public is( type: 'attributeElement' | 'view:attributeElement' ): this is AttributeElement;
	public is( type: 'containerElement' | 'view:containerElement' ): this is ContainerElement | EditableElement | RootEditableElement;
	public is( type: 'editableElement' | 'view:editableElement' ): this is EditableElement | RootEditableElement;
	public is( type: 'emptyElement' | 'view:emptyElement' ): this is EmptyElement;
	public is( type: 'rawElement' | 'view:rawElement' ): this is RawElement;
	public is( type: 'rootElement' | 'view:rootElement' ): this is RootEditableElement;
	public is( type: 'uiElement' | 'view:uiElement' ): this is UIElement;

	public is( type: '$text' | 'view:$text' ): this is Text;
	public is( type: 'documentFragment' | 'view:documentFragment' ): this is DocumentFragment;
	public is( type: '$textProxy' | 'view:$textProxy' ): this is TextProxy;
	public is( type: 'position' | 'view:position' ): this is Position;
	public is( type: 'range' | 'view:range' ): this is Range;
	public is( type: 'selection' | 'view:selection' ): this is Selection | DocumentSelection;
	public is( type: 'documentSelection' | 'view:documentSelection' ): this is DocumentSelection;

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
	public is<N extends string>( type: 'attributeElement' | 'view:attributeElement', name: N ): this is AttributeElement & { name: N };
	public is<N extends string>( type: 'containerElement' | 'view:containerElement', name: N ): this is (
		ContainerElement |
		EditableElement |
		RootEditableElement
	) & { name: N };
	public is<N extends string>( type: 'editableElement' | 'view:editableElement', name: N ): this is (
		EditableElement |
		RootEditableElement
	) & { name: N };
	public is<N extends string>( type: 'emptyElement' | 'view:emptyElement', name: N ): this is EmptyElement & { name: N };
	public is<N extends string>( type: 'rawElement' | 'view:rawElement', name: N ): this is RawElement & { name: N };
	public is<N extends string>( type: 'rootElement' | 'view:rootElement', name: N ): this is RootEditableElement & { name: N };
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
