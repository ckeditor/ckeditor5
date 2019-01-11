/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module editor-balloon/ballooneditoruiview
 */

import EditorUIView from '@ckeditor/ckeditor5-ui/src/editorui/editoruiview';
import InlineEditableUIView from '@ckeditor/ckeditor5-ui/src/editableui/inline/inlineeditableuiview';
import log from '@ckeditor/ckeditor5-utils/src/log';

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
	 * @param {HTMLElement} [editableElement] The editable element. If not specified, it will be automatically created by
	 * {@link module:ui/editableui/editableuiview~EditableUIView}. Otherwise, the given element will be used.
	 */
	constructor( locale, editableElement ) {
		super( locale );

		/**
		 * The editable UI view.
		 *
		 * @readonly
		 * @member {module:ui/editableui/inline/inlineeditableuiview~InlineEditableUIView}
		 */
		this.editable = new InlineEditableUIView( locale, editableElement );
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		this.registerChild( this.editable );
	}

	/**
	 * **Deprecated** since `v12.0.0`. The {@link module:ui/editableui/editableuiview~EditableUIView#editableElement
	 * `EditableUIView editableElement`} could be used instead.
	 *
	 * The element which is the main editable element (usually the one with `contentEditable="true"`).
	 *
	 * @deprecated v12.0.0 The {@link module:ui/editableui/editableuiview~EditableUIView#editableElement
	 * `EditableUIView editableElement`} could be used instead.
	 * @readonly
	 * @member {HTMLElement} #editableElement
	 */
	get editableElement() {
		log.warn( 'deprecated-ui-view-editableElement: The BalloonEditorUIView#editableElement property is deprecated.' );
		return this.editable.editableElement;
	}
}
