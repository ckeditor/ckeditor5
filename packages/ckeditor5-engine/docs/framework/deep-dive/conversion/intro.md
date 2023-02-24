---
category: framework-deep-dive-conversion
menu-title: Introduction
order: 10
since: 33.0.0
modified_at: 2022-03-02
---

# Introduction to conversion

## What is the conversion?

The {@link framework/architecture/editing-engine editing engine} of CKEditor 5 works on two separate layers &mdash; {@link framework/architecture/editing-engine#model model} and {@link framework/architecture/editing-engine#view view}. The process of transforming one into the other is called conversion.

### Upcast conversion

When you load data into the editor, the view is created out of the markup. Then, with the help of the upcast converters, the model is created. Once that is done, the model becomes the editor state. The whole process is called upcast conversion.

{@img assets/img/editor-initalization.svg 266 A diagram explaining loading data into the editor.}

### Downcast conversion

All changes, such as typing or pasting from the clipboard, are applied directly to the model. In order to update the editing view, e.i. the layer being displayed to the user, the engine transforms these changes in the model to the view. The same process is executed when data needs to be generated (e.g. when you copy editor content or use `editor.getData()`). These processes are called editing and downcast conversions.

{@img assets/img/editor-data-flow.svg 582 Diagram explaining interaction between the user, model, and editor output.}

You can think about upcast and downcast as processes working in opposite directions, ones that are symmetrical to each other.

## Further reading

In the following guides you will learn how to create the right converter for each case when creating your very own CKEditor 5 plugin.

* **{@link framework/deep-dive/conversion/downcast Model to view (downcast)}**

	The model has to be transformed into the view. Learn how to achieve that by creating downcast converters.

* **{@link framework/deep-dive/conversion/upcast View to model (upcast)}**

	Raw data coming into the editor has to be transformed into the model. Learn how to achieve that by creating upcast converters.

* **{@link framework/deep-dive/conversion/helpers/intro Conversion helpers}**

	There are plenty of ways to transform data between model and view. To help you do this as efficiently as possible, we provided many functions that speed up this process. This chapter will help you choose the right helper for the job.
