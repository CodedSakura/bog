[meta:author]:# 'CodedSakura'
[meta:number]:# '000'
[meta:projects]:# 'Bog;Website'
[meta:started_on]:# '2023-10-20'
[meta:published]:# 'false'
[meta:published_on]:# '2000-01-01'
[meta:last_updated_on]:# '2024-03-31'
[meta:tags]:# 'Blog;WebSite;Markdown'
[meta:permalink]:# 'https://bog.codedsakura.dev/posts/000'


# CodedSakura's Blog - #000

One occasionally wants to publish their thought to the internet. A blog is a
common solution to this problem. I've decided to call my blog "Bog" (and theme
it appropriately).


## Problem definition

I want to put my thoughts and projects into a Markdown file and create 
decent-looking webpages from those files.

I want to be able to add tags and other metadata to the posts.

I want to write my own service for handling this, except for parsing the 
Markdown into HTML.


## Problem 1 - metadata

Markdown has no official support for adding metadata to a file, but there are
industry solutions to this. [Jekyll has Front Matter][1], which allows adding
YAML metadata to any text file, which has to be at the start of the file and
surrounded in `---`. There is also [MultiMarkdown Metadata][2], but that 
differs heavily with parsers.

[1]: https://jekyllrb.com/docs/front-matter/
[2]: https://fletcher.github.io/MultiMarkdown-5/metadata.html

There is also a way to get metadata in a regular Markdown file that would be
compile-able with pretty much any Markdown processor -- using link references:

```md
[meta:author]:# 'CodedSakura'
[meta:number]:# '000'
[meta:projects]:# 'Bog;Website'
...
```

These link references do not get rendered directly, instead their link and title
is placed into locations where the reference is used
(`[1]: https://some.site` can be used like so: `[Some site][1]`).

This is the solution I've decided to go with, as it will mean I do not have to
alter the files before handing them off to a processor.

The labels I've chosed to use are these:

* `meta:author` - author of the post
* `meta:number` - number of the post
* `meta:projects` - what projects the post relates to
* `meta:started_on` - when work on the post was started
* `meta:published` - whether the post is published
* `meta:published_on` - when was the post published
* `meta:last_updated_on` - when was the post last updated
* `meta:tags` - tags
* `meta:permalink` - permalink to the post