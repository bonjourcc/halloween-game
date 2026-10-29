// 扫描 assets/tnt/<成员拼音>/ 下的照片，生成 manifest.json
// 用法：node assets/tnt/build_manifest.js
const fs = require('fs');
const path = require('path');

const NAME = {
  majiaqi: '马嘉祺',
  dingchengxin: '丁程鑫',
  songyaxuan: '宋亚轩',
  liuyaowen: '刘耀文',
  zhangzhenyuan: '张真源',
  yanhaochun: '严浩翔',
  hejunlin: '贺峻霖'
};

const dir = __dirname;
const entries = fs.readdirSync(dir, { withFileTypes: true }).filter(function (d) { return d.isDirectory(); });
const out = { members: [] };

entries.forEach(function (d) {
  const p = path.join(dir, d.name);
  const files = fs.readdirSync(p).filter(function (f) { return /\.(jpe?g|png|webp|gif|avif)$/i.test(f); });
  if (!files.length) return;
  out.members.push({
    id: d.name,
    name: NAME[d.name] || d.name,
    photos: files.map(function (f) { return d.name + '/' + f; })
  });
});

fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(out, null, 2));
console.log('已生成 manifest.json，共 ' + out.members.length + ' 位成员：');
out.members.forEach(function (m) { console.log('  ' + m.name + ' (' + m.id + ')：' + m.photos.length + ' 张'); });
if (!out.members.length) console.log('（提示：把每位成员的照片放进对应的拼音子文件夹即可）');
