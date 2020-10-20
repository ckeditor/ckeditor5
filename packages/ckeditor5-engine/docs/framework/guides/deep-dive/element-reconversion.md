---
category: framework-deep-dive-conversion
order: 50
---

# Element reconversion

{@snippet framework/build-element-reconversion-source}

<info-box warning>
	The reconversion is a preliminary feature and may not be production ready.
</info-box>

This guide introduces {@link framework/guides/architecture/editing-engine#editing-pipeline "downcast"} reconversion concepts. It expands concepts used in other conversion guides such as {@link framework/guides/deep-dive/custom-element-conversion custom element conversion}.

## Before we begin

This guide builds on top of two similar features:

- custom element conversion
- implementing a block widget

## Demo

Let's take a look at the below enhanced info box might behave:

{@snippet framework/element-reconversion-demo}

The above demo assumes that each box:

- have 1 title
- have multiple content-boxes
- have type
- have URL associated
