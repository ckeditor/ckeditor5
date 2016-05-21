/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Feature from '../feature.js';
import ChangeBuffer from './changebuffer.js';
import MutationObserver from '../engine/view/observer/mutationobserver.js';
import KeyObserver from '../engine/view/observer/keyobserver.js';
import SelectionObserver from '../engine/view/observer/selectionobserver.js';
import ModelPosition from '../engine/model/position.js';
import ModelRange from '../engine/model/range.js';
import ViewPosition from '../engine/view/position.js';
import ViewText from '../engine/view/text.js';
import ViewContainerElement from '../engine/view/containerelement.js';
import diff from '../utils/diff.js';
import diffToChanges from '../utils/difftochanges.js';
import { getCode } from '../utils/keyboard.js';
import { getData } from '/tests/engine/_utils/model.js';

/**
 * The typing feature. Handles... typing.
 *
 * @memberOf typing
 * @extends ckeditor5.Feature
 */
export default class Typing extends Feature {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const editingView = editor.editing.view;

		this.buffer = new ChangeBuffer( editor.document, 5 );

		editingView.addObserver( MutationObserver );
		editingView.addObserver( KeyObserver );
		editingView.addObserver( SelectionObserver );

		this.listenTo( editingView, 'keydown', ( evt, data ) => {
			this._handleKeydown( data );
		}, null, 9999 ); // LOWEST

		this.listenTo( editingView, 'mutations', ( evt, mutations ) => {
			this._handleMutations( mutations );
		} );
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		super.destroy();

		this.buffer.destroy();
		this.buffer = null;
	}

	_handleKeydown( evtData ) {
		const doc = this.editor.document;

		if ( isSafeKeystroke( evtData ) || doc.selection.isCollapsed ) {
			return;
		}

		doc.enqueueChanges( () => {
			doc.composer.deleteContents( this.buffer.batch, doc.selection );
		} );

		evtData.preventDefault();
	}

	_handleMutations( mutations ) {
		const doc = this.editor.document;
		const handler = new MutationHandler( this.editor.editing, this.buffer );

		doc.enqueueChanges( () => {
			handler.handle( mutations );
			handler.commit();
		} );
	}
}

class MutationHandler {
	constructor( editing, buffer ) {
		this.editing = editing;
		this.buffer = buffer;

		this.reset();
	}

	reset() {
		this.insertedCharacterCount = 0;
		this.selectionPosition = null;
	}

	handle( mutations ) {
		// mutations = mutations.slice( 0 );

		// for ( let consumer of consumers.multi ) {
		// 	consumer( mutations, this );

		// 	if ( !mutations.length ) {
		// 		return;
		// 	}
		// }

		mutations.forEach( mutation => {
			for ( let consumer of consumers.single ) {
				if ( consumer.check( mutation ) ) {
					consumer.consume( mutation, this );

					return;
				}
			}
		} );
	}

	commit() {
		this.buffer.input( this.insertedCharacterCount );

		// Placing the selection right after the last change will work for many cases, but not
		// for ones like autocorrection or spellchecking. The caret should be placed after the whole piece
		// which was corrected (e.g. a word), not after the letter that was replaced.
		if ( this.selectionPosition ) {
			this.editing.model.selection.collapse( this.selectionPosition );
		}

		this.reset();

		console.log( getData( this.editing.model, { rootName: 'editor' } ) ); // jshint ignore:line
	}

	insert( { position, text, selectionPosition } ) {
		this.buffer.batch.weakInsert( position, text );

		this.insertedCharacterCount += text.length;
		this.selectionPosition = selectionPosition;
	}

	remove( { range, selectionPosition } ) {
		this.buffer.batch.remove( range );

		this.selectionPosition = selectionPosition;
	}
}

const consumers = {
	// multi: [],

	single: [
		// Simple text nodes change.
		{
			check( mutation ) {
				return ( mutation.type == 'text' );
			},

			consume( mutation, handler ) {
				const changes = diffToChanges( diff( mutation.oldText, mutation.newText ), mutation.newText );

				console.log( 'Text node change handler', JSON.stringify( changes ) ); // jshint ignore:line
				console.log( mutation ); // jshint ignore:line

				changes.forEach( change => {
					const viewPos = new ViewPosition( mutation.node, change.index );
					const modelPos = handler.editing.mapper.toModelPosition( viewPos );

					if ( change.type == 'INSERT' ) {
						const insertedText = change.values.join( '' );

						handler.insert( {
							position: modelPos,
							text: insertedText,
							selectionPosition: ModelPosition.createAt( modelPos.parent, modelPos.offset + insertedText.length )
						} );
					} else /* if ( change.type == 'DELETE' ) */ {
						handler.remove( {
							range: new ModelRange( modelPos, modelPos.getShiftedBy( change.howMany ) ),
							selectionPosition: modelPos
						} );
					}
				} );
			}
		},

		// Insertion into empty container.
		{
			check( mutation ) {
				return (
					mutation.oldChildren.length === 0 &&
					mutation.newChildren.length === 1 &&
					( mutation.newChildren[ 0 ] instanceof ViewText ) &&
					( mutation.node instanceof ViewContainerElement )
				);
			},

			consume( mutation, handler ) {
				console.log( 'Insertion into empty container handler', mutation ); // jshint ignore:line

				const viewPos = new ViewPosition( mutation.node, 0 );
				const modelPos = handler.editing.mapper.toModelPosition( viewPos );
				const insertedText = mutation.newChildren[ 0 ].data;

				handler.insert( {
					position: modelPos,
					text: insertedText,
					selectionPosition: ModelPosition.createAt( modelPos.parent, 'END' )
				} );
			}
		}
	]
};

// This is absolutely lame, but it's enough for now.

const safeKeystrokes = [
	getCode( 'ctrl' ),
	getCode( 'cmd' ),
	getCode( 'shift' ),
	getCode( 'alt' ),
	getCode( 'arrowUp' ),
	getCode( 'arrowRight' ),
	getCode( 'arrowDown' ),
	getCode( 'arrowLeft' )
];

function isSafeKeystroke( keyData ) {
	return safeKeystrokes.indexOf( keyData.keyCode );
}
