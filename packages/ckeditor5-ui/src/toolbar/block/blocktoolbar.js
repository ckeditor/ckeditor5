/**
 * Copyright (c) 2016 - 2017, CKSource - Frederico Knabben. All rights reserved.
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
		 * @type {ToolbarView}
		 */
		this.toolbarView = new ToolbarView( editor.locale );

		/**
		 * Panel view.
		 *
		 * @type {BalloonPanelView}
		 */
		this.panelView = this._createPanelView();

		/**
		 * Button view.
		 *
		 * @type {ButtonView}
		 */
		this.buttonView = this._createButtonView();

		/**
		 * List of block element names that allow do display toolbar next to it.
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
	 * @returns {BalloonPanelView}
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
	 * @returns {BlockButtonView}
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
	 * Returns list of element names that allow to display block button next to it.
	 *
	 * @private
	 */
	_getAllowedElements() {
		const elements = [ 'p', 'li' ];

		for ( const item of this.editor.config.get( 'heading.options' ) || [] ) {
			if ( item.view ) {
				elements.push( item.view );
			}
		}

		return elements;
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

			const targetName = targetElement.name;

			// Do not attach block button when target element is not on the white list.
			if ( !this._allowedElements.includes( targetName ) ) {
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

		// Keep button and panel position on window#resize.
		this.listenTo( this.buttonView, 'change:isVisible', ( evt, name, isVisible ) => {
			if ( isVisible ) {
				this.buttonView.listenTo( window, 'resize', () => this._attachButtonToElement( targetDomElement ) );
			} else {
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
		this.stopListening( this.editor.model.document.selection, 'change:range' );
		this.stopListening( this.editor.editing.view, 'render' );
		this.stopListening( this.buttonView, 'change:isVisible' );
		this.buttonView.isVisible = false;
		this._hidePanel();
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
			limiter: this.editor.ui.view.element
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
