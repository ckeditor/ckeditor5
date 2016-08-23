/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Feature from '../core/feature.js';
import Model from '../ui/model.js';

import LinkEngine from './linkengine.js';

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
		const t = editor.t;
		const command = editor.commands.get( 'link' );

		// Create button model.
		const buttonModel = new Model( {
			isEnabled: true,
			isOn: false,
			label: t( 'Link' ),
			icon: 'link'
		} );

		// Show Balloon Panel on button click.
		this.listenTo( buttonModel, 'execute', () => {
			if ( !this.editor.editing.view.isFocused ) {
				return;
			}

			if ( !this.balloonPanel ) {
				this._createBalloonPanel();
			}

			this._attachPanelToElement();
		} );

		// Add link button to feature components.
		editor.ui.featureComponents.add( 'link', ButtonController, ButtonView, buttonModel );

		// Show Balloon Panel on click directly on some link element.
		// @TODO: Get click event from editor instead of DOM.
		this.editor.ui.editable.view.element.addEventListener( 'click', () => {
			if ( editor.document.selection.isCollapsed && command.value !== undefined ) {
				if ( !this.balloonPanel ) {
					this._createBalloonPanel();
				}

				this._attachPanelToElement();
			}
		} );
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
		const t = editor.t;
		const command = this.editor.commands.get( 'link' );
		const editingView = editor.editing.view;

		// Create the model of the panel.
		const panelModel = new Model( {
			maxWidth: 300,
			url: command.value
		} );

		// Bind panel model to command.
		panelModel.bind( 'url' ).to( command, 'value' );

		// Observe #execute event from within the model of the panel, which means that
		// the "Save" button has been clicked.
		this.listenTo( panelModel, 'execute', () => {
			const urlValue = this.balloonPanel.urlInput.value;

			// TODO: validate panelModel#url with some RegExp imported from v4.
			if ( urlValue ) {
				this.editor.execute( 'link', urlValue );
				this.balloonPanel.view.hide();
			} else {
				window.alert( t( `"${ urlValue }" URL address is incorrect.` ) );
				this.balloonPanel.urlInput.view.focus();
			}
		} );

		/**
		 * TODO
		 *
		 * @member {} todo
		 */
		this.balloonPanel = new LinkBalloonPanel( panelModel, new LinkBalloonPanelView( editor.locale ) );

		// TODO: It's a lame FocusManager.
		editingView.on( 'blur', ( evt, domEvtData ) => {
			if ( domEvtData.domEvent.relatedTarget === this.balloonPanel.urlInput ) {
				domEvtData.domEvent.preventDefault();
			} else {
				this.balloonPanel.view.hide();
			}
		} );

		editor.ui.add( 'body', this.balloonPanel );
		// this.balloonPanel.urlInput.view.focus();
	}

	_attachPanelToElement() {
		if ( !this.balloonPanel ) {
			return;
		}

		// Adjust balloon position.
		const editingView = this.editor.editing.view;
		const editableViewElement = this.editor.ui.editable.view.element;
		const firstParent = editingView.selection.getFirstPosition().parent;
		const firstParentAncestors = firstParent.getAncestors();
		const anchor = firstParentAncestors.find( ( ancestor ) => ancestor.name === 'a' );

		if ( anchor ) {
			this.balloonPanel.view.attachTo(
				editingView.domConverter.getCorrespondingDomElement( anchor ),
				editableViewElement
			);
		} else {
			this.balloonPanel.view.attachTo(
				editingView.domConverter.viewRangeToDom( editingView.selection.getFirstRange() ),
				editableViewElement
			);
		}
	}
}
