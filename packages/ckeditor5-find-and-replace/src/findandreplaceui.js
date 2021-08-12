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
 * The default find and replace UI.
 *
 * It registers the `'findAndReplace'` UI button in the editor's {@link module:ui/componentfactory~ComponentFactory component factory}.
 * that uses the {@link module:find-and-replace/findandreplace~FindAndReplace FindAndReplace} plugin API.
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
		 * The total number of matches found in the document.
		 *
		 * @member {Number} #matchCount
		 */
		this.set( 'matchCount', 0 );

		/**
		 * The index of the current match highlighted in the editing.
		 *
		 * @member {Number} #highlightOffset
		 */
		this.set( 'highlightOffset', 0 );

		/**
		 * A reference to the find and replace form view.
		 *
		 * @member {module:find-and-replace/ui/findandreplaceformview~FindAndReplaceFormView} #formView
		 */
		this.formView = null;
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		// Register the toolbar dropdown component.
		editor.ui.componentFactory.add( 'findAndReplace', locale => {
			const dropdown = createDropdown( locale );
			const formView = this.formView = new FindAndReplaceFormView( editor.locale );

			// Dropdown should be disabled when in source editing mode. See #10001.
			dropdown.bind( 'isEnabled' ).to( editor.commands.get( 'find' ) );
			dropdown.panelView.children.add( formView );

			// Each time a dropdown is opened, the search text field should get focused and selected to better UX.
			// Note: Using the low priority here to make sure the following listener starts working after the
			// default action of the drop-down is executed (i.e. the panel showed up). Otherwise, the
			// invisible form/input cannot be focused/selected.
			//
			// Each time a dropdown is closed, move the focus back to the editing root (to preserve it)
			// and let the find and replace editing feature know that all search results can be invalidated
			// and no longer should be marked in the content.
			dropdown.on( 'change:isOpen', ( event, name, isOpen ) => {
				if ( isOpen ) {
					formView.disableCssTransitions();
					formView.reset();

					formView._findInputView.fieldView.select();
					formView.focus();

					formView.enableCssTransitions();
				} else {
					editor.editing.view.focus();

					this.fire( 'searchReseted' );
				}
			}, { priority: 'low' } );

			this._setupDropdownButton( dropdown );
			this._setupFormView( formView );

			return dropdown;
		} );
	}

	/**
	 * @private
	 * @param {module:ui/dropdown/dropdownview~DropdownView} buttonView
	 */
	_setupDropdownButton( dropdown ) {
		const editor = this.editor;
		const t = editor.locale.t;

		dropdown.buttonView.set( {
			icon: loupeIcon,
			label: t( 'Find and replace' ),
			keystroke: 'CTRL+F',
			tooltip: true
		} );

		editor.keystrokes.set( 'Ctrl+F', ( data, cancelEvent ) => {
			dropdown.isOpen = true;
			cancelEvent();
		} );
	}

	/**
	 * @private
	 * @param {module:find-and-replace/ui/findandreplaceformview~FindAndReplaceFormView} formView A related form view.
	 */
	_setupFormView( formView ) {
		const editor = this.editor;
		const commands = editor.commands;

		formView.bind( 'matchCount', 'highlightOffset' ).to( this );

		// To keep things simple, instead of binding 4 individual observables, there's only one that combines every
		// commands' isEnabled state. Yes, it will change more often but this simplifies the structure of the form.
		formView.bind( 'areCommandsEnabled' ).to(
			commands.get( 'findNext' ), 'isEnabled',
			commands.get( 'findPrevious' ), 'isEnabled',
			commands.get( 'replace' ), 'isEnabled',
			commands.get( 'replaceAll' ), 'isEnabled',
			( findNext, findPrevious, replace, replaceAll ) => ( { findNext, findPrevious, replace, replaceAll } )
		);

		formView.delegate( 'findNext', 'findPrevious', 'replace', 'replaceAll' ).to( this );

		// Let the feature know that search results are no longer relevant because the user changed the searched phrase
		// (or options) but didn't hit the "Find" button yet (e.g. still typing).
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
 * Fired when the UI was reset and the search results marked in the editing root should be invalidated,
 * for instance, because the user changed the searched phrase (or options) but didn't hit
 * the "Find" button yet.
 *
 * @event searchReseted
 */
