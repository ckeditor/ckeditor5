/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import { isProcessingInstruction } from '../../src/dom/isprocessinginstruction.js';

describe( 'isProcessingInstruction()', () => {
	it( 'should return true for a processing instruction node', () => {
		expect( isProcessingInstruction( document.createProcessingInstruction( 'foo', 'bar' ) ) ).toBe( true );
	} );

	it( 'should return true for a processing instruction with empty data', () => {
		expect( isProcessingInstruction( document.createProcessingInstruction( 'foo', '' ) ) ).toBe( true );
	} );

	it( 'should return true for a processing instruction parsed from an XML document', () => {
		const xmlDocument = new DOMParser().parseFromString( '<root><?foo bar?></root>', 'text/xml' );

		expect( isProcessingInstruction( xmlDocument.documentElement.firstChild ) ).toBe( true );
	} );

	it( 'should return false for an element', () => {
		expect( isProcessingInstruction( document.createElement( 'p' ) ) ).toBe( false );
	} );

	it( 'should return false for a text node', () => {
		expect( isProcessingInstruction( document.createTextNode( 'foo' ) ) ).toBe( false );
	} );

	it( 'should return false for a comment node', () => {
		// Engines that do not parse processing instructions in HTML produce a comment for the very
		// same input, so telling the two apart is the whole point of this check.
		expect( isProcessingInstruction( document.createComment( 'foo' ) ) ).toBe( false );
	} );

	it( 'should return false for a document fragment', () => {
		expect( isProcessingInstruction( document.createDocumentFragment() ) ).toBe( false );
	} );

	it( 'should return false for a document', () => {
		expect( isProcessingInstruction( document ) ).toBe( false );
	} );

	it( 'should return false for a window', () => {
		expect( isProcessingInstruction( window ) ).toBe( false );
	} );

	it( 'should return false for an object without a matching node type', () => {
		expect( isProcessingInstruction( {} ) ).toBe( false );
		expect( isProcessingInstruction( { nodeType: Node.COMMENT_NODE } ) ).toBe( false );
		expect( isProcessingInstruction( 'foo' ) ).toBe( false );
		expect( isProcessingInstruction( 42 ) ).toBe( false );
	} );

	it( 'should return true for a plain object with a matching node type', () => {
		// The check is duck-typed on purpose - it does not verify the prototype.
		expect( isProcessingInstruction( { nodeType: Node.PROCESSING_INSTRUCTION_NODE } ) ).toBe( true );
	} );

	it( 'should return a falsy value for nullish and other falsy arguments', () => {
		// Note: the function short-circuits, so it returns the argument itself rather than `false`.
		expect( isProcessingInstruction( null ) ).toBeFalsy();
		expect( isProcessingInstruction( undefined ) ).toBeFalsy();
		expect( isProcessingInstruction() ).toBeFalsy();
		expect( isProcessingInstruction( 0 ) ).toBeFalsy();
		expect( isProcessingInstruction( '' ) ).toBeFalsy();
	} );
} );
