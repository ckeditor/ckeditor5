/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Feature from '../core/feature.js';
import ClickObserver from '../engine/view/observer/clickobserver.js';
import LinkEngine from './linkengine.js';
import LinkElement from './linkelement.js';

import Model from '../ui/model.js';

import ButtonController from '../ui/button/button.js';
import ButtonView from '../ui/button/buttonview.js';

import LinkBalloonPanel from './ui/linkballoonpanel.js';
import LinkBalloonPanelView from './ui/linkballoonpanelview.js';

import { keyCodes } from '../utils/keyboard.js';

/**
 * The link feature. It introduces the Link and Unlink buttons and the <kbd>Ctrl+L</kbd> keystroke.
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
		 * Link balloon panel component.
		 *
		 * @member {link.ui.LinkBalloonPanel} link.Link#balloonPanel
		 */
		this.balloonPanel = this._createBalloonPanel();

		// Create toolbar buttons.
		this._createToolbarLinkButton();
		this._createToolbarUnlinkButton();
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
			keystroke: 'CTRL+L'
		} );

		// Bind button model to the command.
		linkButtonModel.bind( 'isEnabled' ).to( linkCommand, 'isEnabled' );

		// Show the panel on button click only when editor is focused.
		this.listenTo( linkButtonModel, 'execute', () => {
			this._attachPanelToElement();
			this.balloonPanel.urlInput.view.select();
		} );

		// Add link button to feature components.
		editor.ui.featureComponents.add( 'link', ButtonController, ButtonView, linkButtonModel );
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
		unlinkButtonModel.bind( 'isEnabled' ).to( unlinkCommand, 'hasValue' );

		// Execute unlink command and hide panel, if open.
		this.listenTo( unlinkButtonModel, 'execute', () => {
			editor.execute( 'unlink' );
		} );

		// Add unlink button to feature components.
		editor.ui.featureComponents.add( 'unlink', ButtonController, ButtonView, unlinkButtonModel );
	}

	/**
	 * Creates the {@link link.ui.LinkBalloonPanel} instance,
	 * attaches {@link link.LinkBalloonPanelModel} events to the link and unlink commands
	 * and applies behaviors specific for this panel.
	 *
	 * @private
	 * @returns {link.ui.LinkBalloonPanel} Link balloon panel instance.
	 */
	_createBalloonPanel() {
		const editor = this.editor;
		const viewDocument = editor.editing.view;
		const linkCommand = editor.commands.get( 'link' );

		// Create the model of the panel.
		const panelModel = new Model( {
			maxWidth: 300
		} );

		// Bind panel model to command.
		panelModel.bind( 'url' ).to( linkCommand, 'value' );

		// Create the balloon panel instance.
		const balloonPanel = new LinkBalloonPanel( panelModel, new LinkBalloonPanelView( editor.locale ) );

		// Observe `LinkBalloonPanelMode#executeLink` event from within the model of the panel,
		// which means that form has been submitted.
		this.listenTo( panelModel, 'executeLink', () => {
			editor.execute( 'link', balloonPanel.urlInput.value );
			this._hidePanel( { focusEditable: true } );
		} );

		// Observe `LinkBalloonPanelMode#executeUnlink` event from within the model of the panel,
		// which means that the `Unlink` button has been clicked.
		this.listenTo( panelModel, 'executeUnlink', () => {
			editor.execute( 'unlink' );
			this._hidePanel( { focusEditable: true } );
		} );

		// Observe `LinkBalloonPanelMode#executeCancel` event from within the model of the panel,
		// which means that the `Cancel` button has been clicked.
		this.listenTo( panelModel, 'executeCancel', () => this._hidePanel( { focusEditable: true } ) );

		// Handle `Ctrl+L` keystroke and show panel.
		editor.keystrokes.set( 'CTRL+L', () => {
			this._attachPanelToElement();
			balloonPanel.urlInput.view.select();
		} );

		// Attach close by `Esc` press and click out of panel actions on panel show, on panel hide clean up listeners.
		this.listenTo( balloonPanel.view.model, 'change:isVisible', ( evt, propertyName, value ) => {
			if ( value ) {
				// Handle close by `Esc`.
				balloonPanel.view.listenTo( document, 'keydown', this._closePanelOnEsc.bind( this ) );

				// Handle close by clicking out of the panel.
				// Note that it is not handled by a `click` event, this is because clicking on link button or directly on link element
				// opens and closes panel at the same time.
				balloonPanel.view.listenTo( document, 'mouseup', ( evt, domEvt ) => {
					// Do nothing when the panel was clicked.
					if ( balloonPanel.view.element.contains( domEvt.target ) ) {
						return;
					}

					// When click was out of the panel then hide it.
					balloonPanel.view.hide();
				} );
			} else {
				balloonPanel.view.stopListening( document );
			}
		} );

		// Handle click on document and show panel when selection is placed inside the link element.
		// Keep panel open until selection will be inside the same link element.
		viewDocument.on( 'click', () => {
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

				this.listenTo( balloonPanel.view.model, 'change:isVisible', () => this.stopListening( viewDocument ) );
			}
		} );

		// Append panel element to body.
		editor.ui.add( 'body', balloonPanel );

		return balloonPanel;
	}

	/**
	 * Shows {@link link#balloonPanel LinkBalloonPanel} and attach to target element.
	 * If selection is collapsed and is placed inside link element, then panel will be attached
	 * to whole link element, otherwise will be attached to the selection.
	 *
	 * @private
	 * @param {core.view.LinkElement} [parentLink] Target element.
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
	 * Hides {@link link#balloonPanel LinkBalloonPanel}.
	 *
	 * @private
	 * @param {Object} [options={}] Additional options.
	 * @param {Boolean} [options.focusEditable=false] When `true` then editable focus will be restored on panel hide.
	 */
	_hidePanel( options = {} ) {
		this.balloonPanel.view.hide();

		if ( options.focusEditable ) {
			this.editor.editing.view.focus();
		}
	}

	/**
	 * Hides balloon panel on `ESC` key press event and restores editor focus.
	 *
	 * **Note**: this method is `@protected` for testing purposes only.
	 *
	 * @protected
	 * @param {utils.EventInfo} evt Information about the event.
	 * @param {KeyboardEvent} domEvt DOM `keydown` event.
	 */
	_closePanelOnEsc( evt, domEvt ) {
		if ( domEvt.keyCode == keyCodes.esc ) {
			this._hidePanel( { focusEditable: true } );
		}
	}
}

// Get position parent LinkElement.
//
// @private
// @param {engine.view.Position} position
// @returns {link.LinkElement|null}
function getPositionParentLink( position ) {
	return position.parent.getAncestors().find( ( ancestor ) => ancestor instanceof LinkElement );
}
