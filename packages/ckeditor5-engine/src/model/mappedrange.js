/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/mappedrange
 */

import Range from './range';
import compareArrays from '@ckeditor/ckeditor5-utils/src/comparearrays';

/**
 * TODO
 */
export default class MappedRangeCollection {
	/**
	 * TODO
	 */
	constructor() {
		/**
		 * TODO
		 * @private
		 */
		this._ranges = [];

		/**
		 * TODO
		 * @private
		 */
		this._changedRanges = new Map();
	}

	/**
	 * TODO
	 */
	applyChanges( changes ) {
		for ( const change of changes ) {
			if ( change.type == 'insert' ) {
				const insertionRange = Range._createFromPositionAndShift( change.position, change.length );

				for ( const { type, item: element, previousPosition: position, length } of insertionRange ) {
					if ( type != 'elementStart' ) {
						continue;
					}

					let wasHandled = false;

					for ( const mappedRange of Array.from( this._ranges ) ) {
						if ( mappedRange.root != position.root ) {
							continue;
						}

						if ( compareArrays( mappedRange.start.getParentPath(), position.getParentPath() ) != 'same' ) {
							continue;
						}

						if ( element.hasAttribute( 'listItem' ) ) {
							const [ newRange ] = mappedRange._getTransformedByInsertion( position, length );

							if ( mappedRange.containsPosition( position ) ) {
								// @if CK_DEBUG // console.log( '-- range grow inside',
								// @if CK_DEBUG // 		mappedRange.start.path + '-' + mappedRange.end.path,
								// @if CK_DEBUG // 		'to', newRange.start.path + '-' + newRange.end.path );

								this._updateRange( mappedRange, newRange, true );
								wasHandled = true;
							} else if ( !newRange.isEqual( mappedRange ) ) {
								// @if CK_DEBUG // console.log( '-- range move',
								// @if CK_DEBUG // 		mappedRange.start.path + '-' + mappedRange.end.path,
								// @if CK_DEBUG // 		'to', newRange.start.path + '-' + newRange.end.path );

								this._updateRange( mappedRange, newRange, false );
							}
						} else {
							const newRanges = mappedRange._getTransformedByInsertion( position, length, true );

							// Insertion was inside this list.
							if ( newRanges.length > 1 ) {
								// @if CK_DEBUG // console.log( '-- range split',
								// @if CK_DEBUG // 		mappedRange.start.path + '-' + mappedRange.end.path,
								// @if CK_DEBUG // 		'to', newRanges[ 0 ].start.path + '-' + newRanges[ 0 ].end.path,
								// @if CK_DEBUG // 		'and', newRanges[ 1 ].start.path + '-' + newRanges[ 1 ].end.path );

								this._updateRange( mappedRange, newRanges[ 0 ], true );
								this._createRange( newRanges[ 1 ] );
							} else if ( !newRanges[ 0 ].isEqual( mappedRange ) ) {
								// @if CK_DEBUG // console.log( '-- range move',
								// @if CK_DEBUG // 		mappedRange.start.path + '-' + mappedRange.end.path,
								// @if CK_DEBUG // 		'to', newRanges[ 0 ].start.path + '-' + newRanges[ 0 ].end.path );

								this._updateRange( mappedRange, newRanges[ 0 ], false );
							}
						}
					}

					if ( !wasHandled && element.hasAttribute( 'listItem' ) ) {
						const range = Range._createFromPositionAndShift( position, length );

						// @if CK_DEBUG // console.log( '-- new range', range.start.path + '-' + range.end.path );

						this._createRange( range );
					}
				}
			} else if ( change.type == 'remove' ) {
				for ( const mappedRange of Array.from( this._ranges ) ) {
					if ( mappedRange.root != change.position.root ) {
						continue;
					}

					const newRange = mappedRange._getTransformedByDeletion( change.position, change.length );

					if ( !newRange || newRange.isCollapsed ) {
						// @if CK_DEBUG // console.log( '-- range removed', mappedRange.start.path + '-' + mappedRange.end.path );

						this._deleteRange( mappedRange );

						continue;
					}

					if ( mappedRange.isEqual( newRange ) ) {
						continue;
					}

					if ( mappedRange.start.isEqual( change.position ) || mappedRange.containsPosition( change.position ) ) {
						// @if CK_DEBUG // console.log( '-- range shrink',
						// @if CK_DEBUG // 		mappedRange.start.path + '-' + mappedRange.end.path,
						// @if CK_DEBUG // 		'to', newRange.start.path + '-' + newRange.end.path );

						this._updateRange( mappedRange, newRange, true );
					} else {
						// @if CK_DEBUG // console.log( '-- range move',
						// @if CK_DEBUG // 		mappedRange.start.path + '-' + mappedRange.end.path,
						// @if CK_DEBUG // 		'to', newRange.start.path + '-' + newRange.end.path );

						this._updateRange( mappedRange, newRange, false );
					}
				}
			} else if ( change.type == 'attribute' ) {
				if ( [ 'listIndent', 'listType', 'listItem' ].includes( change.attributeKey ) ) {
					// Ignore text nodes.
					if ( change.range.isFlat ) {
						continue;
					}

					const changedRange = Range._createFromPositionAndShift( change.range.start, 1 );

					let wasHandled = false;

					for ( const mappedRange of Array.from( this._ranges ) ) {
						if ( mappedRange.root != changedRange.root ) {
							continue;
						}

						if ( compareArrays( mappedRange.start.getParentPath(), changedRange.start.getParentPath() ) != 'same' ) {
							continue;
						}

						// Attribute was set.
						if ( change.attributeOldValue === null ) {
							if ( mappedRange.isIntersecting( changedRange ) ) {
								// @if CK_DEBUG // console.log( '-- range added secondary attribute',
								// @if CK_DEBUG // 		mappedRange.start.path + '-' + mappedRange.end.path );

								this._updateRange( mappedRange, mappedRange, true );
								wasHandled = true;
							}
						}

						// Attribute was removed.
						else if ( change.attributeNewValue === null ) {
							const newRanges = mappedRange.getDifference( changedRange );

							// Does not affect this list.
							if ( newRanges.length == 1 && newRanges[ 0 ].isEqual( mappedRange ) ) {
								continue;
							}

							if ( newRanges.length > 1 ) {
								// @if CK_DEBUG // console.log( '-- range split',
								// @if CK_DEBUG // 		mappedRange.start.path + '-' + mappedRange.end.path,
								// @if CK_DEBUG // 		'to', newRanges[ 0 ].start.path + '-' + newRanges[ 0 ].end.path,
								// @if CK_DEBUG // 		'and', newRanges[ 1 ].start.path + '-' + newRanges[ 1 ].end.path );

								this._updateRange( mappedRange, newRanges[ 0 ], true );
								this._createRange( newRanges[ 1 ] );
							} else if ( newRanges.length ) {
								// @if CK_DEBUG // console.log( '-- range shrink',
								// @if CK_DEBUG // 		mappedRange.start.path + '-' + mappedRange.end.path,
								// @if CK_DEBUG // 		'to', newRanges[ 0 ].start.path + '-' + newRanges[ 0 ].end.path );

								this._updateRange( mappedRange, newRanges[ 0 ], true );
							} else {
								// @if CK_DEBUG // console.log( '-- range removed',
								// @if CK_DEBUG // 		mappedRange.start.path + '-' + mappedRange.end.path );

								this._deleteRange( mappedRange );
							}
						}

						// Attribute value was changed.
						else if ( change.range.isIntersecting( mappedRange ) ) {
							// @if CK_DEBUG // console.log( '-- range attr change',
							// @if CK_DEBUG // 		mappedRange.start.path + '-' + mappedRange.end.path );

							this._updateRange( mappedRange, mappedRange, true );
						}
					}

					// New attribute on new list.
					if ( !wasHandled && change.attributeOldValue === null ) {
						// @if CK_DEBUG // console.log( '-- new range', changedRange.start.path + '-' + changedRange.end.path );

						this._createRange( changedRange );
					}
				}
			}
		}

		console.log( 'ranges:', ...this._ranges.map( range => range.start.path + '-' + range.end.path ) );
		console.log( 'range changes:', ...Array.from( this._changedRanges.entries() )
			.map( ( [ range, type ] ) => type + ': ' + range.start.path + '-' + range.end.path ) );
	}

	getRanges() {
		return this._ranges;
	}

	getRangesChanges() {
		return Array.from( this._changedRanges.entries() )
			.map( ( [ range, type ] ) => type + ': ' + range.start.path + '-' + range.end.path )
	}

	getReducedChanges( name, changes ) {
		// TODO
		return changes;
	}

	clearChanges() {
		this._changedRanges.clear();
	}

	_createRange( range ) {
		for ( const otherMappedRange of this._ranges ) {
			const joinedRange = joinRanges( otherMappedRange, range );

			if ( !joinedRange ) {
				continue;
			}

			this._updateRange( otherMappedRange, joinedRange, true );

			return;
		}

		const mappedRange = MappedRange._createMappedRange( range.start, range.end );

		this._ranges.push( mappedRange );
		this._changedRanges.set( mappedRange, 'create' );
	}

	_updateRange( mappedRange, newRange, triggerReconversion ) {
		for ( const otherMappedRange of this._ranges ) {
			if ( otherMappedRange == mappedRange ) {
				continue;
			}

			const joinedRange = joinRanges( otherMappedRange, newRange );

			if ( !joinedRange ) {
				continue;
			}

			this._deleteRange( otherMappedRange );
			this._updateRange( mappedRange, joinedRange, true );

			return;
		}

		// TODO custom protected setters (those are read only in Range).
		mappedRange.start = newRange.start;
		mappedRange.end = newRange.end;

		if ( triggerReconversion && !this._changedRanges.has( mappedRange ) ) {
			this._changedRanges.set( mappedRange, 'update' );
		}
	}

	_deleteRange( mappedRange ) {
		this._ranges.splice( this._ranges.indexOf( mappedRange ), 1 );
		this._changedRanges.set( mappedRange, 'delete' );
	}
}

class MappedRange extends Range {
	static _createMappedRange( start, end ) {
		return new this( start, end );
	}
}

function joinRanges( a, b ) {
	if ( compareArrays( a.start.getParentPath(), b.start.getParentPath() ) != 'same' ) {
		return null;
	}

	return a.getJoined( b );
}
