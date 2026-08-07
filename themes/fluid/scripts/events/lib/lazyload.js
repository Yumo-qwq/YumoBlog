'use strict';

const fs = require('fs');
const path = require('path');
const urlJoin = require('../../utils/url-join');

module.exports = (hexo) => {
  const config = hexo.theme.config;
  const loadingImage = urlJoin(hexo.config.root, config.lazyload.loading_img
    || urlJoin(config.static_prefix.internal_img, 'loading.gif'));
  if (!config.lazyload || !config.lazyload.enable || !loadingImage) {
    return;
  }
  const optimizedImages = getOptimizedImages(hexo);
  if (config.lazyload.onlypost) {
    hexo.extend.filter.register('after_post_render', (page) => {
      if (page.layout !== 'post' && !page.lazyload) {
        return;
      }
      if (page.lazyload !== false) {
        page.content = lazyImages(page.content, loadingImage);
        page.content = rewriteOptimizedImages(page.content, optimizedImages);
        page.content = lazyComments(page.content);
      }
      return page;
    });
  } else {
    hexo.extend.filter.register('after_render:html', (html, data) => {
      if (!data.page || data.page.lazyload !== false) {
        html = rewriteOptimizedImages(html, optimizedImages);
        html = lazyImages(html, loadingImage);
        html = lazyComments(html);
        return html;
      }
    });
  }
};

const lazyImages = (htmlContent, loadingImage) => {
  return htmlContent.replace(/<img[^>]+?src=(".*?")[^>]*?>/gims, (str, p1) => {
    if (/lazyload/i.test(str)) {
      return str;
    }
    let result = str.replace(
      p1,
      `${p1} srcset="${loadingImage}" loading="lazy" decoding="async" lazyload`
    );
    if (/\sloading\s*=/i.test(str)) {
      result = result.replace(' loading="lazy"', '');
    }
    if (/\sdecoding\s*=/i.test(str)) {
      result = result.replace(' decoding="async"', '');
    }
    return result;
  });
};

const lazyComments = (htmlContent) => {
  return htmlContent.replace(/<[^>]+?id="comments"[^>]*?>/gims, (str) => {
    if (/lazyload/i.test(str)) {
      return str;
    }
    return str.replace('id="comments"', 'id="comments" lazyload');
  });
};

const getOptimizedImages = (hexo) => {
  const imageRoot = path.resolve(hexo.base_dir, hexo.config.source_dir || 'source', 'img');
  const replacements = new Map();

  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const filePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(filePath);
        continue;
      }
      if (!entry.isFile() || !/-optimized\.jpe?g$/i.test(entry.name)) {
        continue;
      }

      const optimizedExtension = path.extname(entry.name);
      const originalBase = entry.name.slice(0, -(`-optimized${optimizedExtension}`).length);
      const originalName = [`${originalBase}${optimizedExtension}`, `${originalBase}.jpg`,
        `${originalBase}.jpeg`, `${originalBase}.png`].find((name) => {
        return fs.existsSync(path.join(directory, name));
      });
      if (!originalName) {
        continue;
      }
      const originalPath = path.join(directory, originalName);

      const relative = path.relative(imageRoot, originalPath).split(path.sep).join('/');
      const optimizedRelative = path.relative(imageRoot, filePath).split(path.sep).join('/');
      const originalUrl = urlJoin(hexo.config.root, `img/${relative}`);
      const optimizedUrl = urlJoin(hexo.config.root, `img/${optimizedRelative}`);
      replacements.set(originalUrl, optimizedUrl);
      replacements.set(encodeURI(originalUrl), optimizedUrl);
    }
  };

  if (fs.existsSync(imageRoot)) {
    visit(imageRoot);
  }
  return replacements;
};

const rewriteOptimizedImages = (htmlContent, replacements) => {
  if (replacements.size === 0) {
    return htmlContent;
  }

  htmlContent = htmlContent.replace(/url\((['"])(.*?)\1\)/gims, (str, quote, imageUrl) => {
    const optimizedUrl = replacements.get(imageUrl);
    return optimizedUrl ? `url(${quote}${optimizedUrl}${quote})` : str;
  });

  return htmlContent.replace(/<img\b[^>]*?\bsrc=(["'])(.*?)\1[^>]*>/gims, (str, quote, imageUrl) => {
    const optimizedUrl = replacements.get(imageUrl);
    if (!optimizedUrl || /data-original-src=/i.test(str)) {
      return str;
    }
    return str
      .replace(`${quote}${imageUrl}${quote}`, `${quote}${optimizedUrl}${quote}`)
      .replace(/>$/, ` data-original-src="${imageUrl}">`);
  });
};
