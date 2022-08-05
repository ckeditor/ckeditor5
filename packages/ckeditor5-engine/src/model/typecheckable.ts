/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/typecheckable
 */

import type { Marker } from './markercollection';
import type DocumentFragment from './documentfragment';
import type DocumentSelection from './documentselection';
import type Element from './element';
import type LivePosition from './liveposition';
import type LiveRange from './liverange';
import type Node from './node';
import type Position from './position';
import type Range from './range';
import type RootElement from './rootelement';
import type Selection from './selection';
import type Text from './text';
import type TextProxy from './textproxy';

export default abstract class TypeCheckable {
	public is( type: 'node' | 'model:node' ): this is Node | Element | Text | RootElement;
	public is( type: 'element' | 'model:element' ): this is Element | RootElement;
	public is( type: 'rootElement' | 'model:rootElement' ): this is RootElement;
	public is( type: '$text' | 'model:$text' ): this is Text;
	public is( type: 'position' | 'model:position' ): this is Position | LivePosition;
	public is( type: 'livePosition' | 'model:livePosition' ): this is LivePosition;
	public is( type: 'range' | 'model:range' ): this is Range | LiveRange;
	public is( type: 'liveRange' | 'model:liveRange' ): this is LiveRange;
	public is( type: 'documentFragment' | 'model:documentFragment' ): this is DocumentFragment;
	public is( type: 'selection' | 'model:selection' ): this is Selection | DocumentSelection;
	public is( type: 'documentSelection' | 'model:documentSelection' ): this is DocumentSelection;
	public is( type: 'marker' | 'model:marker' ): this is Marker;
	public is( type: '$textProxy' | 'model:$textProxy' ): this is TextProxy;
	public is<N extends string>( type: 'element' | 'model:element', name: N ): this is ( Element | RootElement ) & { name: N };
	public is<N extends string>( type: 'rootElement' | 'model:rootElement', name: N ): this is RootElement & { name: N };

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
