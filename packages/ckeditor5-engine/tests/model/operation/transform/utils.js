/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';

import ListEditing from '@ckeditor/ckeditor5-list/src/list/listediting';
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting';
import { TableEditing } from '@ckeditor/ckeditor5-table';
import ImageBlockEditing from '@ckeditor/ckeditor5-image/src/image/imageblockediting';

import { getData, parse } from '../../../../src/dev-utils/model';
import { transformSets } from '../../../../src/model/operation/transform';
import Position from '../../../../src/model/position';
import Range from '../../../../src/model/range';
import OperationFactory from '../../../../src/model/operation/operationfactory';

const clients = new Set();
const bufferedOperations = new Set();

export class Client {
	constructor( name ) {
		this.editor = null;
		this.document = null;
		this.syncedVersion = 0;
		this.orderNumber = null;
		this.name = name;
	}

	init() {
		return ModelTestEditor.create( {
			// Typing is needed for delete command.
			// UndoEditing is needed for undo command.
			// Block plugins are needed for proper data serializing.
			// BoldEditing is needed for bold command.
			plugins: [
				Typing, Paragraph, ListEditing, UndoEditing, BlockQuoteEditing, HeadingEditing, BoldEditing, TableEditing, ImageBlockEditing
			]
		} ).then( editor => {
			this.editor = editor;
			this.document = editor.model.document;

			return this;
		} );
	}

	setData( initModelString ) {
		const model = this.editor.model;
		const modelRoot = model.document.getRoot();

		// Parse data string to model.
		const parsedResult = parse( initModelString, model.schema, { context: [ modelRoot.name ] } );

		// Retrieve DocumentFragment and Selection from parsed model.
		const modelDocumentFragment = parsedResult.model;
		const selection = parsedResult.selection;

		model.change( writer => {
			// Replace existing model in document by new one.
			writer.remove( writer.createRangeIn( modelRoot ) );
			writer.insert( modelDocumentFragment, modelRoot );
		} );

		const ranges = [];

		for ( const range of selection.getRanges() ) {
			const start = new Position( modelRoot, range.start.path );
			const end = new Position( modelRoot, range.end.path );

			ranges.push( new Range( start, end ) );
		}

		model.document.selection._setTo( ranges );

		// Purify graveyard so there are no artifact nodes there remaining after setting new data.
		// Because of those old nodes some tests may pass even though they fail in real scenarios (those tests
		// involve bringing back elements from graveyard, like wrap or split).
		model.document.graveyard._removeChildren( 0, model.document.graveyard.childCount );

		this.syncedVersion = this.document.version;
	}

	setSelection( start, end ) {
		if ( !end ) {
			end = start.slice();
		}

		const startPos = this._getPosition( start );
		const endPos = this._getPosition( end );

		this.editor.model.document.selection._setTo( new Range( startPos, endPos ) );
	}

	insert( itemString, path ) {
		const item = parse( itemString, this.editor.model.schema );
		const position = this._getPosition( path, 'start' );

		this._processAction( 'insert', item, position );
	}

	type( text, attributes, path ) {
		const position = this._getPosition( path, 'start' );

		this._processAction( 'insertText', text, attributes, position );
	}

	remove( start, end ) {
		const startPos = this._getPosition( start, 'start' );
		const endPos = this._getPosition( end, 'end' );

		this._processAction( 'remove', new Range( startPos, endPos ) );
	}

	delete() {
		this._processExecute( 'delete' );
	}

	move( target, start, end ) {
		const targetPos = this._getPosition( target );
		const startPos = this._getPosition( start, 'start' );
		const endPos = this._getPosition( end, 'end' );

		this._processAction( 'move', new Range( startPos, endPos ), targetPos );
	}

	rename( newName, path ) {
		const pos = this._getPosition( path, 'beforeParent' );
		const element = pos.nodeAfter;

		this._processAction( 'rename', element, newName );
	}

	setAttribute( key, value, start, end ) {
		const startPos = this._getPosition( start, 'start' );
		const endPos = this._getPosition( end, 'end' );

		this._processAction( 'setAttribute', key, value, new Range( startPos, endPos ) );
	}

	removeAttribute( key, start, end ) {
		const startPos = this._getPosition( start, 'start' );
		const endPos = this._getPosition( end, 'end' );

		this._processAction( 'removeAttribute', key, new Range( startPos, endPos ) );
	}

	setMarker( name, start, end ) {
		let actionName;

		const startPos = this._getPosition( start, 'start' );
		const endPos = this._getPosition( end, 'end' );

		if ( this.editor.model.markers.has( name ) ) {
			actionName = 'updateMarker';
		} else {
			actionName = 'addMarker';
		}

		const range = new Range( startPos, endPos );

		this._processAction( actionName, name, { range, usingOperation: true } );
	}

	removeMarker( name ) {
		this._processAction( 'removeMarker', name );
	}

	wrap( elementName, start, end ) {
		const startPos = this._getPosition( start, 'start' );
		const endPos = this._getPosition( end, 'end' );

		this._processAction( 'wrap', new Range( startPos, endPos ), elementName );
	}

	unwrap( path ) {
		const pos = this._getPosition( path, 'beforeParent' );
		const element = pos.nodeAfter;

		this._processAction( 'unwrap', element );
	}

	merge( path ) {
		const pos = this._getPosition( path, 'start' );

		this._processAction( 'merge', pos );
	}

	split( path ) {
		const pos = this._getPosition( path, 'start' );

		this._processAction( 'split', pos );
	}

	undo() {
		this._processExecute( 'undo' );
	}

	redo() {
		this._processExecute( 'redo' );
	}

	_processExecute( commandName, commandArgs ) {
		const oldVersion = this.document.version;

		this.editor.execute( commandName, commandArgs );

		const operations = this.document.history.getOperations( oldVersion );

		bufferOperations( Array.from( operations ), this );
	}

	_getPosition( path, type ) {
		if ( !path ) {
			return this._getPositionFromSelection( type );
		}

		return new Position( this.document.getRoot(), path );
	}

	_getPositionFromSelection( type ) {
		const selRange = this.editor.model.document.selection.getFirstRange();

		switch ( type ) {
			default:
			case 'start':
				return selRange.start.clone();
			case 'end':
				return selRange.end.clone();
			case 'beforeParent':
				return Position._createBefore( selRange.start.parent );
		}
	}

	getModelString() {
		return getData( this.editor.model, { withoutSelection: true, convertMarkers: true } );
	}

	destroy() {
		clients.delete( this );

		return this.editor.destroy();
	}

	_processAction( name, ...args ) {
		const oldVersion = this.document.version;

		this.editor.model.change( writer => {
			writer[ name ]( ...args );
		} );

		const operations = Array.from( this.document.history.getOperations( oldVersion ) );

		bufferOperations( operations, this );
	}

	static get( clientName ) {
		const client = new Client( clientName );
		client.orderNumber = clients.size;

		clients.add( client );

		return client.init();
	}
}

function bufferOperations( operations, client ) {
	bufferedOperations.add( { operations, client } );
}

export function syncClients() {
	const clientsOperations = {};

	// For each client, flatten all buffered operations into one set.
	for ( const item of bufferedOperations ) {
		const name = item.client.name;

		if ( !clientsOperations[ name ] ) {
			clientsOperations[ name ] = [];
		}

		clientsOperations[ name ].push( ...item.operations );
	}

	for ( const localClient of clients ) {
		for ( const remoteClient of clients ) {
			if ( remoteClient == localClient ) {
				continue;
			}

			if ( !clientsOperations[ remoteClient.name ] ) {
				continue;
			}

			// Stringify and rebuild operations to simulate sending operations. Set `wasUndone`.
			const remoteOperationsJson = clientsOperations[ remoteClient.name ].map( operation => {
				operation.wasUndone = remoteClient.document.history.isUndoneOperation( operation );

				const json = JSON.stringify( operation );

				delete operation.wasUndone;

				return json;
			} );

			const remoteOperations = remoteOperationsJson.map( json => {
				const parsedJson = JSON.parse( json );
				const operation = OperationFactory.fromJSON( parsedJson, localClient.document );

				if ( parsedJson.wasUndone ) {
					operation.wasUndone = true;
				}

				return operation;
			} );

			const localOperations = Array.from( localClient.document.history.getOperations( localClient.syncedVersion ) );

			let remoteOperationsTransformed = null;

			const options = {
				document: localClient.document,
				useRelations: false,
				padWithNoOps: true
			};

			if ( localClient.orderNumber < remoteClient.orderNumber ) {
				remoteOperationsTransformed = transformSets( localOperations, remoteOperations, options ).operationsB;
			} else {
				remoteOperationsTransformed = transformSets( remoteOperations, localOperations, options ).operationsA;
			}

			localClient.editor.model.enqueueChange( { isUndoable: false }, writer => {
				for ( const operation of remoteOperationsTransformed ) {
					writer.batch.addOperation( operation );
					localClient.editor.model.applyOperation( operation );
				}
			} );
		}

		localClient.syncedVersion = localClient.document.version;
	}

	bufferedOperations.clear();
}

export function expectClients( expectedModelString ) {
	for ( const client of clients ) {
		expect( client.getModelString(), client.name + ' content' ).to.equal( expectedModelString );
	}

	let syncedVersion = null;

	for ( const client of clients ) {
		if ( syncedVersion === null ) {
			syncedVersion = client.syncedVersion;
			continue;
		}

		expect( client.syncedVersion, client.name + ' version' ).to.equal( syncedVersion );
	}
}

export function clearBuffer() {
	bufferedOperations.clear();
}
