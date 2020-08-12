/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
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

const COMMAND_FORCE_DISABLE_ID = 'RestrictedEditingMode';

/**
 * The restricted editing mode editing feature.
 *
 * * It introduces the exception marker group that renders to `<span>` elements with the `restricted-editing-exception` CSS class.
 * * It registers the `'goToPreviousRestrictedEditingException'` and `'goToNextRestrictedEditingException'` commands.
 * * It also enables highlighting exception markers that are selected.
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

		editor.config.define( 'restrictedEditing', {
			allowedCommands: [ 'bold', 'italic', 'link', 'unlink' ],
			allowedAttributes: [ 'bold', 'italic', 'linkHref' ]
		} );

		/**
		 * Command names that are enabled outside the non-restricted regions.
		 *
		 * @type {Set.<String>}
		 * @private
		 */
		this._alwaysEnabled = new Set( [ 'undo', 'redo', 'goToPreviousRestrictedEditingException', 'goToNextRestrictedEditingException' ] );

		/**
		 * Commands allowed in non-restricted areas.
		 *
		 * Commands always enabled combine typing feature commands: `'typing'`, `'delete'` and `'forwardDelete'` with commands defined
		 * in the feature configuration.
		 *
		 * @type {Set<string>}
		 * @private
		 */
		this._allowedInException = new Set( [ 'input', 'delete', 'forwardDelete' ] );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const editingView = editor.editing.view;
		const allowedCommands = editor.config.get( 'restrictedEditing.allowedCommands' );

		allowedCommands.forEach( commandName => this._allowedInException.add( commandName ) );

		this._setupConversion();
		this._setupCommandsToggling();
		this._setupRestrictions();

		// Commands & keystrokes that allow navigation in the content.
		editor.commands.add( 'goToPreviousRestrictedEditingException', new RestrictedEditingNavigationCommand( editor, 'backward' ) );
		editor.commands.add( 'goToNextRestrictedEditingException', new RestrictedEditingNavigationCommand( editor, 'forward' ) );
		editor.keystrokes.set( 'Tab', getCommandExecuter( editor, 'goToNextRestrictedEditingException' ) );
		editor.keystrokes.set( 'Shift+Tab', getCommandExecuter( editor, 'goToPreviousRestrictedEditingException' ) );
		editor.keystrokes.set( 'Ctrl+A', getSelectAllHandler( editor ) );

		editingView.change( writer => {
			for ( const root of editingView.document.roots ) {
				writer.addClass( 'ck-restricted-editing_mode_restricted', root );
			}
		} );
	}

	/**
	 * Makes the given command always enabled in the restricted editing mode (regardless
	 * of selection location).
	 *
	 * To enable some commands in non-restricted areas of the content use
	 * {@link module:restricted-editing/restrictededitingmode~RestrictedEditingModeConfig#allowedCommands} configuration option.
	 *
	 * @param {String} commandName Name of the command to enable.
	 */
	enableCommand( commandName ) {
		const command = this.editor.commands.get( commandName );

		command.clearForceDisabled( COMMAND_FORCE_DISABLE_ID );

		this._alwaysEnabled.add( commandName );
	}

	/**
	 * Sets up the restricted mode editing conversion:
	 *
	 * * ucpast & downcast converters,
	 * * marker highlighting in the edting area,
	 * * marker post-fixers.
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
				classes: 'restricted-editing-exception'
			},
			model: () => {
				markerNumber++; // Starting from restrictedEditingException:1 marker.

				return `restrictedEditingException:${ markerNumber }`;
			}
		} ) );

		// Currently the marker helpers are tied to other use-cases and do not render collapsed marker as highlight.
		// That's why there are 2 downcast converters for them:
		// 1. The default marker-to-highlight will wrap selected text with `<span>`.
		editor.conversion.for( 'downcast' ).markerToHighlight( {
			model: 'restrictedEditingException',
			// Use callback to return new object every time new marker instance is created - otherwise it will be seen as the same marker.
			view: () => {
				return {
					name: 'span',
					classes: 'restricted-editing-exception',
					priority: -10
				};
			}
		} );

		// 2. But for collapsed marker we need to render it as an element.
		// Additionally the editing pipeline should always display a collapsed markers.
		editor.conversion.for( 'editingDowncast' ).markerToElement( {
			model: 'restrictedEditingException',
			view: ( markerData, { writer } ) => {
				return writer.createUIElement( 'span', {
					class: 'restricted-editing-exception restricted-editing-exception_collapsed'
				} );
			}
		} );

		editor.conversion.for( 'dataDowncast' ).markerToElement( {
			model: 'restrictedEditingException',
			view: ( markerData, { writer } ) => {
				return writer.createEmptyElement( 'span', {
					class: 'restricted-editing-exception'
				} );
			}
		} );

		doc.registerPostFixer( extendMarkerOnTypingPostFixer( editor ) );
		doc.registerPostFixer( resurrectCollapsedMarkerPostFixer( editor ) );
		model.markers.on( 'update:restrictedEditingException', ensureNewMarkerIsFlat( editor ) );

		setupExceptionHighlighting( editor );
	}

	/**
	 * Setups additional editing restrictions beyond command toggling:
	 *
	 * * delete content range trimming
	 * * disabling input command outside exception marker
	 * * restricting clipboard holder to text only
	 * * restricting text attributes in content
	 *
	 * @private
	 */
	_setupRestrictions() {
		const editor = this.editor;
		const model = editor.model;
		const selection = model.document.selection;
		const viewDoc = editor.editing.view.document;

		this.listenTo( model, 'deleteContent', restrictDeleteContent( editor ), { priority: 'high' } );

		const inputCommand = editor.commands.get( 'input' );

		// The restricted editing might be configured without input support - ie allow only bolding or removing text.
		// This check is bit synthetic since only tests are used this way.
		if ( inputCommand ) {
			this.listenTo( inputCommand, 'execute', disallowInputExecForWrongRange( editor ), { priority: 'high' } );
		}

		// Block clipboard outside exception marker on paste.
		this.listenTo( viewDoc, 'clipboardInput', function( evt ) {
			if ( !isRangeInsideSingleMarker( editor, selection.getFirstRange() ) ) {
				evt.stop();
			}
		}, { priority: 'high' } );

		// Block clipboard outside exception marker on cut.
		this.listenTo( viewDoc, 'clipboardOutput', ( evt, data ) => {
			if ( data.method == 'cut' && !isRangeInsideSingleMarker( editor, selection.getFirstRange() ) ) {
				evt.stop();
			}
		}, { priority: 'high' } );

		const allowedAttributes = editor.config.get( 'restrictedEditing.allowedAttributes' );
		model.schema.addAttributeCheck( onlyAllowAttributesFromList( allowedAttributes ) );
		model.schema.addChildCheck( allowTextOnlyInClipboardHolder );
	}

	/**
	 * Sets up the command toggling which enables or disables commands based on the user selection.
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
	 * Checks if commands should be enabled or disabled based on the current selection.
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

		this._disableCommands();

		if ( isSelectionInMarker( selection, marker ) ) {
			this._enableCommands( marker );
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

		const commands = this._getCommandNamesToToggle( editor, this._allowedInException )
			.filter( name => this._allowedInException.has( name ) )
			.filter( filterDeleteCommandsOnMarkerBoundaries( editor.model.document.selection, marker.getRange() ) )
			.map( name => editor.commands.get( name ) );

		for ( const command of commands ) {
			command.clearForceDisabled( COMMAND_FORCE_DISABLE_ID );
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
			command.forceDisabled( COMMAND_FORCE_DISABLE_ID );
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
			cancel();
		}
	};
}

// Helper for handling Ctrl+A keydown behaviour.
function getSelectAllHandler( editor ) {
	return ( data, cancel ) => {
		const model = editor.model;
		const selection = editor.model.document.selection;
		const marker = getMarkerAtPosition( editor, selection.focus );

		if ( !marker ) {
			return;
		}

		// If selection range is inside a restricted editing exception, select text only within the exception.
		//
		// Note: Second Ctrl+A press is also blocked and it won't select the entire text in the editor.
		const selectionRange = selection.getFirstRange();
		const markerRange = marker.getRange();

		if ( markerRange.containsRange( selectionRange, true ) || selection.isCollapsed ) {
			cancel();

			model.change( writer => {
				writer.setSelection( marker.getRange() );
			} );
		}
	};
}

// Additional filtering rule for enabling "delete" and "forwardDelete" commands if selection is on range boundaries:
//
// Does not allow to enable command when selection focus is:
// - is on marker start - "delete" - to prevent removing content before marker
// - is on marker end - "forwardDelete" - to prevent removing content after marker
function filterDeleteCommandsOnMarkerBoundaries( selection, markerRange ) {
	return name => {
		if ( name == 'delete' && markerRange.start.isEqual( selection.focus ) ) {
			return false;
		}

		// Only for collapsed selection - non-collapsed selection that extends over a marker is handled elsewhere.
		if ( name == 'forwardDelete' && selection.isCollapsed && markerRange.end.isEqual( selection.focus ) ) {
			return false;
		}

		return true;
	};
}

// Ensures that model.deleteContent() does not delete outside exception markers ranges.
//
// The enforced restrictions are:
// - only execute deleteContent() inside exception markers
// - restrict passed selection to exception marker
function restrictDeleteContent( editor ) {
	return ( evt, args ) => {
		const [ selection ] = args;

		const marker = getMarkerAtPosition( editor, selection.focus ) || getMarkerAtPosition( editor, selection.anchor );

		// Stop method execution if marker was not found at selection focus.
		if ( !marker ) {
			evt.stop();

			return;
		}

		// Collapsed selection inside exception marker does not require fixing.
		if ( selection.isCollapsed ) {
			return;
		}

		// Shrink the selection to the range inside exception marker.
		const allowedToDelete = marker.getRange().getIntersection( selection.getFirstRange() );

		// Some features uses selection passed to model.deleteContent() to set the selection afterwards. For this we need to properly modify
		// either the document selection using change block...
		if ( selection.is( 'documentSelection' ) ) {
			editor.model.change( writer => {
				writer.setSelection( allowedToDelete );
			} );
		}
		// ... or by modifying passed selection instance directly.
		else {
			selection.setTo( allowedToDelete );
		}
	};
}

// Ensures that input command is executed with a range that is inside exception marker.
//
// This restriction is due to fact that using native spell check changes text outside exception marker.
function disallowInputExecForWrongRange( editor ) {
	return ( evt, args ) => {
		const [ options ] = args;
		const { range } = options;

		// Only check "input" command executed with a range value.
		// Selection might be set in exception marker but passed range might point elsewhere.
		if ( !range ) {
			return;
		}

		if ( !isRangeInsideSingleMarker( editor, range ) ) {
			evt.stop();
		}
	};
}

function isRangeInsideSingleMarker( editor, range ) {
	const markerAtStart = getMarkerAtPosition( editor, range.start );
	const markerAtEnd = getMarkerAtPosition( editor, range.end );

	return markerAtStart && markerAtEnd && markerAtEnd === markerAtStart;
}

// Checks if new marker range is flat. Non-flat ranges might appear during upcast conversion in nested structures, ie tables.
//
// Note: This marker fixer only consider case which is possible to create using StandardEditing mode plugin.
// Markers created by developer in the data might break in many other ways.
//
// See #6003.
function ensureNewMarkerIsFlat( editor ) {
	const model = editor.model;

	return ( evt, marker, oldRange, newRange ) => {
		if ( !oldRange && !newRange.isFlat ) {
			model.change( writer => {
				const start = newRange.start;
				const end = newRange.end;

				const startIsHigherInTree = start.path.length > end.path.length;

				const fixedStart = startIsHigherInTree ? newRange.start : writer.createPositionAt( end.parent, 0 );
				const fixedEnd = startIsHigherInTree ? writer.createPositionAt( start.parent, 'end' ) : newRange.end;

				writer.updateMarker( marker, {
					range: writer.createRange( fixedStart, fixedEnd )
				} );
			} );
		}
	};
}

function onlyAllowAttributesFromList( allowedAttributes ) {
	return ( context, attributeName ) => {
		if ( context.startsWith( '$clipboardHolder' ) ) {
			return allowedAttributes.includes( attributeName );
		}
	};
}

function allowTextOnlyInClipboardHolder( context, childDefinition ) {
	if ( context.startsWith( '$clipboardHolder' ) ) {
		return childDefinition.name === '$text';
	}
}
