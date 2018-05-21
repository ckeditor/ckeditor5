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
import clickOutsideHandler from '../../bindings/clickoutsidehandler';

import { getOptimalPosition } from '@ckeditor/ckeditor5-utils/src/dom/position';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';

import iconPilcrow from '../../../theme/icons/pilcrow.svg';

/**
 * The block toolbar plugin.
 *
 * This plugin provides button attached to the block of content where the selection is currently placed.
 * After clicking on the button, dropdown with editor features defined through
 * {@link module:core/editor/editorconfig~EditorConfig#blockToolbar} appears.
 *
 * By default button is allowed to be displayed next to {@link module:paragraph/paragraph~Paragraph paragraph element},
 * {@link module:list/list~List list items} and all items defined in {@link module:heading/heading~Heading} plugin.
 * This behavior can be customise through decorable {@link ~BlockToolbar#checkAllowed} method.
 *
 * By default button will be attached to the left bound of the
 * {@link module:engine/view/editableelement~EditableElement} so editor integration should
 * ensure that there is enough space between the editor content and left bound of the editable element:
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
	 * Checks if block button is allowed for displaying next to given element
	 * (when element is a $block and is not an object).
	 *
	 * Fires {@link #event:checkAllowed} event which can be handled and overridden to apply custom validation.
	 *
	 * Example how to disallow button for `h2` element:
	 *
	 * 		const blockToolbar = editor.plugins.get( 'BlockToolbar' );
	 *
	 * 		blockToolbar.on( 'checkAllowed', ( evt, args ) => {
	 *			const modelElement = args[ 0 ];
	 *
	 *			if ( modelElement && modelElement.name === 'heading1' ) {
	 *				evt.return = false;
	 *			}
	 * 		}, { priority: 'high' } );
	 *
	 * @fires checkAllowed
	 * @param {module:engine/model/element~Element} modelElement Element where the selection is.
	 * @returns {Boolean} `true` when block button is allowed to be displayed `false` otherwise.
	 */
	checkAllowed( modelElement ) {
		const schema = this.editor.model.schema;

		return modelElement && schema.isBlock( modelElement ) && !schema.isObject( modelElement );
	}

	/**
	 * Starts displaying button next to allowed elements.
	 *
	 * @private
	 */
	_enable() {
		const editor = this.editor;
		const model = editor.model;
		const view = editor.editing.view;
		let modelTarget, domTarget;

		// Hides panel on a direct selection change.
		this.listenTo( editor.model.document.selection, 'change:range', ( evt, data ) => {
			if ( data.directChange ) {
				this._hidePanel();
			}
		} );

		this.listenTo( view, 'render', () => {
			// Get selection closest parent block element, button will be attached to this element.
			modelTarget = getParentBlock( model.document.selection.getFirstPosition(), model.schema );

			// Do not attach block button when is not allowed for given target element.
			if ( !this.checkAllowed( modelTarget ) ) {
				this.buttonView.isVisible = false;

				return;
			}

			// Get DOM target element.
			domTarget = view.domConverter.mapViewToDom( editor.editing.mapper.toViewElement( modelTarget ) );

			// Show block button.
			this.buttonView.isVisible = true;

			// Attach block button to target DOM element.
			this._attachButtonToElement( domTarget );

			// When panel is opened then refresh it position to be properly aligned with block button.
			if ( this.panelView.isVisible ) {
				this._showPanel();
			}
		}, { priority: 'low' } );

		this.listenTo( this.buttonView, 'change:isVisible', ( evt, name, isVisible ) => {
			if ( isVisible ) {
				// Keep correct position of button and panel on window#resize.
				this.buttonView.listenTo( window, 'resize', () => this._attachButtonToElement( domTarget ) );
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
		const contentStyles = window.getComputedStyle( targetElement );

		const editableRect = new Rect( this.editor.ui.view.editableElement );
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
		const wasVisible = this.panelView.isVisible;

		this.panelView.pin( {
			target: this.buttonView.element,
			limiter: this.editor.ui.view.editableElement
		} );

		if ( !wasVisible ) {
			this.toolbarView.items.get( 0 ).focus();
		}
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

	/**
	 * This event is fired when {@link #checkAllowed} method is executed. It makes it possible to override
	 * default method behavior and provides a custom rules.
	 *
	 * @event checkAllowed
	 */
}

function getParentBlock( position, schema ) {
	let parent = position.parent;

	if ( parent.is( 'rootElement' ) ) {
		return null;
	}

	while ( !( schema.isBlock( parent ) ) ) {
		parent = parent.parent;
	}

	return parent;
}

/**
 * Block toolbar configuration. Used by the {@link module:ui/toolbar/block/blocktoolbar~BlockToolbar}
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
 * Read also about configuring the main editor toolbar in {@link module:core/editor/editorconfig~EditorConfig#toolbar}.
 *
 * @member {Array.<String>|Object} module:core/editor/editorconfig~EditorConfig#blockToolbar
 */
