/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/view/editableelement
 */

import { ViewContainerElement } from './containerelement.js';
import { ObservableMixin } from '@ckeditor/ckeditor5-utils';
import type { ViewSelectionChangeEvent } from './selection.js';
import type { ViewElementAttributes } from './element.js';
import { type ViewDocument } from './document.js';
import { type ViewNode } from './node.js';

/**
 * Editable element which can be a {@link module:engine/view/rooteditableelement~ViewRootEditableElement root}
 * or nested editable area in the editor.
 *
 * Editable is automatically read-only when its {@link module:engine/view/document~ViewDocument Document} is read-only.
 *
 * The constructor of this class shouldn't be used directly. To create new `ViewEditableElement` use the
 * {@link module:engine/view/downcastwriter~ViewDowncastWriter#createEditableElement `downcastWriter#createEditableElement()`} method.
 */
export class ViewEditableElement extends /* #__PURE__ */ ObservableMixin( ViewContainerElement ) {
	/**
	 * Whether the editable is in read-write or read-only mode.
	 *
	 * @observable
	 */
	declare public isReadOnly: boolean;

	/**
	 * Whether the editable is focused.
	 *
	 * This property updates when {@link module:engine/view/document~ViewDocument#isFocused document.isFocused} or view
	 * selection is changed.
	 *
	 * @readonly
	 * @observable
	 */
	declare public isFocused: boolean;

	/**
	 * Placeholder of editable element.
	 *
	 * ```ts
	 * editor.editing.view.document.getRoot( 'main' ).placeholder = 'New placeholder';
	 * ```
	 *
	 * @observable
	 */
	declare public placeholder?: string;

	/**
	 * Creates an editable element.
	 *
	 * @see module:engine/view/downcastwriter~ViewDowncastWriter#createEditableElement
	 * @internal
	 * @param document The document instance to which this element belongs.
	 * @param name Node name.
	 * @param attributes Collection of attributes.
	 * @param children A list of nodes to be inserted into created element.
	 */
	constructor(
		document: ViewDocument,
		name: string,
		attributes?: ViewElementAttributes,
		children?: ViewNode | Iterable<ViewNode>
	) {
		super( document, name, attributes, children );

		this.set( 'isReadOnly', false );
		this.set( 'isFocused', false );
		this.set( 'placeholder', undefined );

		this.bind( 'isReadOnly' ).to( document );

		this.bind( 'isFocused' ).to(
			document,
			'isFocused',
			isFocused => isFocused && document.selection.editableElement == this
		);

		// Update focus state based on selection changes.
		this.listenTo<ViewSelectionChangeEvent>( document.selection, 'change', () => {
			this.isFocused = document.isFocused && document.selection.editableElement == this;
		} );
	}

	public destroy(): void {
		this.stopListening();
	}
}

// The magic of type inference using `is` method is centralized in `TypeCheckable` class.
// Proper overload would interfere with that.
ViewEditableElement.prototype.is = function( type: string, name?: string ): boolean {
	if ( !name ) {
		return type === 'editableElement' || type === 'view:editableElement' ||
			// From super.is(). This is highly utilised method and cannot call super. See ckeditor/ckeditor5#6529.
			type === 'containerElement' || type === 'view:containerElement' ||
			type === 'element' || type === 'view:element' ||
			type === 'node' || type === 'view:node';
	} else {
		return name === this.name && (
			type === 'editableElement' || type === 'view:editableElement' ||
			// From super.is(). This is highly utilised method and cannot call super. See ckeditor/ckeditor5#6529.
			type === 'containerElement' || type === 'view:containerElement' ||
			type === 'element' || type === 'view:element'
		);
	}
};
