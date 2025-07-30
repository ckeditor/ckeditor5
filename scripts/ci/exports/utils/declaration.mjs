/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { isInternalNode } from './misc.mjs';

/**
 * Describes a declared class, type, interface, function, etc.
 */
export class Declaration {
	constructor( {
		localName,
		type,
		internal,
		fileName,
		lineNumber,
		baseClasses = []
	} ) {
		this.localName = localName;
		this.type = type;
		this.references = []; // At start it is populated with names as string, later replaced with declarations while resolving.

		this.internal = internal;

		this.fileName = fileName;
		this.lineNumber = lineNumber;
		this.baseClasses = baseClasses;
	}

	static create( { localName, type, internal, node, baseClasses = [] } ) {
		return new Declaration( {
			localName,
			type: Declaration.declarationTypes[ type ] || type,
			internal: internal || isInternalNode( node ),
			fileName: node.loc.filename,
			lineNumber: node.loc.start.line,
			baseClasses
		} );
	}

	// Add type as related as it is used by this declaration (for example as super class, type of property, function argument type, etc.).
	addReference( reference, ignoreTypeParameters ) {
		let referenceName;

		if ( typeof reference === 'string' ) {
			referenceName = reference;
		}
		else if ( reference.type === 'Identifier' ) {
			referenceName = reference.name;
		}
		else if ( reference.type === 'TSQualifiedName' ) {
			if ( reference.left.name === 'globalThis' ) {
				referenceName = reference.right.name;
				this.referenceGlobalThisProperty = true;
			}
			else {
				referenceName = reference.left.name;
			}
		}
		else {
			throw new Error( 'Unknown reference type: ' + reference.type );
		}

		if ( !ignoreTypeParameters.includes( referenceName ) ) {
			this.references.push( referenceName );
		}

		return this;
	}

	static declarationTypes = {
		ClassDeclaration: 'class',
		FunctionDeclaration: 'function',
		TSDeclareFunction: 'function',
		TSInterfaceDeclaration: 'interface',
		TSTypeAliasDeclaration: 'type'
	};
}
