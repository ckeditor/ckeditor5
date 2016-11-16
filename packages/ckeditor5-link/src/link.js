/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Feature from '../core/feature.js';
import ClickObserver from '../engine/view/observer/clickobserver.js';
import LinkEngine from './linkengine.js';
import LinkElement from './linkelement.js';

import clickOutsideHandler from '../ui/bindings/clickoutsidehandler.js';
import escPressHandler from '../ui/bindings/escpresshandler.js';

import ButtonView from '../ui/button/buttonview.js';
import BalloonPanelView from '../ui/balloonpanel/balloonpanelview.js';

import LinkFormView from './ui/linkformview.js';

/**
 * The link feature. It introduces the Link and Unlink buttons and the <kbd>Ctrl+K</kbd> keystroke.
 *
 * It uses the {@link link.LinkEngine link engine feature}.
 *
 * @memberOf link
 * @extends core.Feature
 */
export default class Link extends Feature {
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
		 * @member {link.ui.LinkBalloonPanelView} link.Link#balloonPanelView
		 */
		this.balloonPanelView = this._createBalloonPanel();

		/**
		 * The form view inside {@link link.Link#balloonPanelView}.
		 *
		 * @member {link.ui.LinkFormView} link.Link#formView
		 */
		this.formView = this._createForm();

		// Create toolbar buttons.
		this._createToolbarLinkButton();
		this._createToolbarUnlinkButton();
	}

	/**
	 * Creates a toolbar link button. Clicking this button will show
	 * {@link link.Link#balloonPanelView} attached to the selection.
	 *
	 * @private
	 */
	_createToolbarLinkButton() {
		const editor = this.editor;
		const linkCommand = editor.commands.get( 'link' );
		const t = editor.t;

		// Handle `Ctrl+K` keystroke and show panel.
		editor.keystrokes.set( 'CTRL+K', () => this._showPanel() );

		// Add link button to feature components.
		editor.ui.featureComponents.add( 'link', ( locale ) => {
			const button = new ButtonView( locale );

			button.isEnabled = true;
			button.label = t( 'Link' );
			button.icon = 'link';
			button.keystroke = 'CTRL+K';

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

		// Add unlink button to feature components.
		editor.ui.featureComponents.add( 'unlink', ( locale ) => {
			const button = new ButtonView( locale );

			button.isEnabled = false;
			button.label = t( 'Unlink' );
			button.icon = 'unlink';

			// Bind button to the command.
			button.bind( 'isEnabled' ).to( unlinkCommand, 'isEnabled' );

			// Execute unlink command and hide panel, if open on button click.
			this.listenTo( button, 'execute', () => editor.execute( 'unlink' ) );

			return button;
		} );
	}

	/**
	 * Creates the {@link link.ui.LinkBalloonPanel} instance.
	 *
	 * @private
	 * @returns {link.ui.LinkBalloonPanel} Link balloon panel instance.
	 */
	_createBalloonPanel() {
		const editor = this.editor;
		const viewDocument = editor.editing.view;

		// Create the balloon panel instance.
		const balloonPanelView = new BalloonPanelView( editor.locale );

		balloonPanelView.maxWidth = 300;

		// Add balloonPanel.view#element to FocusTracker.
		// @TODO: Do it automatically ckeditor5-core#23
		editor.focusTracker.add( balloonPanelView.element );

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

		// Close on `ESC` press.
		escPressHandler( {
			emitter: balloonPanelView,
			model: balloonPanelView,
			activeIf: 'isVisible',
			callback: () => this._hidePanel( true )
		} );

		// Close on click outside of balloon panel element.
		clickOutsideHandler( {
			emitter: balloonPanelView,
			model: balloonPanelView,
			activeIf: 'isVisible',
			contextElement: balloonPanelView.element,
			callback: () => this._hidePanel()
		} );

		editor.ui.body.add( balloonPanelView );

		return balloonPanelView;
	}

	/**
	 * Creates the {@link link.ui.LinkForm} instance.
	 *
	 * @private
	 * @returns {link.ui.LinkForm} Link form instance.
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

		// Hide balloon panel after clicking on formView `Cancel` button.
		this.listenTo( formView, 'cancel', () => this._hidePanel( true ) );

		this.balloonPanelView.content.add( formView );

		return formView;
	}

	/**
	 * Shows {@link link.Link#balloonPanel LinkBalloonPanel} and attach to target element.
	 * If selection is collapsed and is placed inside link element, then panel will be attached
	 * to whole link element, otherwise will be attached to the selection.
	 *
	 * @private
	 * @param {link.LinkElement} [parentLink] Target element.
	 */
	_attachPanelToElement( parentLink ) {
		const viewDocument = this.editor.editing.view;
		const domEditableElement = viewDocument.domConverter.getCorrespondingDomElement( viewDocument.selection.editableElement );
		const targetLink = parentLink || getPositionParentLink( viewDocument.selection.getFirstPosition() );

		// When selection is inside link element, then attach panel to this element.
		if ( targetLink ) {
			this.balloonPanelView.attachTo(
				viewDocument.domConverter.getCorrespondingDomElement( targetLink ),
				domEditableElement
			);
		}
		// Otherwise attach panel to the selection.
		else {
			this.balloonPanelView.attachTo(
				viewDocument.domConverter.viewRangeToDom( viewDocument.selection.getFirstRange() ),
				domEditableElement
			);
		}
	}

	/**
	 * Hides {@link link.Link#balloonPanel LinkBalloonPanel}.
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
	 * Shows {@link link.Link#balloonPanel LinkBalloonPanel}.
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
// @returns {link.LinkElement|null}
function getPositionParentLink( position ) {
	return position.parent.getAncestors().find( ( ancestor ) => ancestor instanceof LinkElement );
}
