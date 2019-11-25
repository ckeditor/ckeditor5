/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module restricted-editing/restrictededitingmodeediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import RestrictedEditingNavigationCommand from './restrictededitingmodenavigationcommand';
import { setupExceptionHighlighting, setupMarkersConversion } from './restrictededitingmode/converters';
import { getMarker, isSelectionInExceptionMarker } from './restrictededitingmode/utils';

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

		// Commands that allow navigation in the content.
		editor.commands.add( 'goToPreviousRestrictedEditingRegion', new RestrictedEditingNavigationCommand( editor, 'backward' ) );
		editor.commands.add( 'goToNextRestrictedEditingRegion', new RestrictedEditingNavigationCommand( editor, 'forward' ) );

		setupMarkersConversion( editor );

		const getCommandExecuter = commandName => {
			return ( data, cancel ) => {
				const command = this.editor.commands.get( commandName );

				if ( command.isEnabled ) {
					this.editor.execute( commandName );
				}

				cancel();
			};
		};

		editor.keystrokes.set( 'Tab', getCommandExecuter( 'goToNextRestrictedEditingRegion' ) );
		editor.keystrokes.set( 'Shift+Tab', getCommandExecuter( 'goToPreviousRestrictedEditingRegion' ) );

		setupExceptionHighlighting( editor );
		this._setupRestrictedEditingMode( editor );

		// Block clipboard completely in restricted mode.
		this.listenTo( editor.editing.view.document, 'clipboardInput', evt => {
			evt.stop();
		}, { priority: 'highest' } );
	}

	_setupRestrictedEditingMode( editor ) {
		this._disableCommands( editor );

		const selection = editor.model.document.selection;

		this.listenTo( selection, 'change', this._checkCommands.bind( this ) );
		this.listenTo( editor.model.document, 'change:data', this._checkCommands.bind( this ) );

		editor.model.document.registerPostFixer( writer => {
			let changeApplied = false;

			for ( const change of editor.model.document.differ.getChanges() ) {
				if ( change.type == 'insert' && change.name == '$text' && change.length === 1 ) {
					changeApplied = this._tryExtendMarkedEnd( change, writer, changeApplied ) || changeApplied;
					changeApplied = this._tryExtendMarkerStart( change, writer, changeApplied ) || changeApplied;
				}
			}

			return changeApplied;
		} );

		editor.model.document.registerPostFixer( writer => {
			let changeApplied = false;

			for ( const [ name, data ] of editor.model.document.differ._changedMarkers ) {
				if ( name.startsWith( 'restricted-editing-exception' ) && data.newRange.root.rootName == '$graveyard' ) {
					writer.updateMarker( name, {
						// TODO: better location
						range: writer.createRange( writer.createPositionAt( editor.model.document.selection.focus ) )
					} );

					changeApplied = true;
				}
			}

			return changeApplied;
		} );
	}

	_tryExtendMarkerStart( change, writer, changeApplied ) {
		const markerAtStart = getMarker( this.editor, change.position.getShiftedBy( 1 ) );

		if ( markerAtStart && markerAtStart.getStart().isEqual( change.position.getShiftedBy( 1 ) ) ) {
			writer.updateMarker( markerAtStart, {
				range: writer.createRange( markerAtStart.getStart().getShiftedBy( -1 ), markerAtStart.getEnd() )
			} );

			changeApplied = true;
		}
		return changeApplied;
	}

	_tryExtendMarkedEnd( change, writer, changeApplied ) {
		const markerAtEnd = getMarker( this.editor, change.position );

		if ( markerAtEnd && markerAtEnd.getEnd().isEqual( change.position ) ) {
			writer.updateMarker( markerAtEnd, {
				range: writer.createRange( markerAtEnd.getStart(), markerAtEnd.getEnd().getShiftedBy( 1 ) )
			} );

			changeApplied = true;
		}
		return changeApplied;
	}

	_checkCommands() {
		const editor = this.editor;
		const selection = editor.model.document.selection;

		if ( selection.rangeCount > 1 ) {
			this._disableCommands( editor );

			return;
		}

		const marker = getMarker( editor, selection.focus );

		if ( isSelectionInExceptionMarker( marker, selection ) ) {
			this._enableCommands( marker );
		} else {
			this._disableCommands();
		}
	}

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

	_disableCommands() {
		const editor = this.editor;
		const commands = this._getCommandNamesToToggle( editor )
			.map( name => editor.commands.get( name ) );

		for ( const command of commands ) {
			command.forceDisabled( 'RestrictedEditingMode' );
		}
	}

	_getCommandNamesToToggle( editor ) {
		return Array.from( editor.commands.names() )
			.filter( name => !this._alwaysEnabled.has( name ) );
	}
}
