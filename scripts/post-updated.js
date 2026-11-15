'use strict';

const { execFileSync } = require('node:child_process');
const path = require('node:path');
const { parse } = require('hexo-front-matter');

// Use committed article history, not checkout times, for the update notice.
hexo.extend.filter.register('before_generate', async function() {
  const git = args => execFileSync('git', args, {
    cwd: this.base_dir,
    encoding: 'utf8',
    timeout: 120000
  }).trim();

  // A shallow checkout cannot tell when unchanged articles were last edited.
  if (git(['rev-parse', '--is-shallow-repository']) === 'true') {
    this.log.info('Fetching Git history for article update times');
    git(['fetch', '--unshallow', 'origin']);
  }

  for (const post of this.model('Post').toArray()) {
    // Explicit front-matter dates continue to take priority.
    if (parse(post.raw).updated) continue;

    const file = path.relative(this.base_dir,
      path.join(this.source_dir, post.source)).split(path.sep).join('/');
    const date = git(['log', '-1', '--follow', '--format=%cI', '--', file]);
    // Untracked articles use their publication date until the first commit.
    const updated = date
      ? Math.max(post.date.valueOf(), Date.parse(date))
      : post.date.valueOf();

    post.updated = new Date(updated);
    await post.save();
  }
}, 5);
