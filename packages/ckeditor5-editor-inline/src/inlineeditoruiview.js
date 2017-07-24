/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module editor-inline/inlineeditoruiview
 */

import EditorUIView from '@ckeditor/ckeditor5-ui/src/editorui/editoruiview';
import InlineEditableUIView from '@ckeditor/ckeditor5-ui/src/editableui/inline/inlineeditableuiview';
import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import Template from '@ckeditor/ckeditor5-ui/src/template';

/**
 * Inline editor UI view. Uses an nline editable and a floating toolbar.
 *
 * @extends module:ui/editorui/editoruiview~EditorUIView
 */
export default class InlineEditorUIView extends EditorUIView {
	/**
	 * Creates an instance of the inline editor UI view.
	 *
	 * @param {module:utils/locale~Locale} locale The {@link module:core/editor/editor~Editor#locale} instance.
	 */
	constructor( locale, editableElement ) {
		super( locale );

		/**
		 * A floating toolbar view instance.
		 *
		 * @readonly
		 * @member {module:ui/toolbar/toolbarview~ToolbarView}
		 */
		this.toolbar = new ToolbarView( locale );

		/**
		 * The offset from the top edge of the web browser's viewport which makes the
		 * UI become sticky. The default value is `0`, which means that the UI becomes
		 * sticky when its upper edge touches the top of the page viewport.
		 *
		 * This attribute is useful when the web page has UI elements positioned to the top
		 * either using `position: fixed` or `position: sticky`, which would cover the
		 * UI or vice–versa (depending on the `z-index` hierarchy).
		 *
		 * @readonly
		 * @observable
		 * @member {Number} #viewportTopOffset
		 */
		this.set( 'viewportTopOffset', 0 );

		Template.extend( this.toolbar.template, {
			attributes: {
				class: [
					'ck-editor-toolbar',

					// https://github.com/ckeditor/ckeditor5-editor-inline/issues/11
					'ck-toolbar_floating'
				]
			}
		} );

		/**
		 * A balloon panel view instance.
		 *
		 * @readonly
		 * @member {module:ui/panel/balloon/balloonpanelview~BalloonPanelView}
		 */
		this.panel = new BalloonPanelView( locale );

		this.panel.withArrow = false;

		/**
		 * A set of positioning functions used by the {@link #panel} to float around
		 * {@link #editableElement}.
		 *
		 * The positioning functions are as follows:
		 *
		 * * West:
		 *
		 *		[ Panel ]
		 *		+------------------+
		 *		| #editableElement |
		 *		+------------------+
		 *
		 *		+------------------+
		 *		| #editableElement |
		 *		|[ Panel ]         |
		 *		|                  |
		 *		+------------------+
		 *
		 *		+------------------+
		 *		| #editableElement |
		 *		+------------------+
		 *		[ Panel ]
		 *
		 * * East:
		 *
		 *		           [ Panel ]
		 *		+------------------+
		 *		| #editableElement |
		 *		+------------------+
		 *
		 *		+------------------+
		 *		| #editableElement |
		 *		|         [ Panel ]|
		 *		|                  |
		 *		+------------------+
		 *
		 *		+------------------+
		 *		| #editableElement |
		 *		+------------------+
		 *		           [ Panel ]
		 *
		 * @readonly
		 * @type {module:utils/dom/position~Options#positions}
		 */
		this.panelPositions = this._getPanelPositions();

		Template.extend( this.panel.template, {
			attributes: {
				class: 'ck-toolbar-container'
			}
		} );

		/**
		 * Editable UI view.
		 *
		 * @readonly
		 * @member {module:ui/editableui/inline/inlineeditableuiview~InlineEditableUIView}
		 */
		this.editable = new InlineEditableUIView( locale, editableElement );

		this.body.add( this.panel );
		this.addChildren( this.editable );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		super.init();

		this.panel.content.add( this.toolbar );
	}

	/**
	 * @inheritDoc
	 */
	get editableElement() {
		return this.editable.element;
	}

	/**
	 * Determines the panel top position of the {@link #panel} in {@link #panelPositions}.
	 *
	 * @private
	 * @param {module:utils/dom/rect~Rect} editableRect Rect of the {@link #editableElement}.
	 * @param {module:utils/dom/rect~Rect} panelRect Rect of the {@link #panel}.
	 */
	_getPanelPositionTop( editableRect, panelRect ) {
		let top;

		if ( editableRect.top > panelRect.height + this.viewportTopOffset ) {
			top = editableRect.top - panelRect.height;
		} else if ( editableRect.bottom > panelRect.height + this.viewportTopOffset + 50 ) {
			top = this.viewportTopOffset;
		} else {
			top = editableRect.bottom;
		}

		return top;
	}

	/**
	 * Returns the positions for {@link #panelPositions}.
	 *
	 * @private
	 * @returns {module:utils/dom/position~Options#positions}
	 */
	_getPanelPositions() {
		return [
			( editableRect, panelRect ) => {
				return {
					top: this._getPanelPositionTop( editableRect, panelRect ),
					left: editableRect.left,
					name: 'toolbar_west'
				};
			},
			( editableRect, panelRect ) => {
				return {
					top: this._getPanelPositionTop( editableRect, panelRect ),
					left: editableRect.left + editableRect.width - panelRect.width,
					name: 'toolbar_east'
				};
			}
		];
	}
}
