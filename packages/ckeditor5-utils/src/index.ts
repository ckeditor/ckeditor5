/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/index
 */

export { env } from './env.js';
export { diff, type DiffResult } from './diff.js';
export { fastDiff } from './fastdiff.js';
export { diffToChanges } from './difftochanges.js';

export type { Constructor, Mixed } from './mix.js';

export {
	EmitterMixin,
	type Emitter,
	type BaseEvent,
	type CallbackOptions,
	type EmitterMixinDelegateChain,
	type GetCallback,
	type GetCallbackOptions,
	type GetEventInfo,
	type GetNameOrEventInfo
} from './emittermixin.js';

export { EventInfo } from './eventinfo.js';

export {
	ObservableMixin,
	type Observable,
	type DecoratedMethodEvent,
	type ObservableChangeEvent,
	type ObservableSetEvent
} from './observablemixin.js';

export { CKEditorError, logError, logWarning } from './ckeditorerror.js';

export { ElementReplacer } from './elementreplacer.js';
export { abortableDebounce, type AbortableFunc } from './abortabledebounce.js';
export { count } from './count.js';
export { compareArrays } from './comparearrays.js';
export { createElement } from './dom/createelement.js';
export { Config, type GetSubConfig } from './config.js';
export { isIterable } from './isiterable.js';
export { DomEmitterMixin, type DomEmitter } from './dom/emittermixin.js';
export { findClosestScrollableAncestor } from './dom/findclosestscrollableancestor.js';
export { global } from './dom/global.js';
export { getAncestors } from './dom/getancestors.js';
export { getDataFromElement } from './dom/getdatafromelement.js';
export { getBorderWidths } from './dom/getborderwidths.js';
export { getRangeFromMouseEvent } from './dom/getrangefrommouseevent.js';
export { isText } from './dom/istext.js';
export { Rect, type RectSource } from './dom/rect.js';
export { ResizeObserver } from './dom/resizeobserver.js';
export { setDataInElement } from './dom/setdatainelement.js';
export { toUnit } from './dom/tounit.js';
export { indexOf } from './dom/indexof.js';
export { insertAt } from './dom/insertat.js';
export { isComment } from './dom/iscomment.js';
export { isNode } from './dom/isnode.js';
export { isRange } from './dom/isrange.js';
export { isValidAttributeName } from './dom/isvalidattributename.js';
export { isVisible } from './dom/isvisible.js';
export { getOptimalPosition, type Options as PositionOptions, type PositioningFunction, type DomPoint } from './dom/position.js';
export { remove } from './dom/remove.js';
export { getVisualViewportOffset } from './dom/getvisualviewportoffset.js';
export * from './dom/scroll.js';

export * from './keyboard.js';
export * from './language.js';
export { Locale, type LocaleTranslate, type Translations } from './locale.js';
export {
	Collection,
	type CollectionAddEvent,
	type CollectionChangeEvent,
	type CollectionRemoveEvent
} from './collection.js';
export { first } from './first.js';
export { FocusTracker, type ViewWithFocusTracker, isViewWithFocusTracker } from './focustracker.js';
export { KeystrokeHandler, type KeystrokeHandlerOptions } from './keystrokehandler.js';
export { toArray, type ArrayOrItem, type ReadonlyArrayOrItem } from './toarray.js';
export { toMap } from './tomap.js';
export { add } from './translation-service.js';
export { priorities, type PriorityString } from './priorities.js';
export { retry, exponentialDelay } from './retry.js';
export { insertToPriorityArray } from './inserttopriorityarray.js';
export { spliceArray } from './splicearray.js';

export { uid } from './uid.js';
export { delay, type DelayedFunc } from './delay.js';
export { wait } from './wait.js';
export { parseBase64EncodedObject } from './parsebase64encodedobject.js';
export { crc32, type CRCData } from './crc32.js';
export { collectStylesheets } from './collectstylesheets.js';
export { formatHtml } from './formathtml.js';

export * from './unicode.js';

export { version, releaseDate } from './version.js';
