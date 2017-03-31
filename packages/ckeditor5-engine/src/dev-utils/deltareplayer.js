/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/dev-utils/deltareplayer
 */

/* global setTimeout, console */

import DeltaFactory from '../model/delta/deltafactory';

/**
 * DeltaReplayer is a dev-tool created for easily replaying operations on the document from stringified deltas.
 */
export default class DeltaReplayer {
	/**
	 * @param {module:engine/model/document~Document} document.
	 * @param {String} logSeparator Separator between deltas.
	 * @param {String} stringifiedDeltas Deltas to replay.
	 */
	constructor( document, logSeparator, stringifiedDeltas ) {
		this._document = document;
		this._logSeparator = logSeparator;
		this.setStringifiedDeltas( stringifiedDeltas );
	}

	/**
	 * @param {String} stringifiedDeltas Deltas to replay.
	 */
	setStringifiedDeltas( stringifiedDeltas ) {
		if ( stringifiedDeltas === '' ) {
			this._deltaToReplay = [];

			return;
		}

		this._deltaToReplay = stringifiedDeltas
			.split( this._logSeparator )
			.map( stringifiedDelta => JSON.parse( stringifiedDelta ) )
			.map( jsonDelta => DeltaFactory.fromJSON( jsonDelta, this._document ) );
	}

	/**
	 * @param {Number} timeInterval
	 */
	play( timeInterval = 1000 ) {
		if ( this._deltaToReplay.length === 0 ) {
			return;
		}

		this.applyNextDelta().then( () => {
			setTimeout( () => this.play(), timeInterval );
		} );
	}

	/**
	 * @returns {Promise}
	 */
	applyNextDelta() {
		const document = this._document;

		return new Promise( ( res, rej ) => {
			document.enqueueChanges( () => {
				const delta = this._deltaToReplay.shift();

				if ( !delta ) {
					return rej( new Error( 'No deltas to replay' ) );
				}

				const batch = document.batch();
				batch.addDelta( delta );

				for ( const operation of delta.operations ) {
					document.applyOperation( operation );
				}

				res();
			} );
		} );
	}

	/**
	 * @returns {Promise}
	 */
	applyAllDeltas() {
		return this.applyNextDelta()
			.then( () => this.applyAllDeltas() )
			.catch( err => console.warn( err ) );
	}
}
