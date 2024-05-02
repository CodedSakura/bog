const marked = require("marked");
const { readdir, readFile, writeFile, mkdir, cp } = require("fs/promises");
const path = require("path");
const handlebars = require("handlebars");

const outputDir = process.env.OUT_DIR ?? "./out";
const pubDir = process.env.PUB_DIR ?? "./public";
const postsDirName = process.env.POSTS_DIR_NAME ?? "posts";
const templateFile = process.env.TEMPLATE_FILE ?? "./template.handlebars";
const landingFile = process.env.LANDING_FILE ?? "./landing.handlebars";

const postsOutput = path.join(outputDir, postsDirName);


marked.use({
  async: true,
  renderer: {
    heading(text, level, raw) {
      const escapedText = raw.toLowerCase().replace(/\W+/g, '-');

      return `<h${level} id="${escapedText}">\n` +
        `    <a href="#${escapedText}" class="anchor">${text}</a>\n` +
        `</h${level}>\n`;
    },
    link(href, title, text) {
      const internal = /^#|^\.?\/|^https:\/\/bog\.codedsakura\.dev/.test(href);
      const titleProp = title ? ` title=${title}` : "";
      if (internal) {
        return `<a href="${href}"${titleProp}>${text}</a>`;
      }
      return `<a href="${href}"${titleProp} class="external" target="_blank">${text}</a>`;
    }
  },
});

handlebars.registerHelper("split", (separator, text) => {
  if (typeof text === "string") {
    return text.split(separator);
  }
  return [ text ];
});
handlebars.registerHelper("join", (joiner, list) => {
  if (Array.isArray(list)) {
    return list.join(joiner);
  }
  return list;
});
handlebars.registerHelper("stripNewlines", text => {
  return text.replaceAll("\n", " ");
});
handlebars.registerHelper("eachSeparated", function (separator, list, options) {
  return list.map(options.fn).join(separator);
});
handlebars.registerHelper("bool", text => ["yes", "true", "y"].includes(text.toLowerCase()));


function extractMetadata(mdFile) {
  const tags = /^(?:\[.+\n)+/.exec(mdFile)[0];
  return [...tags.matchAll(/\[meta:(\w+)].+?'(.+)'/g)]
    .reduce((acc, [ , k, v ]) => ({ ...acc, [k]: v }), {});
}

function extractExtra(mdFile) {
  const [ , title, description ] = /^[\w\W]+?\n#\s*(.+)\s*(?:([\w\W]+?)\s*?\n#)?/.exec(mdFile) ?? [];
  return { title, description };
}


async function main() {
  await mkdir(postsOutput, { recursive: true });

  await Promise.all((await readdir(pubDir)).map(f => {
    return cp(
      path.join(pubDir, f),
      path.join(outputDir, f),
      { recursive: true },
    );
  }));

  const template = handlebars.compile(await readFile(templateFile, { encoding: "utf-8" }));

  const directories = (await readdir("./", { withFileTypes: true }))
    .filter(v => v.isDirectory())
    .map(v => v.name)
    .filter(v => /^\d+$/.test(v));

  await Promise.all(directories.map(d => {
    return cp(d, path.join(postsOutput, d), { recursive: true });
  }));

  const posts = await Promise.all(directories.flatMap(async d => {
    const files = (await readdir(path.join(postsOutput, d)))
      .filter(v => /\.md$/.test(v));

    const pages = await Promise.all(files.map(async f => {
      const contents = await readFile(path.join(postsOutput, d, f), { encoding: "utf-8" });
      const meta = extractMetadata(contents);
      const extra = extractExtra(contents);
      const content = await marked.parse(contents);
      const html = template({ meta, extra, content });
      await writeFile(
        path.join(postsOutput, d, path.basename(f, ".md") + ".html"),
        html,
        { encoding: "utf-8" },
      );
      return { name: f, meta, extra };
    }));

    return pages.find(v => v.name === "index.md");
  }));

  const landingTemplate = handlebars.compile(await readFile(landingFile, { encoding: "utf-8" }));
  const landingContent = landingTemplate({
    posts: posts.sort((a, b) => Number(a.meta.number) - Number(b.meta.number))
      .map(({ meta: { permalink: url }, extra: { title } }) => ({ url, title })),
  });
  await writeFile(path.join(outputDir, "index.html"), landingContent, { encoding: "utf-8" });
}

main().catch(console.error);
