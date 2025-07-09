#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* eslint-env node */

import { ExternalModule } from './externalmodule.mjs';

// Describes the import declaration.
export class Import {
	constructor( {
		name,
		localName,
		importKind,
		fileName,
		lineNumber,
		importFrom
	} ) {
		this.name = name;
		this.localName = localName;
		this.importKind = importKind;

		this.fileName = fileName;
		this.lineNumber = lineNumber;

		this.importFrom = importFrom; // First a string, later replaces with module while resolving.
		this.references = null;
	}

	resolveImport( otherModule ) {
		this.importFrom = otherModule;

		// Case of `import * as x from y`, The `import * from y` is not valid TS.
		if ( this.name === '*' && !( otherModule instanceof ExternalModule ) ) {
			throw new Error( 'import * as abc from ... is not supported' );
		} else {
			return [ this ];
		}
	}

	static create( { name, localName, importKind, importFrom, node, fileName } ) {
		return new Import( {
			name,
			localName,
			importKind: node.importKind === 'type' ? 'type' : importKind || node.importKind,
			fileName,
			lineNumber: node.loc.start.line,
			importFrom
		} );
	}
}
