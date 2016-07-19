/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

// Deltas require `register` method that require `Batch` class and is defined in batch-base.js.
// We would like to group all deltas files in one place, so we would only have to include batch.js
// which would already have all default deltas registered.

// Import default suite of deltas so a feature have to include only Batch class file.
import d01 from './attributedelta.js';
import d02 from './insertdelta.js';
import d03 from './mergedelta.js';
import d04 from './movedelta.js';
import d05 from './removedelta.js';
import d06 from './renamedelta.js';
import d07 from './splitdelta.js';
import d08 from './unwrapdelta.js';
import d09 from './weakinsertdelta.js';
import d10 from './wrapdelta.js';
/*jshint unused: false*/
