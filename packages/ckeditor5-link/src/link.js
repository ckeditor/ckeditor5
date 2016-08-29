/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Feature from '../core/feature.js';
import LinkEngine from './linkengine.js';
import ClickObserver from '../engine/view/observer/clickobserver.js';

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
		const editor = this.editor;
		const viewDocument = editor.editing.view;
		const linkCommand = editor.commands.get( 'link' );

		/**
		 * @TODO
		 */
		this.balloonPanel = this._createBalloonPanel();
		this._createToolbarLinkButton();
		this._createToolbarUnlinkButton();

		// Register document click observer
		viewDocument.addObserver( ClickObserver );

		// Handle click on document and show panel when click target is a link element.
		viewDocument.on( 'click', () => {
			if ( viewDocument.selection.isCollapsed && linkCommand.value !== undefined ) {
				this._attachPanelToElement();
			}
		} );

		// Handle Ctrl+l keystroke and show panel.
		editor.keystrokes.set( 'CTRL+l', () => this._attachPanelToElement() );
	}

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
			icon: 'link'
		} );

		linkButtonModel.bind( 'url', 'isEnabled' ).to( linkCommand, 'value', 'isEnabled' );

		// Show Balloon Panel on button click.
		this.listenTo( linkButtonModel, 'execute', () => {
			if ( !viewDocument.isFocused ) {
				return;
			}

			this._attachPanelToElement();
		} );

		// Add link button to feature components.
		editor.ui.featureComponents.add( 'link', ButtonController, ButtonView, linkButtonModel );
	}

	_createToolbarUnlinkButton() {
		const editor = this.editor;
		const t = editor.t;
		const unlinkCommand = editor.commands.get( 'unlink' );

		// Create button model.
		const unlinkButtonModel = new Model( {
			isEnabled: true,
			isOn: false,
			label: t( 'Unlink' ),
			icon: 'unlink'
		} );

		// Bind button model to command.
		unlinkButtonModel.bind( 'isEnabled' ).to( unlinkCommand, 'hasValue' );

		// Execute command.
		this.listenTo( unlinkButtonModel, 'execute', () => {
			editor.execute( 'unlink' );

			if ( this.balloonPanel && this.balloonPanel.view.isVisible ) {
				this.balloonPanel.view.hide();
			}
		} );

		// Add link button to feature components.
		editor.ui.featureComponents.add( 'unlink', ButtonController, ButtonView, unlinkButtonModel );
	}

	/**
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
	 */
	_createBalloonPanel() {
		const editor = this.editor;
		const viewDocument = editor.editing.view;
		const t = editor.t;
		const linkCommand = editor.commands.get( 'link' );

		// Create the model of the panel.
		const panelModel = new Model( {
			maxWidth: 300,
			url: linkCommand.value
		} );

		// Bind panel model to command.
		panelModel.bind( 'url' ).to( linkCommand, 'value' );

		// Create balloon Panel instance.
		const balloonPanel = new LinkBalloonPanel( panelModel, new LinkBalloonPanelView( editor.locale ) );

		// Observe #execute event from within the model of the panel, which means that the "Save" button has been clicked.
		this.listenTo( panelModel, 'execute', () => {
			const urlValue = balloonPanel.urlInput.value;

			// TODO: Validate panelModel#url with some RegExp imported from v4.
			if ( urlValue ) {
				editor.execute( 'link', urlValue );
				balloonPanel.view.hide();
			} else {
				window.alert( t( `"${ urlValue }" URL address is incorrect.` ) );
				balloonPanel.urlInput.view.focus();
			}
		} );

		// Always focus editor on panel hide.
		this.listenTo( panelModel, 'hide', () => viewDocument.focus() );

		// TODO: Create real focus manager.
		viewDocument.on( 'focus', () => balloonPanel.view.hide() );
		viewDocument.on( 'blur', ( evt, domEvtData ) => {
			if ( domEvtData.domEvent.relatedTarget === balloonPanel.urlInput.input.view.element ) {
				domEvtData.domEvent.preventDefault();
			}
		} );

		editor.ui.add( 'body', balloonPanel );

		return balloonPanel;
	}

	_attachPanelToElement() {
		const viewDocument = this.editor.editing.view;
		const editableViewElement = this.editor.ui.editable.view.element;
		const viewSelectionParent = viewDocument.selection.getFirstPosition().parent;
		const viewSelectionParentAncestors = viewSelectionParent.getAncestors();
		const linkElement = viewSelectionParentAncestors.find( ( ancestor ) => ancestor.name === 'a' );

		if ( linkElement ) {
			this.balloonPanel.view.attachTo(
				viewDocument.domConverter.getCorrespondingDomElement( linkElement ),
				editableViewElement
			);
		} else {
			this.balloonPanel.view.attachTo(
				viewDocument.domConverter.viewRangeToDom( viewDocument.selection.getFirstRange() ),
				editableViewElement
			);
		}

		this.balloonPanel.urlInput.view.focus();
	}
}
