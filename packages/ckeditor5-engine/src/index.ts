/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine
 */

export {
	type PlaceholderableElement,
	disablePlaceholder,
	enablePlaceholder,
	hidePlaceholder,
	needsPlaceholder,
	showPlaceholder
} from './view/placeholder.js';

// Controller.
export { EditingController } from './controller/editingcontroller.js';
export {
	DataController,
	type DataControllerInitEvent,
	type DataControllerSetEvent,
	type DataControllerToModelEvent,
	type DataControllerToViewEvent
} from './controller/datacontroller.js';

// Conversion.
export { Conversion } from './conversion/conversion.js';
export type {
	DowncastDispatcher,
	DowncastAddMarkerEvent,
	DowncastAttributeEvent,
	DowncastConversionApi,
	DowncastInsertEvent,
	DowncastRemoveEvent,
	DowncastRemoveMarkerEvent,
	DowncastSelectionEvent
} from './conversion/downcastdispatcher.js';
export type {
	UpcastDispatcher,
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
	Mapper,
	MapperModelToViewPositionEvent,
	MapperViewToModelPositionEvent
} from './conversion/mapper.js';
export type { ModelConsumable } from './conversion/modelconsumable.js';
export type { Consumables, ViewConsumable } from './conversion/viewconsumable.js';

// DataProcessor.
export type { DataProcessor } from './dataprocessor/dataprocessor.js';
export { HtmlDataProcessor } from './dataprocessor/htmldataprocessor.js';
export { XmlDataProcessor } from './dataprocessor/xmldataprocessor.js';

// Model / Operation.
export type { Operation } from './model/operation/operation.js';
export { InsertOperation } from './model/operation/insertoperation.js';
export { MoveOperation } from './model/operation/moveoperation.js';
export { MergeOperation } from './model/operation/mergeoperation.js';
export { SplitOperation } from './model/operation/splitoperation.js';
export { MarkerOperation } from './model/operation/markeroperation.js';
export { OperationFactory } from './model/operation/operationfactory.js';
export { AttributeOperation } from './model/operation/attributeoperation.js';
export { RenameOperation } from './model/operation/renameoperation.js';
export { RootAttributeOperation } from './model/operation/rootattributeoperation.js';
export { RootOperation } from './model/operation/rootoperation.js';
export { NoOperation } from './model/operation/nooperation.js';
export { transformSets } from './model/operation/transform.js';

// Model.
export {
	DocumentSelection,
	type DocumentSelectionChangeRangeEvent,
	type DocumentSelectionChangeMarkerEvent,
	type DocumentSelectionChangeAttributeEvent
} from './model/documentselection.js';
export { Range } from './model/range.js';
export { LiveRange, type LiveRangeChangeRangeEvent } from './model/liverange.js';
export { LivePosition } from './model/liveposition.js';
export { Model } from './model/model.js';
export { TreeWalker, type TreeWalkerValue } from './model/treewalker.js';
export { Element } from './model/element.js';
export { Position, type PositionOffset } from './model/position.js';
export { DocumentFragment } from './model/documentfragment.js';
export { History } from './model/history.js';
export { Text } from './model/text.js';
export { TextProxy } from './model/textproxy.js';
export type { Document, ModelPostFixer } from './model/document.js';
export type { Marker } from './model/markercollection.js';
export type { Batch } from './model/batch.js';
export type { Differ, DiffItem, DiffItemAttribute, DiffItemInsert, DiffItemRemove } from './model/differ.js';
export type { Item } from './model/item.js';
export type { Node, NodeAttributes } from './model/node.js';
export type { RootElement } from './model/rootelement.js';
export {
	SchemaContext,
	type Schema,
	type SchemaAttributeCheckCallback,
	type SchemaChildCheckCallback,
	type AttributeProperties,
	type SchemaItemDefinition,
	type SchemaCompiledItemDefinition,
	type SchemaContextDefinition
} from './model/schema.js';
export type { Selection, Selectable } from './model/selection.js';
export type { TypeCheckable } from './model/typecheckable.js';
export type { Writer } from './model/writer.js';

// Model utils.
export {
	autoParagraphEmptyRoots,
	isParagraphable,
	wrapInParagraph
} from './model/utils/autoparagraphing.js';

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
export { DataTransfer } from './view/datatransfer.js';
export { DomConverter } from './view/domconverter.js';
export { Renderer } from './view/renderer.js';
export { EditingView } from './view/view.js';
export { ViewDocument } from './view/document.js';
export { ViewText } from './view/text.js';
export { ViewElement, type ElementAttributes as ViewElementAttributes } from './view/element.js';
export { ViewContainerElement } from './view/containerelement.js';
export { ViewEditableElement } from './view/editableelement.js';
export { ViewRootEditableElement } from './view/rooteditableelement.js';
export { ViewAttributeElement } from './view/attributeelement.js';
export { ViewEmptyElement } from './view/emptyelement.js';
export { ViewRawElement } from './view/rawelement.js';
export { ViewUIElement } from './view/uielement.js';
export { ViewDocumentFragment } from './view/documentfragment.js';
export { ViewTreeWalker, type TreeWalkerValue as ViewTreeWalkerValue } from './view/treewalker.js';
export type { ViewElementDefinition, ElementObjectDefinition } from './view/elementdefinition.js';
export type { ViewDocumentSelection } from './view/documentselection.js';
export { AttributeElement } from './view/attributeelement.js';
export type { ViewItem } from './view/item.js';
export type { ViewNode } from './view/node.js';
export type { ViewPosition, PositionOffset as ViewPositionOffset } from './view/position.js';
export type { ViewRange } from './view/range.js';
export type { ViewSelection, ViewSelectionChangeEvent, Selectable as ViewSelectable } from './view/selection.js';
export type { ViewTypeCheckable } from './view/typecheckable.js';

export { getFillerOffset } from './view/containerelement.js';

// View / Observer.
export { Observer } from './view/observer/observer.js';
export { ClickObserver } from './view/observer/clickobserver.js';
export { DomEventObserver } from './view/observer/domeventobserver.js';
export { MouseObserver } from './view/observer/mouseobserver.js';
export { TabObserver } from './view/observer/tabobserver.js';
export { TouchObserver } from './view/observer/touchobserver.js';

export {
	FocusObserver,
	type ViewDocumentBlurEvent,
	type ViewDocumentFocusEvent
} from './view/observer/focusobserver.js';

export { DowncastWriter } from './view/downcastwriter.js';
export { UpcastWriter } from './view/upcastwriter.js';
export { Matcher, type MatcherPattern, type MatcherObjectPattern, type Match, type MatchResult } from './view/matcher.js';

export { BubblingEventInfo } from './view/observer/bubblingeventinfo.js';
export { DomEventData } from './view/observer/domeventdata.js';

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
export type {
	ViewDocumentTouchEndEvent,
	ViewDocumentTouchMoveEvent,
	ViewDocumentTouchStartEvent
} from './view/observer/touchobserver.js';
export type { ViewDocumentTabEvent } from './view/observer/tabobserver.js';
export type { ViewDocumentClickEvent } from './view/observer/clickobserver.js';
export type { ViewDocumentSelectionChangeEvent } from './view/observer/selectionobserver.js';
export type { ViewRenderEvent, ViewScrollToTheSelectionEvent } from './view/view.js';

// View / Styles.
export { StylesMap, StylesProcessor, type BoxSides } from './view/stylesmap.js';
export { addBackgroundRules } from './view/styles/background.js';
export { addBorderRules } from './view/styles/border.js';
export { addMarginRules } from './view/styles/margin.js';
export { addPaddingRules } from './view/styles/padding.js';
export {
	isColor,
	isLineStyle,
	isLength,
	isPercentage,
	isRepeat,
	isPosition,
	isAttachment,
	isURL,
	getBoxSidesValues,
	getBoxSidesValueReducer,
	getBoxSidesShorthandValue,
	getPositionShorthandNormalizer,
	getShorthandValues
} from './view/styles/utils.js';

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
