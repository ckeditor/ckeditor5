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
 * Inline editor UI view. Uses inline editable and floating toolbar.
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
		 * A balloon panel view instance.
		 *
		 * @readonly
		 * @member {module:ui/panel/balloon/balloonpanelview~BalloonPanelView}
		 */
		this.panel = new BalloonPanelView( locale );

		this.panel.withArrow = false;

		Template.extend( this.panel.template, {
			attributes: {
				class: 'ck-toolbar__container'
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
		return super.init()
			.then( () => this.panel.content.add( this.toolbar ) );
	}

	/**
	 * @inheritDoc
	 */
	get editableElement() {
		return this.editable.element;
	}

	/**
	 * A set of positioning functions used by the {@link #panel} to float around
	 * {@link #editableElement}.
	 *
	 * The positioning functions are as follows:
	 *
	 * * South east:
	 *
	 *		+------------------+
	 *		| #editableElement |
	 *		+------------------+
	 *		           [ Panel ]
	 *
	 * * South west:
	 *
	 *		+------------------+
	 *		| #editableElement |
	 *		+------------------+
	 *		[ Panel ]
	 *
	 * * North east:
	 *
	 *		           [ Panel ]
	 *		+------------------+
	 *		| #editableElement |
	 *		+------------------+
	 *
	 *
	 * * North west:
	 *
	 *		[ Panel ]
	 *		+------------------+
	 *		| #editableElement |
	 *		+------------------+
	 *
	 * @type {module:utils/dom/position~Options#positions}
	 */
	get panelPositions() {
		return panelPositions;
	}
}

// A set of positioning functions used by the
// {@link module:editor-inline/inlineeditoruiview~InlineEditableUIView#panel}.
//
// @private
// @type {module:utils/dom/position~Options#positions}
const panelPositions = [
	( editableRect, panelRect ) => ( {
		top: editableRect.top - panelRect.height,
		left: editableRect.left,
		name: 'toolbar_nw'
	} ),
	( editableRect ) => ( {
		top: editableRect.bottom,
		left: editableRect.left,
		name: 'toolbar_sw'
	} ),
	( editableRect, panelRect ) => ( {
		top: editableRect.top - panelRect.height,
		left: editableRect.left + editableRect.width - panelRect.width,
		name: 'toolbar_ne'
	} ),
	( editableRect, panelRect ) => ( {
		top: editableRect.bottom,
		left: editableRect.left + editableRect.width - panelRect.width,
		name: 'toolbar_se'
	} )
];
