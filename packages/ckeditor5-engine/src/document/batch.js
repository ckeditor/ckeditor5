/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

// All deltas need to be loaded so they can register themselves as Batch methods.
//
// To solve circular dependencies (deltas need to require Batch class), Batch class body is moved
// to document/delta/batch-base.
CKEDITOR.define( [
	'document/delta/batch-base',
	'document/delta/insertdelta',
	'document/delta/removedelta',
	'document/delta/attributedelta',
	'document/delta/splitdelta',
	'document/delta/mergedelta'
], ( Batch ) => {
	return Batch;
} );
