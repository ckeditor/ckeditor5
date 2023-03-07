/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module restricted-editing/restrictededitingmodeediting
 */

import {
	Plugin,
	type Command,
	type Editor,
	type EditingKeystrokeCallback
} from 'ckeditor5/src/core';
import type {
	DocumentSelection,
	Marker,
	ModelDeleteContentEvent,
	ModelPostFixer,
	Range,
	SchemaAttributeCheckCallback,
	SchemaChildCheckCallback
} from 'ckeditor5/src/engine';
import type { BaseEvent, GetCallback } from 'ckeditor5/src/utils';
import type { InsertTextCommand, InsertTextCommandExecuteEvent } from 'ckeditor5/src/typing';
import type {
	ClipboardContentInsertionEvent,
	ViewDocumentClipboardOutputEvent,
	ClipboardPipeline
} from 'ckeditor5/src/clipboard';

import RestrictedEditingModeNavigationCommand from './restrictededitingmodenavigationcommand';
import {
	extendMarkerOnTypingPostFixer,
	resurrectCollapsedMarkerPostFixer,
	setupExceptionHighlighting,
	upcastHighlightToMarker
} from './restrictededitingmode/converters';
import { getMarkerAtPosition, isSelectionInMarker } from './restrictededitingmode/utils';
import type { RestrictedEditingConfig } from './restrictededitingconfig';

const COMMAND_FORCE_DISABLE_ID = 'RestrictedEditingMode';

/**
 * The restricted editing mode editing feature.
 *
 * * It introduces the exception marker group that renders to `<span>` elements with the `restricted-editing-exception` CSS class.
 * * It registers the `'goToPreviousRestrictedEditingException'` and `'goToNextRestrictedEditingException'` commands.
 * * It also enables highlighting exception markers that are selected.
 */
export default class RestrictedEditingModeEditing extends Plugin {
	/**
	 * Command names that are enabled outside the non-restricted regions.
	 */
	private _alwaysEnabled: Set<string>;

	/**
	 * Commands allowed in non-restricted areas.
	 *
	 * Commands always enabled combine typing feature commands: `'input'`, `'insertText'`, `'delete'`, and `'deleteForward'` with
	 * commands defined in the feature configuration.
	 */
	private _allowedInException: Set<string>;

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'RestrictedEditingModeEditing' {
		return 'RestrictedEditingModeEditing';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		editor.config.define( 'restrictedEditing', {
			allowedCommands: [ 'bold', 'italic', 'link', 'unlink' ],
			allowedAttributes: [ 'bold', 'italic', 'linkHref' ]
		} );

		this._alwaysEnabled = new Set( [ 'undo', 'redo' ] );
		this._allowedInException = new Set( [ 'input', 'insertText', 'delete', 'deleteForward' ] );
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const editingView = editor.editing.view;
		const allowedCommands: RestrictedEditingConfig['allowedCommands'] = editor.config.get( 'restrictedEditing.allowedCommands' )!;

		allowedCommands.forEach( commandName => this._allowedInException.add( commandName ) );

		this._setupConversion();
		this._setupCommandsToggling();
		this._setupRestrictions();

		// Commands & keystrokes that allow navigation in the content.
		editor.commands.add(
			'goToPreviousRestrictedEditingException',
			new RestrictedEditingModeNavigationCommand( editor, 'backward' )
		);

		editor.commands.add(
			'goToNextRestrictedEditingException',
			new RestrictedEditingModeNavigationCommand( editor, 'forward' )
		);

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
	 * {@link module:restricted-editing/restrictededitingconfig~RestrictedEditingConfig#allowedCommands} configuration option.
	 *
	 * @param commandName Name of the command to enable.
	 */
	public enableCommand( commandName: string ): void {
		const command: Command = this.editor.commands.get( commandName )!;

		command.clearForceDisabled( COMMAND_FORCE_DISABLE_ID );

		this._alwaysEnabled.add( commandName );
	}

	/**
	 * Sets up the restricted mode editing conversion:
	 *
	 * * ucpast & downcast converters,
	 * * marker highlighting in the edting area,
	 * * marker post-fixers.
	 */
	private _setupConversion(): void {
		const editor = this.editor;
		const model = editor.model;
		const doc = model.document;

		// The restricted editing does not attach additional data to the zones so there's no need for smarter markers managing.
		// Also, the markers will only be created when loading the data.
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

		// Currently the marker helpers are tied to other use-cases and do not render a collapsed marker as highlight.
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
		// Additionally the editing pipeline should always display a collapsed marker.
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
		doc.registerPostFixer( ensureNewMarkerIsFlatPostFixer( editor ) );

		setupExceptionHighlighting( editor );
	}

	/**
	 * Setups additional editing restrictions beyond command toggling:
	 *
	 * * delete content range trimming
	 * * disabling input command outside exception marker
	 * * restricting clipboard holder to text only
	 * * restricting text attributes in content
	 */
	private _setupRestrictions() {
		const editor = this.editor;
		const model = editor.model;
		const selection = model.document.selection;
		const viewDoc = editor.editing.view.document;
		const clipboard: ClipboardPipeline = editor.plugins.get( 'ClipboardPipeline' );

		this.listenTo<ModelDeleteContentEvent>( model, 'deleteContent', restrictDeleteContent( editor ), { priority: 'high' } );

		const insertTextCommand: InsertTextCommand | undefined = editor.commands.get( 'insertText' );

		// The restricted editing might be configured without insert text support - ie allow only bolding or removing text.
		// This check is bit synthetic since only tests are used this way.
		if ( insertTextCommand ) {
			this.listenTo<InsertTextCommandExecuteEvent>(
				insertTextCommand,
				'execute',
				disallowInputExecForWrongRange( editor ),
				{ priority: 'high' }
			);
		}

		// Block clipboard outside exception marker on paste and drop.
		this.listenTo<ClipboardContentInsertionEvent>( clipboard, 'contentInsertion', evt => {
			if ( !isRangeInsideSingleMarker( editor, selection.getFirstRange()! ) ) {
				evt.stop();
			}
		} );

		// Block clipboard outside exception marker on cut.
		this.listenTo<ViewDocumentClipboardOutputEvent>( viewDoc, 'clipboardOutput', ( evt, data ) => {
			if ( data.method == 'cut' && !isRangeInsideSingleMarker( editor, selection.getFirstRange()! ) ) {
				evt.stop();
			}
		}, { priority: 'high' } );

		const allowedAttributes: RestrictedEditingConfig['allowedAttributes'] = editor.config.get( 'restrictedEditing.allowedAttributes' )!;
		model.schema.addAttributeCheck( onlyAllowAttributesFromList( allowedAttributes ) );
		model.schema.addChildCheck( allowTextOnlyInClipboardHolder() );
	}

	/**
	 * Sets up the command toggling which enables or disables commands based on the user selection.
	 */
	private _setupCommandsToggling(): void {
		const editor = this.editor;
		const model = editor.model;
		const doc = model.document;

		this._disableCommands();

		this.listenTo( doc.selection, 'change', this._checkCommands.bind( this ) );
		this.listenTo( doc, 'change:data', this._checkCommands.bind( this ) );
	}

	/**
	 * Checks if commands should be enabled or disabled based on the current selection.
	 */
	private _checkCommands(): void {
		const editor = this.editor;
		const selection = editor.model.document.selection;

		if ( selection.rangeCount > 1 ) {
			this._disableCommands();

			return;
		}

		const marker = getMarkerAtPosition( editor, selection.focus! );

		this._disableCommands();

		if ( isSelectionInMarker( selection, marker ) ) {
			this._enableCommands( marker! );
		}
	}

	/**
	 * Enables commands in non-restricted regions.
	 */
	private _enableCommands( marker: Marker ): void {
		const editor = this.editor;

		for ( const [ commandName, command ] of editor.commands ) {
			if ( !command.affectsData || this._alwaysEnabled.has( commandName ) ) {
				continue;
			}

			// Enable ony those commands that are allowed in the exception marker.
			if ( !this._allowedInException.has( commandName ) ) {
				continue;
			}

			// Do not enable 'delete' and 'deleteForward' commands on the exception marker boundaries.
			if ( isDeleteCommandOnMarkerBoundaries( commandName, editor.model.document.selection, marker.getRange() ) ) {
				continue;
			}

			command.clearForceDisabled( COMMAND_FORCE_DISABLE_ID );
		}
	}

	/**
	 * Disables commands outside non-restricted regions.
	 */
	private _disableCommands(): void {
		const editor = this.editor;

		for ( const [ commandName, command ] of editor.commands ) {
			if ( !command.affectsData || this._alwaysEnabled.has( commandName ) ) {
				continue;
			}

			command.forceDisabled( COMMAND_FORCE_DISABLE_ID );
		}
	}
}

/**
 * Helper method for executing enabled commands only.
 */
function getCommandExecuter( editor: Editor, commandName: string ): EditingKeystrokeCallback {
	return ( _, cancel ) => {
		const command: Command = editor.commands.get( commandName )!;

		if ( command.isEnabled ) {
			editor.execute( commandName );
			cancel();
		}
	};
}

/**
 * Helper for handling Ctrl+A keydown behaviour.
 */
function getSelectAllHandler( editor: Editor ): EditingKeystrokeCallback {
	return ( _, cancel ) => {
		const model = editor.model;
		const selection = editor.model.document.selection;
		const marker = getMarkerAtPosition( editor, selection.focus! );

		if ( !marker ) {
			return;
		}

		// If selection range is inside a restricted editing exception, select text only within the exception.
		//
		// Note: Second Ctrl+A press is also blocked and it won't select the entire text in the editor.
		const selectionRange = selection.getFirstRange()!;
		const markerRange = marker.getRange();

		if ( markerRange.containsRange( selectionRange, true ) || selection.isCollapsed ) {
			cancel();

			model.change( writer => {
				writer.setSelection( marker.getRange() );
			} );
		}
	};
}

/**
 * Additional rule for enabling "delete" and "deleteForward" commands if selection is on range boundaries:
 *
 * Does not allow to enable command when selection focus is:
 * - is on marker start - "delete" - to prevent removing content before marker
 * - is on marker end - "deleteForward" - to prevent removing content after marker
 */
function isDeleteCommandOnMarkerBoundaries( commandName: string, selection: DocumentSelection, markerRange: Range ) {
	if ( commandName == 'delete' && markerRange.start.isEqual( selection.focus! ) ) {
		return true;
	}

	// Only for collapsed selection - non-collapsed selection that extends over a marker is handled elsewhere.
	if ( commandName == 'deleteForward' && selection.isCollapsed && markerRange.end.isEqual( selection.focus! ) ) {
		return true;
	}

	return false;
}

/**
 * Ensures that model.deleteContent() does not delete outside exception markers ranges.
 *
 * The enforced restrictions are:
 * - only execute deleteContent() inside exception markers
 * - restrict passed selection to exception marker
 */
function restrictDeleteContent( editor: Editor ): GetCallback<BaseEvent> {
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

/**
 * Ensures that input command is executed with a range that is inside exception marker.
 *
 * This restriction is due to fact that using native spell check changes text outside exception marker.
 */
function disallowInputExecForWrongRange( editor: Editor ): GetCallback<InsertTextCommandExecuteEvent> {
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

function isRangeInsideSingleMarker( editor: Editor, range: Range ) {
	const markerAtStart = getMarkerAtPosition( editor, range.start );
	const markerAtEnd = getMarkerAtPosition( editor, range.end );

	return markerAtStart && markerAtEnd && markerAtEnd === markerAtStart;
}

/**
 * Checks if new marker range is flat. Non-flat ranges might appear during upcast conversion in nested structures, ie tables.
 *
 * Note: This marker fixer only consider case which is possible to create using StandardEditing mode plugin.
 * Markers created by developer in the data might break in many other ways.
 *
 * See #6003.
 */
function ensureNewMarkerIsFlatPostFixer( editor: Editor ): ModelPostFixer {
	return writer => {
		let changeApplied = false;

		const changedMarkers = editor.model.document.differ.getChangedMarkers();

		for ( const { data, name } of changedMarkers ) {
			if ( !name.startsWith( 'restrictedEditingException' ) ) {
				continue;
			}

			const newRange = data.newRange!;

			if ( !data.oldRange && !newRange.isFlat ) {
				const start = newRange.start;
				const end = newRange.end;

				const startIsHigherInTree = start.path.length > end.path.length;

				const fixedStart = startIsHigherInTree ? newRange.start : writer.createPositionAt( end.parent, 0 );
				const fixedEnd = startIsHigherInTree ? writer.createPositionAt( start.parent, 'end' ) : newRange.end;

				writer.updateMarker( name, {
					range: writer.createRange( fixedStart, fixedEnd )
				} );

				changeApplied = true;
			}
		}

		return changeApplied;
	};
}

function onlyAllowAttributesFromList( allowedAttributes: RestrictedEditingConfig['allowedAttributes'] ): SchemaAttributeCheckCallback {
	return ( context, attributeName ) => {
		if ( context.startsWith( '$clipboardHolder' ) ) {
			return allowedAttributes.includes( attributeName );
		}
	};
}

function allowTextOnlyInClipboardHolder(): SchemaChildCheckCallback {
	return ( context, childDefinition ) => {
		if ( context.startsWith( '$clipboardHolder' ) ) {
			return childDefinition.name === '$text';
		}
	};
}
