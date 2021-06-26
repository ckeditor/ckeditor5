/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module find-and-replace/findandreplaceui
 */

import { Plugin } from 'ckeditor5/src/core';
import { createDropdown, SplitButtonView } from 'ckeditor5/src/ui';
import 'ckeditor5/packages/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
import '../theme/findandreplaceform.css';
import FindAndReplaceFormView from './ui/findandreplaceformview';

import loupeIcon from '../theme/icons/find-replace.svg';

/**
 * Default find and replace UI. It introduces:
 *
 * * The `'Find and replace'` dropdown button.
 *
 * It registers the `'findAndReplace'` UI button in the editor's {@link module:ui/componentfactory~ComponentFactory component factory}.
 * that uses {@link module:find-and-replace/findandreplace~FindAndReplace FindAndReplace} plugin API.
 *
 * It emits events regarding of user search/replace intents.
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
	}

	/**
	 * @inheritDoc
	 */
	init() {
		this.activeSearch = null;
		this.findAndReplacePlugin = this.editor.plugins.get( 'FindAndReplace' );

		const editor = this.editor;

		editor.ui.componentFactory.add( 'findAndReplace', locale => {
			const dropdown = createDropdown( locale, SplitButtonView );

			const formView = new FindAndReplaceFormView( editor.locale );

			formView.delegate( 'findNext' ).to( this );
			formView.delegate( 'findPrev' ).to( this );
			formView.delegate( 'replace' ).to( this );
			formView.delegate( 'replaceAll' ).to( this );

			formView.bind( 'matchCount' ).to( this );
			formView.bind( 'highlightOffset' ).to( this );

			formView.bind( 'isSearching' ).to( this );

			this._createToolbarDropdown( dropdown, loupeIcon );

			dropdown.panelView.children.add( formView );

			dropdown.on( 'change:isOpen', ( event, name, value ) => {
				if ( !value ) {
					this.fire( 'dropdown:closed' );
				}
			} );

			return dropdown;
		} );
	}

	setState( state ) {
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
	 */
	_createToolbarDropdown( dropdown, icon ) {
		const t = this.editor.locale.t;

		// Configure dropdown's button properties:
		dropdown.buttonView.set( {
			icon,
			withText: true,
			tooltip: t( 'Find and replace' )
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
 * @event findPrev
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
