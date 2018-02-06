/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/dev-utils/enableenginedebug
 */

/* global console */

import DeltaReplayer from './deltareplayer';

import ModelPosition from '../model/position';
import ModelRange from '../model/range';
import ModelText from '../model/text';
import ModelTextProxy from '../model/textproxy';
import ModelElement from '../model/element';
import Operation from '../model/operation/operation';
import AttributeOperation from '../model/operation/attributeoperation';
import DetachOperation from '../model/operation/detachoperation';
import InsertOperation from '../model/operation/insertoperation';
import MarkerOperation from '../model/operation/markeroperation';
import MoveOperation from '../model/operation/moveoperation';
import NoOperation from '../model/operation/nooperation';
import RenameOperation from '../model/operation/renameoperation';
import RootAttributeOperation from '../model/operation/rootattributeoperation';
import Delta from '../model/delta/delta';
import AttributeDelta from '../model/delta/attributedelta';
import InsertDelta from '../model/delta/insertdelta';
import MarkerDelta from '../model/delta/markerdelta';
import MergeDelta from '../model/delta/mergedelta';
import MoveDelta from '../model/delta/movedelta';
import RenameDelta from '../model/delta/renamedelta';
import RootAttributeDelta from '../model/delta/rootattributedelta';
import SplitDelta from '../model/delta/splitdelta';
import UnwrapDelta from '../model/delta/unwrapdelta';
import WrapDelta from '../model/delta/wrapdelta';
import deltaTransform from '../model/delta/transform';
import Model from '../model/model';
import ModelDocument from '../model/document';
import ModelDocumentFragment from '../model/documentfragment';
import ModelRootElement from '../model/rootelement';

import ViewDocument from '../view/document';
import ViewElement from '../view/element';
import ViewText from '../view/text';
import ViewTextProxy from '../view/textproxy';
import ViewDocumentFragment from '../view/documentfragment';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Editor from '@ckeditor/ckeditor5-core/src/editor/editor';

import clone from '@ckeditor/ckeditor5-utils/src/lib/lodash/clone';

// Sandbox class allows creating mocks of the functions and restoring these mocks to the original values.
class Sandbox {
	constructor() {
		// An array that contains functions which restore the original values of mocked objects.
		// @private
		// @type {Array.<Function>}
		this._restores = [];
	}

	// Creates a new mock.
	//
	// @param {Object} object Object to mock.
	// @param {String} methodName Function to mock.
	// @param {Function} fakeMethod Function that will be executed.
	mock( object, methodName, fakeMethod ) {
		const originalMethod = object[ methodName ];

		object[ methodName ] = fakeMethod;

		this._restores.unshift( () => {
			if ( originalMethod ) {
				object[ methodName ] = originalMethod;
			} else {
				delete object[ methodName ];
			}
		} );
	}

	// Restores all mocked functions.
	restore() {
		for ( const restore of this._restores ) {
			restore();
		}

		this._restores = [];
	}
}

const sandbox = new Sandbox();

const treeDump = Symbol( '_treeDump' );

// Maximum number of stored states of model and view document.
const maxTreeDumpLength = 20;

// Separator used to separate stringified deltas
const LOG_SEPARATOR = '-------';

// Specified whether debug tools were already enabled.
let enabled = false;

// Logging function used to log debug messages.
let logger = console;

/**
 * Enhances model classes with logging methods. Returns a plugin that should be loaded in the editor to
 * enable debugging features.
 *
 * Every operation applied on {@link module:engine/model/document~Document model.Document} is logged.
 *
 * The following classes are expanded with `log` and meaningful `toString` methods:
 * * {@link module:engine/model/position~Position model.Position},
 * * {@link module:engine/model/range~Range model.Range},
 * * {@link module:engine/model/text~Text model.Text},
 * * {@link module:engine/model/element~Element model.Element},
 * * {@link module:engine/model/rootelement~RootElement model.RootElement},
 * * {@link module:engine/model/documentfragment~DocumentFragment model.DocumentFragment},
 * * {@link module:engine/model/document~Document model.Document},
 * * all {@link module:engine/model/operation/operation~Operation operations}
 * * all {@link module:engine/model/delta/delta~Delta deltas},
 * * {@link module:engine/view/element~Element view.Element},
 * * {@link module:engine/view/documentfragment~DocumentFragment view.DocumentFragment},
 * * {@link module:engine/view/document~Document view.Document}.
 *
 * Additionally, the following logging utility methods are added:
 * * {@link module:engine/model/text~Text model.Text} `logExtended`,
 * * {@link module:engine/model/element~Element model.Element} `logExtended`,
 * * {@link module:engine/model/element~Element model.Element} `logAll`,
 * * {@link module:engine/model/delta/delta~Delta model.Delta} `logAll`.
 *
 * Additionally, the following classes are expanded with `logTree` and `printTree` methods:
 * * {@link module:engine/model/element~Element model.Element},
 * * {@link module:engine/model/documentfragment~DocumentFragment model.DocumentFragment},
 * * {@link module:engine/view/element~Element view.Element},
 * * {@link module:engine/view/documentfragment~DocumentFragment view.DocumentFragment}.
 *
 * Finally, the following methods are added to {@link module:core/editor/editor~Editor}: `logModel`, `logView`, `logDocuments`.
 * All those methods take one parameter, which is the version of the {@link module:engine/model/document~Document model document}
 * for which the model or view document state should be logged.
 *
 * @param {Object} [_logger] An object with functions used to log messages and errors. By default messages are logged to the console.
 * If specified, it is expected to have `log()` and `error()` methods.
 * @returns {module:engine/dev-utils/enableenginedebug~DebugPlugin} The plugin to be loaded into the editor.
 */
export default function enableEngineDebug( _logger = console ) {
	logger = _logger;

	if ( !enabled ) {
		enabled = true;

		enableLoggingTools();
		enableDocumentTools();
		enableReplayerTools();
	}

	return DebugPlugin;
}

/**
 * Restores all methods that have been overwritten.
 */
export function disableEngineDebug() {
	sandbox.restore();
	enabled = false;
}

function enableLoggingTools() {
	sandbox.mock( ModelPosition.prototype, 'toString', function() {
		return `${ this.root } [ ${ this.path.join( ', ' ) } ]`;
	} );

	sandbox.mock( ModelPosition.prototype, 'log', function() {
		logger.log( 'ModelPosition: ' + this );
	} );

	sandbox.mock( ModelRange.prototype, 'toString', function() {
		return `${ this.root } [ ${ this.start.path.join( ', ' ) } ] - [ ${ this.end.path.join( ', ' ) } ]`;
	} );

	sandbox.mock( ModelRange.prototype, 'log', function() {
		logger.log( 'ModelRange: ' + this );
	} );

	sandbox.mock( ModelText.prototype, 'toString', function() {
		return `#${ this.data }`;
	} );

	sandbox.mock( ModelText.prototype, 'logExtended', function() {
		logger.log( `ModelText: ${ this }, attrs: ${ mapString( this.getAttributes() ) }` );
	} );

	sandbox.mock( ModelText.prototype, 'log', function() {
		logger.log( 'ModelText: ' + this );
	} );

	sandbox.mock( ModelTextProxy.prototype, 'toString', function() {
		return `#${ this.data }`;
	} );

	sandbox.mock( ModelTextProxy.prototype, 'logExtended', function() {
		logger.log( `ModelTextProxy: ${ this }, attrs: ${ mapString( this.getAttributes() ) }` );
	} );

	sandbox.mock( ModelTextProxy.prototype, 'log', function() {
		logger.log( 'ModelTextProxy: ' + this );
	} );

	sandbox.mock( ModelElement.prototype, 'toString', function() {
		return `<${ this.rootName || this.name }>`;
	} );

	sandbox.mock( ModelElement.prototype, 'log', function() {
		logger.log( 'ModelElement: ' + this );
	} );

	sandbox.mock( ModelElement.prototype, 'logExtended', function() {
		logger.log( `ModelElement: ${ this }, ${ this.childCount } children, attrs: ${ mapString( this.getAttributes() ) }` );
	} );

	sandbox.mock( ModelElement.prototype, 'logAll', function() {
		logger.log( '--------------------' );

		this.logExtended();
		logger.log( 'List of children:' );

		for ( const child of this.getChildren() ) {
			child.log();
		}
	} );

	sandbox.mock( ModelElement.prototype, 'printTree', function( level = 0 ) {
		let string = '';

		string += '\t'.repeat( level ) + `<${ this.rootName || this.name }${ mapToTags( this.getAttributes() ) }>`;

		for ( const child of this.getChildren() ) {
			string += '\n';

			if ( child.is( 'text' ) ) {
				const textAttrs = mapToTags( child._attrs );

				string += '\t'.repeat( level + 1 );

				if ( textAttrs !== '' ) {
					string += `<$text${ textAttrs }>` + child.data + '</$text>';
				} else {
					string += child.data;
				}
			} else {
				string += child.printTree( level + 1 );
			}
		}

		if ( this.childCount ) {
			string += '\n' + '\t'.repeat( level );
		}

		string += `</${ this.rootName || this.name }>`;

		return string;
	} );

	sandbox.mock( ModelElement.prototype, 'logTree', function() {
		logger.log( this.printTree() );
	} );

	sandbox.mock( ModelRootElement.prototype, 'toString', function() {
		return this.rootName;
	} );

	sandbox.mock( ModelRootElement.prototype, 'log', function() {
		logger.log( 'ModelRootElement: ' + this );
	} );

	sandbox.mock( ModelDocumentFragment.prototype, 'toString', function() {
		return 'documentFragment';
	} );

	sandbox.mock( ModelDocumentFragment.prototype, 'log', function() {
		logger.log( 'ModelDocumentFragment: ' + this );
	} );

	sandbox.mock( ModelDocumentFragment.prototype, 'printTree', function() {
		let string = 'ModelDocumentFragment: [';

		for ( const child of this.getChildren() ) {
			string += '\n';

			if ( child.is( 'text' ) ) {
				const textAttrs = mapToTags( child._attrs );

				string += '\t'.repeat( 1 );

				if ( textAttrs !== '' ) {
					string += `<$text${ textAttrs }>` + child.data + '</$text>';
				} else {
					string += child.data;
				}
			} else {
				string += child.printTree( 1 );
			}
		}

		string += '\n]';

		return string;
	} );

	sandbox.mock( ModelDocumentFragment.prototype, 'logTree', function() {
		logger.log( this.printTree() );
	} );

	sandbox.mock( Operation.prototype, 'log', function() {
		logger.log( this.toString() );
	} );

	sandbox.mock( AttributeOperation.prototype, 'toString', function() {
		return getClassName( this ) + `( ${ this.baseVersion } ): ` +
			`"${ this.key }": ${ JSON.stringify( this.oldValue ) } -> ${ JSON.stringify( this.newValue ) }, ${ this.range }`;
	} );

	sandbox.mock( DetachOperation.prototype, 'toString', function() {
		const range = ModelRange.createFromPositionAndShift( this.sourcePosition, this.howMany );
		const nodes = Array.from( range.getItems() );
		const nodeString = nodes.length > 1 ? `[ ${ nodes.length } ]` : nodes[ 0 ];

		return getClassName( this ) + `( ${ this.baseVersion } ): ${ nodeString } -> ${ range }`;
	} );

	sandbox.mock( InsertOperation.prototype, 'toString', function() {
		const nodeString = this.nodes.length > 1 ? `[ ${ this.nodes.length } ]` : this.nodes.getNode( 0 );

		return getClassName( this ) + `( ${ this.baseVersion } ): ${ nodeString } -> ${ this.position }`;
	} );

	sandbox.mock( MarkerOperation.prototype, 'toString', function() {
		return getClassName( this ) + `( ${ this.baseVersion } ): ` +
			`"${ this.name }": ${ this.oldRange } -> ${ this.newRange }`;
	} );

	sandbox.mock( MoveOperation.prototype, 'toString', function() {
		const range = ModelRange.createFromPositionAndShift( this.sourcePosition, this.howMany );

		return getClassName( this ) + `( ${ this.baseVersion } ): ` +
			`${ range } -> ${ this.targetPosition }${ this.isSticky ? ' (sticky)' : '' }`;
	} );

	sandbox.mock( NoOperation.prototype, 'toString', function() {
		return `NoOperation( ${ this.baseVersion } )`;
	} );

	sandbox.mock( RenameOperation.prototype, 'toString', function() {
		return getClassName( this ) + `( ${ this.baseVersion } ): ` +
			`${ this.position }: "${ this.oldName }" -> "${ this.newName }"`;
	} );

	sandbox.mock( RootAttributeOperation.prototype, 'toString', function() {
		return getClassName( this ) + `( ${ this.baseVersion } ): ` +
			`"${ this.key }": ${ JSON.stringify( this.oldValue ) } -> ${ JSON.stringify( this.newValue ) }, ${ this.root.rootName }`;
	} );

	sandbox.mock( Delta.prototype, 'log', function() {
		logger.log( this.toString() );
	} );

	sandbox.mock( Delta.prototype, 'logAll', function() {
		logger.log( '--------------------' );

		this.log();

		for ( const op of this.operations ) {
			op.log();
		}
	} );

	sandbox.mock( Delta.prototype, '_saveHistory', function( itemToSave ) {
		const history = itemToSave.before.history ? itemToSave.before.history : [];

		itemToSave.before = clone( itemToSave.before );
		delete itemToSave.before.history;
		itemToSave.before = JSON.stringify( itemToSave.before );

		itemToSave.transformedBy = clone( itemToSave.transformedBy );
		delete itemToSave.transformedBy.history;
		itemToSave.transformedBy = JSON.stringify( itemToSave.transformedBy );

		this.history = history.concat( itemToSave );
	} );

	const _deltaTransformTransform = deltaTransform.transform;

	sandbox.mock( deltaTransform, 'transform', function( a, b, context ) {
		let results;

		try {
			results = _deltaTransformTransform( a, b, context );
		} catch ( e ) {
			logger.error( 'Error during delta transformation!' );
			logger.error( a.toString() + ( context.isStrong ? ' (important)' : '' ) );
			logger.error( b.toString() + ( context.isStrong ? '' : ' (important)' ) );

			throw e;
		}

		for ( let i = 0; i < results.length; i++ ) {
			results[ i ]._saveHistory( {
				before: a,
				transformedBy: b,
				wasImportant: !!context.isStrong,
				resultIndex: i,
				resultsTotal: results.length
			} );
		}

		return results;
	} );

	sandbox.mock( AttributeDelta.prototype, 'toString', function() {
		return getClassName( this ) + `( ${ this.baseVersion } ): ` +
			`"${ this.key }": -> ${ JSON.stringify( this.value ) }, ${ this.range }, ${ this.operations.length } ops`;
	} );

	sandbox.mock( InsertDelta.prototype, 'toString', function() {
		const op = this._insertOperation;
		const nodeString = op.nodes.length > 1 ? `[ ${ op.nodes.length } ]` : op.nodes.getNode( 0 );

		return getClassName( this ) + `( ${ this.baseVersion } ): ${ nodeString } -> ${ op.position }`;
	} );

	sandbox.mock( MarkerDelta.prototype, 'toString', function() {
		const op = this.operations[ 0 ];

		return getClassName( this ) + `( ${ this.baseVersion } ): ` +
			`"${ op.name }": ${ op.oldRange } -> ${ op.newRange }`;
	} );

	sandbox.mock( MergeDelta.prototype, 'toString', function() {
		return getClassName( this ) + `( ${ this.baseVersion } ): ` +
			( this.position ?
				this.position.toString() :
				`(move from ${ this.operations[ 0 ].sourcePosition })`
			);
	} );

	sandbox.mock( MoveDelta.prototype, 'toString', function() {
		const opStrings = [];

		for ( const op of this.operations ) {
			const range = ModelRange.createFromPositionAndShift( op.sourcePosition, op.howMany );

			opStrings.push( `${ range } -> ${ op.targetPosition }` );
		}

		return getClassName( this ) + `( ${ this.baseVersion } ): ` +
			opStrings.join( '; ' );
	} );

	sandbox.mock( RenameDelta.prototype, 'toString', function() {
		const op = this.operations[ 0 ];

		return getClassName( this ) + `( ${ this.baseVersion } ): ` +
			`${ op.position }: "${ op.oldName }" -> "${ op.newName }"`;
	} );

	sandbox.mock( RootAttributeDelta.prototype, 'toString', function() {
		const op = this.operations[ 0 ];

		return getClassName( this ) + `( ${ this.baseVersion } ): ` +
			`"${ op.key }": ${ JSON.stringify( op.oldValue ) } -> ${ JSON.stringify( op.newValue ) }, ${ op.root.rootName }`;
	} );

	sandbox.mock( SplitDelta.prototype, 'toString', function() {
		return getClassName( this ) + `( ${ this.baseVersion } ): ` +
			( this.position ?
				this.position.toString() :
				`(clone to ${ this._cloneOperation.position || this._cloneOperation.targetPosition })`
			);
	} );

	sandbox.mock( UnwrapDelta.prototype, 'toString', function() {
		return getClassName( this ) + `( ${ this.baseVersion } ): ` +
			this.position.toString();
	} );

	sandbox.mock( WrapDelta.prototype, 'toString', function() {
		const wrapElement = this._insertOperation.nodes.getNode( 0 );

		return getClassName( this ) + `( ${ this.baseVersion } ): ` +
			`${ this.range } -> ${ wrapElement }`;
	} );

	sandbox.mock( ViewText.prototype, 'toString', function() {
		return `#${ this.data }`;
	} );

	sandbox.mock( ViewText.prototype, 'logExtended', function() {
		logger.log( 'ViewText: ' + this );
	} );

	sandbox.mock( ViewText.prototype, 'log', function() {
		logger.log( 'ViewText: ' + this );
	} );

	sandbox.mock( ViewTextProxy.prototype, 'toString', function() {
		return `#${ this.data }`;
	} );

	sandbox.mock( ViewTextProxy.prototype, 'logExtended', function() {
		logger.log( 'ViewTextProxy: ' + this );
	} );

	sandbox.mock( ViewTextProxy.prototype, 'log', function() {
		logger.log( 'ViewTextProxy: ' + this );
	} );

	sandbox.mock( ViewElement.prototype, 'printTree', function( level = 0 ) {
		let string = '';

		string += '\t'.repeat( level ) + `<${ this.name }${ mapToTags( this.getAttributes() ) }>`;

		for ( const child of this.getChildren() ) {
			if ( child.is( 'text' ) ) {
				string += '\n' + '\t'.repeat( level + 1 ) + child.data;
			} else {
				string += '\n' + child.printTree( level + 1 );
			}
		}

		if ( this.childCount ) {
			string += '\n' + '\t'.repeat( level );
		}

		string += `</${ this.name }>`;

		return string;
	} );

	sandbox.mock( ViewElement.prototype, 'logTree', function() {
		logger.log( this.printTree() );
	} );

	sandbox.mock( ViewDocumentFragment.prototype, 'printTree', function() {
		let string = 'ViewDocumentFragment: [';

		for ( const child of this.getChildren() ) {
			if ( child.is( 'text' ) ) {
				string += '\n' + '\t'.repeat( 1 ) + child.data;
			} else {
				string += '\n' + child.printTree( 1 );
			}
		}

		string += '\n]';

		return string;
	} );

	sandbox.mock( ViewDocumentFragment.prototype, 'logTree', function() {
		logger.log( this.printTree() );
	} );
}

function enableReplayerTools() {
	const _modelApplyOperation = Model.prototype.applyOperation;

	sandbox.mock( Model.prototype, 'applyOperation', function( operation ) {
		if ( !this._lastDelta ) {
			this._appliedDeltas = [];
		} else if ( this._lastDelta !== operation.delta ) {
			this._appliedDeltas.push( this._lastDelta.toJSON() );
		}

		this._lastDelta = operation.delta;

		return _modelApplyOperation.call( this, operation );
	} );

	sandbox.mock( Model.prototype, 'getAppliedDeltas', function() {
		// No deltas has been applied yet, return empty string.
		if ( !this._lastDelta ) {
			return '';
		}

		const appliedDeltas = this._appliedDeltas.concat( this._lastDelta );

		return appliedDeltas.map( JSON.stringify ).join( LOG_SEPARATOR );
	} );

	sandbox.mock( Model.prototype, 'createReplayer', function( stringifiedDeltas ) {
		return new DeltaReplayer( this, LOG_SEPARATOR, stringifiedDeltas );
	} );
}

function enableDocumentTools() {
	const _modelApplyOperation = Model.prototype.applyOperation;

	sandbox.mock( Model.prototype, 'applyOperation', function( operation ) {
		logger.log( 'Applying ' + operation );

		if ( !this._operationLogs ) {
			this._operationLogs = [];
		}

		this._operationLogs.push( JSON.stringify( operation.toJSON() ) );

		return _modelApplyOperation.call( this, operation );
	} );

	sandbox.mock( ModelDocument.prototype, 'log', function( version = null ) {
		version = version === null ? this.version : version;

		logDocument( this, version );
	} );

	sandbox.mock( ViewDocument.prototype, 'log', function( version ) {
		logDocument( this, version );
	} );

	sandbox.mock( Editor.prototype, 'logModel', function( version = null ) {
		version = version === null ? this.model.document.version : version;

		this.model.document.log( version );
	} );

	sandbox.mock( Editor.prototype, 'logView', function( version ) {
		this.editing.view.document.log( version );
	} );

	sandbox.mock( Editor.prototype, 'logDocuments', function( version = null ) {
		version = version === null ? this.model.document.version : version;

		this.logModel( version );
		this.logView( version );
	} );

	function logDocument( document, version ) {
		logger.log( '--------------------' );

		if ( document[ treeDump ][ version ] ) {
			logger.log( document[ treeDump ][ version ] );
		} else {
			logger.log( 'Tree log unavailable for given version: ' + version );
		}
	}
}

/**
 * Plugin that enables debugging features on the editor's model and view documents.
 */
class DebugPlugin extends Plugin {
	constructor( editor ) {
		super( editor );

		const model = this.editor.model;
		const modelDocument = model.document;
		const view = this.editor.editing.view;
		const viewDocument = view.document;

		modelDocument[ treeDump ] = [];
		viewDocument[ treeDump ] = [];

		dumpTrees( modelDocument, modelDocument.version );
		dumpTrees( viewDocument, modelDocument.version );

		model.on( 'applyOperation', () => {
			dumpTrees( modelDocument, modelDocument.version );
		}, { priority: 'lowest' } );

		model.document.on( 'change', () => {
			dumpTrees( viewDocument, modelDocument.version );
		}, { priority: 'lowest' } );
	}
}

// Helper function, stores the `document` state for a given `version` as a string in a private property.
function dumpTrees( document, version ) {
	let string = '';

	for ( const root of document.roots ) {
		string += root.printTree() + '\n';
	}

	document[ treeDump ][ version ] = string.substr( 0, string.length - 1 ); // Remove the last "\n".

	const overflow = document[ treeDump ].length - maxTreeDumpLength;

	if ( overflow > 0 ) {
		document[ treeDump ][ overflow - 1 ] = null;
	}
}

// Helper function, returns the class name of a given `Delta` or `Operation`.
// @param {module:engine/model/delta/delta~Delta|module:engine/model/operation/operation~Operation}
// @returns {String} Class name.
function getClassName( obj ) {
	const path = obj.constructor.className.split( '.' );

	return path[ path.length - 1 ];
}

// Helper function, converts a map to the {"key1":"value1","key2":"value2"} format.
// @param {Map} map Map to convert.
// @returns {String} Converted map.
function mapString( map ) {
	const obj = {};

	for ( const entry of map ) {
		obj[ entry[ 0 ] ] = entry[ 1 ];
	}

	return JSON.stringify( obj );
}

// Helper function, converts a map to the key1="value1" key2="value1" format.
// @param {Map} map Map to convert.
// @returns {String} Converted map.
function mapToTags( map ) {
	let string = '';

	for ( const entry of map ) {
		string += ` ${ entry[ 0 ] }=${ JSON.stringify( entry[ 1 ] ) }`;
	}

	return string;
}
