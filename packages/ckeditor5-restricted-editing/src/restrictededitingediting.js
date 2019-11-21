/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module restricted-editing/restrictededitingediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Matcher from '@ckeditor/ckeditor5-engine/src/view/matcher';

/**
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

		this._disableCommands( editor );

		const selection = editor.model.document.selection;

		this.listenTo( selection, 'change', () => {
			if ( selection.rangeCount > 1 ) {
				this._disableCommands( editor );

				return;
			}

			const marker = this._getMarker( editor, selection );

			if ( isSelectionInExceptionMarker( marker, selection ) ) {
				this._enableCommands( marker );
			} else {
				this._disableCommands();
			}
		} );
	}

	_getMarker( editor, selection ) {
		for ( const marker of this.editor.model.markers ) {
			const markerRange = marker.getRange();

			if ( isPositionInRangeOrOnRangeBoundary( markerRange, selection.focus ) ) {
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
