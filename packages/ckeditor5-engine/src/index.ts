/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine
 */

export * from './view/placeholder.js';

// Controller.
export { default as EditingController } from './controller/editingcontroller.js';
export {
	default as DataController,
	type DataControllerInitEvent,
	type DataControllerSetEvent,
	type DataControllerToModelEvent,
	type DataControllerToViewEvent
} from './controller/datacontroller.js';

// Conversion.
export { default as Conversion } from './conversion/conversion.js';
export type {
	default as DowncastDispatcher,
	DowncastAddMarkerEvent,
	DowncastAttributeEvent,
	DowncastConversionApi,
	DowncastInsertEvent,
	DowncastRemoveEvent,
	DowncastRemoveMarkerEvent,
	DowncastSelectionEvent
} from './conversion/downcastdispatcher.js';
export type {
	default as UpcastDispatcher,
	UpcastConversionApi,
	UpcastConversionData,
	UpcastElementEvent,
	UpcastTextEvent
} from './conversion/upcastdispatcher.js';
export type {
	AddHighlightCallback,
	AttributeDescriptor,
	ElementCreatorFunction,
	HighlightDescriptor,
	RemoveHighlightCallback,
	MarkerElementCreatorFunction,
	SlotFilter
} from './conversion/downcasthelpers.js';
export type {
	default as Mapper,
	MapperModelToViewPositionEvent,
	MapperViewToModelPositionEvent
} from './conversion/mapper.js';
export type { default as ModelConsumable } from './conversion/modelconsumable.js';
export type { Consumables, default as ViewConsumable } from './conversion/viewconsumable.js';

// DataProcessor.
export type { default as DataProcessor } from './dataprocessor/dataprocessor.js';
export { default as HtmlDataProcessor } from './dataprocessor/htmldataprocessor.js';
export { default as XmlDataProcessor } from './dataprocessor/xmldataprocessor.js';

// Model / Operation.
export type { default as Operation } from './model/operation/operation.js';
export { default as InsertOperation } from './model/operation/insertoperation.js';
export { default as MoveOperation } from './model/operation/moveoperation.js';
export { default as MergeOperation } from './model/operation/mergeoperation.js';
export { default as SplitOperation } from './model/operation/splitoperation.js';
export { default as MarkerOperation } from './model/operation/markeroperation.js';
export { default as OperationFactory } from './model/operation/operationfactory.js';
export { default as AttributeOperation } from './model/operation/attributeoperation.js';
export { default as RenameOperation } from './model/operation/renameoperation.js';
export { default as RootAttributeOperation } from './model/operation/rootattributeoperation.js';
export { default as RootOperation } from './model/operation/rootoperation.js';
export { default as NoOperation } from './model/operation/nooperation.js';
export { transformSets } from './model/operation/transform.js';

// Model.
export {
	default as DocumentSelection,
	type DocumentSelectionChangeRangeEvent,
	type DocumentSelectionChangeMarkerEvent,
	type DocumentSelectionChangeAttributeEvent
} from './model/documentselection.js';
export { default as Range } from './model/range.js';
export { default as LiveRange, type LiveRangeChangeRangeEvent } from './model/liverange.js';
export { default as LivePosition } from './model/liveposition.js';
export { default as Model } from './model/model.js';
export { default as TreeWalker, type TreeWalkerValue } from './model/treewalker.js';
export { default as Element } from './model/element.js';
export { default as Position, type PositionOffset } from './model/position.js';
export { default as DocumentFragment } from './model/documentfragment.js';
export { default as History } from './model/history.js';
export { default as Text } from './model/text.js';
export { default as TextProxy } from './model/textproxy.js';
export type { default as Document, ModelPostFixer } from './model/document.js';
export type { Marker } from './model/markercollection.js';
export type { default as Batch } from './model/batch.js';
export type { default as Differ, DiffItem, DiffItemAttribute, DiffItemInsert, DiffItemRemove } from './model/differ.js';
export type { default as Item } from './model/item.js';
export type { default as Node, NodeAttributes } from './model/node.js';
export type { default as RootElement } from './model/rootelement.js';
export type {
	default as Schema,
	SchemaAttributeCheckCallback,
	SchemaChildCheckCallback,
	AttributeProperties,
	SchemaItemDefinition,
	SchemaContext
} from './model/schema.js';
export type { default as Selection, Selectable } from './model/selection.js';
export type { default as TypeCheckable } from './model/typecheckable.js';
export type { default as Writer } from './model/writer.js';

// Model utils.
export * from './model/utils/autoparagraphing.js';

// Model Events.
export type { DocumentChangeEvent } from './model/document.js';
export type { DocumentSelectionChangeEvent } from './model/documentselection.js';
export type {
	ModelApplyOperationEvent,
	ModelDeleteContentEvent,
	ModelGetSelectedContentEvent,
	ModelInsertContentEvent,
	ModelInsertObjectEvent,
	ModelModifySelectionEvent,
	ModelCanEditAtEvent
} from './model/model.js';
export type { SelectionChangeRangeEvent } from './model/selection.js';

// View.
export { default as DataTransfer } from './view/datatransfer.js';
export { default as DomConverter } from './view/domconverter.js';
export { default as Renderer } from './view/renderer.js';
export { default as EditingView } from './view/view.js';
export { default as ViewDocument } from './view/document.js';
export { default as ViewText } from './view/text.js';
export { default as ViewElement, type ElementAttributes as ViewElementAttributes } from './view/element.js';
export { default as ViewContainerElement } from './view/containerelement.js';
export { default as ViewEditableElement } from './view/editableelement.js';
export { default as ViewRootEditableElement } from './view/rooteditableelement.js';
export { default as ViewAttributeElement } from './view/attributeelement.js';
export { default as ViewEmptyElement } from './view/emptyelement.js';
export { default as ViewRawElement } from './view/rawelement.js';
export { default as ViewUIElement } from './view/uielement.js';
export { default as ViewDocumentFragment } from './view/documentfragment.js';
export { default as ViewTreeWalker, type TreeWalkerValue as ViewTreeWalkerValue } from './view/treewalker.js';
export type { default as ViewElementDefinition, ElementObjectDefinition } from './view/elementdefinition.js';
export type { default as ViewDocumentSelection } from './view/documentselection.js';
export { default as AttributeElement } from './view/attributeelement.js';
export type { default as ViewItem } from './view/item.js';
export type { default as ViewNode } from './view/node.js';
export type { default as ViewPosition, PositionOffset as ViewPositionOffset } from './view/position.js';
export type { default as ViewRange } from './view/range.js';
export type { default as ViewSelection, ViewSelectionChangeEvent, Selectable as ViewSelectable } from './view/selection.js';
export type { default as ViewTypeCheckable } from './view/typecheckable.js';

export { getFillerOffset } from './view/containerelement.js';

// View / Observer.
export { default as Observer } from './view/observer/observer.js';
export { default as ClickObserver } from './view/observer/clickobserver.js';
export { default as DomEventObserver } from './view/observer/domeventobserver.js';
export { default as MouseObserver } from './view/observer/mouseobserver.js';
export { default as TabObserver } from './view/observer/tabobserver.js';

export {
	default as FocusObserver,
	type ViewDocumentBlurEvent,
	type ViewDocumentFocusEvent
} from './view/observer/focusobserver.js';

export { default as DowncastWriter } from './view/downcastwriter.js';
export { default as UpcastWriter } from './view/upcastwriter.js';
export { default as Matcher, type MatcherPattern, type MatcherObjectPattern, type Match, type MatchResult } from './view/matcher.js';

export { default as BubblingEventInfo } from './view/observer/bubblingeventinfo.js';
export { default as DomEventData } from './view/observer/domeventdata.js';

// View / Events.
export type { BubblingEvent } from './view/observer/bubblingemittermixin.js';
export type { ViewDocumentArrowKeyEvent } from './view/observer/arrowkeysobserver.js';
export type {
	ViewDocumentCompositionStartEvent,
	ViewDocumentCompositionUpdateEvent,
	ViewDocumentCompositionEndEvent
} from './view/observer/compositionobserver.js';
export type { ViewDocumentInputEvent } from './view/observer/inputobserver.js';
export type { ViewDocumentMutationsEvent, MutationData } from './view/observer/mutationobserver.js';
export type { ViewDocumentKeyDownEvent, ViewDocumentKeyUpEvent, KeyEventData } from './view/observer/keyobserver.js';
export type { ViewDocumentLayoutChangedEvent } from './view/document.js';
export type {
	ViewDocumentMouseDownEvent,
	ViewDocumentMouseUpEvent,
	ViewDocumentMouseOverEvent,
	ViewDocumentMouseOutEvent
} from './view/observer/mouseobserver.js';
export type { ViewDocumentTabEvent } from './view/observer/tabobserver.js';
export type { ViewDocumentClickEvent } from './view/observer/clickobserver.js';
export type { ViewDocumentSelectionChangeEvent } from './view/observer/selectionobserver.js';
export type { ViewRenderEvent, ViewScrollToTheSelectionEvent } from './view/view.js';

// View / Styles.
export { default as StylesMap, StylesProcessor, type BoxSides } from './view/stylesmap.js';
export * from './view/styles/background.js';
export * from './view/styles/border.js';
export * from './view/styles/margin.js';
export * from './view/styles/padding.js';
export * from './view/styles/utils.js';

// Development / testing utils.
export {
	getData as _getModelData,
	setData as _setModelData,
	parse as _parseModel,
	stringify as _stringifyModel
} from './dev-utils/model.js';

export {
	getData as _getViewData,
	setData as _setViewData,
	parse as _parseView,
	stringify as _stringifyView
} from './dev-utils/view.js';
