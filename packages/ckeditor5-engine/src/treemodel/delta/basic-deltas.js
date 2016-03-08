/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

// Deltas require `register` method that require `Batch` class and is defined in batch-base.js.
// We would like to group all deltas files in one place, so we would only have to include batch.js
// which would already have all default deltas registered.

// Import default suite of deltas so a feature have to include only Batch class file.
import d1 from './insertdelta.js';
import d2 from './weakinsertdelta.js';
import d3 from './movedelta.js';
import d4 from './removedelta.js';
import d5 from './attributedelta.js';
import d6 from './splitdelta.js';
import d7 from './mergedelta.js';
import d8 from './wrapdelta.js';
import d9 from './unwrapdelta.js';
/*jshint unused: false*/