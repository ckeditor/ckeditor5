/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module restricted-editing/restrictededitingmodeediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import RestrictedEditingNavigationCommand from './restrictededitingmodenavigationcommand';
import {
	extendMarkerOnTypingPostFixer,
	resurrectCollapsedMarkerPostFixer,
	setupExceptionHighlighting,
	upcastHighlightToMarker
} from './restrictededitingmode/converters';
import { getMarkerAtPosition, isSelectionInMarker } from './restrictededitingmode/utils';

/**
 * The Restricted Editing Mode editing feature.
 *
 * * It introduces the exception marker group that renders to `<spans>` with the `ck-restricted-editing-exception` CSS class.
 * * It registers the `'goToPreviousRestrictedEditingRegion'` and `'goToNextRestrictedEditingRegion'` commands.
 * * Also enables highlighting exception markers that are selected.
 *
 * @extends module:core/plugin~Plugin
 */
export default class RestrictedEditingModeEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'RestrictedEditingModeEditing';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		this._alwaysEnabled = new Set( [ 'undo', 'redo', 'goToPreviousRestrictedEditingRegion', 'goToNextRestrictedEditingRegion' ] );
		this._allowedInException = new Set( [ 'bold', 'italic', 'link', 'input', 'delete', 'forwardDelete' ] );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		this._setupConversion();
		this._setupCommandsToggling();

		// Commands & keystrokes that allow navigation in the content.
		editor.commands.add( 'goToPreviousRestrictedEditingRegion', new RestrictedEditingNavigationCommand( editor, 'backward' ) );
		editor.commands.add( 'goToNextRestrictedEditingRegion', new RestrictedEditingNavigationCommand( editor, 'forward' ) );
		editor.keystrokes.set( 'Tab', getCommandExecuter( editor, 'goToNextRestrictedEditingRegion' ) );
		editor.keystrokes.set( 'Shift+Tab', getCommandExecuter( editor, 'goToPreviousRestrictedEditingRegion' ) );

		// Block clipboard completely in restricted mode.
		this.listenTo( this.editor.editing.view.document, 'clipboardInput', evt => {
			evt.stop();
		}, { priority: 'highest' } );
	}

	/**
	 * Setups restricted mode editing conversion:
	 *
	 * * ucpast & downcast converters
	 * * marker highlighting in the edting area
	 * * marker post-fixers
	 *
	 * @private
	 */
	_setupConversion() {
		const editor = this.editor;
		const model = editor.model;
		const doc = model.document;

		// The restricted editing does not attach additional data to the zones so there's no need for smarter markers management.
		// Also, the markers will only be created when  when loading the data.
		let markerNumber = 0;

		editor.conversion.for( 'upcast' ).add( upcastHighlightToMarker( {
			view: {
				name: 'span',
				classes: 'ck-restricted-editing-exception'
			},
			model: () => {
				markerNumber++; // Starting from restricted-editing-exception:1 marker.

				return `restricted-editing-exception:${ markerNumber }`;
			}
		} ) );

		// Currently the marker helpers are tied to other use-cases and do not render collapsed marker as highlight.
		// That's why there are 2 downcast converters for them:
		// 1. The default marker-to-highlight will wrap selected text with `<span>`.
		editor.conversion.for( 'downcast' ).markerToHighlight( {
			model: 'restricted-editing-exception',
			// Use callback to return new object every time new marker instance is created - otherwise it will be seen as the same marker.
			view: () => ( {
				name: 'span',
				classes: 'ck-restricted-editing-exception',
				priority: -10
			} )
		} );

		// 2. But for collapsed marker we need to render it as an element.
		// Additionally the editing pipeline should always display a collapsed markers.
		editor.conversion.for( 'editingDowncast' ).markerToElement( {
			model: 'restricted-editing-exception',
			view: ( markerData, viewWriter ) => viewWriter.createUIElement( 'span', {
				class: 'ck-restricted-editing-exception ck-restricted-editing-exception_collapsed'
			} )
		} );

		editor.conversion.for( 'dataDowncast' ).markerToElement( {
			model: 'restricted-editing-exception',
			view: ( markerData, viewWriter ) => viewWriter.createEmptyElement( 'span', {
				class: 'ck-restricted-editing-exception'
			} )
		} );

		doc.registerPostFixer( extendMarkerOnTypingPostFixer( editor ) );
		doc.registerPostFixer( resurrectCollapsedMarkerPostFixer( editor ) );

		setupExceptionHighlighting( editor );
	}

	/**
	 * Setups the commands handling:
	 *
	 * * exposes the navigation commands
	 * *
	 *
	 * @private
	 */
	_setupCommandsToggling() {
		const editor = this.editor;
		const model = editor.model;
		const doc = model.document;

		this._disableCommands( editor );

		this.listenTo( doc.selection, 'change', this._checkCommands.bind( this ) );
		this.listenTo( doc, 'change:data', this._checkCommands.bind( this ) );
	}

	/**
	 * Checks if commands should be enabled or disabled based on current selection.
	 *
	 * @private
	 */
	_checkCommands() {
		const editor = this.editor;
		const selection = editor.model.document.selection;

		if ( selection.rangeCount > 1 ) {
			this._disableCommands( editor );

			return;
		}

		const marker = getMarkerAtPosition( editor, selection.focus );

		if ( isSelectionInMarker( selection, marker ) ) {
			this._enableCommands( marker );
		} else {
			this._disableCommands();
		}
	}

	/**
	 * Enables commands in non-restricted regions.
	 *
	 * @returns {module:engine/model/markercollection~Marker} marker
	 * @private
	 */
	_enableCommands( marker ) {
		const editor = this.editor;

		const exceptionDisable = [];

		const commands = this._getCommandNamesToToggle( editor, this._allowedInException )
			.filter( name => this._allowedInException.has( name ) )
			.filter( name => {
				const selection = editor.model.document.selection;
				const markerRange = marker.getRange();

				if ( name == 'delete' && markerRange.start.isEqual( selection.focus ) ) {
					exceptionDisable.push( name );

					return false;
				}

				if ( name == 'forwardDelete' && selection.isCollapsed && markerRange.end.isEqual( selection.focus ) ) {
					exceptionDisable.push( name );

					return false;
				}

				return true;
			} )
			.map( name => editor.commands.get( name ) );

		for ( const command of commands ) {
			command.clearForceDisabled( 'RestrictedEditingMode' );
		}

		for ( const command of exceptionDisable.map( name => editor.commands.get( name ) ) ) {
			command.forceDisabled( 'RestrictedEditingMode' );
		}
	}

	/**
	 * Disables commands outside non-restricted regions.
	 *
	 * @private
	 */
	_disableCommands() {
		const editor = this.editor;
		const commands = this._getCommandNamesToToggle( editor )
			.map( name => editor.commands.get( name ) );

		for ( const command of commands ) {
			command.forceDisabled( 'RestrictedEditingMode' );
		}
	}

	/**
	 * Returns command names that should be toggleable.
	 *
	 * @param {module:core/editor/editor~Editor} editor
	 * @returns {Array.<String>}
	 * @private
	 */
	_getCommandNamesToToggle( editor ) {
		return Array.from( editor.commands.names() )
			.filter( name => !this._alwaysEnabled.has( name ) );
	}
}

// Helper method for executing enabled commands only.
function getCommandExecuter( editor, commandName ) {
	return ( data, cancel ) => {
		const command = editor.commands.get( commandName );

		if ( command.isEnabled ) {
			editor.execute( commandName );
		}

		cancel();
	};
}
