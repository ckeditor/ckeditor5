/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils
 */

export { default as env } from './env';
export { default as diff } from './diff';
export { default as fastDiff } from './fastdiff';

export { default as mix } from './mix';
export { default as EmitterMixin } from './emittermixin';
export { default as ObservableMixin } from './observablemixin';

export { default as CKEditorError, logError, logWarning } from './ckeditorerror';

export { default as ElementReplacer } from './elementreplacer';
export { default as Locale } from './locale';
export { default as Config } from './config';

export { default as createElement } from './dom/createelement';
export { default as DomEmitterMixin } from './dom/emittermixin';
export { default as global } from './dom/global';
export { default as isRange } from './dom/isrange';
export { default as getDataFromElement } from './dom/getdatafromelement';
export { default as Rect } from './dom/rect';
export { default as ResizeObserver } from './dom/resizeobserver';
export { default as setDataInElement } from './dom/setdatainelement';
export { default as isText } from './dom/istext';
export { default as isNode } from './dom/isnode';
export { default as toUnit } from './dom/tounit';
export { default as insertAt } from './dom/insertat';
export { default as remove } from './dom/remove';
export { default as getCommonAncestor } from './dom/getcommonancestor';
export { default as getAncestors } from './dom/getancestors';
export { default as indexOf } from './dom/indexof';
export { getOptimalPosition } from './dom/position';
export * from './dom/scroll';

export * from './keyboard';
export * from './unicode';

export { default as count } from './count';
export { default as isIterable } from './isiterable';
export { default as Collection } from './collection';
export { default as first } from './first';
export { default as FocusTracker } from './focustracker';
export { default as KeystrokeHandler } from './keystrokehandler';
export { default as toArray } from './toarray';
export { default as toMap } from './tomap';
export { default as priorities } from './priorities';

export { default as uid } from './uid';
export { default as version } from './version';
export { default as compareArrays } from './comparearrays';
