{{md 'partial-yfm' this}}
{{md 'partial-yfm' page}}

Note that even though we're explicitly defining `page` and `this` as the context, since no data is
defined in the page (e.g. YAML front matter) the context will be set to `options.data` since
`options.data` is merged into the context directly after page data.