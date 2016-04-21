/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Feature from '../feature.js';
import ChangeBuffer from './changebuffer.js';
import MutationObserver from '../engine/view/observer/mutationobserver.js';
import KeyObserver from '../engine/view/observer/keyobserver.js';
import ModelPosition from '../engine/model/position.js';
import ModelRange from '../engine/model/range.js';
import ViewPosition from '../engine/view/position.js';
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
	constructor( editor ) {
		super( editor );
	}

	init() {
		const editor = this.editor;
		const doc = editor.document;
		const editingView = editor.editing.view;

		this.buffer = new ChangeBuffer( doc, 5 );

		editingView.addObserver( MutationObserver );
		editingView.addObserver( KeyObserver );

		this.listenTo( editingView, 'keydown', ( evt, data ) => {
			if ( isSafeKeystroke( data ) || doc.selection.isCollapsed ) {
				return;
			}

			doc.enqueueChanges( () => {
				doc.composer.deleteContents( this.buffer.batch, doc.selection );
			} );

			data.preventDefault();
		}, null, 9999 ); // LOWEST

		this.listenTo( editingView, 'mutations', ( evt, mutations ) => {
			mutations.forEach( mutation => this._handleMutation( mutation ) );
		} );
	}

	destroy() {
		super.destroy();

		this.buffer.destroy();
		this.buffer = null;
	}

	_handleMutation( mutation ) {
		if ( mutation.type == 'children' ) {
			this._handleChildrenMutation( mutation );
		} else {
			this._handleTextMutation( mutation );
		}
	}

	_handleChildrenMutation( mutation ) {
		// TODO Currently it's a bit tricky to implement this piece because quirks are not filtered out
		// so typing inside <p>^<br></p> will give us "remove <br>, add 'x'".

		console.log( 'Children mutation', mutation ); // jshint ignore:line
	}

	_handleTextMutation( mutation ) {
		const doc = this.editor.document;
		const changes = diffToChanges( diff( mutation.oldText, mutation.newText ), mutation.newText );
		let lastPos;
		let insertedCharacters = 0;

		console.log( 'Text mutation', JSON.stringify( changes ) ); // jshint ignore:line
		console.log( mutation ); // jshint ignore:line

		doc.enqueueChanges( () => {
			changes
				.forEach( change => {
					const viewPos = new ViewPosition( mutation.node, change.index );
					const modelPos = this.editor.editing.mapper.toModelPosition( viewPos );

					if ( change.type == 'INSERT' ) {
						const insertedText = change.values.join( '' );

						this.buffer.batch.weakInsert( modelPos, insertedText );

						lastPos = ModelPosition.createAt( modelPos.parent, modelPos.offset + insertedText.length );
						insertedCharacters += insertedText.length;
					} else /* if ( change.type == 'DELETE' ) */ {
						this.buffer.batch.remove( new ModelRange( modelPos, modelPos.getShiftedBy( change.howMany ) ) );

						lastPos = modelPos;
					}
				} );

			// Placing the selection right after the last change will work for many cases, but not
			// for ones like autocorrection or spellchecking. The caret should be placed after the whole piece
			// which was corrected (e.g. a word), not after the letter that was replaced.
			doc.selection.collapse( lastPos );

			this.buffer.input( insertedCharacters );

			console.log( getData( doc, { rootName: 'editor' } ) ); // jshint ignore:line
		} );
	}
}

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
