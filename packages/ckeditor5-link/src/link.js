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

/**
 * The link feature.
 *
 * It uses the {@link basic-styles.LinkEngine link engine feature}.
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
		const viewDocument = this.editor.editing.view;

		// Register document click observer.
		viewDocument.addObserver( ClickObserver );

		/**
		 * Link balloon panel component.
		 *
		 * @member {link.ui.LinkBalloonPanel}
		 */
		this.balloonPanel = this._createBalloonPanel();

		// Create toolbar buttons.
		this._createToolbarLinkButton();
		this._createToolbarUnlinkButton();
	}

	/**
	 * Create toolbar link button. Click on button will show
	 * {@link link.ui.LinkBalloonPanel LinkBalloonPanel} attached to the selection.
	 *
	 * @private
	 */
	_createToolbarLinkButton() {
		const editor = this.editor;
		const viewDocument = editor.editing.view;
		const linkCommand = editor.commands.get( 'link' );
		const t = editor.t;

		// Create button model.
		const linkButtonModel = new Model( {
			isEnabled: true,
			isOn: false,
			label: t( 'Link' ),
			icon: 'link',
			keystroke: 'CTRL+l'
		} );

		// Bind button model to command.
		linkButtonModel.bind( 'isEnabled' ).to( linkCommand, 'isEnabled' );

		// Show Balloon Panel on button click only when editor is focused.
		this.listenTo( linkButtonModel, 'execute', () => {
			if ( !viewDocument.isFocused ) {
				return;
			}

			this._attachPanelToElement();
		} );

		// Add link button to feature components.
		editor.ui.featureComponents.add( 'link', ButtonController, ButtonView, linkButtonModel );
	}

	/**
	 * Create toolbar unlink button. Click on button will unlink selected link.
	 *
	 * @private
	 */
	_createToolbarUnlinkButton() {
		const editor = this.editor;
		const t = editor.t;
		const unlinkCommand = editor.commands.get( 'unlink' );

		// Create button model.
		const unlinkButtonModel = new Model( {
			isEnabled: false,
			isOn: false,
			label: t( 'Unlink' ),
			icon: 'unlink'
		} );

		// Bind button model to command.
		unlinkButtonModel.bind( 'isEnabled' ).to( unlinkCommand, 'hasValue' );

		// Execute unlink command and hide panel if is opened.
		this.listenTo( unlinkButtonModel, 'execute', () => {
			editor.execute( 'unlink' );

			if ( this.balloonPanel && this.balloonPanel.view.isVisible ) {
				this.balloonPanel.view.hide();
			}
		} );

		// Add unlink button to feature components.
		editor.ui.featureComponents.add( 'unlink', ButtonController, ButtonView, unlinkButtonModel );
	}

	/**
	 * Create {@link link.ui.LinkBalloonPanel LinkBalloonPanel} instance
	 * and attach link command to LinkBalloonPanelModel#execute event.
	 *
	 *	                       +------------------------------------+
	 *	                       | <a href="http://foo.com">[foo]</a> |
	 *	                       +------------------------------------+
	 *	                                      Document
	 *	             Value set in doc   ^                   +
	 *	             if it's correct.   |                   |
	 *	                                |                   |
	 *	                      +---------+--------+          |
	 *	Panel.urlInput#value  | Value validation |          |  User clicked "Link" in
	 *	       is validated.  +---------+--------+          |  the toolbar. Retrieving
	 *	                                |                   |  URL from Document and setting
	 *	             PanelModel fires   |                   |  PanelModel#url.
	 *	          PanelModel#execute.   +                   v
	 *
	 *	                              +-----------------------+
	 *	                              | url: 'http://foo.com' |
	 *	                              +-----------------------+
	 *	                                      PanelModel
	 *	                                ^                   +
	 *	                                |                   |  Input field is
	 *	                  User clicked  |                   |  in sync with
	 *	                       "Save".  |                   |  PanelModel#url.
	 *	                                +                   v
	 *
	 *	                            +--------------------------+
	 *	                            | +----------------------+ |
	 *	                            | |http://foo.com        | |
	 *	                            | +----------------------+ |
	 *	                            |                   +----+ |
	 *	                            |                   |Save| |
	 *	                            |                   +----+ |
	 *	                            +--------------------------+
	 * @private
	 * @returns {link.ui.LinkBalloonPanel} Link balloon panel instance.
	 */
	_createBalloonPanel() {
		const editor = this.editor;
		const viewDocument = editor.editing.view;
		const linkCommand = editor.commands.get( 'link' );

		// Create the model of the panel.
		const panelModel = new Model( {
			maxWidth: 300,
			url: linkCommand.value
		} );

		// Bind panel model to command.
		panelModel.bind( 'url' ).to( linkCommand, 'value' );

		// Create Balloon panel instance.
		const balloonPanel = new LinkBalloonPanel( panelModel, new LinkBalloonPanelView( editor.locale ) );

		// Observe `LinkBalloonPanelMode#execute` event from within the model of the panel,
		// which means that the `Save` button has been clicked.
		this.listenTo( panelModel, 'execute', () => {
			editor.execute( 'link', balloonPanel.urlInput.value );
			balloonPanel.view.hide();
		} );

		// Observe `LinkBalloonPanelMode#execute-unlink` event from within the model of the panel,
		// which means that the `Unlink` button has been clicked.
		this.listenTo( panelModel, 'execute-unlink', () => {
			editor.execute( 'unlink' );
			balloonPanel.view.hide();
		} );

		// Always focus editor on panel hide.
		this.listenTo( balloonPanel.view.model, 'change:isVisible', ( evt, propertyName, value ) => {
			if ( !value ) {
				viewDocument.focus();
			}
		} );

		// Hide panel on editor focus.
		// @TODO replace it by some FocusManager.
		viewDocument.on( 'focus', () => balloonPanel.view.hide() );

		// Handle click on document and show panel when selection is placed in the link element.
		viewDocument.on( 'click', () => {
			if ( viewDocument.selection.isCollapsed && linkCommand.value !== undefined ) {
				this._attachPanelToElement();
			}
		} );

		// Handle `Ctrl+l` keystroke and show panel.
		editor.keystrokes.set( 'CTRL+l', () => this._attachPanelToElement() );

		// Append panel element to body.
		editor.ui.add( 'body', balloonPanel );

		return balloonPanel;
	}

	/**
	 * Show {@link link.ui.LinkBalloonPanel LinkBalloonPanel} and attach to target element.
	 * If selection is collapsed and is placed inside link element, then panel will be attached
	 * to whole link element, otherwise will be attached to the selection.
	 *
	 * Input inside panel will be focused.
	 *
	 * @private
	 */
	_attachPanelToElement() {
		const viewDocument = this.editor.editing.view;
		const domEditableElement = viewDocument.domConverter.getCorrespondingDomElement( viewDocument.selection.editableElement );

		const viewSelectionParent = viewDocument.selection.getFirstPosition().parent;
		const viewSelectionParentAncestors = viewSelectionParent.getAncestors();
		const linkElement = viewSelectionParentAncestors.find( ( ancestor ) => ancestor instanceof LinkElement );

		// When selection is inside link element, then attach panel to this element.
		if ( linkElement ) {
			this.balloonPanel.view.attachTo(
				viewDocument.domConverter.getCorrespondingDomElement( linkElement ),
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

		// Set focus to the panel input.
		this.balloonPanel.urlInput.view.focus();
	}
}
