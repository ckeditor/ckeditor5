/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/model/typecheckable
 */

import type { Marker } from './markercollection.js';
import { type ModelDocumentFragment } from './documentfragment.js';
import { type ModelDocumentSelection } from './documentselection.js';
import { type ModelElement } from './element.js';
import { type ModelLivePosition } from './liveposition.js';
import { type ModelLiveRange } from './liverange.js';
import { type ModelNode } from './node.js';
import { type ModelPosition } from './position.js';
import { type ModelRange } from './range.js';
import { type ModelRootElement } from './rootelement.js';
import { type ModelSelection } from './selection.js';
import { type ModelText } from './text.js';
import { type ModelTextProxy } from './textproxy.js';

export abstract class ModelTypeCheckable {
	/**
	 * Checks whether the object is of type {@link module:engine/model/node~ModelNode} or its subclass.
	 *
	 * This method is useful when processing model objects that are of unknown type. For example, a function
	 * may return a {@link module:engine/model/documentfragment~ModelDocumentFragment} or a {@link module:engine/model/node~ModelNode}
	 * that can be either a text node or an element. This method can be used to check what kind of object is returned.
	 *
	 * ```ts
	 * someObject.is( 'element' ); // -> true if this is an element
	 * someObject.is( 'node' ); // -> true if this is a node (a text node or an element)
	 * someObject.is( 'documentFragment' ); // -> true if this is a document fragment
	 * ```
	 *
	 * Since this method is also available on a range of view objects, you can prefix the type of the object with
	 * `model:` or `view:` to check, for example, if this is the model's or view's element:
	 *
	 * ```ts
	 * modelElement.is( 'model:element' ); // -> true
	 * modelElement.is( 'view:element' ); // -> false
	 * ```
	 *
	 * By using this method it is also possible to check a name of an element:
	 *
	 * ```ts
	 * imageElement.is( 'element', 'imageBlock' ); // -> true
	 * imageElement.is( 'element', 'imageBlock' ); // -> same as above
	 * imageElement.is( 'model:element', 'imageBlock' ); // -> same as above, but more precise
	 * ```
	 *
	 * @label NODE
	 */
	public is( type: 'node' | 'model:node' ): this is ModelNode | ModelElement | ModelText | ModelRootElement;

	/**
	 * Checks whether the object is of type {@link module:engine/model/element~ModelElement} or its subclass.
	 *
	 * ```ts
	 * element.is( 'element' ); // -> true
	 * element.is( 'node' ); // -> true
	 * element.is( 'model:element' ); // -> true
	 * element.is( 'model:node' ); // -> true
	 *
	 * element.is( 'view:element' ); // -> false
	 * element.is( 'documentSelection' ); // -> false
	 * ```
	 *
	 * Assuming that the object being checked is an element, you can also check its
	 * {@link module:engine/model/element~ModelElement#name name}:
	 *
	 * ```ts
	 * element.is( 'element', 'imageBlock' ); // -> true if this is an <imageBlock> element
	 * text.is( 'element', 'imageBlock' ); -> false
	 * ```
	 *
	 * @label ELEMENT
	 */
	public is( type: 'element' | 'model:element' ): this is ModelElement | ModelRootElement;

	/**
	 * Checks whether the object is of type {@link module:engine/model/rootelement~ModelRootElement}.
	 *
	 * ```ts
	 * rootElement.is( 'rootElement' ); // -> true
	 * rootElement.is( 'element' ); // -> true
	 * rootElement.is( 'node' ); // -> true
	 * rootElement.is( 'model:rootElement' ); // -> true
	 * rootElement.is( 'model:element' ); // -> true
	 * rootElement.is( 'model:node' ); // -> true
	 *
	 * rootElement.is( 'view:element' ); // -> false
	 * rootElement.is( 'documentFragment' ); // -> false
	 * ```
	 *
	 * Assuming that the object being checked is an element, you can also check its
	 * {@link module:engine/model/element~ModelElement#name name}:
	 *
	 * ```ts
	 * rootElement.is( 'rootElement', '$root' ); // -> same as above
	 * ```
	 *
	 * @label ROOT_ELEMENT
	 */
	public is( type: 'rootElement' | 'model:rootElement' ): this is ModelRootElement;

	/**
	 * Checks whether the object is of type {@link module:engine/model/text~ModelText}.
	 *
	 * ```ts
	 * text.is( '$text' ); // -> true
	 * text.is( 'node' ); // -> true
	 * text.is( 'model:$text' ); // -> true
	 * text.is( 'model:node' ); // -> true
	 *
	 * text.is( 'view:$text' ); // -> false
	 * text.is( 'documentSelection' ); // -> false
	 * ```
	 *
	 * **Note:** Until version 20.0.0 this method wasn't accepting `'$text'` type. The legacy `'text'` type is still
	 * accepted for backward compatibility.
	 *
	 * @label TEXT
	 */
	public is( type: '$text' | 'model:$text' ): this is ModelText;

	/**
	 * Checks whether the object is of type {@link module:engine/model/position~ModelPosition} or its subclass.
	 *
	 * ```ts
	 * position.is( 'position' ); // -> true
	 * position.is( 'model:position' ); // -> true
	 *
	 * position.is( 'view:position' ); // -> false
	 * position.is( 'documentSelection' ); // -> false
	 * ```
	 *
	 * @label POSITION
	 */
	public is( type: 'position' | 'model:position' ): this is ModelPosition | ModelLivePosition;

	/**
	 * Checks whether the object is of type {@link module:engine/model/liveposition~ModelLivePosition}.
	 *
	 * ```ts
	 * livePosition.is( 'position' ); // -> true
	 * livePosition.is( 'model:position' ); // -> true
	 * livePosition.is( 'liveposition' ); // -> true
	 * livePosition.is( 'model:livePosition' ); // -> true
	 *
	 * livePosition.is( 'view:position' ); // -> false
	 * livePosition.is( 'documentSelection' ); // -> false
	 * ```
	 *
	 * @label LIVE_POSITION
	 */
	public is( type: 'livePosition' | 'model:livePosition' ): this is ModelLivePosition;

	/**
	 * Checks whether the object is of type {@link module:engine/model/range~ModelRange} or its subclass.
	 *
	 * ```ts
	 * range.is( 'range' ); // -> true
	 * range.is( 'model:range' ); // -> true
	 *
	 * range.is( 'view:range' ); // -> false
	 * range.is( 'documentSelection' ); // -> false
	 * ```
	 *
	 * @label RANGE
	 */
	public is( type: 'range' | 'model:range' ): this is ModelRange | ModelLiveRange;

	/**
	 * Checks whether the object is of type {@link module:engine/model/liverange~ModelLiveRange}.
	 *
	 * ```ts
	 * liveRange.is( 'range' ); // -> true
	 * liveRange.is( 'model:range' ); // -> true
	 * liveRange.is( 'liveRange' ); // -> true
	 * liveRange.is( 'model:liveRange' ); // -> true
	 *
	 * liveRange.is( 'view:range' ); // -> false
	 * liveRange.is( 'documentSelection' ); // -> false
	 * ```
	 *
	 * @label LIVE_RANGE
	 */
	public is( type: 'liveRange' | 'model:liveRange' ): this is ModelLiveRange;

	/**
	 * Checks whether the object is of type {@link module:engine/model/documentfragment~ModelDocumentFragment}.
	 *
	 * ```ts
	 * docFrag.is( 'documentFragment' ); // -> true
	 * docFrag.is( 'model:documentFragment' ); // -> true
	 *
	 * docFrag.is( 'view:documentFragment' ); // -> false
	 * docFrag.is( 'element' ); // -> false
	 * docFrag.is( 'node' ); // -> false
	 * ```
	 *
	 * @label DOCUMENT_FRAGMENT
	 */
	public is( type: 'documentFragment' | 'model:documentFragment' ): this is ModelDocumentFragment;

	/**
	 * Checks whether the object is of type {@link module:engine/model/selection~ModelSelection}
	 * or {@link module:engine/model/documentselection~ModelDocumentSelection}.
	 *
	 * ```ts
	 * selection.is( 'selection' ); // -> true
	 * selection.is( 'model:selection' ); // -> true
	 *
	 * selection.is( 'view:selection' ); // -> false
	 * selection.is( 'range' ); // -> false
	 * ```
	 *
	 * @label SELECTION
	 */
	public is( type: 'selection' | 'model:selection' ): this is ModelSelection | ModelDocumentSelection;

	/**
	 * Checks whether the object is of type {@link module:engine/model/documentselection~ModelDocumentSelection}.
	 *
	 * ```ts
	 * selection.is( 'selection' ); // -> true
	 * selection.is( 'documentSelection' ); // -> true
	 * selection.is( 'model:selection' ); // -> true
	 * selection.is( 'model:documentSelection' ); // -> true
	 *
	 * selection.is( 'view:selection' ); // -> false
	 * selection.is( 'element' ); // -> false
	 * selection.is( 'node' ); // -> false
	 * ```
	 *
	 * @label DOCUMENT_SELECTION
	 */
	public is( type: 'documentSelection' | 'model:documentSelection' ): this is ModelDocumentSelection;

	/**
	 * Checks whether the object is of type {@link module:engine/model/markercollection~Marker}.
	 *
	 * ```ts
	 * marker.is( 'marker' ); // -> true
	 * marker.is( 'model:marker' ); // -> true
	 *
	 * marker.is( 'view:element' ); // -> false
	 * marker.is( 'documentSelection' ); // -> false
	 * ```
	 *
	 * @label MARKER
	 */
	public is( type: 'marker' | 'model:marker' ): this is Marker;

	/**
	 * Checks whether the object is of type {@link module:engine/model/textproxy~ModelTextProxy}.
	 *
	 * ```ts
	 * textProxy.is( '$textProxy' ); // -> true
	 * textProxy.is( 'model:$textProxy' ); // -> true
	 *
	 * textProxy.is( 'view:$textProxy' ); // -> false
	 * textProxy.is( 'range' ); // -> false
	 * ```
	 *
	 * **Note:** Until version 20.0.0 this method wasn't accepting `'$textProxy'` type. The legacy `'textProxt'` type is still
	 * accepted for backward compatibility.
	 *
	 * @label TEXT_PROXY
	 */
	public is( type: '$textProxy' | 'model:$textProxy' ): this is ModelTextProxy;

	/**
	 * Checks whether the object is of type {@link module:engine/model/element~ModelElement} or its subclass and has the specified `name`.
	 *
	 * ```ts
	 * element.is( 'element', 'imageBlock' ); // -> true if this is an <imageBlock> element
	 * text.is( 'element', 'imageBlock' ); -> false
	 * ```
	 *
	 * @label ELEMENT_NAME
	 */
	public is<N extends string>( type: 'element' | 'model:element', name: N ): this is ( ModelElement | ModelRootElement ) & { name: N };

	/**
	 * Checks whether the object is of type {@link module:engine/model/rootelement~ModelRootElement} and has the specified `name`.
	 *
	 * ```ts
	 * rootElement.is( 'rootElement', '$root' );
	 * ```
	 *
	 * @label ROOT_ELEMENT_NAME
	 */
	public is<N extends string>( type: 'rootElement' | 'model:rootElement', name: N ): this is ModelRootElement & { name: N };

	/* istanbul ignore next -- @preserve */
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
