/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Feature from '../core/feature.js';
import ClickObserver from '../engine/view/observer/clickobserver.js';
import LinkEngine from './linkengine.js';
import LinkElement from './linkelement.js';

import Model from '../ui/model.js';
import clickOutsideHandler from '../ui/bindings/clickoutsidehandler.js';
import escPressHandler from '../ui/bindings/escpresshandler.js';

import Button from '../ui/button/button.js';
import ButtonView from '../ui/button/buttonview.js';

import BalloonPanel from '../ui/balloonpanel/balloonpanel.js';
import BalloonPanelView from '../ui/balloonpanel/balloonpanelview.js';

import LinkForm from './ui/linkform.js';
import LinkFormView from './ui/linkformview.js';

import LabeledInput from '../ui/labeledinput/labeledinput.js';
import InputText from '../ui/inputtext/inputtext.js';

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
		 * Balloon panel component to display the main UI.
		 *
		 * @member {link.ui.LinkBalloonPanel} link.Link#balloonPanel
		 */
		this.balloonPanel = this._createBalloonPanel();

		/**
		 * The form component inside {@link link.Link#balloonPanel}.
		 *
		 * @member {link.ui.LinkForm} link.Link#form
		 */
		this.form = this._createForm();

		// Create toolbar buttons.
		this._createToolbarLinkButton();
		this._createToolbarUnlinkButton();

		/**
		 * The URL input inside {@link link.Link#form}.
		 *
		 * @protected
		 * @member {ui.input.labeled.LabeledInput} think.Link#_urlInput
		 */
	}

	/**
	 * Creates a toolbar link button. Clicking this button will show
	 * {@link link.Link#balloonPanel} attached to the selection.
	 *
	 * @private
	 */
	_createToolbarLinkButton() {
		const editor = this.editor;
		const linkCommand = editor.commands.get( 'link' );
		const t = editor.t;

		// Create button model.
		const linkButtonModel = new Model( {
			isEnabled: true,
			isOn: false,
			label: t( 'Link' ),
			icon: 'link',
			keystroke: 'CTRL+K'
		} );

		// Bind button model to the command.
		linkButtonModel.bind( 'isEnabled' ).to( linkCommand, 'isEnabled' );

		// Show the panel on button click only when editor is focused.
		this.listenTo( linkButtonModel, 'execute', () => this._showPanel() );

		// Add link button to feature components.
		editor.ui.featureComponents.add( 'link', Button, ButtonView, linkButtonModel );

		// Handle `Ctrl+K` keystroke and show panel.
		editor.keystrokes.set( 'CTRL+K', () => this._showPanel() );
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

		// Create the button model.
		const unlinkButtonModel = new Model( {
			isEnabled: false,
			isOn: false,
			label: t( 'Unlink' ),
			icon: 'unlink'
		} );

		// Bind button model to the command.
		unlinkButtonModel.bind( 'isEnabled' ).to( unlinkCommand, 'isEnabled' );

		// Execute unlink command and hide panel, if open.
		this.listenTo( unlinkButtonModel, 'execute', () => {
			editor.execute( 'unlink' );
		} );

		// Add unlink button to feature components.
		editor.ui.featureComponents.add( 'unlink', Button, ButtonView, unlinkButtonModel );
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
		const balloonPanel = new BalloonPanel(
			new Model( {
				maxWidth: 300
			} ),
			new BalloonPanelView( editor.locale )
		);

		// Add balloonPanel.view#element to FocusTracker.
		// @TODO: Do it automatically ckeditor5-core#23
		editor.focusTracker.add( balloonPanel.view.element );

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

				this.listenTo( balloonPanel.view, 'change:isVisible', () => this.stopListening( viewDocument, 'render' ) );
			}
		} );

		// Close on `ESC` press.
		escPressHandler( {
			controller: balloonPanel.view,
			model: balloonPanel.view,
			activeIf: 'isVisible',
			callback: () => this._hidePanel( true )
		} );

		// Close on click outside of balloon panel element.
		clickOutsideHandler( {
			controller: balloonPanel.view,
			model: balloonPanel.view,
			activeIf: 'isVisible',
			contextElement: balloonPanel.view.element,
			callback: () => this._hidePanel()
		} );

		editor.ui.add( 'body', balloonPanel );

		return balloonPanel;
	}

	/**
	 * Creates the {@link link.ui.LinkForm} instance.
	 *
	 * @private
	 * @returns {link.ui.LinkForm} Link form instance.
	 */
	_createForm() {
		const editor = this.editor;
		const t = this.editor.t;
		const linkCommand = editor.commands.get( 'link' );

		const formView = new LinkFormView( editor.locale );
		const form = new LinkForm( new Model(), formView );

		// Create component models.
		const urlInputModel = new Model( {
			label: t( 'Link URL' )
		} );

		urlInputModel.bind( 'value' ).to( linkCommand, 'value' );

		const saveButtonModel = new Model( {
			isEnabled: true,
			isOn: false,
			label: t( 'Save' ),
			withText: true,
			type: 'submit'
		} );

		const cancelButtonModel = new Model( {
			isEnabled: true,
			isOn: false,
			label: t( 'Cancel' ),
			withText: true
		} );

		const unlinkButtonModel = new Model( {
			isEnabled: true,
			isOn: false,
			label: t( 'Unlink' ),
			icon: 'unlink'
		} );

		// Add components to the form.
		form.add( this._urlInput = new LabeledInput( urlInputModel, formView.urlInputView, InputText, new Model() ) );
		form.add( this._saveButton = new Button( saveButtonModel, formView.saveButtonView ) );
		form.add( this._cancelButton = new Button( cancelButtonModel, formView.cancelButtonView ) );
		form.add( this._unlinkButton = new Button( unlinkButtonModel, formView.unlinkButtonView ) );

		// Execute link command after clicking on balloon panel `Link` button.
		this.listenTo( form.model, 'submit', () => {
			editor.execute( 'link', this._urlInput.value );
			this._hidePanel( true );
		} );

		// Execute unlink command after clicking on balloon panel `Unlink` button.
		this.listenTo( unlinkButtonModel, 'execute', () => {
			editor.execute( 'unlink' );
			this._hidePanel( true );
		} );

		// Hide balloon panel after clicking on balloon panel `Cancel` button.
		this.listenTo( cancelButtonModel, 'execute', () => this._hidePanel( true ) );

		this.balloonPanel.add( 'content', form );

		return form;
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
			this.balloonPanel.view.attachTo(
				viewDocument.domConverter.getCorrespondingDomElement( targetLink ),
				domEditableElement
			);
		}
		// Otherwise attach panel to the selection.
		else {
			this.balloonPanel.view.attachTo(
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
		this.balloonPanel.view.hide();

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
		this._urlInput.view.select();
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
