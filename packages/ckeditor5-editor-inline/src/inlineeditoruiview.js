/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module editor-inline/inlineeditoruiview
 */

import EditorUIView from '@ckeditor/ckeditor5-ui/src/editorui/editoruiview';
import InlineEditableUIView from '@ckeditor/ckeditor5-ui/src/editableui/inline/inlineeditableuiview';
import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';
import ResizeObserver from '@ckeditor/ckeditor5-utils/src/dom/resizeobserver';
import toUnit from '@ckeditor/ckeditor5-utils/src/dom/tounit';

const toPx = toUnit( 'px' );

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
	 * @param {module:engine/view/view~View} editingView The editing view instance this view is related to.
	 * @param {HTMLElement} [editableElement] The editable element. If not specified, it will be automatically created by
	 * {@link module:ui/editableui/editableuiview~EditableUIView}. Otherwise, the given element will be used.
	 * @param {Object} [options={}] Configuration options for the view instance.
	 * @param {Boolean} [options.shouldToolbarGroupWhenFull] When set `true` enables automatic items grouping
	 * in the main {@link module:editor-inline/inlineeditoruiview~InlineEditorUIView#toolbar toolbar}.
	 * See {@link module:ui/toolbar/toolbarview~ToolbarOptions#shouldGroupWhenFull} to learn more.
	 */
	constructor( locale, editingView, editableElement, options = {} ) {
		super( locale );

		/**
		 * A floating toolbar view instance.
		 *
		 * @readonly
		 * @member {module:ui/toolbar/toolbarview~ToolbarView}
		 */
		this.toolbar = new ToolbarView( locale, {
			shouldGroupWhenFull: options.shouldToolbarGroupWhenFull
		} );

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

		this.toolbar.extendTemplate( {
			attributes: {
				class: [
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
		 * {@link #element editableElement}.
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
		 * See: {@link module:utils/dom/position~Options#positions}.
		 *
		 * @readonly
		 * @type {Array.<Function>}
		 */
		this.panelPositions = this._getPanelPositions();

		this.panel.extendTemplate( {
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
		this.editable = new InlineEditableUIView( locale, editingView, editableElement );

		/**
		 * An instance of the resize observer that helps dynamically determine the geometry of the toolbar
		 * and manage items that do not fit into a single row.
		 *
		 * **Note:** Created in {@link #render}.
		 *
		 * @private
		 * @member {module:utils/dom/resizeobserver~ResizeObserver}
		 */
		this._resizeObserver = null;
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		this.body.add( this.panel );
		this.registerChild( this.editable );
		this.panel.content.add( this.toolbar );

		const options = this.toolbar.options;

		// Set toolbar's max-width on the initialization and update it on the editable resize,
		// if 'shouldToolbarGroupWhenFull' in config is set to 'true'.
		if ( options.shouldGroupWhenFull ) {
			const editableElement = this.editable.element;

			this._resizeObserver = new ResizeObserver( editableElement, () => {
				this.toolbar.maxWidth = toPx( new Rect( editableElement ).width );
			} );
		}
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		super.destroy();

		if ( this._resizeObserver ) {
			this._resizeObserver.destroy();
		}
	}

	/**
	 * Determines the panel top position of the {@link #panel} in {@link #panelPositions}.
	 *
	 * @private
	 * @param {module:utils/dom/rect~Rect} editableRect Rect of the {@link #element}.
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
	 * See: {@link module:utils/dom/position~Options#positions}.
	 *
	 * @private
	 * @returns {Array.<Function>}
	 */
	_getPanelPositions() {
		const positions = [
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

		if ( this.locale.uiLanguageDirection === 'ltr' ) {
			return positions;
		} else {
			return positions.reverse();
		}
	}
}
