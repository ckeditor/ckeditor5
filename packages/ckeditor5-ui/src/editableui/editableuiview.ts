/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/editableui/editableuiview
 */

import { View } from '../view.js';

import type { EditingView } from '@ckeditor/ckeditor5-engine';
import { toArray, type Locale, type ObservableChangeEvent } from '@ckeditor/ckeditor5-utils';
import type { ViewRootElementDefinition } from '@ckeditor/ckeditor5-core';

import { isElement as _isElement } from 'es-toolkit/compat';

/**
 * The editable UI view class.
 */
export class EditableUIView extends View {
	/**
	 * The name of the editable UI view.
	 */
	public name: string | null = null;

	/**
	 * Controls whether the editable is focused, i.e. the user is typing in it.
	 *
	 * @observable
	 */
	declare public isFocused: boolean;

	/**
	 * The editing view instance the editable is related to. Editable uses the editing
	 * view to dynamically modify its certain DOM attributes after {@link #render rendering}.
	 *
	 * **Note**: The DOM attributes are performed by the editing view and not UI
	 * {@link module:ui/view~View#bindTemplate template bindings} because once rendered,
	 * the editable DOM element must remain under the full control of the engine to work properly.
	 */
	protected _editingView: EditingView;

	/**
	 * The element which is the main editable element (usually the one with `contentEditable="true"`).
	 */
	protected _editableElement: HTMLElement | null | undefined;

	/**
	 * Whether an external {@link #_editableElement} was passed into the constructor, which also means
	 * the view will not render its {@link #template}.
	 */
	private _hasExternalElement: boolean;

	/**
	 * Creates an instance of EditableUIView class.
	 *
	 * @param locale The locale instance.
	 * @param editingView The editing view instance the editable is related to.
	 * @param editableElement The editable element. If an existing `HTMLElement` is passed, the view applies its
	 * template to it; otherwise the view creates a fresh element (a `<div>` by default, or one matching the given
	 * {@link module:core/editor/editorconfig~ViewRootElementDefinition}).
	 */
	constructor(
		locale: Locale,
		editingView: EditingView,
		editableElement?: HTMLElement | ViewRootElementDefinition
	) {
		super( locale );

		const elementDefinition = isElement( editableElement ) ? undefined : editableElement;
		const { name, classes, styles, attributes } = elementDefinition || {};

		this.setTemplate( {
			tag: name || 'div',
			attributes: {
				...attributes,
				class: [
					'ck',
					'ck-content',
					'ck-editor__editable',
					'ck-rounded-corners',
					...( classes ? toArray( classes ) : [] )
				],
				...( styles && { style: styles } ),
				lang: locale.contentLanguage,
				dir: locale.contentLanguageDirection
			}
		} );

		this.set( 'isFocused', false );

		this._editableElement = isElement( editableElement ) ? editableElement : undefined;
		this._hasExternalElement = !!this._editableElement;
		this._editingView = editingView;
	}

	/**
	 * Renders the view by either applying the {@link #template} to the existing
	 * {@link module:ui/editableui/editableuiview~EditableUIView#_editableElement} or assigning {@link #element}
	 * as {@link module:ui/editableui/editableuiview~EditableUIView#_editableElement}.
	 */
	public override render(): void {
		super.render();

		if ( this._hasExternalElement ) {
			this.template!.apply( this.element = this._editableElement! );
		} else {
			this._editableElement = this.element;
		}

		this.on<ObservableChangeEvent>( 'change:isFocused', () => this._updateIsFocusedClasses() );
		this._updateIsFocusedClasses();
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		if ( this._hasExternalElement ) {
			this.template!.revert( this._editableElement! );
		}

		super.destroy();
	}

	/**
	 * Whether an external {@link #_editableElement} was passed into the constructor, which also means
	 * the view will not render its {@link #template}.
	 */
	public get hasExternalElement(): boolean {
		return this._hasExternalElement;
	}

	/**
	 * Updates the `ck-focused` and `ck-blurred` CSS classes on the {@link #element} according to
	 * the {@link #isFocused} property value using the {@link #_editingView editing view} API.
	 */
	private _updateIsFocusedClasses() {
		const editingView = this._editingView;

		if ( editingView.isRenderingInProgress ) {
			updateAfterRender( this );
		} else {
			update( this );
		}

		function update( view: EditableUIView ) {
			editingView.change( writer => {
				const viewRoot = editingView.document.getRoot( view.name! )!;

				writer.addClass( view.isFocused ? 'ck-focused' : 'ck-blurred', viewRoot );
				writer.removeClass( view.isFocused ? 'ck-blurred' : 'ck-focused', viewRoot );
			} );
		}

		// In a case of a multi-root editor, a callback will be attached more than once (one callback for each root).
		// While executing one callback the `isRenderingInProgress` observable is changing what causes executing another
		// callback and render is called inside the already pending render.
		// We need to be sure that callback is executed only when the value has changed from `true` to `false`.
		// See https://github.com/ckeditor/ckeditor5/issues/1676.
		function updateAfterRender( view: EditableUIView ) {
			editingView.once<ObservableChangeEvent<boolean>>( 'change:isRenderingInProgress', ( evt, name, value ) => {
				if ( !value ) {
					update( view );
				} else {
					updateAfterRender( view );
				}
			} );
		}
	}
}

/**
 * An alias for `isElement` from `es-toolkit/compat` with additional type guard.
 */
function isElement( value: any ): value is HTMLElement {
	return _isElement( value );
}
