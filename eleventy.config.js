const { clientSideTemplate } = require("eleventy-plugin-redirects/templates");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPlugin(eleventyNavigationPlugin);

  // eleventy-plugin-redirects: ship the plugin's clientSide template via
  // a shortcode but build our own `redirects` collection so it picks up
  // .html pages (the plugin's built-in collection only scans *.md).
  eleventyConfig.addCollection("redirects", (collection) =>
    collection
      .getAll()
      .filter((page) => Array.isArray(page.data.aliases))
      .flatMap((page) =>
        page.data.aliases.map((alias) => ({
          from: alias,
          to: page.url,
          title: page.data.title,
        }))
      )
  );
  eleventyConfig.addShortcode("redirect", (redirect) =>
    clientSideTemplate(redirect)
  );

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["liquid", "html"],
    htmlTemplateEngine: "liquid",
  };
};
