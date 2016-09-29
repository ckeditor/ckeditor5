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

import ButtonController from '../ui/button/button.js';
import ButtonView from '../ui/button/buttonview.js';

import LinkBalloonPanel from './ui/linkballoonpanel.js';
import LinkBalloonPanelView from './ui/linkballoonpanelview.js';

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
			keystroke: 'CTRL+K'
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
		unlinkButtonModel.bind( 'isEnabled' ).to( unlinkCommand, 'isEnabled' );

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

		// Execute link command after clicking on balloon panel `Link` button.
		this.listenTo( panelModel, 'executeLink', () => {
			editor.execute( 'link', balloonPanel.urlInput.value );
			this._hidePanel( { focusEditable: true } );
		} );

		// Execute unlink command after clicking on balloon panel `Unlink` button.
		this.listenTo( panelModel, 'executeUnlink', () => {
			editor.execute( 'unlink' );
			this._hidePanel( { focusEditable: true } );
		} );

		// Hide balloon panel after clicking on balloon panel `Cancel` button.
		this.listenTo( panelModel, 'executeCancel', () => this._hidePanel( { focusEditable: true } ) );

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

				this.listenTo( balloonPanel.view.model, 'change:isVisible', () => this.stopListening( viewDocument, 'render' ) );
			}
		} );

		// Close on `ESC` press.
		escPressHandler( {
			controller: balloonPanel.view,
			model: balloonPanel.view.model,
			activeIf: 'isVisible',
			callback: () => this._hidePanel( { focusEditable: true } )
		} );

		// Close on click outside of balloon panel element.
		clickOutsideHandler( {
			controller: balloonPanel.view,
			model: balloonPanel.view.model,
			activeIf: 'isVisible',
			contextElement: balloonPanel.view.element,
			callback: () => this._hidePanel()
		} );

		// Handle `Ctrl+K` keystroke and show panel.
		editor.keystrokes.set( 'CTRL+K', () => {
			this._attachPanelToElement();
			balloonPanel.urlInput.view.select();
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
