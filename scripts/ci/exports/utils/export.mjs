#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { isInternalNode } from './misc.mjs';

/**
 * Describes an export declaration.
 */
export class Export {
	constructor( {
		name,
		localName,
		exportKind,
		fileName,
		lineNumber,
		type,
		internal,
		importFrom
	} ) {
		this.name = name;
		this.localName = localName;
		this.exportKind = exportKind;

		this.fileName = fileName;
		this.lineNumber = lineNumber;

		this.type = type;
		this.internal = internal;
		this.importFrom = importFrom; // First string, then replaces with module while resolving.

		this.references = null; // First string, then replaces with item declaration/import/export while resolving.
		this.reExported = []; // Array of { name: string, kind: string } objects.
	}

	resolveImport( otherModule ) {
		this.importFrom = otherModule;

		if ( this.name === '*' ) {
			return otherModule.exports.map( item => (
				new Export( {
					name: item.name,
					localName: item.localName,
					exportKind: item.exportKind,
					internal: item.internal,

					fileName: this.fileName,
					lineNumber: this.lineNumber,
					type: this.type,
					importFrom: this.importFrom
				} )
			) );
		} else {
			return [ this ];
		}
	}

	static create( { name, localName, exportKind, type, importFrom, node, fileName } ) {
		return new Export( {
			name,
			localName,
			exportKind: exportKind || node.exportKind,
			fileName, // TODO fileName: node.loc.filename,
			lineNumber: node.loc.start.line,
			type: Export._getType( node, type ),
			internal: isInternalNode( node ),
			importFrom
		} );
	}

	static _getType( node, type ) {
		if ( node.leadingComments ) {
			for ( const comment of node.leadingComments ) {
				if ( comment.value.includes( '@eventName' ) ) {
					return 'event';
				}
			}
		}

		if ( !node.declaration && node.source ) {
			return 're-export';
		}

		if ( node.declaration ) {
			const detail = Export.DECLARATION_TYPES[ node.declaration.type ];

			if ( !detail ) {
				throw new Error( 'Unknown export declaration type' );
			}

			return detail;
		}

		if ( type ) {
			return type;
		}

		throw new Error( 'Unknown export type' );
	}

	static DECLARATION_TYPES = {
		VariableDeclaration: 'variable',
		FunctionDeclaration: 'function',
		ClassDeclaration: 'class',
		ObjectExpression: 'object',
		Identifier: 'identifier',
		TSTypeAliasDeclaration: 'type',
		TSInterfaceDeclaration: 'interface',
		TSEnumDeclaration: 'enum'
	};
}
