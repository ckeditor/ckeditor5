/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module link/link
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver';
import LinkEngine from './linkengine';
import LinkElement from './linkelement';

import clickOutsideHandler from '@ckeditor/ckeditor5-ui/src/bindings/clickoutsidehandler';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/balloonpanel/balloonpanelview';

import LinkFormView from './ui/linkformview';

import linkIcon from '../theme/icons/link.svg';
import unlinkIcon from '../theme/icons/unlink.svg';

import '../theme/theme.scss';

/**
 * The link feature. It introduces the Link and Unlink buttons and the <kbd>Ctrl+K</kbd> keystroke.
 *
 * It uses the {@link module:link/linkengine~LinkEngine link engine feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Link extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ LinkEngine ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		this.editor.editing.view.addObserver( ClickObserver );

		/**
		 * Balloon panel view to display the main UI.
		 *
		 * @member {module:link/ui/balloonpanel~BalloonPanelView}
		 */
		this.balloonPanelView = this._createBalloonPanel();

		/**
		 * The form view inside {@link #balloonPanelView}.
		 *
		 * @member {module:link/ui/linkformview~LinkFormView}
		 */
		this.formView = this._createForm();

		// Create toolbar buttons.
		this._createToolbarLinkButton();
		this._createToolbarUnlinkButton();
	}

	/**
	 * Creates a toolbar link button. Clicking this button will show
	 * {@link #balloonPanelView} attached to the selection.
	 *
	 * @private
	 */
	_createToolbarLinkButton() {
		const editor = this.editor;
		const linkCommand = editor.commands.get( 'link' );
		const t = editor.t;

		// Handle `Ctrl+K` keystroke and show panel.
		editor.keystrokes.set( 'CTRL+K', () => this._showPanel() );

		editor.ui.componentFactory.add( 'link', ( locale ) => {
			const button = new ButtonView( locale );

			button.isEnabled = true;
			button.label = t( 'Link' );
			button.icon = linkIcon;
			button.keystroke = 'CTRL+K';
			button.tooltip = true;

			// Bind button to the command.
			button.bind( 'isEnabled' ).to( linkCommand, 'isEnabled' );

			// Show the panel on button click.
			this.listenTo( button, 'execute', () => this._showPanel() );

			return button;
		} );
	}

	/**
	 * Creates a toolbar unlink button. Clicking this button will unlink
	 * the selected link.
	 *
	 * @private
	 */
	_createToolbarUnlinkButton() {
		const editor = this.editor;
		const t = editor.t;
		const unlinkCommand = editor.commands.get( 'unlink' );

		editor.ui.componentFactory.add( 'unlink', ( locale ) => {
			const button = new ButtonView( locale );

			button.isEnabled = false;
			button.label = t( 'Unlink' );
			button.icon = unlinkIcon;
			button.tooltip = true;

			// Bind button to the command.
			button.bind( 'isEnabled' ).to( unlinkCommand, 'isEnabled' );

			// Execute unlink command and hide panel, if open on button click.
			this.listenTo( button, 'execute', () => editor.execute( 'unlink' ) );

			return button;
		} );
	}

	/**
	 * Creates the {@link module:ui/balloonpanel/balloonpanelview~BalloonPanelView} instance.
	 *
	 * @private
	 * @returns {module:ui/balloonpanel/balloonpanelview~BalloonPanelView} Link balloon panel instance.
	 */
	_createBalloonPanel() {
		const editor = this.editor;
		const viewDocument = editor.editing.view;

		// Create the balloon panel instance.
		const balloonPanelView = new BalloonPanelView( editor.locale );
		balloonPanelView.maxWidth = 300;

		// Add balloonPanel.view#element to FocusTracker.
		// @TODO: Do it automatically ckeditor5-core#23
		editor.ui.focusTracker.add( balloonPanelView.element );

		// Handle click on view document and show panel when selection is placed inside the link element.
		// Keep panel open until selection will be inside the same link element.
		this.listenTo( viewDocument, 'click', () => {
			const viewSelection = viewDocument.selection;
			const parentLink = getPositionParentLink( viewSelection.getFirstPosition() );

			if ( viewSelection.isCollapsed && parentLink ) {
				this._attachPanelToElement();

				this.listenTo( viewDocument, 'render', () => {
					const currentParentLink = getPositionParentLink( viewSelection.getFirstPosition() );

					if ( !viewSelection.isCollapsed || parentLink !== currentParentLink ) {
						this._hidePanel();
					} else {
						this._attachPanelToElement( parentLink );
					}
				} );

				this.listenTo( balloonPanelView, 'change:isVisible', () => this.stopListening( viewDocument, 'render' ) );
			}
		} );

		// Focus the form if balloon panel is open and tab key has been pressed.
		editor.keystrokes.set( 'Tab', ( data, cancel ) => {
			if ( balloonPanelView.isVisible && !this.formView.focusTracker.isFocused ) {
				this.formView.focus();
				cancel();
			}
		} );

		// Close the panel on esc key press when editable has focus.
		editor.keystrokes.set( 'Esc', ( data, cancel ) => {
			if ( balloonPanelView.isVisible ) {
				this._hidePanel( true );
				cancel();
			}
		} );

		// Close on click outside of balloon panel element.
		clickOutsideHandler( {
			emitter: balloonPanelView,
			activator: () => balloonPanelView.isVisible,
			contextElement: balloonPanelView.element,
			callback: () => this._hidePanel()
		} );

		editor.ui.view.body.add( balloonPanelView );

		return balloonPanelView;
	}

	/**
	 * Creates the {@link module:link/ui/linkformview~LinkFormView} instance.
	 *
	 * @private
	 * @returns {module:link/ui/linkformview~LinkFormView} Link form instance.
	 */
	_createForm() {
		const editor = this.editor;
		const formView = new LinkFormView( editor.locale );

		formView.urlInputView.bind( 'value' ).to( editor.commands.get( 'link' ), 'value' );

		// Execute link command after clicking on formView `Save` button.
		this.listenTo( formView, 'submit', () => {
			editor.execute( 'link', formView.urlInputView.inputView.element.value );
			this._hidePanel( true );
		} );

		// Execute unlink command after clicking on formView `Unlink` button.
		this.listenTo( formView, 'unlink', () => {
			editor.execute( 'unlink' );
			this._hidePanel( true );
		} );

		// Close the panel on esc key press when the form has focus.
		formView.keystrokes.set( 'Esc', ( data, cancel ) => {
			this._hidePanel( true );
			cancel();
		} );

		// Hide balloon panel after clicking on formView `Cancel` button.
		this.listenTo( formView, 'cancel', () => this._hidePanel( true ) );

		this.balloonPanelView.content.add( formView );

		return formView;
	}

	/**
	 * Shows {@link #balloonPanelView link balloon panel} and attach to target element.
	 * If selection is collapsed and is placed inside link element, then panel will be attached
	 * to whole link element, otherwise will be attached to the selection.
	 *
	 * @private
	 * @param {module:link/linkelement~LinkElement} [parentLink] Target element.
	 */
	_attachPanelToElement( parentLink ) {
		const viewDocument = this.editor.editing.view;
		const targetLink = parentLink || getPositionParentLink( viewDocument.selection.getFirstPosition() );

		const target = targetLink ?
				// When selection is inside link element, then attach panel to this element.
				viewDocument.domConverter.getCorrespondingDomElement( targetLink )
			:
				// Otherwise attach panel to the selection.
				viewDocument.domConverter.viewRangeToDom( viewDocument.selection.getFirstRange() );

		this.balloonPanelView.attachTo( {
			target,
			limiter: viewDocument.domConverter.getCorrespondingDomElement( viewDocument.selection.editableElement )
		} );
	}

	/**
	 * Hides {@link #balloonPanelView balloon panel view}.
	 *
	 * @private
	 * @param {Boolean} [focusEditable=false] When `true` then editable focus will be restored on panel hide.
	 */
	_hidePanel( focusEditable ) {
		this.balloonPanelView.hide();

		if ( focusEditable ) {
			this.editor.editing.view.focus();
		}
	}

	/**
	 * Shows {@link #balloonPanelView balloon panel view}.
	 *
	 * @private
	 */
	_showPanel() {
		this._attachPanelToElement();
		this.formView.urlInputView.select();
	}
}

// Try to find if one of the position parent ancestors is a LinkElement,
// if yes return this element.
//
// @private
// @param {engine.view.Position} position
// @returns {module:link/linkelement~LinkElement|null}
function getPositionParentLink( position ) {
	return position.parent.getAncestors().find( ( ancestor ) => ancestor instanceof LinkElement );
}
