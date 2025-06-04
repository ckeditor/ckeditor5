---
category: features
menu-title: Custom widgets & components
meta_description: Learn to build custom widgets and components in CKEditor 5 including block widgets, inline elements, external data integration, React components, and complex UI features.
modified_at: 2025-06-02
---

# Custom widgets and components

CKEditor&nbsp;5's widget system allows developers to create custom interactive components that integrate with the editor's content model. Widgets provide a structured way to embed complex content blocks, inline elements, data-driven components, and framework integrations within the editor.

The examples below demonstrate the functionality and implementation approaches for each widget type.

## Block widgets: self-contained content components

Developers can build block widgets that create structured content blocks functioning as independent units within documents. The demo below shows a created from scratch simple block widget with title and description slots. You can {@link tutorials/widgets/implementing-a-block-widget learn how to build block widgets} in our framework section.

{@snippet framework/tutorials/block-widget}

**Example components developers can build:**
* Product displays with images, pricing, and purchase options,
* Team member profiles with photos and contact information,
* Content cards for articles, case studies, and news items,
* Data visualization components and interactive charts,
* Alert boxes, callouts, and feature highlights.

## Inline widgets: dynamic elements within text

Developers can create inline widgets as interactive elements that integrate seamlessly within text content without disrupting document flow. The demo below shows a simple and custom build placeholder feature. We have more advanced version of this feature, {@link features/merge-fields Merge fields}, but this serves as a good example of what's possible. You can {@link tutorials/widgets/implementing-an-inline-widget learn how to build inline widgets} in our framework section.

{@snippet framework/tutorials/inline-widget}

**Example components developers can build:**
* Dynamic data displays for pricing, stock information, or weather,
* User mentions and employee directory references,
* Status indicators for project phases and workflows,
* Badge elements for ratings, certifications, and labels,

## External data widgets: live updating components

Developers can build widgets that connect to external APIs and data sources to display real-time information directly within editor content. The editor below contains a widget that fetches data from an external source and updates all its instances in a set interval of time. In this particular example, the widget shows the current Bitcoin rate. You can {@link tutorials/widgets/data-from-external-source learn how to build widgets with external data} in our framework section.

{@snippet framework/tutorials/external-data-widget}

**Example components developers can build:**
* Financial data including stock prices and market indicators,
* Business metrics and KPI dashboards,
* Live feeds from social media, news sources, and events,
* Inventory systems with product availability and pricing,
* API integrations for CRM data and system notifications,
* Analytics displays with traffic and conversion metrics.

## React (and other frameworks) components in widgets : modern UI integrations

Developers can integrate components from popular UI frameworks like React, Vue, Angular, and others into CKEditor&nbsp;5, enabling reuse of existing component libraries and business logic. The editor below presents integration between React library and a block widget from the CKEditor ecosystem. You can {@link tutorials/widgets/using-react-in-a-widget learn how to build widgets with React} in our framework section.

{@snippet framework/tutorials/using-react-in-widget}

**Example applications developers can build:**
* Design system component integration across frameworks,
* Complex multi-step forms and configuration panels that streamline content creation workflows.

While CKEditor&nbsp;5 provides an example React integration, similar patterns can be applied to other frameworks when building custom widgets.

## More complex features: components and editor's UI

Developers can build sophisticated features that go beyond simple content widgets to include rich interactive UI elements like balloons, dropdowns, and contextual panels. These features combine content modeling, conversion pipelines, commands, and custom UI components to create seamless editing experiences. The demo below shows an abbreviation feature that presents a balloon panel for user input when adding abbreviations to text. You can {@link tutorials/abbreviation-plugin-tutorial/abbreviation-plugin-level-1 learn how to build features with balloon UI} in our framework section.

{@snippet tutorials/abbreviation-level-3}

## Architecture overview

CKEditor&nbsp;5's architecture provides a comprehensive framework for building complex features that integrate content handling with sophisticated user interfaces:

**{@link framework/architecture/editing-engine#schema Schema system}** - Defines content structure, validation rules, and element relationships to ensure data integrity and feature compatibility.

**{@link framework/architecture/editing-engine#conversion Conversion pipeline}** - Transforms data between the model, editing view, and data view, enabling seamless integration with external formats and real-time collaboration.

**{@link framework/architecture/core-editor-architecture#commands Command architecture}** - Implements user actions, business logic, and state management with built-in undo/redo support and collaboration-ready operation handling.

**{@link framework/architecture/ui-library UI integration}** - Supports toolbar buttons, {@link framework/architecture/ui-library#view-collections-and-the-ui-tree contextual balloons}, dropdowns, and custom panel elements with automatic {@link framework/deep-dive/focus-tracking focus management} and accessibility features.

**{@link framework/deep-dive/event-system Event system}** - Provides a robust foundation for inter-component communication, user interaction handling, and plugin coordination through observable patterns.

**{@link framework/architecture/core-editor-architecture#plugins Plugin architecture}** - Enables modular feature development with dependency management, lifecycle hooks, and seamless integration with existing editor functionality.