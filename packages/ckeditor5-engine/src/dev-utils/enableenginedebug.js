/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
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
import InsertOperation from '../model/operation/insertoperation';
import MarkerOperation from '../model/operation/markeroperation';
import MoveOperation from '../model/operation/moveoperation';
import NoOperation from '../model/operation/nooperation';
import RenameOperation from '../model/operation/renameoperation';
import RootAttributeOperation from '../model/operation/rootattributeoperation';
import Delta from '../model/delta/delta';
import AttributeDelta from '../model/delta/attributedelta';
import { RootAttributeDelta } from '../model/delta/attributedelta';
import InsertDelta from '../model/delta/insertdelta';
import MarkerDelta from '../model/delta/markerdelta';
import MergeDelta from '../model/delta/mergedelta';
import MoveDelta from '../model/delta/movedelta';
import RenameDelta from '../model/delta/renamedelta';
import SplitDelta from '../model/delta/splitdelta';
import UnwrapDelta from '../model/delta/unwrapdelta';
import WrapDelta from '../model/delta/wrapdelta';
import deltaTransform from '../model/delta/transform';
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

const treeDump = Symbol( '_treeDump' );

// Maximum number of stored states of model and view document.
const maxTreeDumpLength = 20;

// Separator used to separate stringified deltas
const LOG_SEPARATOR = '-------';

// Specified whether debug tools were already enabled.
let enabled = false;

// Logging function used to log debug messages.
let log = console.log;

/**
 * Enhances model classes with logging methods. Returns a plugin that should be loaded in the editor to
 * enable debugging features.
 *
 * Every operation applied on {@link module:engine/model/document~Document model.Document} is logged.
 *
 * Following classes are expanded with `log` and meaningful `toString` methods:
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
 * Additionally, following logging utility methods are added:
 * * {@link module:engine/model/text~Text model.Text} `logExtended`,
 * * {@link module:engine/model/element~Element model.Element} `logExtended`,
 * * {@link module:engine/model/element~Element model.Element} `logAll`,
 * * {@link module:engine/model/delta/delta~Delta model.Delta} `logAll`.
 *
 * Additionally, following classes are expanded with `logTree` and `printTree` methods:
 * * {@link module:engine/model/element~Element model.Element},
 * * {@link module:engine/model/documentfragment~DocumentFragment model.DocumentFragment},
 * * {@link module:engine/view/element~Element view.Element},
 * * {@link module:engine/view/documentfragment~DocumentFragment view.DocumentFragment}.
 *
 * Finally, following methods are added to {@link module:core/editor/editor~Editor}: `logModel`, `logView`, `logDocuments`.
 * All those methods take one parameter, which is a version of {@link module:engine/model/document~Document model document}
 * for which model or view document state should be logged.
 *
 * @param {Function} [logger] Function used to log messages. By default messages are logged to console.
 * @returns {module:engine/dev-utils/enableenginedebug~DebugPlugin} Plugin to be loaded in the editor.
 */
export default function enableEngineDebug( logger ) {
	if ( logger ) {
		log = logger;
	}

	if ( !enabled ) {
		enabled = true;

		enableLoggingTools();
		enableDocumentTools();
		enableReplayerTools();
	}

	return DebugPlugin;
}

function enableLoggingTools() {
	ModelPosition.prototype.toString = function() {
		return `${ this.root } [ ${ this.path.join( ', ' ) } ]`;
	};

	ModelPosition.prototype.log = function() {
		log( 'ModelPosition: ' + this );
	};

	ModelRange.prototype.toString = function() {
		return `${ this.root } [ ${ this.start.path.join( ', ' ) } ] - [ ${ this.end.path.join( ', ' ) } ]`;
	};

	ModelRange.prototype.log = function() {
		log( 'ModelRange: ' + this );
	};

	ModelText.prototype.toString = function() {
		return `#${ this.data }`;
	};

	ModelText.prototype.logExtended = function() {
		log( `ModelText: ${ this }, attrs: ${ mapString( this.getAttributes() ) }` );
	};

	ModelText.prototype.log = function() {
		log( 'ModelText: ' + this );
	};

	ModelTextProxy.prototype.toString = function() {
		return `#${ this.data }`;
	};

	ModelTextProxy.prototype.logExtended = function() {
		log( `ModelTextProxy: ${ this }, attrs: ${ mapString( this.getAttributes() ) }` );
	};

	ModelTextProxy.prototype.log = function() {
		log( 'ModelTextProxy: ' + this );
	};

	ModelElement.prototype.toString = function() {
		return `<${ this.rootName || this.name }>`;
	};

	ModelElement.prototype.log = function() {
		log( 'ModelElement: ' + this );
	};

	ModelElement.prototype.logExtended = function() {
		log( `ModelElement: ${ this }, ${ this.childCount } children, attrs: ${ mapString( this.getAttributes() ) }` );
	};

	ModelElement.prototype.logAll = function() {
		log( '--------------------' );

		this.logExtended();
		log( 'List of children:' );

		for ( let child of this.getChildren() ) {
			child.log();
		}
	};

	ModelElement.prototype.printTree = function( level = 0 ) {
		let string = '';

		string += '\t'.repeat( level ) + `<${ this.rootName || this.name }${ mapToTags( this.getAttributes() ) }>`;

		for ( let child of this.getChildren() ) {
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
	};

	ModelElement.prototype.logTree = function() {
		log( this.printTree() );
	};

	ModelRootElement.prototype.toString = function() {
		return this.rootName;
	};

	ModelRootElement.prototype.log = function() {
		log( 'ModelRootElement: ' + this );
	};

	ModelDocumentFragment.prototype.toString = function() {
		return `documentFragment`;
	};

	ModelDocumentFragment.prototype.log = function() {
		log( 'ModelDocumentFragment: ' + this );
	};

	ModelDocumentFragment.prototype.printTree = function() {
		let string = 'ModelDocumentFragment: [';

		for ( let child of this.getChildren() ) {
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
	};

	ModelDocumentFragment.prototype.logTree = function() {
		log( this.printTree() );
	};

	Operation.prototype.log = function() {
		log( this.toString() );
	};

	AttributeOperation.prototype.toString = function() {
		return getClassName( this ) + `( ${ this.baseVersion } ): ` +
			`"${ this.key }": ${ JSON.stringify( this.oldValue ) } -> ${ JSON.stringify( this.newValue ) }, ${ this.range }`;
	};

	InsertOperation.prototype.toString = function() {
		return getClassName( this ) + `( ${ this.baseVersion } ): ` +
			`[ ${ this.nodes.length } ] -> ${ this.position }`;
	};

	MarkerOperation.prototype.toString = function() {
		return getClassName( this ) + `( ${ this.baseVersion } ): ` +
			`"${ this.name }": ${ this.oldRange } -> ${ this.newRange }`;
	};

	MoveOperation.prototype.toString = function() {
		const range = ModelRange.createFromPositionAndShift( this.sourcePosition, this.howMany );

		return getClassName( this ) + `( ${ this.baseVersion } ): ` +
			`${ range } -> ${ this.targetPosition }`;
	};

	NoOperation.prototype.toString = function() {
		return `NoOperation( ${ this.baseVersion } )`;
	};

	RenameOperation.prototype.toString = function() {
		return getClassName( this ) + `( ${ this.baseVersion } ): ` +
			`${ this.position }: "${ this.oldName }" -> "${ this.newName }"`;
	};

	RootAttributeOperation.prototype.toString = function() {
		return getClassName( this ) + `( ${ this.baseVersion } ): ` +
			`"${ this.key }": ${ JSON.stringify( this.oldValue ) } -> ${ JSON.stringify( this.newValue ) }, ${ this.root.rootName }`;
	};

	Delta.prototype.log = function() {
		log( this.toString() );
	};

	Delta.prototype.logAll = function() {
		log( '--------------------' );

		this.log();

		for ( let op of this.operations ) {
			op.log();
		}
	};

	Delta.prototype._saveHistory = function( itemToSave ) {
		const history = itemToSave.before.history ? itemToSave.before.history : [];

		itemToSave.before = clone( itemToSave.before );
		delete itemToSave.before.history;
		itemToSave.before = JSON.stringify( itemToSave.before );

		itemToSave.transformedBy = clone( itemToSave.transformedBy );
		delete itemToSave.transformedBy.history;
		itemToSave.transformedBy = JSON.stringify( itemToSave.transformedBy );

		this.history = history.concat( itemToSave );
	};

	const _deltaTransformTransform = deltaTransform.transform;

	deltaTransform.transform = function( a, b, isAMoreImportantThanB ) {
		const results = _deltaTransformTransform( a, b, isAMoreImportantThanB );

		for ( let i = 0; i < results.length; i++ ) {
			results[ i ]._saveHistory( {
				before: a,
				transformedBy: b,
				wasImportant: !!isAMoreImportantThanB,
				resultIndex: i,
				resultsTotal: results.length
			} );
		}

		return results;
	};

	AttributeDelta.prototype.toString = function() {
		return getClassName( this ) + `( ${ this.baseVersion } ): ` +
			`"${ this.key }": -> ${ JSON.stringify( this.value ) }, ${ this.range }, ${ this.operations.length } ops`;
	};

	InsertDelta.prototype.toString = function() {
		const op = this._insertOperation;

		return getClassName( this ) + `( ${ this.baseVersion } ): ` +
			`[ ${ op.nodes.length } ] -> ${ op.position }`;
	};

	MarkerDelta.prototype.toString = function() {
		const op = this.operations[ 0 ];

		return getClassName( this ) + `( ${ this.baseVersion } ): ` +
			`"${ op.name }": ${ op.oldRange } -> ${ op.newRange }`;
	};

	MergeDelta.prototype.toString = function() {
		return getClassName( this ) + `( ${ this.baseVersion } ): ` +
			this.position.toString();
	};

	MoveDelta.prototype.toString = function() {
		const opStrings = [];

		for ( let op of this.operations ) {
			const range = ModelRange.createFromPositionAndShift( op.sourcePosition, op.howMany );

			opStrings.push( `${ range } -> ${ op.targetPosition }` );
		}

		return getClassName( this ) + `( ${ this.baseVersion } ): ` +
			opStrings.join( '; ' );
	};

	RenameDelta.prototype.toString = function() {
		const op = this.operations[ 0 ];

		return getClassName( this ) + `( ${ this.baseVersion } ): ` +
			`${ op.position }: "${ op.oldName }" -> "${ op.newName }"`;
	};

	RootAttributeDelta.prototype.toString = function() {
		const op = this.operations[ 0 ];

		return getClassName( this ) + `( ${ this.baseVersion } ): ` +
			`"${ op.key }": ${ JSON.stringify( op.oldValue ) } -> ${ JSON.stringify( op.newValue ) }, ${ op.root.rootName }`;
	};

	SplitDelta.prototype.toString = function() {
		return getClassName( this ) + `( ${ this.baseVersion } ): ` +
			this.position.toString();
	};

	UnwrapDelta.prototype.toString = function() {
		return getClassName( this ) + `( ${ this.baseVersion } ): ` +
			this.position.toString();
	};

	WrapDelta.prototype.toString = function() {
		const wrapElement = this._insertOperation.nodes.getNode( 0 );

		return getClassName( this ) + `( ${ this.baseVersion } ): ` +
			`${ this.range } -> ${ wrapElement }`;
	};

	ViewText.prototype.toString = function() {
		return `#${ this.data }`;
	};

	ViewText.prototype.logExtended = function() {
		log( 'ViewText: ' + this );
	};

	ViewText.prototype.log = function() {
		log( 'ViewText: ' + this );
	};

	ViewTextProxy.prototype.toString = function() {
		return `#${ this.data }`;
	};

	ViewTextProxy.prototype.logExtended = function() {
		log( 'ViewTextProxy: ' + this );
	};

	ViewTextProxy.prototype.log = function() {
		log( 'ViewTextProxy: ' + this );
	};

	ViewElement.prototype.printTree = function( level = 0 ) {
		let string = '';

		string += '\t'.repeat( level ) + `<${ this.name }${ mapToTags( this.getAttributes() ) }>`;

		for ( let child of this.getChildren() ) {
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
	};

	ViewElement.prototype.logTree = function() {
		log( this.printTree() );
	};

	ViewDocumentFragment.prototype.printTree = function() {
		let string = 'ViewDocumentFragment: [';

		for ( let child of this.getChildren() ) {
			if ( child.is( 'text' ) ) {
				string += '\n' + '\t'.repeat( 1 ) + child.data;
			} else {
				string += '\n' + child.printTree( 1 );
			}
		}

		string += '\n]';

		return string;
	};

	ViewDocumentFragment.prototype.logTree = function() {
		log( this.printTree() );
	};
}

function enableReplayerTools() {
	const _modelDocumentApplyOperation = ModelDocument.prototype.applyOperation;

	ModelDocument.prototype.applyOperation = function( operation ) {
		if ( !this._lastDelta ) {
			this._appliedDeltas = [];
		} else if ( this._lastDelta !== operation.delta ) {
			this._appliedDeltas.push( this._lastDelta.toJSON() );
		}

		this._lastDelta = operation.delta;

		_modelDocumentApplyOperation.call( this, operation );
	};

	ModelDocument.prototype.getAppliedDeltas = function() {
		// No deltas has been applied yet, return empty string.
		if ( !this._lastDelta ) {
			return '';
		}

		const appliedDeltas = this._appliedDeltas.concat( this._lastDelta.toJSON() );

		return appliedDeltas.map( JSON.stringify ).join( LOG_SEPARATOR );
	};

	ModelDocument.prototype.createReplayer = function( stringifiedDeltas ) {
		return new DeltaReplayer( this, LOG_SEPARATOR, stringifiedDeltas );
	};
}

function enableDocumentTools() {
	const _modelDocumentApplyOperation = ModelDocument.prototype.applyOperation;

	ModelDocument.prototype.applyOperation = function( operation ) {
		log( 'Applying ' + operation );

		if ( !this._operationLogs ) {
			this._operationLogs = [];
		}

		this._operationLogs.push( JSON.stringify( operation.toJSON() ) );

		_modelDocumentApplyOperation.call( this, operation );
	};

	ModelDocument.prototype.log = function( version = null ) {
		version = version === null ? this.version : version;

		logDocument( this, version );
	};

	ViewDocument.prototype.log = function( version ) {
		logDocument( this, version );
	};

	Editor.prototype.logModel = function( version = null ) {
		version = version === null ? this.document.version : version;

		this.document.log( version );
	};

	Editor.prototype.logView = function( version ) {
		this.editing.view.log( version );
	};

	Editor.prototype.logDocuments = function( version = null ) {
		version = version === null ? this.document.version : version;

		this.logModel( version );
		this.logView( version );
	};

	function logDocument( document, version ) {
		log( '--------------------' );

		if ( document[ treeDump ][ version ] ) {
			log( document[ treeDump ][ version ] );
		} else {
			log( 'Tree log unavailable for given version: ' + version );
		}
	}
}

/**
 * Plugin that enables debugging features on the editor's model and view documents.
 */
class DebugPlugin extends Plugin {
	constructor( editor ) {
		super( editor );

		const modelDocument = this.editor.document;
		const viewDocument = this.editor.editing.view;

		modelDocument[ treeDump ] = [];
		viewDocument[ treeDump ] = [];

		dumpTrees( modelDocument, modelDocument.version );
		dumpTrees( viewDocument, modelDocument.version );

		modelDocument.on( 'change', () => {
			dumpTrees( modelDocument, modelDocument.version );
			dumpTrees( viewDocument, modelDocument.version );
		}, { priority: 'lowest' } );
	}
}

// Helper function, stores `document` state for given `version` as a string in private property.
function dumpTrees( document, version ) {
	let string = '';

	for ( let root of document.roots.values() ) {
		string += root.printTree() + '\n';
	}

	document[ treeDump ][ version ] = string.substr( 0, string.length - 1 ); // Remove the last "\n".

	const overflow = document[ treeDump ].length - maxTreeDumpLength;

	if ( overflow > 0 ) {
		document[ treeDump ][ overflow - 1 ] = null;
	}
}

// Helper function, returns class name of given `Delta` or `Operation`.
// @param {module:engine/model/delta/delta~Delta|module:engine/model/operation/operation~Operation}
// @returns {String} Class name.
function getClassName( obj ) {
	const path = obj.constructor.className.split( '.' );

	return path[ path.length - 1 ];
}

// Helper function, converts map to {"key1":"value1","key2":"value2"} format.
// @param {Map} map Map to convert.
// @returns {String} Converted map.
function mapString( map ) {
	const obj = {};

	for ( let entry of map ) {
		obj[ entry[ 0 ] ] = entry[ 1 ];
	}

	return JSON.stringify( obj );
}

// Helper function, converts map to key1="value1" key2="value1" format.
// @param {Map} map Map to convert.
// @returns {String} Converted map.
function mapToTags( map ) {
	let string = '';

	for ( let entry of map ) {
		string += ` ${ entry[ 0 ] }=${ JSON.stringify( entry[ 1 ] ) }`;
	}

	return string;
}
