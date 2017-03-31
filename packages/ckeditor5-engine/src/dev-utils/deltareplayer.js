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
			this._deltasToReplay = [];

			return;
		}

		this._deltasToReplay = stringifiedDeltas
			.split( this._logSeparator )
			.map( stringifiedDelta => JSON.parse( stringifiedDelta ) );
	}

	getDeltasToReplay() {
		return this._deltasToReplay;
	}

	/**
	 * Applies all deltas with delay between actions.
	 *
	 * @param {Number} timeInterval
	 */
	play( timeInterval = 1000 ) {
		if ( this._deltasToReplay.length === 0 ) {
			return;
		}

		this.applyNextDelta().then( () => {
			setTimeout( () => this.play(), timeInterval );
		} );
	}

	/**
	 * @param {Number} numberOfDeltas Number of deltas to apply.
	 * @returns {Promise}
	 */
	applyDeltas( numberOfDeltas ) {
		if ( numberOfDeltas <= 0 ) {
			return;
		}

		return this.applyNextDelta()
			.then( () => this.applyDeltas( numberOfDeltas - 1 ) )
			.catch( err => console.warn( err ) );
	}

	/**
	 * @returns {Promise}
	 */
	applyAllDeltas() {
		return this.applyNextDelta()
			.then( () => this.applyAllDeltas() )
			.catch( err => console.warn( err ) );
	}

	/**
	 * @returns {Promise}
	 */
	applyNextDelta() {
		const document = this._document;

		return new Promise( ( res, rej ) => {
			document.enqueueChanges( () => {
				const jsonDelta = this._deltasToReplay.shift();

				if ( !jsonDelta ) {
					return rej( new Error( 'No deltas to replay' ) );
				}

				const delta = DeltaFactory.fromJSON( jsonDelta, this._document );

				const batch = document.batch();
				batch.addDelta( delta );

				for ( const operation of delta.operations ) {
					document.applyOperation( operation );
				}

				res();
			} );
		} );
	}
}
