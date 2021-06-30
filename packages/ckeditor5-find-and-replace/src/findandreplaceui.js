/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module find-and-replace/findandreplaceui
 */

import { Plugin } from 'ckeditor5/src/core';
import { createDropdown, SplitButtonView } from 'ckeditor5/src/ui';
import FindAndReplaceFormView from './ui/findandreplaceformview';
// See: #8833.
// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import '@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
import '../theme/findandreplaceform.css';

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

		this.set( 'searchText' );
		this.set( 'replaceText' );

		this.set( 'isSearching', false );

		this.set( 'matchCount', null );
		this.set( 'highlightOffset', null );

		this.bind( 'isSearching' ).to( this, 'matchCount', count => count > 0 );

		/**
		 * The form view will only be assigned if the find and replace toolbar button was added.
		 *
		 * @member {module:find-and-replace/ui/findandreplaceformview~FindAndReplaceFormView|null} #formView
		 */
		this.formView = null;
	}

	/**
	 * @inheritDoc
	 */
	init() {
		this.findAndReplacePlugin = this.editor.plugins.get( 'FindAndReplace' );

		const editor = this.editor;

		editor.ui.componentFactory.add( 'findAndReplace', locale => {
			const dropdown = createDropdown( locale, SplitButtonView );

			const formView = new FindAndReplaceFormView( editor.locale );

			formView.delegate( 'findNext' ).to( this );
			formView.delegate( 'findPrevious' ).to( this );
			formView.delegate( 'replace' ).to( this );
			formView.delegate( 'replaceAll' ).to( this );

			formView.bind( 'matchCount' ).to( this );
			formView.bind( 'highlightOffset' ).to( this );

			formView.bind( 'isSearching' ).to( this );

			this._createToolbarDropdown( dropdown, loupeIcon, formView );

			dropdown.panelView.children.add( formView );

			dropdown.on( 'change:isOpen', ( event, name, value ) => {
				if ( !value ) {
					this.fire( 'dropdown:closed' );
				}
			} );

			this.formView = formView;

			if ( this._state ) {
				this.unbind( 'isSearching' );

				const findTextInputView = formView.findInputView.fieldView;

				// Searching should only be active if there's more than 1 result matched and
				// the user has not changed any search criteria.
				this.bind( 'isSearching' ).to( this, 'matchCount',
					findTextInputView, 'value', this._state, 'searchText',
					formView.matchCaseView, 'isChecked', this._state, 'matchCase',
					formView.matchWholeWordsView, 'isChecked', this._state, 'matchWholeWords',
					( count,
						viewSearchText, modelSearchText,
						viewMatchCase, modelMatchCase,
						viewWholeWords, modelWholeWords
					) => {
						return count > 0 &&
							viewSearchText == modelSearchText &&
							viewMatchCase == modelMatchCase &&
							viewWholeWords == modelWholeWords;
					} );
			}

			editor.keystrokes.set( 'Ctrl+F', ( data, cancelEvent ) => {
				dropdown.buttonView.actionView.fire( 'execute' );

				cancelEvent();
			} );

			return dropdown;
		} );
	}

	/**
	 * Sets the observed state object. It is used to display search result count etc.
	 *
	 * @protected
	 * @param {module:find-and-replace/findandreplaceediting~FindAndReplaceState} state State object to be tracked.
	 */
	_setState( state ) {
		this._state = state;

		this.listenTo( state.results, 'change', () => {
			this.set( 'matchCount', state.results.length );
		} );

		this.bind( 'highlightOffset' ).to( state, 'highlightedResult', highlightedResult => {
			if ( !highlightedResult ) {
				return null;
			}

			const sortedResults = Array.from( state.results ).sort( ( a, b ) => {
				const mapping = {
					before: -1,
					same: 0,
					after: 1
				};

				return mapping[ a.marker.getStart().compareWith( b.marker.getStart() ) ];
			} );

			const index = sortedResults.indexOf( highlightedResult );

			return index === -1 ?
				null : index + 1;
		} );
	}

	/**
	 * @private
	 * @param {module:ui/dropdown/dropdownview~DropdownView} dropdown
	 * @param {String} icon An icon to be assigned to the button.
	 * @param {module:find-and-replace/ui/findandreplaceformview~FindAndReplaceFormView} formView A related form view.
	 */
	_createToolbarDropdown( dropdown, icon, formView ) {
		const t = this.editor.locale.t;
		const buttonView = dropdown.buttonView;

		// Configure the dropdown's button properties:
		buttonView.set( {
			icon,
			tooltip: t( 'Find and replace' )
		} );

		// Clicking the main button has the same effect as clicking the dropdown arrow.
		buttonView.actionView.delegate( 'execute' ).to( buttonView.arrowView );

		// Each time a dropdown is opened, the search text field should get focused.
		buttonView.on( 'open', () => {
			formView.findInputView.fieldView.select();
			formView.focus();
		}, { priority: 'low' } );
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
 * Fired when the toolbar dropdown gets closed.
 *
 * @event dropdown:closed
 */
