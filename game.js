(function () {
  'use strict';

  // 八关：记忆翻牌 + 连连看 + 点亮南瓜灯 + 挖出小幽灵 + 打蝙蝠 + 南瓜快跑 + 配置奶茶 + 玉楠小测验
  var TOTAL = 8;

  // ---------- 存储 ----------
  function loadState() {
    try { return JSON.parse(localStorage.getItem('hw_state') || '{}'); }
    catch (e) { return {}; }
  }
  function saveState(s) { try { localStorage.setItem('hw_state', JSON.stringify(s)); } catch (e) {} }
  var state = loadState();
  if (!state.candies) state.candies = {};
  saveState(state);

  // ---------- 糖果插画（SVG，免外部图片）----------
  function candySVG(color) {
    color = color || '#8a2be2';
    return '<svg viewBox="0 0 200 120" class="candy-svg" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="糖果">' +
      '<polygon points="18,60 60,40 60,80" fill="' + color + '"/>' +
      '<polygon points="182,60 140,40 140,80" fill="' + color + '"/>' +
      '<rect x="56" y="44" width="88" height="32" rx="8" fill="' + color + '"/>' +
      '<circle cx="100" cy="60" r="35" fill="#fff3c4"/>' +
      '<circle cx="100" cy="60" r="35" fill="none" stroke="' + color + '" stroke-width="4"/>' +
      '<path d="M78 50 Q100 42 122 50" stroke="' + color + '" stroke-width="3" fill="none" opacity="0.75"/>' +
      '<circle cx="90" cy="54" r="6" fill="' + color + '" opacity="0.55"/>' +
      '<path d="M70 60 l16 -8 M70 60 l16 8 M130 60 l-16 -8 M130 60 l-16 8" stroke="' + color + '" stroke-width="3"/>' +
      '<text x="100" y="106" text-anchor="middle" font-size="13" fill="#ffd9a8">🍬</text>' +
      '</svg>';
  }

  function candyGroup(cx, cy, color, name) {
    var sc = 0.62;
    var g = '<g transform="translate(' + cx + ',' + cy + ') scale(' + sc + ')">';
    g += '<g transform="translate(-60,-60)">';
    g += '<polygon points="18,60 60,40 60,80" fill="' + color + '"/>';
    g += '<polygon points="182,60 140,40 140,80" fill="' + color + '"/>';
    g += '<rect x="56" y="44" width="88" height="32" rx="8" fill="' + color + '"/>';
    g += '<circle cx="100" cy="60" r="34" fill="#fff3c4"/>';
    g += '<circle cx="100" cy="60" r="34" fill="none" stroke="' + color + '" stroke-width="4"/>';
    g += '<path d="M78 50 Q100 42 122 50" stroke="' + color + '" stroke-width="3" fill="none" opacity="0.75"/>';
    g += '<circle cx="90" cy="54" r="6" fill="' + color + '" opacity="0.55"/>';
    g += '<path d="M70 60 l16 -8 M70 60 l16 8 M130 60 l-16 -8 M130 60 l-16 8" stroke="' + color + '" stroke-width="3"/>';
    g += '</g></g>';
    g += '<text x="' + cx + '" y="' + (cy + 52) + '" text-anchor="middle" font-size="18" fill="#ffd166" font-family="sans-serif">' + name + '</text>';
    return g;
  }

  function endingCardSVG() {
    var W = 800, H = 1040;
    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" preserveAspectRatio="xMidYMid meet">';
    s += '<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">' +
         '<stop offset="0" stop-color="#2a1840"/><stop offset="1" stop-color="#120a1e"/></linearGradient></defs>';
    s += '<rect width="' + W + '" height="' + H + '" fill="url(#bg)"/>';
    s += '<text x="400" y="150" text-anchor="middle" font-size="68" font-weight="800" fill="#ff8a3d" font-family="sans-serif">玉楠生日快乐</text>';
    s += '<text x="400" y="205" text-anchor="middle" font-size="26" fill="#ffd9a8" font-family="sans-serif">🎃 全部糖果，集齐所有祝福 🎂</text>';
    var n = LEVELS.length;
    var cols = n <= 2 ? 2 : (n <= 4 ? 2 : (n <= 6 ? 3 : 4));
    var rowsN = Math.ceil(n / cols);
    var colW = 800 / (cols + 1);
    var top = 380, bot = 720;
    var rowGap = rowsN > 1 ? (bot - top) / (rowsN - 1) : 0;
    for (var i = 0; i < n; i++) {
      var r = Math.floor(i / cols), c = i % cols;
      var x = colW * (c + 1);
      var y = rowsN > 1 ? top + rowGap * r : (top + bot) / 2;
      s += candyGroup(x, y, LEVELS[i].candy.color, LEVELS[i].candy.name);
    }
    s += '<text x="400" y="900" text-anchor="middle" font-size="28" fill="#ff8a3d" font-family="sans-serif">—— 来自万圣夜的生日祝福 ——</text>';
    s += '<text x="400" y="948" text-anchor="middle" font-size="20" fill="#b69be0" font-family="sans-serif">被爱包围 · 心想事成 · 快乐加倍</text>';
    s += '</svg>';
    return s;
  }

  function svgToPng(svg, name) {
    var blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var img = new Image();
    img.onload = function () {
      var canvas = document.createElement('canvas');
      canvas.width = 800; canvas.height = 1040;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(function (b) {
        var a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = name;
        document.body.appendChild(a); a.click(); a.remove();
        URL.revokeObjectURL(url);
      });
    };
    img.src = url;
  }

  // ---------- 关卡元数据 ----------
  var LEVELS = [
    {
      id: 1, name: '记忆翻牌',
      scene: '翻开所有卡片，记住它们的位置，把成对的万圣图标找出来！',
      candy: { id: 'memory', name: '记忆糖果', desc: '翻开的每一对，都是一份小惊喜。', color: '#7c5cff' }
    },
    {
      id: 2, name: '连连看',
      scene: '万圣图标铺满桌面，找出相同的两个，点一下让它们一起消失，清空全部就过关！',
      candy: { id: 'link', name: '连线糖果', desc: '连上的每一对，都甜了一份。', color: '#ff5db1' }
    },
    {
      id: 3, name: '点亮南瓜灯',
      scene: '跟着亮起的南瓜灯，按顺序敲出隐藏咒语！看清顺序，重复一遍就能点亮它。',
      candy: { id: 'pumpkinlight', name: '灯语糖果', desc: '你记住的每一段光，都在替你说话。', color: '#ffd93b' }
    },
    {
      id: 4, name: '挖出小幽灵',
      scene: '泥地下藏着小幽灵，分散在 12 个格子里。你有 10 次挖掘机会，挖出 5 只小幽灵就过关，机会用完还没挖全就算失败！',
      candy: { id: 'dig', name: '幽灵糖果', desc: '藏得再深，也被你挖到。', color: '#9be7ff' }
    },
    {
      id: 5, name: '打蝙蝠',
      scene: '万圣夜蝙蝠乱飞，点击击中 8 只蝙蝠，护送玉楠平安通过！',
      candy: { id: 'bat', name: '蝙蝠糖果', desc: '每一次出手，都是为冒险护航。', color: '#c77dff' }
    },
    {
      id: 6, name: '南瓜快跑',
      scene: '移动脚下的🎃，接住天上掉落的🍬，小心别碰💀！接满 8 颗就过关～',
      candy: { id: 'run', name: '快跑糖果', desc: '跑得稳，才接得住甜。', color: '#ff9f1c' }
    },
    {
      id: 7, name: '配置奶茶',
      scene: '自由调配专属奶茶：点配料加进杯子，点杯子摇匀，评分达到 70 分就拿到糖果！',
      candy: { id: 'tea', name: '奶茶糖果', desc: '调得刚刚好，甜到心里。', color: '#ffb3c1' }
    },
    {
      id: 8, name: '玉楠小测验',
      scene: '先答几道粉丝向小问答，再挑战时代少年团认人题，全部答对就拿到最后一颗糖果！',
      candy: { id: 'quiz', name: '智慧糖果', desc: '答对的每一题，都是心意。', color: '#5ad17a' }
    }
  ];

  // ---------- 页面切换 ----------
  function show(id) {
    var screens = document.querySelectorAll('.screen');
    for (var i = 0; i < screens.length; i++) screens[i].classList.remove('active');
    document.getElementById(id).classList.add('active');
    window.scrollTo(0, 0);
  }

  function updateBag() {
    var n = Object.keys(state.candies).length;
    var txt = '🍬 糖果袋 ' + n + '/' + TOTAL;
    document.getElementById('bag-start').textContent = txt;
    document.getElementById('bag-game').textContent = txt;
    refreshStart();
  }

  // 首页按钮随进度变化：集齐后「开始冒险」变「查看结局」，并显示「再玩一次」
  function refreshStart() {
    var all = Object.keys(state.candies).length >= TOTAL;
    var startBtn = document.getElementById('btn-start');
    var replayBtn = document.getElementById('btn-replay');
    if (startBtn) startBtn.textContent = all ? '🎉 查看结局' : '开始冒险';
    if (replayBtn) replayBtn.style.display = all ? 'inline-block' : 'none';
  }

  // 再玩一次：清空糖果袋，从第 1 关重新挑战（新一轮）
  function replayAll() {
    state.candies = {};
    saveState(state);
    updateBag();
    startLevel(1);
  }

  var curLevel = 1;
  var levelCleanup = null;
  function stopLevel() {
    if (levelCleanup) { levelCleanup(); levelCleanup = null; }
  }

  function msg(t) { document.getElementById('game-msg').textContent = t || ''; }

  // ---------- 关卡失败 → 重开 / 跳过 ----------
  var retries = {};   // 每关剩余重开次数（最多 2 次）
  function retriesLeft(level) {
    if (retries[level] === undefined) retries[level] = 2;
    return retries[level];
  }
  function showFail(level) {
    stopLevel();
    var r = retriesLeft(level);
    var retryBtn = document.getElementById('btn-fail-retry');
    var note = document.getElementById('fail-retry-note');
    document.getElementById('fail-title').textContent = '第 ' + level + ' 关还没通过 😢';
    if (r > 0) {
      retryBtn.style.display = 'block';
      note.textContent = '还可以重新开始 ' + r + ' 次';
    } else {
      retryBtn.style.display = 'none';
      note.textContent = '重开次数已用完，直接继续下一关吧～';
    }
    document.getElementById('fail-overlay').classList.add('show');
  }
  function hideFail() { document.getElementById('fail-overlay').classList.remove('show'); }

  // ---------- 第 1 关：记忆翻牌 ----------
  function renderMemoryGame(area) {
    var icons = ['🎃', '🦇', '👻', '🍬', '🌙', '🕸️'];
    var deck = icons.concat(icons);
    // Fisher-Yates 洗牌
    for (var i = deck.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = deck[i]; deck[i] = deck[j]; deck[j] = t;
    }
    var grid = document.createElement('div');
    grid.className = 'memory-grid';
    area.appendChild(grid);

    var first = null, lock = false, matched = 0;
    var cards = [];
    deck.forEach(function (emoji) {
      var el = document.createElement('div');
      el.className = 'mem-card';
      el.innerHTML = '<div class="mem-face back">❓</div><div class="mem-face front">' + emoji + '</div>';
      grid.appendChild(el);
      var card = { emoji: emoji, el: el, flipped: false, matched: false };
      cards.push(card);
      el.addEventListener('click', function () { onCard(card); });
    });

    function onCard(card) {
      if (lock || card.flipped || card.matched) return;
      card.flipped = true;
      card.el.classList.add('flipped');
      if (!first) { first = card; return; }
      if (first === card) return;
      var a = first, b = card;
      first = null;
      if (a.emoji === b.emoji) {
        a.matched = b.matched = true;
        a.el.classList.add('matched');
        b.el.classList.add('matched');
        matched++;
        msg('配对成功！(' + matched + '/' + icons.length + ')');
        if (matched >= icons.length) {
          setTimeout(completeLevel, 520);
        }
      } else {
        lock = true;
        msg('不一样，再记一下~');
        setTimeout(function () {
          a.flipped = b.flipped = false;
          a.el.classList.remove('flipped');
          b.el.classList.remove('flipped');
          lock = false;
        }, 760);
      }
    }
    msg('点击卡片开始翻牌吧~');
  }

  // ---------- 第 2 关：连连看 ----------
  function renderLinkGame(area) {
    var icons = ['🎃', '🦇', '👻', '🍬', '🌙', '🕸️', '🧙', '🍭'];
    var deck = icons.concat(icons); // 16 张，8 对
    for (var i = deck.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = deck[i]; deck[i] = deck[j]; deck[j] = t;
    }
    var grid = document.createElement('div');
    grid.className = 'link-grid';
    area.appendChild(grid);

    var first = null, lock = false, cleared = 0;
    deck.forEach(function (emoji) {
      var el = document.createElement('div');
      el.className = 'link-tile';
      el.textContent = emoji;
      grid.appendChild(el);
      var tile = { emoji: emoji, el: el, cleared: false };
      el.addEventListener('click', function () { onTile(tile); });
    });
    function onTile(tile) {
      if (lock || tile.cleared) return;
      if (first === tile) return;
      if (first) {
        var a = first; first = null;
        if (a.emoji === tile.emoji) {
          a.cleared = tile.cleared = true;
          a.el.classList.add('gone'); tile.el.classList.add('gone');
          cleared++;
          msg('连上啦！(' + cleared + '/' + icons.length + ')');
          if (cleared >= icons.length) setTimeout(completeLevel, 480);
        } else {
          lock = true;
          a.el.classList.add('bad'); tile.el.classList.add('bad');
          msg('不一样，再找找~');
          setTimeout(function () {
            a.el.classList.remove('bad'); tile.el.classList.remove('bad');
            lock = false;
          }, 520);
        }
      } else {
        first = tile;
        tile.el.classList.add('pick');
      }
    }
    msg('点选两个相同的图标，让它们一起消失~');
  }

  // ---------- 第 3 关：点亮南瓜灯（Simon 记忆序列）----------
  function renderSimonGame(area) {
    var syms = [
      { icon: '🎃', color: '#ff7518' },
      { icon: '🦇', color: '#9b5cff' },
      { icon: '👻', color: '#e8e8f5' },
      { icon: '🕸️', color: '#5ad17a' }
    ];
    var wrap = document.createElement('div');
    wrap.className = 'simon-wrap';
    var grid = document.createElement('div');
    grid.className = 'simon-grid';
    var btns = [];
    syms.forEach(function (s) {
      var b = document.createElement('button');
      b.className = 'simon-btn';
      b.style.setProperty('--c', s.color);
      b.innerHTML = '<span class="si">' + s.icon + '</span>';
      grid.appendChild(b);
      btns.push(b);
    });
    wrap.appendChild(grid);
    var status = document.createElement('div');
    status.className = 'simon-status';
    wrap.appendChild(status);
    area.appendChild(wrap);

    var seq = [], input = [], locked = false;
    var startLen = 4, goalLen = 6;   // 从 4 步起，逐轮 +1，记到 6 步过关
    var curLen = startLen;

    function flash(i, cb) {
      btns[i].classList.add('on');
      setTimeout(function () {
        btns[i].classList.remove('on');
        if (cb) setTimeout(cb, 140);   // 间隔更短，记忆更紧
      }, 420);
    }
    function playSeq(cb) {
      locked = true;
      var k = 0;
      status.textContent = '看好顺序…（长度 ' + seq.length + '）';
      (function step() {
        if (k >= seq.length) {
          locked = false; input = [];
          status.textContent = '该你啦，按刚才顺序点！';
          if (cb) cb();
          return;
        }
        flash(seq[k], function () { k++; step(); });
      })();
    }
    function newSeq() {
      seq = [];
      for (var i = 0; i < curLen; i++) seq.push(Math.floor(Math.random() * syms.length));
      playSeq();
    }
    function tap(i) {
      if (locked) return;
      flash(i);
      input.push(i);
      var pos = input.length - 1;
      if (input[pos] !== seq[pos]) {
        status.textContent = '记错啦，重来这 ' + curLen + ' 步~';
        setTimeout(newSeq, 720);
        return;
      }
      if (input.length === seq.length) {
        if (curLen >= goalLen) {
          status.textContent = '咒语生效！南瓜灯全亮 ✨';
          setTimeout(completeLevel, 520);
        } else {
          curLen++;
          status.textContent = '记住啦！长度 +1…';
          setTimeout(newSeq, 660);
        }
      }
    }
    btns.forEach(function (b, i) { b.addEventListener('click', function () { tap(i); }); });
    msg('跟着亮起的南瓜灯，记住越来越长的咒语～从 ' + startLen + ' 步开始，记到 ' + goalLen + ' 步就过关！某一步记错只重来这一步，不退回 4 步。');
    newSeq();
  }

  // ---------- 第 4 关：挖出小幽灵 ----------
  function renderDigGame(area) {
    var COLS = 4, ROWS = 3, total = COLS * ROWS; // 12 格
    function cellsOf(top, left, w, h) {
      var a = [];
      for (var r = 0; r < h; r++) for (var c = 0; c < w; c++) a.push((top + r) * COLS + (left + c));
      return a;
    }
    // 需要挖出 5 只小幽灵（每只占 1 格，随机分布）；干扰块：2×2（4 格），不重叠
    var GOAL = 5;
    var ghostCells = [];
    while (ghostCells.length < GOAL) {
      var gx = Math.floor(Math.random() * total);
      if (ghostCells.indexOf(gx) < 0) ghostCells.push(gx);
    }
    var decoy = {};
    for (var t = 0; t < 40; t++) {
      var dTop = Math.floor(Math.random() * 2), dLeft = Math.floor(Math.random() * 3);
      var d = cellsOf(dTop, dLeft, 2, 2);
      var ov = d.some(function (x) { return ghostCells.indexOf(x) >= 0; });
      if (!ov) { d.forEach(function (x) { decoy[x] = true; }); break; }
    }
    var wrap = document.createElement('div');
    wrap.className = 'dig-wrap';
    var info = document.createElement('div');
    info.className = 'dig-info';
    wrap.appendChild(info);
    var grid = document.createElement('div');
    grid.className = 'dig-grid';
    wrap.appendChild(grid);
    area.appendChild(wrap);

    var found = 0, chances = 10, done = false;
    function renderInfo() {
      info.innerHTML = '👻 已挖出 <b>' + found + '/' + GOAL + '</b> ｜ 剩余机会 <b>' + chances + '/10</b>';
    }
    renderInfo();

    for (var i = 0; i < total; i++) {
      (function (idx) {
        var c = document.createElement('div');
        c.className = 'dig-cell';
        grid.appendChild(c);
        c.addEventListener('click', function () {
          if (done || c.classList.contains('dug')) return;
          c.classList.add('dug');
          chances--;
          if (ghostCells.indexOf(idx) >= 0) {
            c.classList.add('ghost'); c.textContent = '👻';
            found++;
            msg('挖到幽灵啦！(' + found + '/' + GOAL + ')');
          } else if (decoy[idx]) {
            c.classList.add('decoy');
            c.textContent = ['🎃', '🦇', '🕸️', '🌙'][Math.floor(Math.random() * 4)];
            msg('是别的图案，不是幽灵~');
          } else {
            c.classList.add('empty'); c.textContent = '·';
            msg('空空的，继续挖~');
          }
          renderInfo();
          if (found >= GOAL) { done = true; setTimeout(completeLevel, 480); }
          else if (chances <= 0) {
            done = true; msg('机会用完啦，幽灵没挖全…');
            setTimeout(function () { showFail(4); }, 700);
          }
        });
      })(i);
    }
    msg('挖开格子找小幽灵！10 次机会内挖出 ' + GOAL + ' 只小幽灵就过关~');
  }

  // ---------- 第 5 关：打蝙蝠（15s 限时）----------
  function renderBatGame(area) {
    var wrap = document.createElement('div');
    wrap.className = 'bat-wrap';
    var scoreEl = document.createElement('div');
    scoreEl.className = 'bat-score';
    wrap.appendChild(scoreEl);
    var timeEl = document.createElement('div');
    timeEl.className = 'lv-timer';
    wrap.appendChild(timeEl);
    area.appendChild(wrap);

    var need = 12, score = 0, timeLeft = 15, done = false, spawnTimer = null, tickTimer = null;
    function update() { scoreEl.textContent = '已击中 ' + score + '/' + need + ' 🦇'; }
    function updateTime() { timeEl.textContent = '⏱ ' + timeLeft + 's'; }
    update(); updateTime();

    function finish() { done = true; if (spawnTimer) clearInterval(spawnTimer); if (tickTimer) clearInterval(tickTimer); }

    function spawn() {
      if (done) return;
      var b = document.createElement('div');
      b.className = 'bat';
      b.textContent = '🦇';
      b.style.left = (10 + Math.random() * 78) + '%';
      b.style.top = (12 + Math.random() * 60) + '%';
      wrap.appendChild(b);
      var hit = false;
      function hitIt() {
        if (hit || done) return;
        hit = true; score++; update();
        b.classList.add('boom');
        setTimeout(function () { b.remove(); }, 200);
        if (score >= need) { finish(); setTimeout(completeLevel, 360); }
        else msg('击中！(' + score + '/' + need + ')');
      }
      b.addEventListener('pointerdown', hitIt);
      setTimeout(function () { if (!hit) b.remove(); }, 1400);
    }
    spawn();
    spawnTimer = setInterval(spawn, 700);
    tickTimer = setInterval(function () {
      if (done) return;
      timeLeft--;
      updateTime();
      if (timeLeft <= 0) {
        finish();
        msg('时间到！还差 ' + (need - score) + ' 只~');
        setTimeout(function () { showFail(5); }, 700);
      }
    }, 1000);
    levelCleanup = function () { if (spawnTimer) clearInterval(spawnTimer); if (tickTimer) clearInterval(tickTimer); };
    msg('15 秒内击中 ' + need + ' 只蝙蝠！');
  }

  // ---------- 第 6 关：南瓜快跑（接糖躲骷髅，15s 限时）----------
  function renderRunGame(area) {
    var wrap = document.createElement('div');
    wrap.className = 'run-wrap';
    var scoreEl = document.createElement('div');
    scoreEl.className = 'run-score';
    wrap.appendChild(scoreEl);
    var timeEl = document.createElement('div');
    timeEl.className = 'lv-timer';
    wrap.appendChild(timeEl);
    var paddle = document.createElement('div');
    paddle.className = 'run-paddle';
    paddle.textContent = '🎃';
    wrap.appendChild(paddle);
    area.appendChild(wrap);

    var need = 8, score = 0, done = false, raf = null, alive = true, timeLeft = 15, tickTimer = null;
    var W = wrap.clientWidth || 320;
    var paddleX = W / 2;
    var items = [];
    function updateScore() { scoreEl.textContent = '已接住 ' + score + '/' + need + ' 🍬'; }
    function updateTime() { timeEl.textContent = '⏱ ' + timeLeft + 's'; }
    updateScore(); updateTime();

    function movePaddle(clientX) {
      var rect = wrap.getBoundingClientRect();
      var x = clientX - rect.left;
      paddleX = Math.max(26, Math.min(W - 26, x));
      paddle.style.left = paddleX + 'px';
    }
    wrap.addEventListener('pointermove', function (e) { if (!done) movePaddle(e.clientX); });
    wrap.addEventListener('pointerdown', function (e) { if (!done) movePaddle(e.clientX); });

    function spawn() {
      if (done) return;
      var el = document.createElement('div');
      var bad = Math.random() < 0.38;
      el.className = 'run-item' + (bad ? ' bad' : '');
      el.textContent = bad ? '💀' : '🍬';
      var x = 24 + Math.random() * (W - 48);
      el.style.left = x + 'px';
      wrap.appendChild(el);
      items.push({ el: el, x: x, y: -30, vy: 2.2 + Math.random() * 1.3, bad: bad, checked: false });
    }

    var last = 0, spawnAcc = 0;
    function loop(ts) {
      if (done || !alive) return;
      if (!last) last = ts;
      var dt = ts - last; last = ts;
      if (dt > 60) dt = 60;
      spawnAcc += dt;
      if (spawnAcc > 620) { spawnAcc = 0; spawn(); }
      var ph = wrap.clientHeight;
      for (var i = items.length - 1; i >= 0; i--) {
        var it = items[i];
        it.y += it.vy * (dt / 16);
        it.el.style.top = it.y + 'px';
        if (!it.checked && it.y >= ph - 42) {
          it.checked = true;
          if (Math.abs(it.x - paddleX) < 42) {
            if (it.bad) { it.el.remove(); items.splice(i, 1); fail(); return; }
            score++;
            updateScore();
            it.el.remove(); items.splice(i, 1);
            if (score >= need) { win(); return; }
            else msg('接住啦！(' + score + '/' + need + ')');
            continue;
          }
        }
        if (it.y > ph + 12) { it.el.remove(); items.splice(i, 1); }
      }
      raf = requestAnimationFrame(loop);
    }
    function fail() {
      if (done) return;
      done = true;
      if (tickTimer) clearInterval(tickTimer);
      if (raf) cancelAnimationFrame(raf);
      msg('碰到骷髅啦！再试一次~');
      setTimeout(function () { if (alive) showFail(6); }, 800);
    }
    function win() {
      if (done) return;
      done = true;
      if (tickTimer) clearInterval(tickTimer);
      if (raf) cancelAnimationFrame(raf);
      setTimeout(completeLevel, 360);
    }
    raf = requestAnimationFrame(loop);
    tickTimer = setInterval(function () {
      if (done || !alive) return;
      timeLeft--;
      updateTime();
      if (timeLeft <= 0) {
        done = true;
        if (raf) cancelAnimationFrame(raf);
        msg('时间到！还差 ' + (need - score) + ' 颗~');
        setTimeout(function () { if (alive) showFail(6); }, 700);
      }
    }, 1000);
    levelCleanup = function () { alive = false; if (raf) cancelAnimationFrame(raf); if (tickTimer) clearInterval(tickTimer); };
    msg('15 秒内移动🎃接住🍬，小心💀！接满 ' + need + ' 颗过关');
  }

  // ---------- 第 7 关：配置奶茶（自由调配 + 摇杯 + 评分）----------
  function renderMilkGame(area) {
    // 配料与隐藏风味类别（评分规则见 game.js 注释与评分标准文档）
    var ING = [
      { ic: '🥛', name: '牛奶', cat: '奶' },
      { ic: '🧋', name: '珍珠', cat: '料' },
      { ic: '🍯', name: '蜂蜜', cat: '甜' },
      { ic: '🍓', name: '草莓', cat: '甜' },
      { ic: '🍵', name: '抹茶', cat: '茶' },
      { ic: '☕', name: '咖啡', cat: '茶' },
      { ic: '🧊', name: '冰块', cat: '冰' },
      { ic: '🍫', name: '巧克力', cat: '甜' }
    ];
    var CATS = ['奶', '料', '甜', '茶', '冰'];
    var cup = [];      // 放入的配料下标（可重复）
    var shakes = 0;
    var MAX = 10;
    var alive = true;

    var wrap = document.createElement('div');
    wrap.className = 'milk-wrap';
    wrap.innerHTML = '<div class="milk-hint">自由调配专属奶茶：点配料加进杯子，点杯子摇匀，最后点「评分」🧋</div>';

    // 杯子（可点击 = 摇）
    var cupBox = document.createElement('div');
    cupBox.className = 'milk-cup';
    var cupLiquid = document.createElement('div');
    cupLiquid.className = 'milk-liquid';
    cupBox.appendChild(cupLiquid);
    var cupShake = document.createElement('div');
    cupShake.className = 'milk-shake';
    cupShake.textContent = '已摇 0 下';
    cupBox.appendChild(cupShake);
    wrap.appendChild(cupBox);

    var fillEl = document.createElement('div');
    fillEl.className = 'milk-fill';
    wrap.appendChild(fillEl);

    var palette = document.createElement('div');
    palette.className = 'milk-palette';
    wrap.appendChild(palette);

    var scoreBtn = document.createElement('button');
    scoreBtn.className = 'btn btn-primary milk-done';
    scoreBtn.textContent = '📊 评分';
    wrap.appendChild(scoreBtn);

    var resultEl = document.createElement('div');
    resultEl.className = 'milk-result';
    wrap.appendChild(resultEl);

    area.appendChild(wrap);

    function refresh() {
      var h = Math.min(100, cup.length / MAX * 100);
      cupLiquid.style.height = h + '%';
      cupLiquid.innerHTML = cup.map(function (i) { return ING[i].ic; }).join('');
      cupShake.textContent = '已摇 ' + shakes + ' 下';
      fillEl.textContent = cup.length === 0
        ? '杯子空空的~'
        : ('杯中 ' + cup.length + '/' + MAX + ' 份：' + cup.map(function (i) { return ING[i].ic; }).join(' '));
    }

    // 摇杯子
    cupBox.addEventListener('click', function () {
      if (!alive) return;
      shakes++;
      cupBox.classList.remove('shake');
      void cupBox.offsetWidth;
      cupBox.classList.add('shake');
      refresh();
      msg('摇一摇～（已摇 ' + shakes + ' 下）');
    });

    // 加配料
    ING.forEach(function (ing, i) {
      var b = document.createElement('button');
      b.className = 'milk-ing';
      b.innerHTML = '<span class="mi">' + ing.ic + '</span><span class="mn">' + ing.name + '</span>';
      b.addEventListener('click', function () {
        if (!alive) return;
        if (cup.length >= MAX) { msg('杯子满啦，先摇匀评分吧~'); return; }
        cup.push(i);
        refresh();
      });
      palette.appendChild(b);
    });

    scoreBtn.addEventListener('click', function () {
      if (!alive) return;
      var cats = { 奶: 0, 料: 0, 甜: 0, 茶: 0, 冰: 0 };
      cup.forEach(function (i) { cats[ING[i].cat]++; });
      var total = cup.length;

      // 1) 风味分 50：五类每出现一类 +8（满 40），再按各类份数均衡度加 0~10
      var haveCats = CATS.filter(function (k) { return cats[k] > 0; });
      var flavor = haveCats.length * 8;
      var vals = CATS.map(function (k) { return cats[k]; });
      var mean = vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
      var variance = vals.reduce(function (a, b) { return a + (b - mean) * (b - mean); }, 0) / vals.length;
      var std = Math.sqrt(variance);
      var balanceBonus = Math.max(0, 10 - Math.round(std * 4));
      flavor = Math.min(50, flavor + balanceBonus);
      if (total === 0) flavor = 0;

      // 2) 浓度分 20：总份数 6~10 满分，4~5 或 11 得 12，2~3 得 6，其余 0
      var conc = 0;
      if (total >= 6 && total <= 10) conc = 20;
      else if (total >= 4) conc = 12;
      else if (total >= 2) conc = 6;

      // 3) 摇匀分 30：摇 6~10 下满分；1~5 下线性至 18；>10 每多 1 下 -4；0 下为 0
      var shake = 0;
      if (shakes >= 6 && shakes <= 10) shake = 30;
      else if (shakes > 0 && shakes < 6) shake = Math.round(shakes / 6 * 18);
      else if (shakes > 10) shake = Math.max(0, 30 - (shakes - 10) * 4);

      var totalScore = flavor + conc + shake;
      var pass = totalScore >= 70;

      resultEl.innerHTML =
        '<div class="mr-title">得分 <b>' + totalScore + '</b> / 100 ' + (pass ? '🎉 合格！' : '😅 再调调~') + '</div>' +
        '<div class="mr-line">风味搭配：' + flavor + ' / 50</div>' +
        '<div class="mr-line">浓度适中：' + conc + ' / 20</div>' +
        '<div class="mr-line">摇匀程度：' + shake + ' / 30（摇了 ' + shakes + ' 下）</div>';

      if (pass) setTimeout(completeLevel, 760);
      else setTimeout(function () { if (alive) showFail(7); }, 900);
    });

    levelCleanup = function () { alive = false; };
    msg('自由加料、点杯摇匀，凑够 70 分就过关~');
    refresh();
  }

  // ---------- 第 8 关：玉楠小测验（同关多题）----------
  function renderQuizGame(area) {
    var QUIZ = [
      { q: '在楠家烤肉时，璇玩了什么游戏？', opts: ['原神', '星露谷', '王者荣耀', '蛋仔派对'], a: 1 },
      { q: '一起吃自助是谁过生日？', opts: ['王人资', '潘会计', '李工程师', '刘经理'], a: 1 },
      { q: '庄胜拼豆日，璇给朋友拼了一个谁的小笔嘎？', opts: ['蒋敦豪', '鹭卓', '李耕耘', '李昊', '赵一博', '卓沅', '赵小童', '何浩楠', '陈少熙', '王一珩'], a: 1 }
    ];
    var idx = 0;
    var wrap = document.createElement('div');
    wrap.className = 'quiz-wrap';
    area.appendChild(wrap);

    function render() {
      wrap.innerHTML = '';
      var prog = document.createElement('div');
      prog.className = 'quiz-prog';
      prog.textContent = '第 ' + (idx + 1) + ' / ' + QUIZ.length + ' 题';
      wrap.appendChild(prog);
      var qq = document.createElement('div');
      qq.className = 'quiz-q';
      qq.textContent = QUIZ[idx].q;
      wrap.appendChild(qq);
      var opts = document.createElement('div');
      opts.className = 'quiz-opts';
      wrap.appendChild(opts);
      QUIZ[idx].opts.forEach(function (text, i) {
        var b = document.createElement('button');
        b.className = 'quiz-opt';
        b.textContent = text;
        b.addEventListener('click', function () { onPick(b, i); });
        opts.appendChild(b);
      });
    }
    function onPick(btn, i) {
      if (btn.classList.contains('done')) return;
      if (i === QUIZ[idx].a) {
        btn.classList.add('correct', 'done');
        var kids = btn.parentNode.children;
        for (var k = 0; k < kids.length; k++) kids[k].classList.add('done');
        msg('答对啦！');
        setTimeout(function () {
          idx++;
          if (idx >= QUIZ.length) { renderTntGame(area); return; }
          else render();
        }, 620);
      } else {
        btn.classList.add('wrong');
        msg('再想想~');
        setTimeout(function () { btn.classList.remove('wrong'); }, 600);
      }
    }
    msg('玉楠小测验：先答粉丝题，再认时代少年团~');
    render();
  }

  // ---------- 第 8 关（续）：时代少年团认人题 ----------
  // 直接内联照片清单，避免用 fetch 读取（fetch 在本地 file:// 打开或某些托管下会被浏览器拦截，
  // 会导致照片永远显示“待添加”占位）。内联后本地双击 index.html 也能正常显示照片。
  var TNT_DATA = {
    members: [
      { id: 'dingchengxin', name: '丁程鑫', photos: ['dingchengxin/13bc7801bfb208798a326ff6dde17d1d.jpg', 'dingchengxin/3822b9089ec6c36f35f6438661b5bc96.jpg', 'dingchengxin/4c7fcf332dbed08c9b00f31df6df4e2f.jpg'] },
      { id: 'hejunlin', name: '贺峻霖', photos: ['hejunlin/240e01412b891cf0772984b9d8aafcd4.jpg', 'hejunlin/3c54d63bf169f40f3fcbbebcd647174a.jpg', 'hejunlin/d00c4a7d2f8f1d02556a511dacf07975.jpg'] },
      { id: 'liuyaowen', name: '刘耀文', photos: ['liuyaowen/4341a101c96021d64161a58e49e844aa.jpg', 'liuyaowen/4712d25f2122b82e83494464d8aee8e6.jpg', 'liuyaowen/557334fa66e3a207fcb67df9fd805281.jpg'] },
      { id: 'majiaqi', name: '马嘉祺', photos: ['majiaqi/492b3967f423af6310a43b3410418eb5.jpg', 'majiaqi/e278cf03bb453c378f129ed8e60f4514.jpg', 'majiaqi/f68c9782397f0cdb3bff35925b9df7f6.jpeg'] },
      { id: 'songyaxuan', name: '宋亚轩', photos: ['songyaxuan/210816720057dc14cb77c82484eb889b.jpg', 'songyaxuan/8698527bdf23379d16569996e12ee0c7.jpg', 'songyaxuan/c06700eb8c296a3c58cf4d0265f5e97a.jpg'] },
      { id: 'yanhaochun', name: '严浩翔', photos: ['yanhaochun/5f4a1a0d2ccfe1ac9b0f3695ae0445d7.jpg', 'yanhaochun/66f33d25c02b6121fd31684c884cf33d.jpg', 'yanhaochun/bb2716d5325f28a14bbbd919414cfaf4.jpg'] },
      { id: 'zhangzhenyuan', name: '张真源', photos: ['zhangzhenyuan/16e88f641cebfe7fdf93f7669d038b1d.jpg', 'zhangzhenyuan/52eca12e973aa705951982c6b6165a29.jpg', 'zhangzhenyuan/ee1ff7c47d3c1e48b4d55593182d3992.jpg'] }
    ]
  };
  function renderTntGame(area) {
    area.innerHTML = '';
    msg('接下来是时代少年团认人题，看清每一张脸~');
    var members = (TNT_DATA && TNT_DATA.members) || [];
    members = members.filter(function (m) { return m.photos && m.photos.length; });
    if (members.length < 2) {
      area.innerHTML = '<div class="tnt-empty">时代少年团的照片还没放好～<br>把每位成员的照片放进 <b>assets/tnt/&lt;拼音&gt;/</b> 文件夹即可。</div>';
      return;
    }
    runTnt(members, area);
  }

  function pickPhotos(members, n) {
    // 从 n 个不同成员各取 1 张随机照片
    var pool = members.slice();
    for (var i = pool.length - 1; i > 0; i--) { var r = Math.floor(Math.random() * (i + 1)); var t = pool[i]; pool[i] = pool[r]; pool[r] = t; }
    return pool.slice(0, n).map(function (m) {
      var ph = m.photos[Math.floor(Math.random() * m.photos.length)];
      return { id: m.id, name: m.name, photo: 'assets/tnt/' + ph };
    });
  }

  function runTnt(members, area) {
    var qidx = 0, TOTALQ = 4;
    function advance() { qidx++; setTimeout(next, 520); }
    function next() {
      area.innerHTML = '';
      if (qidx >= TOTALQ) { setTimeout(completeLevel, 460); return; }
      var types = ['recognize', 'recognize', 'mismatch', 'connect'];
      var type = types[qidx % types.length];
      if (type === 'recognize') buildRecognize(members, area, advance);
      else if (type === 'mismatch') buildMismatch(members, area, advance);
      else buildConnect(members, area, advance);
    }
    next();
  }

  // 题型一：认人——从若干张照片里选出"某某"
  function buildRecognize(members, area, done) {
    var k = Math.min(4, members.length);
    var picks = pickPhotos(members, k);
    var target = picks[Math.floor(Math.random() * picks.length)];
    var wrap = document.createElement('div');
    wrap.className = 'tnt-wrap';
    wrap.innerHTML = '<div class="tnt-q">哪个是 <b>' + target.name + '</b>？</div>';
    var grid = document.createElement('div');
    grid.className = 'tnt-grid';
    wrap.appendChild(grid);
    area.appendChild(wrap);
    picks.forEach(function (p) {
      var b = document.createElement('button');
      b.className = 'tnt-photo';
      b.innerHTML = '<img src="' + p.photo + '" alt="" onerror="this.parentNode.classList.add(\'broken\')">';
      b.addEventListener('click', function () {
        if (b.classList.contains('done')) return;
        if (p.id === target.id) {
          b.classList.add('correct', 'done');
          msg('答对啦！就是 ' + target.name + ' 🎉');
          done();
        } else {
          b.classList.add('wrong');
          msg('再看看~');
          setTimeout(function () { b.classList.remove('wrong'); }, 600);
        }
      });
      grid.appendChild(b);
    });
  }

  // 题型二：不匹配——找出名字与照片对不上的那一组
  function buildMismatch(members, area, done) {
    var k = Math.min(4, members.length);
    var picks = pickPhotos(members, k);
    // 随机让其中一组名字/照片错位
    var wrongIdx = Math.floor(Math.random() * picks.length);
    var swapWith = (wrongIdx + 1) % picks.length;
    var wrongName = picks[wrongIdx].name;
    picks[wrongIdx].name = picks[swapWith].name; // 名字用别人的
    var wrap = document.createElement('div');
    wrap.className = 'tnt-wrap';
    wrap.innerHTML = '<div class="tnt-q">哪一组「名字 – 照片」不匹配？</div>';
    var grid = document.createElement('div');
    grid.className = 'tnt-grid';
    wrap.appendChild(grid);
    area.appendChild(wrap);
    picks.forEach(function (p, i) {
      var b = document.createElement('button');
      b.className = 'tnt-photo';
      b.innerHTML = '<img src="' + p.photo + '" alt="" onerror="this.parentNode.classList.add(\'broken\')"><span class="tnt-name">' + p.name + '</span>';
      b.addEventListener('click', function () {
        if (b.classList.contains('done')) return;
        if (i === wrongIdx) {
          b.classList.add('correct', 'done');
          msg('找到啦！' + wrongName + ' 才是这张照片的主人~');
          done();
        } else {
          b.classList.add('wrong');
          msg('这组是对的哦，再找找~');
          setTimeout(function () { b.classList.remove('wrong'); }, 600);
        }
      });
      grid.appendChild(b);
    });
  }

  // 题型三：连线——把名字和对应照片连起来（点名字再点照片）
  function buildConnect(members, area, done) {
    var k = Math.min(3, members.length);
    var picks = pickPhotos(members, k);
    var wrap = document.createElement('div');
    wrap.className = 'tnt-wrap';
    wrap.innerHTML = '<div class="tnt-q">把名字和照片连起来（先点名字，再点照片）</div>';
    var photosBox = document.createElement('div');
    photosBox.className = 'tnt-grid';
    var namesBox = document.createElement('div');
    namesBox.className = 'tnt-names';
    wrap.appendChild(photosBox);
    wrap.appendChild(namesBox);
    area.appendChild(wrap);

    var links = {};           // photoIndex -> memberId（用户连的）
    var pending = null;       // 当前选中的名字
    var namedPicks = picks.map(function (p) { return { id: p.id, name: p.name }; });
    for (var s = namedPicks.length - 1; s > 0; s--) { var r = Math.floor(Math.random() * (s + 1)); var tt = namedPicks[s]; namedPicks[s] = namedPicks[r]; namedPicks[r] = tt; }

    var photoBtns = [];
    picks.forEach(function (p, i) {
      var b = document.createElement('button');
      b.className = 'tnt-photo';
      b.dataset.i = i;
      b.innerHTML = '<img src="' + p.photo + '" alt="" onerror="this.parentNode.classList.add(\'broken\')"><span class="tnt-link"></span>';
      b.addEventListener('click', function () {
        if (links[i] !== undefined) return;
        if (!pending) { msg('先点一个名字~'); return; }
        links[i] = pending;
        b.querySelector('.tnt-link').textContent = pendingName;
        b.classList.add('linked');
        clearPending();
        check();
      });
      photosBox.appendChild(b);
      photoBtns.push(b);
    });

    var nameBtns = [];
    var pendingName = '';
    namedPicks.forEach(function (np) {
      var b = document.createElement('button');
      b.className = 'tnt-name-btn';
      b.textContent = np.name;
      b.dataset.id = np.id;
      b.addEventListener('click', function () {
        if (b.classList.contains('used')) return;
        clearPending();
        pending = np.id; pendingName = np.name;
        b.classList.add('pending');
        msg('已选「' + np.name + '」，再点对应照片');
      });
      namesBox.appendChild(b);
      nameBtns.push(b);
    });

    function clearPending() {
      pending = null; pendingName = '';
      nameBtns.forEach(function (b) { b.classList.remove('pending'); });
    }
    function check() {
      if (Object.keys(links).length < k) return;
      var ok = true;
      for (var key in links) { if (links[key] !== picks[key].id) { ok = false; break; } }
      if (ok) { msg('全部连对啦！🎉'); done(); }
      else {
        msg('有连错的，清掉重连~');
        links = {};
        photoBtns.forEach(function (b) { b.classList.remove('linked'); b.querySelector('.tnt-link').textContent = ''; });
      }
    }
  }

  // ---------- 开始一关 ----------
  function startLevel(level) {
    stopLevel();
    curLevel = level;
    var def = LEVELS[level - 1];
    show('screen-game');
    document.getElementById('level-tag').textContent = '第 ' + level + ' 关 · ' + def.name;
    var area = document.getElementById('game-area');
    area.innerHTML = '';
    msg(def.scene);
    if (level === 1) renderMemoryGame(area);
    else if (level === 2) renderLinkGame(area);
    else if (level === 3) renderSimonGame(area);
    else if (level === 4) renderDigGame(area);
    else if (level === 5) renderBatGame(area);
    else if (level === 6) renderRunGame(area);
    else if (level === 7) renderMilkGame(area);
    else if (level === 8) renderQuizGame(area);
  }

  function completeLevel() {
    stopLevel();
    var def = LEVELS[curLevel - 1];
    state.candies[curLevel] = true;
    saveState(state);
    updateBag();
    document.getElementById('candy-name').textContent = def.candy.name;
    document.getElementById('candy-desc').innerHTML = def.candy.desc;
    document.getElementById('candy-box').innerHTML = candySVG(def.candy.color);
    var nextBtn = document.getElementById('btn-next');
    var all = Object.keys(state.candies).length >= TOTAL;
    nextBtn.textContent = all ? '查看结局 🎉' : '继续冒险';
    show('screen-card');
  }

  document.getElementById('btn-next').onclick = function () {
    if (curLevel < TOTAL) startLevel(curLevel + 1);
    else showEnding();
  };

  // 失败弹窗：重开本关（最多 2 次）/ 继续下一关
  document.getElementById('btn-fail-retry').onclick = function () {
    var lv = curLevel;
    if (retriesLeft(lv) <= 0) return;
    retries[lv] = retriesLeft(lv) - 1;
    hideFail();
    startLevel(lv);
  };
  document.getElementById('btn-fail-skip').onclick = function () {
    hideFail();
    if (curLevel < TOTAL) startLevel(curLevel + 1);
    else showEnding();
  };

  // ---------- 我的糖果 ----------
  function renderCollection() {
    var list = document.getElementById('card-list');
    list.innerHTML = '';
    var any = false;
    for (var l = 1; l <= TOTAL; l++) {
      if (state.candies[l]) {
        any = true;
        var c = LEVELS[l - 1].candy;
        var d = document.createElement('div');
        d.className = 'mini-card';
        d.innerHTML = candySVG(c.color) +
          '<div class="mc-info"><div class="mc-name">' + c.name + '</div>' +
          '<div class="mc-desc">' + c.desc + '</div>' +
          '<div class="mc-note">礼物兑换糖果一颗</div>' +
          '<div class="mc-lv">第 ' + l + ' 关 · ' + LEVELS[l - 1].name + '（点击重玩）</div></div>';
        (function (lv) { d.addEventListener('click', function () { startLevel(lv); }); })(l);
        list.appendChild(d);
      }
    }
    if (!any) list.innerHTML = '<p class="tip">还没有糖果，快去冒险吧！</p>';
    var all = Object.keys(state.candies).length >= TOTAL;
    document.getElementById('btn-ending').style.display = all ? 'block' : 'none';
    show('screen-collection');
  }

  // ---------- 结局 ----------
  function showEnding() {
    document.getElementById('ending-card').innerHTML = endingCardSVG();
    show('screen-ending');
    try {
      var b = document.getElementById('bgm'); if (b) b.pause();
      var w = document.getElementById('win');
      if (w) { w.currentTime = 0; var p = w.play(); if (p && p.catch) p.catch(function () {}); }
    } catch (e) {}
  }

  // ---------- 导航 ----------
  function firstIncomplete() {
    for (var l = 1; l <= TOTAL; l++) if (!state.candies[l]) return l;
    return TOTAL;
  }
  document.getElementById('btn-start').onclick = function () {
    if (Object.keys(state.candies).length >= TOTAL) { showEnding(); return; }
    startLevel(firstIncomplete());
  };
  document.getElementById('btn-collection').onclick = renderCollection;
  document.getElementById('btn-quit').onclick = function () { stopLevel(); show('screen-start'); };
  var restartArmed = false, restartTimer = null;
  document.getElementById('btn-restart').onclick = function () {
    var btn = this;
    if (!restartArmed) {
      restartArmed = true;
      btn.textContent = '确认重开？';
      btn.classList.add('armed');
      restartTimer = setTimeout(function () {
        restartArmed = false; btn.textContent = '重新开始'; btn.classList.remove('armed');
      }, 3000);
      return;
    }
    clearTimeout(restartTimer);
    restartArmed = false;
    btn.textContent = '重新开始';
    btn.classList.remove('armed');
    state.candies = {};
    saveState(state);
    updateBag();
    stopLevel();
    show('screen-start');
  };
  document.getElementById('btn-back-start').onclick = function () { show('screen-start'); };
  document.getElementById('btn-ending').onclick = showEnding;
  document.getElementById('btn-ending-back').onclick = function () { show('screen-start'); };
  document.getElementById('btn-replay').onclick = replayAll;
  document.getElementById('btn-replay-ending').onclick = replayAll;
  document.getElementById('btn-save').onclick = function () {
    svgToPng(endingCardSVG(), '玉楠生日快乐.png');
  };

  // ---------- 背景音乐 ----------
  var bgm = document.getElementById('bgm');
  var bgmToggle = document.getElementById('bgm-toggle');
  var bgmMuted = false;
  try { bgmMuted = localStorage.getItem('bgm_muted') === '1'; } catch (e) {}
  if (bgm) bgm.volume = 0.45;
  function startBgm() {
    if (!bgm || bgmMuted) return;
    var p = bgm.play();
    if (p && p.catch) p.catch(function () {});
  }
  function updateBgmBtn() {
    if (!bgmToggle) return;
    bgmToggle.textContent = bgmMuted ? '🔇' : '🎵';
  }
  if (bgmToggle) {
    bgmToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      bgmMuted = !bgmMuted;
      try { localStorage.setItem('bgm_muted', bgmMuted ? '1' : '0'); } catch (e) {}
      if (bgmMuted) { if (bgm) bgm.pause(); } else { startBgm(); }
      updateBgmBtn();
    });
  }
  updateBgmBtn();
  // 浏览器自动播放策略：必须在用户首次手势后启动
  var bgmStarted = false;
  function firstGesture() {
    if (bgmStarted) return;
    bgmStarted = true;
    startBgm();
  }
  document.addEventListener('pointerdown', firstGesture);

  updateBag();

  // 刷新/重开页面后强制回到主界面（糖果进度保留在糖果袋里）
  show('screen-start');
})();
