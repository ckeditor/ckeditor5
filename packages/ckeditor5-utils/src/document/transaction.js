/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

// All deltas need to be loaded so they can register themselves as transaction methods.
//
// To solve circular dependencies (deltas need to require transaction class), transaction class body is moved
// to document/delta/transaction-base.
CKEDITOR.define( [
	'document/delta/transaction-base',
	'document/delta/insertdelta',
	'document/delta/removedelta',
	'document/delta/changedelta',
	'document/delta/splitdelta',
	'document/delta/mergedelta'
], ( Transaction ) => {
	return Transaction;
} );