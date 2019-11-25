/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module restricted-editing/restrictededitingediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Matcher from '@ckeditor/ckeditor5-engine/src/view/matcher';
import RestrictedEditingNavigationCommand from './restrictededitingnavigationcommand';

const HIGHLIGHT_CLASS = 'ck-restricted-editing-exception_selected';

/**
 * The Restricted Editing editing feature.
 *
 * * It introduces the exception marker group that renders to `<spans>` with the `ck-restricted-editing-exception` CSS class.
 * * It registers the `'goToPreviousRestrictedEditingRegion'` and `'goToNextRestrictedEditingRegion'` commands.
 * * Also enables highlighting exception markers that are selected.
 *
 * @extends module:core/plugin~Plugin
 */
export default class RestrictedEditingEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'RestrictedEditingEditing';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		this._alwaysEnabled = new Set( [ 'undo', 'redo' ] );
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

		let createdMarkers = 0;

		editor.conversion.for( 'upcast' ).add( upcastHighlightToMarker( {
			view: {
				name: 'span',
				classes: 'ck-restricted-editing-exception'
			},
			model: () => {
				createdMarkers++;

				return `restricted-editing-exception:${ createdMarkers }`;
			}
		} ) );

		editor.conversion.for( 'downcast' ).markerToHighlight( {
			model: 'restricted-editing-exception',
			// Use callback to return new object every time new marker instance is created - otherwise it will be seen as the same marker.
			view: () => ( {
				name: 'span',
				classes: 'ck-restricted-editing-exception',
				priority: -10
			} )
		} );

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

		this._setupExceptionHighlighting();
		this._setupRestrictedMode( editor );
	}

	/**
	 * Adds a visual highlight style to a restricted editing exception the selection is anchored to.
	 *
	 * Highlight is turned on by adding the `.ck-restricted-editing-exception_selected` class to the
	 * exception in the view:
	 *
	 * * The class is removed before the conversion has started, as callbacks added with the `'highest'` priority
	 * to {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher} events.
	 * * The class is added in the view post fixer, after other changes in the model tree were converted to the view.
	 *
	 * This way, adding and removing the highlight does not interfere with conversion.
	 *
	 * @private
	 */
	_setupExceptionHighlighting() {
		const editor = this.editor;
		const view = editor.editing.view;
		const model = editor.model;
		const highlightedMarkers = new Set();

		// Adding the class.
		view.document.registerPostFixer( writer => {
			const modelSelection = model.document.selection;

			const marker = this._getMarker( modelSelection.anchor );

			if ( !marker ) {
				return;
			}

			const markerNameToElements = editor.editing.mapper.markerNameToElements( marker.name );

			if ( !markerNameToElements ) {
				return;
			}

			for ( const viewElement of markerNameToElements ) {
				writer.addClass( HIGHLIGHT_CLASS, viewElement );
				highlightedMarkers.add( viewElement );
			}
		} );

		// Removing the class.
		editor.conversion.for( 'editingDowncast' ).add( dispatcher => {
			// Make sure the highlight is removed on every possible event, before conversion is started.
			dispatcher.on( 'insert', removeHighlight, { priority: 'highest' } );
			dispatcher.on( 'remove', removeHighlight, { priority: 'highest' } );
			dispatcher.on( 'attribute', removeHighlight, { priority: 'highest' } );
			dispatcher.on( 'selection', removeHighlight, { priority: 'highest' } );

			function removeHighlight() {
				view.change( writer => {
					for ( const item of highlightedMarkers.values() ) {
						writer.removeClass( HIGHLIGHT_CLASS, item );
						highlightedMarkers.delete( item );
					}
				} );
			}
		} );
	}

	_setupRestrictedMode( editor ) {
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
		const markerAtStart = this._getMarker( change.position.getShiftedBy( 1 ) );

		if ( markerAtStart && markerAtStart.getStart().isEqual( change.position.getShiftedBy( 1 ) ) ) {
			writer.updateMarker( markerAtStart, {
				range: writer.createRange( markerAtStart.getStart().getShiftedBy( -1 ), markerAtStart.getEnd() )
			} );

			changeApplied = true;
		}
		return changeApplied;
	}

	_tryExtendMarkedEnd( change, writer, changeApplied ) {
		const markerAtEnd = this._getMarker( change.position );

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

		const marker = this._getMarker( selection.focus );

		if ( isSelectionInExceptionMarker( marker, selection ) ) {
			this._enableCommands( marker );
		} else {
			this._disableCommands();
		}
	}

	_getMarker( position ) {
		const editor = this.editor;

		for ( const marker of editor.model.markers ) {
			const markerRange = marker.getRange();

			if ( isPositionInRangeOrOnRangeBoundary( markerRange, position ) ) {
				if ( marker.name.startsWith( 'restricted-editing-exception:' ) ) {
					return marker;
				}
			}
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
			command.clearForceDisabled( 'RestrictedMode' );
		}

		for ( const command of exceptionDisable.map( name => editor.commands.get( name ) ) ) {
			command.forceDisabled( 'RestrictedMode' );
		}
	}

	_disableCommands() {
		const editor = this.editor;
		const commands = this._getCommandNamesToToggle( editor )
			.map( name => editor.commands.get( name ) );

		for ( const command of commands ) {
			command.forceDisabled( 'RestrictedMode' );
		}
	}

	_getCommandNamesToToggle( editor ) {
		return Array.from( editor.commands.names() )
			.filter( name => !this._alwaysEnabled.has( name ) );
	}
}

function upcastHighlightToMarker( config ) {
	return dispatcher => dispatcher.on( 'element:span', ( evt, data, conversionApi ) => {
		const { writer } = conversionApi;

		const matcher = new Matcher( config.view );
		const matcherResult = matcher.match( data.viewItem );

		// If there is no match, this callback should not do anything.
		if ( !matcherResult ) {
			return;
		}

		const match = matcherResult.match;

		// Force consuming element's name (taken from upcast helpers elementToElement converter).
		match.name = true;

		const { modelRange: convertedChildrenRange } = conversionApi.convertChildren( data.viewItem, data.modelCursor );
		conversionApi.consumable.consume( data.viewItem, match );

		const markerName = config.model( data.viewItem );
		const fakeMarkerStart = writer.createElement( '$marker', { 'data-name': markerName } );
		const fakeMarkerEnd = writer.createElement( '$marker', { 'data-name': markerName } );

		// Insert in reverse order to use converter content positions directly (without recalculating).
		writer.insert( fakeMarkerEnd, convertedChildrenRange.end );
		writer.insert( fakeMarkerStart, convertedChildrenRange.start );

		data.modelRange = writer.createRange(
			writer.createPositionBefore( fakeMarkerStart ),
			writer.createPositionAfter( fakeMarkerEnd )
		);
		data.modelCursor = data.modelRange.end;
	} );
}

function isSelectionInExceptionMarker( marker, selection ) {
	if ( !marker ) {
		return false;
	}

	const markerRange = marker.getRange();

	if ( selection.isCollapsed ) {
		return isPositionInRangeOrOnRangeBoundary( markerRange, selection.focus );
	}

	return markerRange.containsRange( selection.getFirstRange(), true );
}

function isPositionInRangeOrOnRangeBoundary( range, position ) {
	return (
		range.containsPosition( position ) ||
		range.end.isEqual( position ) ||
		range.start.isEqual( position )
	);
}
