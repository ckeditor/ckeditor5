/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module find-and-replace/findandreplaceui
 */

import { Plugin } from 'ckeditor5/src/core';
import { createDropdown } from 'ckeditor5/src/ui';
import FindAndReplaceFormView from './ui/findandreplaceformview';

import loupeIcon from '../theme/icons/find-replace.svg';

/**
 * The default find and replace UI. It introduces:
 *
 * * The `'Find and replace'` dropdown button.
 *
 * It registers the `'findAndReplace'` UI button in the editor's {@link module:ui/componentfactory~ComponentFactory component factory}.
 * that uses the {@link module:find-and-replace/findandreplace~FindAndReplace FindAndReplace} plugin API.
 *
 * It emits events depending on user search/replace intents.
 *
 * @extends module:core/plugin~Plugin
 */
export default class FindAndReplaceUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'FindAndReplaceUI';
	}

	constructor( editor ) {
		super( editor );

		/**
		 * TODO
		 */
		this.set( 'matchCount', 0 );

		/**
		 * TODO
		 */
		this.set( 'highlightOffset', 0 );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		// Register the toolbar dropdown component.
		editor.ui.componentFactory.add( 'findAndReplace', locale => {
			const dropdown = createDropdown( locale );
			const formView = new FindAndReplaceFormView( editor.locale );

			// Dropdown should be disabled when in source editing mode. See #10001.
			dropdown.bind( 'isEnabled' ).to( editor.commands.get( 'find' ) );
			dropdown.panelView.children.add( formView );
			dropdown.on( 'change:isOpen', ( event, name, isOpen ) => {
				formView.reset();

				if ( !isOpen ) {
					// Preserve the focus in the editor when the UI was closed.
					editor.editing.view.focus();

					// Let the feature know that search results are no longer relevant because the user left the UI.
					this.fire( 'searchReseted' );
				}
			} );

			this._setupDropdownButton( dropdown.buttonView, formView );
			this._setupFormView( formView );

			return dropdown;
		} );
	}

	/**
	 * @private
	 * @param {module:ui/button/buttonview~ButtonView} buttonView
	 * @param {module:find-and-replace/ui/findandreplaceformview~FindAndReplaceFormView} formView A related form view.
	 */
	_setupDropdownButton( buttonView, formView ) {
		const editor = this.editor;
		const t = editor.locale.t;

		// Configure the dropdown's button properties:
		buttonView.set( {
			icon: loupeIcon,
			label: t( 'Find and replace' ),
			keystroke: 'CTRL+F',
			tooltip: true
		} );

		// Each time a dropdown is opened, the search text field should get focused.
		// Note: Use the low priority to make sure the following listener starts working after the
		// default action of the drop-down is executed (i.e. the panel showed up). Otherwise, the
		// invisible form/input cannot be focused/selected.
		buttonView.on( 'open', () => {
			formView.disableCssTransitions();

			formView._findInputView.fieldView.select();
			formView.focus();

			formView.enableCssTransitions();
		}, { priority: 'low' } );

		editor.keystrokes.set( 'Ctrl+F', ( data, cancelEvent ) => {
			buttonView.fire( 'execute' );

			cancelEvent();
		} );
	}

	/**
	 * TODO
	 *
	 * @private
	 * @param {module:find-and-replace/ui/findandreplaceformview~FindAndReplaceFormView} formView A related form view.
	 */
	_setupFormView( formView ) {
		const editor = this.editor;
		const commands = editor.commands;

		formView.bind( 'matchCount', 'highlightOffset' ).to( this );
		formView.bind( 'areCommandsEnabled' ).to(
			commands.get( 'findNext' ), 'isEnabled',
			commands.get( 'findPrevious' ), 'isEnabled',
			commands.get( 'replace' ), 'isEnabled',
			commands.get( 'replaceAll' ), 'isEnabled',
			( isFindNextCommandEnabled, isFindPreviousCommandEnabled, isReplaceCommandEnabled, isReplaceAllCommandEnabled ) => ( {
				isFindNextCommandEnabled,
				isFindPreviousCommandEnabled,
				isReplaceCommandEnabled,
				isReplaceAllCommandEnabled
			} )
		);

		formView.delegate( 'findNext', 'findPrevious', 'replace', 'replaceAll' ).to( this );

		// Let the feature know that search results are no longer relevant because the user changed the searched phrase
		// but didn't hit the "Find" button yet (e.g. still typing).
		formView.on( 'change:isDirty', ( evt, data, isDirty ) => {
			if ( isDirty ) {
				this.fire( 'searchReseted' );
			}
		} );
	}
}

/**
 * Fired when the find next button is triggered.
 *
 * @event findNext
 * @param {String} searchText Search text.
 */

/**
 * Fired when the find previous button is triggered.
 *
 * @event findPrevious
 * @param {String} searchText Search text.
 */

/**
 * Fired when the replace button is triggered.
 *
 * @event replace
 * @param {String} replaceText Replacement text.
 */

/**
 * Fired when the replaceAll button is triggered.
 *
 * @event replaceAll
 * @param {String} replaceText Replacement text.
 */

/**
 * Fired when the UI was reset and the search results marked in the content
 * should be invalidated.
 *
 * @event searchReseted
 */
