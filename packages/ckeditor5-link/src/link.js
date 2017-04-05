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
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/contextualballoon';

import clickOutsideHandler from '@ckeditor/ckeditor5-ui/src/bindings/clickoutsidehandler';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import LinkFormView from './ui/linkformview';

import linkIcon from '../theme/icons/link.svg';
import unlinkIcon from '../theme/icons/unlink.svg';

import '../theme/theme.scss';

/**
 * The link plugin. It introduces the Link and Unlink buttons and the <kbd>Ctrl+K</kbd> keystroke.
 *
 * It uses the {@link module:link/linkengine~LinkEngine link engine plugin} and
 * {@link module:ui/contextualballoon~ContextualBalloon contextual balloon plugin}.
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
		return 'link/link';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		this.editor.editing.view.addObserver( ClickObserver );

		/**
		 * The form view inside {@link #balloonPanelView}.
		 *
		 * @member {module:link/ui/linkformview~LinkFormView}
		 */
		this.formView = this._createForm();

		/**
		 * Contextual balloon plugin instance.
		 *
		 * @private
		 * @member {module:ui/contextualballoon~ContextualBalloon}
		 */
		this._balloon = this.editor.plugins.get( ContextualBalloon );

		// Create toolbar buttons.
		this._createToolbarLinkButton();
		this._createToolbarUnlinkButton();

		// Attach lifecycle actions to the link balloon.
		this._attachActions();
	}

	/**
	 * Returns `true` when link view is added to the {@link module:ui/contextualballoon~ContextualBalloon}.
	 *
	 * @private
	 * @returns {Boolean}
	 */
	get _isInBalloon() {
		return this._balloon.hasView( this.formView );
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
	 * {@link #balloonPanelView} attached to the selection.
	 *
	 * @private
	 */
	_createToolbarLinkButton() {
		const editor = this.editor;
		const linkCommand = editor.commands.get( 'link' );
		const t = editor.t;

		// Handle `Ctrl+K` keystroke and show the panel.
		editor.keystrokes.set( 'CTRL+K', () => this._showPanel( true ) );

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
	 * Attaches actions which defines when panel should be open or close.
	 *
	 * @private
	 */
	_attachActions() {
		const viewDocument = this.editor.editing.view;

		// Handle click on view document and show panel when selection is placed inside the link element.
		// Keep panel open until selection will be inside the same link element.
		this.listenTo( viewDocument, 'click', () => {
			const viewSelection = viewDocument.selection;
			const parentLink = getPositionParentLink( viewSelection.getFirstPosition() );

			// When collapsed selection is inside link element (link element is clicked).
			if ( viewSelection.isCollapsed && parentLink ) {
				// Then show panel but keep focus inside editor editable.
				this._showPanel();

				// Avoid duplication of the same listener.
				this.stopListening( viewDocument, 'render' );

				// Start listen to view document changes and close the panel when selection will be moved
				// out of the actual link element.
				this.listenTo( viewDocument, 'render', () => {
					const currentParentLink = getPositionParentLink( viewSelection.getFirstPosition() );

					if ( !viewSelection.isCollapsed || parentLink !== currentParentLink ) {
						this._hidePanel();
					} else {
						this._balloon.updatePosition();
					}
				} );
			}
		} );

		// Focus the form if link balloon is currently visible and tab key has been pressed.
		this.editor.keystrokes.set( 'Tab', ( data, cancel ) => {
			if ( this._balloon.visibleView === this.formView && !this.formView.focusTracker.isFocused ) {
				this.formView.focus();
				cancel();
			}
		} );

		// Close the panel on esc key press when editable has focus and link balloon is currently visible.
		this.editor.keystrokes.set( 'Esc', ( data, cancel ) => {
			if ( this._balloon.visibleView === this.formView ) {
				this._hidePanel();
				cancel();
			}
		} );

		// Close on click outside of balloon panel element.
		clickOutsideHandler( {
			emitter: this.formView,
			activator: () => this._isInBalloon,
			contextElement: this._balloon.view.element,
			callback: () => this._hidePanel()
		} );
	}

	/**
	 * Adds link view to {_@link module:ui/contextualballoon~ContextualBalloon}.
	 *
	 * @private
	 * @param {Boolean} [focusInput=false] When `true` then link form will be focused on panel show.
	 */
	_showPanel( focusInput ) {
		if ( this._isInBalloon ) {
			return;
		}

		this._balloon.add( {
			view: this.formView,
			position: this._getBalloonPositionData()
		} );

		if ( focusInput ) {
			this.formView.urlInputView.select();
		}
	}

	/**
	 * Removes link view from {_@link module:ui/contextualballoon~ContextualBalloon}.
	 *
	 * @private
	 * @param {Boolean} [focusEditable=false] When `true` then editable focus will be restored on panel hide.
	 */
	_hidePanel( focusEditable ) {
		if ( !this._isInBalloon ) {
			return;
		}

		this._balloon.remove( this.formView );
		this.stopListening( this.editor.editing.view, 'render' );

		if ( focusEditable ) {
			this.editor.editing.view.focus();
		}
	}

	/**
	 * Returns position configuration for the balloon panel. According to this data balloon will be attached
	 * to the target element. If selection is collapsed and is placed inside link element, then panel
	 * will be attached to whole link element, otherwise will be attached to the selection.
	 *
	 * @private
	 * @returns {module:utils/dom/position~Options}
	 */
	_getBalloonPositionData() {
		const viewDocument = this.editor.editing.view;
		const targetLink = getPositionParentLink( viewDocument.selection.getFirstPosition() );

		const target = targetLink ?
			// When selection is inside link element, then attach panel to this element.
			viewDocument.domConverter.getCorrespondingDomElement( targetLink )
			:
			// Otherwise attach panel to the selection.
			viewDocument.domConverter.viewRangeToDom( viewDocument.selection.getFirstRange() );

		return {
			target,
			limiter: viewDocument.domConverter.getCorrespondingDomElement( viewDocument.selection.editableElement )
		};
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
