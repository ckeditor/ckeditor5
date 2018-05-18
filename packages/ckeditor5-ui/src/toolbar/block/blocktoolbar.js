/**
 * Copyright (c) 2016 - 2017, CKSource - Frederico Knabben. All rights reserved.
 */

/**
 * @module ui/toolbar/block/blocktoolbar
 */

/* global window */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import BlockButtonView from './view/blockbuttonview';
import BalloonPanelView from '../../panel/balloon/balloonpanelview';
import ToolbarView from '../toolbarview';

import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver';
import ContainerElement from '@ckeditor/ckeditor5-engine/src/view/containerelement';
import clickOutsideHandler from '../../bindings/clickoutsidehandler';

import { getOptimalPosition } from '@ckeditor/ckeditor5-utils/src/dom/position';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';

import iconPilcrow from '../../../theme/icons/pilcrow.svg';

/**
 * The block toolbar plugin.
 *
 * This plugin provides button attached to the block of content where the selection is currently placed.
 * After clicking on the button, dropdown with editor features defined through editor configuration appears.
 *
 * By default button is allowed to be displayed next to {@link module:paragraph/paragraph~Paragraph paragraph element},
 * {@link module:list/list~List list items} and all items defined in {@link module:heading/heading~Heading} plugin.
 * This behavior can be customise through decorable {@link #checkAllowed} method.
 *
 * By default button will be attached to the left bound of the
 * {@link module:ui/editorui/editoruiview~EditorUIView#editableElement} so editor integration should
 * ensure that there is enough space between the editor content and left bound of the editable element
 *
 * 		| __
 * 		||  |     This is a block of content that
 * 		| ¯¯      button is attached to. This is a
 * 		|  space  block of content that button is
 * 		| <-----> attached to.
 *
 * The position of the button can be adjusted using css transform:
 *
 * 		.ck-block-toolbar-button {
 * 			transform: translate( 10px, 10px );
 * 		}
 *
 * 		|
 * 		|   __    This is a block of content that
 * 		|  |  |   button is attached to. This is a
 * 		|   ¯¯    block of content that button is
 * 		|         attached to.
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
	init() {
		const editor = this.editor;

		editor.editing.view.addObserver( ClickObserver );

		/**
		 * Toolbar view.
		 *
		 * @type {module:ui/toolbar/toolbarview~ToolbarView}
		 */
		this.toolbarView = new ToolbarView( editor.locale );

		/**
		 * Panel view.
		 *
		 * @type {module:ui/panel/balloon/balloonpanelview~BalloonPanelView}
		 */
		this.panelView = this._createPanelView();

		/**
		 * Button view.
		 *
		 * @type {module:ui/toolbar/block/view/blockbuttonview~BlockButtonView}
		 */
		this.buttonView = this._createButtonView();

		/**
		 * List of block element names that allow displaying toolbar next to it.
		 * This list will be updated by #afterInit method.
		 *
		 * @type {Array<String>}
		 */
		this._allowedElements = [];

		// Close #panelView on click out of the plugin UI.
		clickOutsideHandler( {
			emitter: this.panelView,
			contextElements: [ this.panelView.element, this.buttonView.element ],
			activator: () => this.panelView.isVisible,
			callback: () => this._hidePanel()
		} );

		// Hide plugin UI when editor switch to read-only.
		this.listenTo( editor, 'change:isReadOnly', ( evt, name, isReadOnly ) => {
			if ( isReadOnly ) {
				this._disable();
			} else {
				this._enable();
			}
		} );

		// Checking if button is allowed for displaying next to given element is event–driven.
		// It is possible to override #checkAllowed method and apply custom validation.
		this.decorate( 'checkAllowed' );

		// Enable as default.
		this._enable();
	}

	/**
	 * Creates toolbar components based on given configuration.
	 * This needs to be done when all plugins are ready.
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

		this._allowedElements = this._getAllowedElements();
	}

	/**
	 * Creates panel view.
	 *
	 * @private
	 * @returns {module:ui/panel/balloon/balloonpanelview~BalloonPanelView}
	 */
	_createPanelView() {
		const editor = this.editor;
		const panelView = new BalloonPanelView( editor.locale );

		panelView.content.add( this.toolbarView );
		panelView.className = 'ck-balloon-panel-block-toolbar';
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
	 * Creates button view.
	 *
	 * @private
	 * @returns {module:ui/toolbar/block/view/blockbuttonview~BlockButtonView}
	 */
	_createButtonView() {
		const editor = this.editor;
		const buttonView = new BlockButtonView( editor.locale );

		buttonView.label = editor.t( 'Edit block' );
		buttonView.icon = iconPilcrow;
		buttonView.withText = false;

		// Bind panelView to buttonView.
		buttonView.bind( 'isOn' ).to( this.panelView, 'isVisible' );
		buttonView.bind( 'tooltip' ).to( this.panelView, 'isVisible', isVisible => !isVisible );

		// Toggle panelView on buttonView#execute.
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
	 * Returns list of element names that allow displaying block button next to it.
	 *
	 * @private
	 * @returns {Array<String>}
	 */
	_getAllowedElements() {
		const config = this.editor.config;

		const elements = [ 'p', 'li' ];

		for ( const item of config.get( 'heading.options' ) || [] ) {
			if ( item.view ) {
				elements.push( item.view );
			}
		}

		return elements;
	}

	/**
	 * Checks if block button is allowed for displaying next to given element.
	 *
	 * Fires {@link #event:checkAllowed} event which can be handled and overridden to apply custom validation.
	 *
	 * Example how to disallow button for `h1` element:
	 *
	 * 		const blockToolbar = editor.plugins.get( 'BlockToolbar' );
	 *
	 * 		blockToolbar.on( 'checkAllowed', ( evt, args ) => {
	 *			const viewElement = args[ 0 ];
	 *
	 *			if ( viewElement.name === 'h1' ) {
	 *				evt.return = false;
	 *			}
	 * 		}, { priority: 'high' } );
	 *
	 * @fires checkAllowed
	 * @param {module:engine/view/containerelement~ContainerElement} viewElement Container element where selection is.
	 * @returns {Boolean} `true` when block button is allowed to display `false` otherwise.
	 */
	checkAllowed( viewElement ) {
		return this._allowedElements.includes( viewElement.name );
	}

	/**
	 * Starts displaying button next to allowed elements.
	 *
	 * @private
	 */
	_enable() {
		const editor = this.editor;
		const view = editor.editing.view;
		const viewDocument = view.document;
		let targetElement, targetDomElement;

		// Hides panel on a direct selection change.
		this.listenTo( editor.model.document.selection, 'change:range', ( evt, data ) => {
			if ( data.directChange ) {
				this._hidePanel();
			}
		} );

		this.listenTo( view, 'render', () => {
			// Get selection parent container, block button will be attached to this element.
			targetElement = getParentContainer( viewDocument.selection.getFirstPosition() );

			// Do not attach block button when is not allowed for given target element.
			if ( !this.checkAllowed( targetElement ) ) {
				this.buttonView.isVisible = false;

				return;
			}

			// Get target DOM node.
			targetDomElement = view.domConverter.mapViewToDom( targetElement );

			// Show block button.
			this.buttonView.isVisible = true;

			// Attach block button to target DOM element.
			this._attachButtonToElement( targetDomElement );

			// When panel is opened then refresh it position to be properly aligned with block button.
			if ( this.panelView.isVisible ) {
				this._showPanel();
			}
		}, { priority: 'low' } );

		this.listenTo( this.buttonView, 'change:isVisible', ( evt, name, isVisible ) => {
			if ( isVisible ) {
				// Keep correct position of button and panel on window#resize.
				this.buttonView.listenTo( window, 'resize', () => this._attachButtonToElement( targetDomElement ) );
			} else {
				// Stop repositioning button when is hidden.
				this.buttonView.stopListening( window, 'resize' );

				// Hide the panel when the button disappears.
				this._hidePanel();
			}
		} );
	}

	/**
	 * Stops displaying block button.
	 *
	 * @private
	 */
	_disable() {
		this.buttonView.isVisible = false;
		this.stopListening( this.editor.model.document.selection, 'change:range' );
		this.stopListening( this.editor.editing.view, 'render' );
		this.stopListening( this.buttonView, 'change:isVisible' );
	}

	/**
	 * Attaches #buttonView to the target block of content.
	 *
	 * @protected
	 * @param {HTMLElement} targetElement Target element.
	 */
	_attachButtonToElement( targetElement ) {
		const contentComputedStyles = window.getComputedStyle( targetElement );

		const editableRect = new Rect( this.editor.ui.view.editableElement );
		const contentPaddingTop = parseInt( contentComputedStyles.paddingTop );
		const contentLineHeight = parseInt( contentComputedStyles.lineHeight ) || parseInt( contentComputedStyles.fontSize );

		const position = getOptimalPosition( {
			element: this.buttonView.element,
			target: targetElement,
			positions: [
				( contentRect, buttonRect ) => {
					return {
						top: contentRect.top + contentPaddingTop + ( ( contentLineHeight - buttonRect.height ) / 2 ),
						left: editableRect.left
					};
				}
			]
		} );

		this.buttonView.top = position.top;
		this.buttonView.left = position.left;
	}

	/**
	 * Shows toolbar attached to the block button.
	 * When toolbar is already opened then just repositions it.
	 *
	 * @private
	 */
	_showPanel() {
		this.panelView.pin( {
			target: this.buttonView.element,
			limiter: this.editor.ui.view.editableElement
		} );
	}

	/**
	 * Hides toolbar.
	 *
	 * @private
	 * @param {Boolean} [focusEditable=false] When `true` then editable will be focused after hiding panel.
	 */
	_hidePanel( focusEditable ) {
		this.panelView.isVisible = false;

		if ( focusEditable ) {
			this.editor.editing.view.focus();
		}
	}
}

// Because the engine.view.writer.getParentContainer is not exported here is a copy.
// See: https://github.com/ckeditor/ckeditor5-engine/issues/628
function getParentContainer( position ) {
	let parent = position.parent;

	while ( !( parent instanceof ContainerElement ) ) {
		parent = parent.parent;
	}

	return parent;
}
