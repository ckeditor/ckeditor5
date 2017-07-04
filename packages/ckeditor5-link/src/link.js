/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module link/link
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver';
import Range from '@ckeditor/ckeditor5-engine/src/view/range';
import LinkEngine from './linkengine';
import LinkElement from './linkelement';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';

import clickOutsideHandler from '@ckeditor/ckeditor5-ui/src/bindings/clickoutsidehandler';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import LinkFormView from './ui/linkformview';

import linkIcon from '../theme/icons/link.svg';
import unlinkIcon from '../theme/icons/unlink.svg';

import '../theme/theme.scss';

/**
 * The link plugin. It introduces the Link and Unlink buttons and the <kbd>Ctrl+K</kbd> keystroke.
 *
 * It uses the {@link module:link/linkengine~LinkEngine link engine plugin} and the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon plugin}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Link extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ LinkEngine, ContextualBalloon ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Link';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		this.editor.editing.view.addObserver( ClickObserver );

		/**
		 * The form view displayed inside of the balloon.
		 *
		 * @member {module:link/ui/linkformview~LinkFormView}
		 */
		this.formView = this._createForm();

		/**
		 * The contextual balloon plugin instance.
		 *
		 * @private
		 * @member {module:ui/panel/balloon/contextualballoon~ContextualBalloon}
		 */
		this._balloon = this.editor.plugins.get( ContextualBalloon );

		// Create toolbar buttons.
		this._createToolbarLinkButton();
		this._createToolbarUnlinkButton();

		// Attach lifecycle actions to the the balloon.
		this._attachActions();
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

		// Hide the panel after clicking on formView `Cancel` button.
		this.listenTo( formView, 'cancel', () => this._hidePanel( true ) );

		// Close the panel on esc key press when the form has focus.
		formView.keystrokes.set( 'Esc', ( data, cancel ) => {
			this._hidePanel( true );
			cancel();
		} );

		return formView;
	}

	/**
	 * Creates a toolbar link button. Clicking this button will show
	 * {@link #_balloon} attached to the selection.
	 *
	 * @private
	 */
	_createToolbarLinkButton() {
		const editor = this.editor;
		const linkCommand = editor.commands.get( 'link' );
		const t = editor.t;

		// Handle `Ctrl+K` keystroke and show the panel.
		editor.keystrokes.set( 'CTRL+K', () => this._showPanel( true ) );

		editor.ui.componentFactory.add( 'link', locale => {
			const button = new ButtonView( locale );

			button.isEnabled = true;
			button.label = t( 'Link' );
			button.icon = linkIcon;
			button.keystroke = 'CTRL+K';
			button.tooltip = true;

			// Bind button to the command.
			button.bind( 'isEnabled' ).to( linkCommand, 'isEnabled' );

			// Show the panel on button click.
			this.listenTo( button, 'execute', () => this._showPanel( true ) );

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

		editor.ui.componentFactory.add( 'unlink', locale => {
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
	 * Attaches actions which control whether the balloon panel containing the
	 * {@link #formView} is visible or not.
	 *
	 * @private
	 */
	_attachActions() {
		const viewDocument = this.editor.editing.view;

		// Handle click on view document and show panel when selection is placed inside the link element.
		// Keep panel open until selection will be inside the same link element.
		this.listenTo( viewDocument, 'click', () => {
			const parentLink = this._getSelectedLinkElement();

			if ( parentLink ) {
				// Then show panel but keep focus inside editor editable.
				this._showPanel();
			}
		} );

		// Focus the form if the balloon is visible and the Tab key has been pressed.
		this.editor.keystrokes.set( 'Tab', ( data, cancel ) => {
			if ( this._balloon.visibleView === this.formView && !this.formView.focusTracker.isFocused ) {
				this.formView.focus();
				cancel();
			}
		} );

		// Close the panel on the Esc key press when the editable has focus and the balloon is visible.
		this.editor.keystrokes.set( 'Esc', ( data, cancel ) => {
			if ( this._balloon.visibleView === this.formView ) {
				this._hidePanel();
				cancel();
			}
		} );

		// Close on click outside of balloon panel element.
		clickOutsideHandler( {
			emitter: this.formView,
			activator: () => this._balloon.hasView( this.formView ),
			contextElement: this._balloon.view.element,
			callback: () => this._hidePanel()
		} );
	}

	/**
	 * Adds the {@link #formView} to the {@link #_balloon}.
	 * When view is already added then try to focus it `focusInput` parameter is set as true.
	 *
	 * @protected
	 * @param {Boolean} [focusInput=false] When `true`, link form will be focused on panel show.
	 * @return {Promise} A promise resolved when the {@link #formView} {@link module:ui/view~View#init} is done.
	 */
	_showPanel( focusInput ) {
		const editor = this.editor;
		const command = editor.commands.get( 'link' );
		const editing = editor.editing;
		const showViewDocument = editing.view;
		const showIsCollapsed = showViewDocument.selection.isCollapsed;
		const showSelectedLink = this._getSelectedLinkElement();

		// https://github.com/ckeditor/ckeditor5-link/issues/53
		this.formView.unlinkButtonView.isVisible = !!showSelectedLink;

		// Make sure that each time the panel shows up, the URL field remains in sync with the value of
		// the command. If the user typed in the input, then canceled the balloon (`urlInputView#value` stays
		// unaltered) and re-opened it without changing the value of the link command (e.g. because they
		// clicked the same link), they would see the old value instead of the actual value of the command.
		// https://github.com/ckeditor/ckeditor5-link/issues/78
		// https://github.com/ckeditor/ckeditor5-link/issues/123
		this.formView.urlInputView.inputView.element.value = command.value || '';

		this.listenTo( showViewDocument, 'render', () => {
			const renderSelectedLink = this._getSelectedLinkElement();
			const renderIsCollapsed = showViewDocument.selection.isCollapsed;
			const hasSellectionExpanded = showIsCollapsed && !renderIsCollapsed;

			// Hide the panel if:
			//   * the selection went out of the original link element
			//     (e.g. paragraph containing the link was removed),
			//   * the selection has expanded
			// upon the #render event.
			if ( hasSellectionExpanded || showSelectedLink !== renderSelectedLink ) {
				this._hidePanel( true );
			}
			// Update the position of the panel when:
			//  * the selection remains in the original link element,
			//  * there was no link element in the first place, i.e. creating a new link
			else {
				// If still in a link element, simply update the position of the balloon.
				if ( renderSelectedLink ) {
					this._balloon.updatePosition();
				}
				// If there was no link, upon #render, the balloon must be moved
				// to the new position in the editing view (a new native DOM range).
				else {
					this._balloon.updatePosition( this._getBalloonPositionData() );
				}
			}
		} );

		if ( this._balloon.hasView( this.formView ) ) {
			// Check if formView should be focused and focus it if is visible.
			if ( focusInput && this._balloon.visibleView === this.formView ) {
				this.formView.urlInputView.select();
			}

			return Promise.resolve();
		} else {
			return this._balloon.add( {
				view: this.formView,
				position: this._getBalloonPositionData()
			} ).then( () => {
				if ( focusInput ) {
					this.formView.urlInputView.select();
				}
			} );
		}
	}

	/**
	 * Removes the {@link #formView} from the {@link #_balloon}.
	 *
	 * See {@link #_showPanel}.
	 *
	 * @protected
	 * @param {Boolean} [focusEditable=false] When `true`, editable focus will be restored on panel hide.
	 */
	_hidePanel( focusEditable ) {
		this.stopListening( this.editor.editing.view, 'render' );

		if ( !this._balloon.hasView( this.formView ) ) {
			return;
		}

		if ( focusEditable ) {
			this.editor.editing.view.focus();
		}

		this.stopListening( this.editor.editing.view, 'render' );
		this._balloon.remove( this.formView );
	}

	/**
	 * Returns positioning options for the {@link #_balloon}. They control the way balloon is attached
	 * to the target element or selection.
	 *
	 * If the selection is collapsed and inside a link element, then the panel will be attached to the
	 * entire link element. Otherwise, it will be attached to the selection.
	 *
	 * @private
	 * @returns {module:utils/dom/position~Options}
	 */
	_getBalloonPositionData() {
		const viewDocument = this.editor.editing.view;
		const targetLink = this._getSelectedLinkElement();

		const target = targetLink ?
			// When selection is inside link element, then attach panel to this element.
			viewDocument.domConverter.mapViewToDom( targetLink ) :
			// Otherwise attach panel to the selection.
			viewDocument.domConverter.viewRangeToDom( viewDocument.selection.getFirstRange() );

		return {
			target,
			limiter: viewDocument.domConverter.mapViewToDom( viewDocument.selection.editableElement )
		};
	}

	/**
	 * Returns the {@link module:link/linkelement~LinkElement} under
	 * {@link module:engine/view/document~Document editing view's} selection or `null`
	 * if there's none.
	 *
	 * **Note**: For non–collapsed selection the `LinkElement` is only returned when **fully**
	 * selected and the **only** element within the selection boundaries.
	 *
	 * @private
	 * @returns {module:link/linkelement~LinkElement|null}
	 */
	_getSelectedLinkElement() {
		const selection = this.editor.editing.view.selection;

		if ( selection.isCollapsed ) {
			return findLinkElementAncestor( selection.getFirstPosition() );
		} else {
			// The range for fully selected link is usually anchored in adjacent text nodes.
			// Trim it to get closer to the actual LinkElement.
			const range = selection.getFirstRange().getTrimmed();
			const startLink = findLinkElementAncestor( range.start );
			const endLink = findLinkElementAncestor( range.end );

			if ( !startLink || startLink != endLink ) {
				return null;
			}

			// Check if the LinkElement is fully selected.
			if ( Range.createIn( startLink ).getTrimmed().isEqual( range ) ) {
				return startLink;
			} else {
				return null;
			}
		}
	}
}

// Returns a `LinkElement` if there's one among the ancestors of the provided `Position`.
//
// @private
// @param {module:engine/view/position~Position} View position to analyze.
// @returns {module:link/linkelement~LinkElement|null} LinkElement at the position or null.
function findLinkElementAncestor( position ) {
	return position.getAncestors().find( ancestor => ancestor instanceof LinkElement );
}
