/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module editor-balloon/ballooneditoruiview
 */

import { EditorUIView, InlineEditableUIView } from 'ckeditor5/src/ui';

/**
 * Contextual editor UI view. Uses the {@link module:ui/editableui/inline/inlineeditableuiview~InlineEditableUIView}.
 *
 * @extends module:ui/editorui/editoruiview~EditorUIView
 */
export default class BalloonEditorUIView extends EditorUIView {
	/**
	 * Creates an instance of the balloon editor UI view.
	 *
	 * @param {module:utils/locale~Locale} locale The {@link module:core/editor/editor~Editor#locale} instance.
	 * @param {module:engine/view/view~View} editingView The editing view instance this view is related to.
	 * @param {HTMLElement} [editableElement] The editable element. If not specified, it will be automatically created by
	 * @param {Object} [options={}] Configuration options for the view instance.
	 * @param {String} [options.editorName] Editor's name used for the creation of a voice label view instance.
	 * {@link module:ui/editableui/editableuiview~EditableUIView}. Otherwise, the given element will be used.
	 */
	constructor( locale, editingView, editableElement, options = {} ) {
		super( locale );

		const t = locale.t;

		/**
		 * Editor's label defined by the `options` passed to the constructor.
		 * Used to generate the label used by assistive technologies.
		 *
		 * @protected
		 * @readonly
		 */
		this._editorName = options.editorName;

		/**
		 * The editable UI view.
		 *
		 * @readonly
		 * @member {module:ui/editableui/inline/inlineeditableuiview~InlineEditableUIView}
		 */
		this.editable = new InlineEditableUIView( locale, editingView, editableElement, {
			label: () => {
				if ( this._editorName && this._editorName !== '' ) {
					return t( 'Rich Text Editor, ' + this._editorName );
				} else {
					return t( 'Rich Text Editor' );
				}
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		this.registerChild( this.editable );
	}
}
