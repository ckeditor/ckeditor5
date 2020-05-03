/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/toolbar/block/blocktoolbar
 */

/* global window */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import BlockButtonView from './blockbuttonview';
import BalloonPanelView from '../../panel/balloon/balloonpanelview';
import ToolbarView from '../toolbarview';

import clickOutsideHandler from '../../bindings/clickoutsidehandler';

import { getOptimalPosition } from '@ckeditor/ckeditor5-utils/src/dom/position';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';
import normalizeToolbarConfig from '../normalizetoolbarconfig';

import ResizeObserver from '@ckeditor/ckeditor5-utils/src/dom/resizeobserver';

import toUnit from '@ckeditor/ckeditor5-utils/src/dom/tounit';
import iconPilcrow from '@ckeditor/ckeditor5-core/theme/icons/pilcrow.svg';

const toPx = toUnit( 'px' );

/**
 * The block toolbar plugin.
 *
 * This plugin provides a button positioned next to the block of content where the selection is anchored.
 * Upon clicking the button, a dropdown providing access to editor features shows up, as configured in
 * {@link module:core/editor/editorconfig~EditorConfig#blockToolbar}.
 *
 * By default, the button is displayed next to all elements marked in {@link module:engine/model/schema~Schema}
 * as `$block` for which the toolbar provides at least one option.
 *
 * By default, the button is attached so its right boundary is touching the
 * {@link module:engine/view/editableelement~EditableElement}:
 *
 * 		 __ |
 * 		|  ||  This is a block of content that the
 * 		 ¯¯ |  button is attached to. This is a
 * 		    |  block of content that the button is
 * 		    |  attached to.
 *
 * The position of the button can be adjusted using the CSS `transform` property:
 *
 * 		.ck-block-toolbar-button {
 * 			transform: translateX( -10px );
 * 		}
 *
 * 		 __   |
 * 		|  |  |  This is a block of content that the
 * 		 ¯¯   |  button is attached to. This is a
 * 		      |  block of content that the button is
 * 		      |  attached to.
 *
 * **Note**: If you plan to run the editor in a right–to–left (RTL) language, keep in mind the button
 * will be attached to the **right** boundary of the editable area. In that case, make sure the
 * CSS position adjustment works properly by adding the following styles:
 *
 * 		.ck[dir="rtl"] .ck-block-toolbar-button {
 * 			transform: translateX( 10px );
 * 		}
 *
 * @extends module:core/plugin~Plugin
 */
export default class BlockToolbar extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'BlockToolbar';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * A cached and normalized `config.blockToolbar` object.
		 *
		 * @type {module:core/editor/editorconfig~EditorConfig#blockToolbar}
		 * @private
		 */
		this._blockToolbarConfig = normalizeToolbarConfig( this.editor.config.get( 'blockToolbar' ) );

		/**
		 * The toolbar view.
		 *
		 * @type {module:ui/toolbar/toolbarview~ToolbarView}
		 */
		this.toolbarView = this._createToolbarView();

		/**
		 * The balloon panel view, containing the {@link #toolbarView}.
		 *
		 * @type {module:ui/panel/balloon/balloonpanelview~BalloonPanelView}
		 */
		this.panelView = this._createPanelView();

		/**
		 * The button view that opens the {@link #toolbarView}.
		 *
		 * @type {module:ui/toolbar/block/blockbuttonview~BlockButtonView}
		 */
		this.buttonView = this._createButtonView();

		/**
		 * An instance of the resize observer that allows to respond to changes in editable's geometry
		 * so the toolbar can stay within its boundaries (and group toolbar items that do not fit).
		 *
		 * **Note**: Used only when `shouldNotGroupWhenFull` was **not** set in the
		 * {@link module:core/editor/editorconfig~EditorConfig#blockToolbar configuration}.
		 *
		 * **Note:** Created in {@link #afterInit}.
		 *
		 * @protected
		 * @member {module:utils/dom/resizeobserver~ResizeObserver}
		 */
		this._resizeObserver = null;

		// Close the #panelView upon clicking outside of the plugin UI.
		clickOutsideHandler( {
			emitter: this.panelView,
			contextElements: [ this.panelView.element, this.buttonView.element ],
			activator: () => this.panelView.isVisible,
			callback: () => this._hidePanel()
		} );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		// Hides panel on a direct selection change.
		this.listenTo( editor.model.document.selection, 'change:range', ( evt, data ) => {
			if ( data.directChange ) {
				this._hidePanel();
			}
		} );

		this.listenTo( editor.ui, 'update', () => this._updateButton() );
		// `low` priority is used because of https://github.com/ckeditor/ckeditor5-core/issues/133.
		this.listenTo( editor, 'change:isReadOnly', () => this._updateButton(), { priority: 'low' } );
		this.listenTo( editor.ui.focusTracker, 'change:isFocused', () => this._updateButton() );

		// Reposition button on resize.
		this.listenTo( this.buttonView, 'change:isVisible', ( evt, name, isVisible ) => {
			if ( isVisible ) {
				// Keep correct position of button and panel on window#resize.
				this.buttonView.listenTo( window, 'resize', () => this._updateButton() );
			} else {
				// Stop repositioning button when is hidden.
				this.buttonView.stopListening( window, 'resize' );

				// Hide the panel when the button disappears.
				this._hidePanel();
			}
		} );
	}

	/**
	 * Fills the toolbar with its items based on the configuration.
	 *
	 * **Note:** This needs to be done after all plugins are ready.
	 *
	 * @inheritDoc
	 */
	afterInit() {
		const factory = this.editor.ui.componentFactory;
		const config = this._blockToolbarConfig;

		this.toolbarView.fillFromConfig( config.items, factory );

		// Hide panel before executing each button in the panel.
		for ( const item of this.toolbarView.items ) {
			item.on( 'execute', () => this._hidePanel( true ), { priority: 'high' } );
		}

		if ( !config.shouldNotGroupWhenFull ) {
			this.listenTo( this.editor, 'ready', () => {
				const editableElement = this.editor.ui.view.editable.element;

				// Set #toolbarView's max-width just after the initialization and update it on the editable resize.
				this._resizeObserver = new ResizeObserver( editableElement, () => {
					this.toolbarView.maxWidth = this._getToolbarMaxWidth();
				} );
			} );
		}
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		super.destroy();

		// Destroy created UI components as they are not automatically destroyed (see ckeditor5#1341).
		this.panelView.destroy();
		this.buttonView.destroy();
		this.toolbarView.destroy();

		if ( this._resizeObserver ) {
			this._resizeObserver.destroy();
		}
	}

	/**
	 * Creates the {@link #toolbarView}.
	 *
	 * @private
	 * @returns {module:ui/toolbar/toolbarview~ToolbarView}
	 */
	_createToolbarView() {
		const shouldGroupWhenFull = !this._blockToolbarConfig.shouldNotGroupWhenFull;
		const toolbarView = new ToolbarView( this.editor.locale, {
			shouldGroupWhenFull
		} );

		toolbarView.extendTemplate( {
			attributes: {
				// https://github.com/ckeditor/ckeditor5-editor-inline/issues/11
				class: [ 'ck-toolbar_floating' ]
			}
		} );

		// When toolbar lost focus then panel should hide.
		toolbarView.focusTracker.on( 'change:isFocused', ( evt, name, is ) => {
			if ( !is ) {
				this._hidePanel();
			}
		} );

		return toolbarView;
	}

	/**
	 * Creates the {@link #panelView}.
	 *
	 * @private
	 * @returns {module:ui/panel/balloon/balloonpanelview~BalloonPanelView}
	 */
	_createPanelView() {
		const editor = this.editor;
		const panelView = new BalloonPanelView( editor.locale );

		panelView.content.add( this.toolbarView );
		panelView.class = 'ck-toolbar-container';
		editor.ui.view.body.add( panelView );
		editor.ui.focusTracker.add( panelView.element );

		// Close #panelView on `Esc` press.
		this.toolbarView.keystrokes.set( 'Esc', ( evt, cancel ) => {
			this._hidePanel( true );
			cancel();
		} );

		return panelView;
	}

	/**
	 * Creates the {@link #buttonView}.
	 *
	 * @private
	 * @returns {module:ui/toolbar/block/blockbuttonview~BlockButtonView}
	 */
	_createButtonView() {
		const editor = this.editor;
		const t = editor.t;
		const buttonView = new BlockButtonView( editor.locale );

		buttonView.set( {
			label: t( 'Edit block' ),
			icon: iconPilcrow,
			withText: false
		} );

		// Bind the panelView observable properties to the buttonView.
		buttonView.bind( 'isOn' ).to( this.panelView, 'isVisible' );
		buttonView.bind( 'tooltip' ).to( this.panelView, 'isVisible', isVisible => !isVisible );

		// Toggle the panelView upon buttonView#execute.
		this.listenTo( buttonView, 'execute', () => {
			if ( !this.panelView.isVisible ) {
				this._showPanel();
			} else {
				this._hidePanel( true );
			}
		} );

		editor.ui.view.body.add( buttonView );
		editor.ui.focusTracker.add( buttonView.element );

		return buttonView;
	}

	/**
	 * Shows or hides the button.
	 * When all the conditions for displaying the button are matched, it shows the button. Hides otherwise.
	 *
	 * @private
	 */
	_updateButton() {
		const editor = this.editor;
		const model = editor.model;
		const view = editor.editing.view;

		// Hides the button when the editor is not focused.
		if ( !editor.ui.focusTracker.isFocused ) {
			this._hideButton();

			return;
		}

		// Hides the button when the editor switches to the read-only mode.
		if ( editor.isReadOnly ) {
			this._hideButton();

			return;
		}

		// Get the first selected block, button will be attached to this element.
		const modelTarget = Array.from( model.document.selection.getSelectedBlocks() )[ 0 ];

		// Hides the button when there is no enabled item in toolbar for the current block element.
		if ( !modelTarget || Array.from( this.toolbarView.items ).every( item => !item.isEnabled ) ) {
			this._hideButton();

			return;
		}

		// Get DOM target element.
		const domTarget = view.domConverter.mapViewToDom( editor.editing.mapper.toViewElement( modelTarget ) );

		// Show block button.
		this.buttonView.isVisible = true;

		// Attach block button to target DOM element.
		this._attachButtonToElement( domTarget );

		// When panel is opened then refresh it position to be properly aligned with block button.
		if ( this.panelView.isVisible ) {
			this._showPanel();
		}
	}

	/**
	 * Hides the button.
	 *
	 * @private
	 */
	_hideButton() {
		this.buttonView.isVisible = false;
	}

	/**
	 * Shows the {@link #toolbarView} attached to the {@link #buttonView}.
	 * If the toolbar is already visible, then it simply repositions it.
	 *
	 * @private
	 */
	_showPanel() {
		const wasVisible = this.panelView.isVisible;

		// So here's the thing: If there was no initial panelView#show() or these two were in different order, the toolbar
		// positioning will break in RTL editors. Weird, right? What you show know is that the toolbar
		// grouping works thanks to:
		//
		// * the ResizeObserver, which kicks in as soon as the toolbar shows up in DOM (becomes visible again).
		// * the observable ToolbarView#maxWidth, which triggers re-grouping when changed.
		//
		// Here are the possible scenarios:
		//
		// 1. (WRONG ❌) If the #maxWidth is set when the toolbar is invisible, it won't affect item grouping (no DOMRects, no grouping).
		//    Then, when panelView.pin() is called, the position of the toolbar will be calculated for the old
		//    items grouping state, and when finally ResizeObserver kicks in (hey, the toolbar is visible now, right?)
		//    it will group/ungroup some items and the length of the toolbar will change. But since in RTL the toolbar
		//    is attached on the right side and the positioning uses CSS "left", it will result in the toolbar shifting
		//    to the left and being displayed in the wrong place.
		// 2. (WRONG ❌) If the panelView.pin() is called first and #maxWidth set next, then basically the story repeats. The balloon
		//    calculates the position for the old toolbar grouping state, then the toolbar re-groups items and because
		//    it is positioned using CSS "left" it will move.
		// 3. (RIGHT ✅) We show the panel first (the toolbar does re-grouping but it does not matter), then the #maxWidth
		//    is set allowing the toolbar to re-group again and finally panelView.pin() does the positioning when the
		//    items grouping state is stable and final.
		//
		// https://github.com/ckeditor/ckeditor5/issues/6449, https://github.com/ckeditor/ckeditor5/issues/6575
		this.panelView.show();
		this.toolbarView.maxWidth = this._getToolbarMaxWidth();

		this.panelView.pin( {
			target: this.buttonView.element,
			limiter: this.editor.ui.getEditableElement()
		} );

		if ( !wasVisible ) {
			this.toolbarView.items.get( 0 ).focus();
		}
	}

	/**
	 * Hides the {@link #toolbarView}.
	 *
	 * @private
	 * @param {Boolean} [focusEditable=false] When `true`, the editable will be focused after hiding the panel.
	 */
	_hidePanel( focusEditable ) {
		this.panelView.isVisible = false;

		if ( focusEditable ) {
			this.editor.editing.view.focus();
		}
	}

	/**
	 * Attaches the {@link #buttonView} to the target block of content.
	 *
	 * @protected
	 * @param {HTMLElement} targetElement Target element.
	 */
	_attachButtonToElement( targetElement ) {
		const contentStyles = window.getComputedStyle( targetElement );

		const editableRect = new Rect( this.editor.ui.getEditableElement() );
		const contentPaddingTop = parseInt( contentStyles.paddingTop, 10 );
		// When line height is not an integer then thread it as "normal".
		// MDN says that 'normal' == ~1.2 on desktop browsers.
		const contentLineHeight = parseInt( contentStyles.lineHeight, 10 ) || parseInt( contentStyles.fontSize, 10 ) * 1.2;

		const position = getOptimalPosition( {
			element: this.buttonView.element,
			target: targetElement,
			positions: [
				( contentRect, buttonRect ) => {
					let left;

					if ( this.editor.locale.uiLanguageDirection === 'ltr' ) {
						left = editableRect.left - buttonRect.width;
					} else {
						left = editableRect.right;
					}

					return {
						top: contentRect.top + contentPaddingTop + ( contentLineHeight - buttonRect.height ) / 2,
						left
					};
				}
			]
		} );

		this.buttonView.top = position.top;
		this.buttonView.left = position.left;
	}

	/**
	 * Gets the {@link #toolbarView} max-width, based on
	 * editable width plus distance between farthest edge of the {@link #buttonView} and the editable.
	 *
	 * @private
	 * @returns {String} maxWidth A maximum width that toolbar can have, in pixels.
	 */
	_getToolbarMaxWidth() {
		const editableElement = this.editor.ui.view.editable.element;
		const editableRect = new Rect( editableElement );
		const buttonRect = new Rect( this.buttonView.element );
		const isRTL = this.editor.locale.uiLanguageDirection === 'rtl';
		const offset = isRTL ? ( buttonRect.left - editableRect.right ) + buttonRect.width : editableRect.left - buttonRect.left;

		return toPx( editableRect.width + offset );
	}
}

/**
 * The block toolbar configuration. Used by the {@link module:ui/toolbar/block/blocktoolbar~BlockToolbar}
 * feature.
 *
 *		const config = {
 *			blockToolbar: [ 'paragraph', 'heading1', 'heading2', 'bulletedList', 'numberedList' ]
 *		};
 *
 * You can also use `'|'` to create a separator between groups of items:
 *
 *		const config = {
 *			blockToolbar: [ 'paragraph', 'heading1', 'heading2', '|', 'bulletedList', 'numberedList' ]
 *		};
 *
 * ## Configuring items grouping
 *
 * You can prevent automatic items grouping by setting the `shouldNotGroupWhenFull` option:
 *
 *		const config = {
 *			blockToolbar: {
 *				items: [ 'paragraph', 'heading1', 'heading2', '|', 'bulletedList', 'numberedList' ],
 *				shouldNotGroupWhenFull: true
 *			},
 *		};
 *
 * Read more about configuring the main editor toolbar in {@link module:core/editor/editorconfig~EditorConfig#toolbar}.
 *
 * @member {Array.<String>|Object} module:core/editor/editorconfig~EditorConfig#blockToolbar
 */
