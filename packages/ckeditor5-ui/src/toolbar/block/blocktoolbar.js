/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
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

import iconPilcrow from '@ckeditor/ckeditor5-core/theme/icons/pilcrow.svg';

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
		const config = this.editor.config.get( 'blockToolbar' );

		this.toolbarView.fillFromConfig( config, factory );

		// Hide panel before executing each button in the panel.
		for ( const item of this.toolbarView.items ) {
			item.on( 'execute', () => this._hidePanel( true ), { priority: 'high' } );
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
	}

	/**
	 * Creates the {@link #toolbarView}.
	 *
	 * @private
	 * @returns {module:ui/toolbar/toolbarview~ToolbarView}
	 */
	_createToolbarView() {
		const toolbarView = new ToolbarView( this.editor.locale );

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
					return {
						top: contentRect.top + contentPaddingTop + ( ( contentLineHeight - buttonRect.height ) / 2 ),
						left: editableRect.left - buttonRect.width
					};
				}
			]
		} );

		this.buttonView.top = position.top;
		this.buttonView.left = position.left;
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
 * Read more about configuring the main editor toolbar in {@link module:core/editor/editorconfig~EditorConfig#toolbar}.
 *
 * @member {Array.<String>|Object} module:core/editor/editorconfig~EditorConfig#blockToolbar
 */
