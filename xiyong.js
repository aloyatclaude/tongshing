// 喜用引擎（扶抑 + 调候《穷通宝鉴》）— 由 tongshing-research/build_xiyong.js 自动生成，勿手改
(function(){
const defs = {};
defs['./geju.js'] = function(module, exports, require){
// 格局判断原型（规则版）
// 正格身强/身弱 · 专旺(曲直/炎上/稼穑/从革/润下) · 从强 · 从弱(从财/从杀/从儿/从势) · 化气 · 两神成象
// 输入：四柱字符串数组，如 ['癸酉','辛酉','壬辰','壬寅']；时柱可为 null
const GAN = '甲乙丙丁戊己庚辛壬癸', ZHI = '子丑寅卯辰巳午未申酉戌亥';
const WX = ['木','火','土','金','水'];
const GAN_WX = [0,0,1,1,2,2,3,3,4,4];
const ZHI_WX = [4,2,0,0,2,1,1,2,3,3,2,4];
const HIDE = { 子:['癸'], 丑:['己','癸','辛'], 寅:['甲','丙','戊'], 卯:['乙'], 辰:['戊','乙','癸'], 巳:['丙','庚','戊'],
               午:['丁','己'], 未:['己','丁','乙'], 申:['庚','壬','戊'], 酉:['辛'], 戌:['戊','辛','丁'], 亥:['壬','甲'] };
// 藏干位阶：0 本气，1 中气（长生、午中己），2 余气/墓气（弱根）
const QI_RANK = { 子:[0], 丑:[0,2,2], 寅:[0,1,2], 卯:[0], 辰:[0,2,2], 巳:[0,1,2], 午:[0,1], 未:[0,2,2], 申:[0,1,2], 酉:[0], 戌:[0,2,2], 亥:[0,1] };
const QI_W = [1, .5, .3];
const FANG = [['寅卯辰',0],['巳午未',1],['申酉戌',3],['亥子丑',4]];
const JU = [['亥卯未',0],['寅午戌',1],['巳酉丑',3],['申子辰',4]];
const ZHUANWANG = ['曲直格','炎上格','稼穑格','从革格','润下格'];
const HE = { 甲:['己',2], 己:['甲',2], 乙:['庚',3], 庚:['乙',3], 丙:['辛',4], 辛:['丙',4], 丁:['壬',0], 壬:['丁',0], 戊:['癸',1], 癸:['戊',1] };
const ROLE = ['比劫','食伤','财','官杀','印'];
const SEASON = { 寅:0,卯:0,辰:0, 巳:1,午:1,未:1, 申:3,酉:3,戌:3, 亥:4,子:4,丑:4 };
const ge = g => GAN_WX[GAN.indexOf(g)];

function analyse(pillars){
  const hasTime = !!pillars[3];
  const gan = pillars.map(p => p ? p[0] : null), zhi = pillars.map(p => p ? p[1] : null);
  const dm = gan[2], d = ge(dm), mz = zhi[1];
  const role = e => ROLE[(e - d + 5) % 5];

  // 方 / 局：成方成局的地支按所化五行论（合局则化），其原有藏干不再作根
  const zs = zhi.filter(Boolean).join('');
  const fang = FANG.filter(([f]) => [...f].every(c => zs.includes(c))).map(([f,e]) => ({f, e}));
  const ju = JU.filter(([j]) => [...j].every(c => zs.includes(c))).map(([j,e]) => ({j, e}));
  const trans = {}; [...fang.map(x => [x.f, x.e]), ...ju.map(x => [x.j, x.e])].forEach(([s,e]) => [...s].forEach(c => trans[c] ??= e));
  const hid = z => trans[z] !== undefined ? [{e: trans[z], m: 0}] : HIDE[z].map((g,i) => ({e: ge(g), m: QI_RANK[z][i]}));

  const rootOf = e => { let best = null; zhi.forEach((z,k) => { if (!z) return; hid(z).forEach(h => { if (h.e === e && (best === null || h.m < best.m)) best = {z, k, m: h.m}; }); }); return best; };
  const rootName = r => r ? `${r.z}（${['本气','中气','余气'][r.m]}）` : '无根';
  const tou = e => gan.some((g,k) => g && k !== 2 && ge(g) === e);

  // 力量：透干有根 1、无根 0.5（虚浮）；地支藏干按位阶，月令 ×2
  const w = [0,0,0,0,0];
  gan.forEach((g,k) => { if (g && k !== 2) w[ge(g)] += rootOf(ge(g)) ? 1 : .5; });
  zhi.forEach((z,k) => { if (z) hid(z).forEach(h => w[h.e] += QI_W[h.m] * (k === 1 ? 2 : 1)); });
  const byRole = {}; ROLE.forEach(r => byRole[r] = 0); w.forEach((v,e) => byRole[role(e)] += v);
  const total = w.reduce((a,b)=>a+b,0), ratio = (byRole['比劫'] + byRole['印']) / total;

  const dmRoot = rootOf(d), yinE = (d+4)%5, yinRoot = rootOf(yinE);
  const shiE = (d+1)%5, caiE = (d+2)%5, guanE = (d+3)%5;
  const guanRoot = rootOf(guanE), guanTou = tou(guanE);
  const monthRole = role(hid(mz)[0].e);
  const inSeason = d === 2 ? '辰戌丑未'.includes(mz) : SEASON[mz] === d;
  const ownFangJu = fang.some(x => x.e === d) || ju.some(x => x.e === d);
  const earthAll = d === 2 && zhi.filter(Boolean).every(z => '辰戌丑未'.includes(z));

  const out = [], add = (type, conf, why) => out.push({type, conf, why});

  // 1) 化气：日干与月干或时干相合；化神当令，或化神另有透干且通根；日主无本气根；无争合妒合；克化神者不透而有根
  [1,3].forEach(k => {
    const g = gan[k]; if (!g || HE[dm][0] !== g) return;
    const hua = HE[dm][1];
    const huaSeason = hua === 2 ? '辰戌丑未'.includes(mz) : SEASON[mz] === hua;
    const huaTouRooted = gan.some((x,i) => x && i !== 2 && i !== k && ge(x) === hua) && rootOf(hua);
    const zhengHe = gan.some((x,i) => x && i !== 2 && x === dm) || gan.some((x,i) => x && i !== k && i !== 2 && x === g);
    const keHua = (hua+3)%5;
    if ((huaSeason || huaTouRooted) && (!dmRoot || dmRoot.m > 0) && !zhengHe && !(tou(keHua) && rootOf(keHua))) {
      add(`化${WX[hua]}格`, huaSeason && !dmRoot ? '高' : '中',
        [`日干${dm}与${k===1?'月':'时'}干${g}合化${WX[hua]}`, huaSeason ? `${mz}月${WX[hua]}当令` : `化神${WX[hua]}透干通根`, dmRoot ? `日主仅${rootName(dmRoot)}` : '日主无根']);
    }
  });

  // 2) 专旺（一行得气）：日主当令；地支成本气方/局（或土日全土，或比劫过半且扶助≥70%）；官杀不透、无本气根
  if (inSeason && !guanTou && !(guanRoot && guanRoot.m === 0) &&
      (ownFangJu || earthAll || (byRole['比劫'] / total >= .5 && ratio >= .7))) {
    add(ZHUANWANG[d], (ownFangJu || earthAll) && !guanRoot ? '高' : '中',
      [`日主${dm}${WX[d]}生于${mz}月当令`, ownFangJu ? `地支成${WX[d]}方/局` : earthAll ? '地支全土' : `比劫占 ${Math.round(byRole['比劫']/total*100)}%`,
       guanRoot ? `官杀只有${rootName(guanRoot)}，力弱` : '官杀不透无根', byRole['食伤'] ? '有食伤吐秀' : '']);
  }

  // 3) 从强：印比压倒性（≥85%），或日主成方局而不当令（≥70%）；月令为印比或成局；财官不透无本气根
  const caiOrGuanRooted = [caiE, guanE].some(e => { const r = rootOf(e); return (r && r.m === 0) || (tou(e) && r); });
  if (!out.length && !caiOrGuanRooted && !guanTou &&
      ((ratio >= .85 && ['印','比劫'].includes(monthRole)) || (ownFangJu && ratio >= .7))) {
    add('从强格', ratio >= .9 ? '高' : '中', [`印比占 ${Math.round(ratio*100)}%`, ownFangJu ? `日主成${WX[d]}方/局` : `月令${mz}为${monthRole}`, '财官不透、无本气根']);
  }

  // 4) 从弱：日主无根或只有余气根；印不透或透而无本气根；扶助 ≤25%
  const dmWeakRoot = !dmRoot || dmRoot.m === 2;
  const yinHelp = tou(yinE) && yinRoot && yinRoot.m === 0;
  if (!out.length && ratio <= .25 && dmWeakRoot && !yinHelp) {
    const drain = { 食伤: byRole['食伤'], 财: byRole['财'], 官杀: byRole['官杀'] };
    const sum = drain.食伤 + drain.财 + drain.官杀;
    const top = Object.entries(drain).sort((a,b)=>b[1]-a[1])[0];
    const KIND = { 食伤:'从儿格', 财:'从财格', 官杀:'从杀格' };
    const kind = (top[1] / sum >= .55 || (top[0] === monthRole && top[1] / sum >= .45)) ? KIND[top[0]] : '从势格';
    add(kind, !dmRoot && ratio <= .12 ? '高' : '中（可能为假从）',
      [`日主${dmRoot ? '只有' + rootName(dmRoot) : '无根'}`, `扶助只占 ${Math.round(ratio*100)}%`,
       kind === '从势格' ? '食伤财官势均' : `${top[0]}最旺（${Math.round(top[1]/sum*100)}%）`, yinRoot ? `印${rootName(yinRoot)}力弱` : '无印生扶']);
  }
  if (!out.length && ratio > .25 && ratio <= .32 && dmWeakRoot && !yinHelp) {
    add('接近从格（需人工判断）', '低', [`扶助占 ${Math.round(ratio*100)}%，介于正格与从格之间`, `日主${dmRoot ? '只有' + rootName(dmRoot) : '无根'}`]);
  }

  // 5) 两神成象：八字只见两种五行，且各占 3–5 字
  if (hasTime) {
    const cnt = [0,0,0,0,0]; gan.forEach(g => cnt[ge(g)]++); zhi.forEach(z => cnt[ZHI_WX[ZHI.indexOf(z)]]++);
    const two = cnt.map((c,e) => [c,e]).filter(([c]) => c > 0);
    if (two.length === 2 && two.every(([c]) => c >= 3)) {
      const [a, b] = two.map(([,e]) => e), rel = (b - a + 5) % 5;
      add(`两神成象（${WX[a]}${WX[b]}）`, '中', [`八字只有${WX[a]}、${WX[b]}两行，各${two[0][0]}与${two[1][0]}字`, [1,4].includes(rel) ? '两行相生' : '两行相克']);
    }
  }

  // 6) 正格
  if (!out.length) {
    const lab = ratio >= .58 ? '身强' : ratio >= .5 ? '中和偏强' : ratio >= .42 ? '中和偏弱' : '身弱';
    add('正格·' + lab, '—', [`扶助（印比）占 ${Math.round(ratio*100)}%`, `月令${mz}为${monthRole}`, `日主根：${rootName(dmRoot)}`]);
  }
  if (!hasTime) out.forEach(o => o.why.push('时辰未知，结论不稳'));
  return { d, w, byRole, total, ratioNum: ratio, monthRole, mz, inSeason, rootOf, tou, dmRoot,
           pillars: pillars.map(p=>p||'——').join(' '), dm: dm + WX[d], ratio: Math.round(ratio*100) + '%',
           shares: ROLE.map(r => r + Math.round(byRole[r]/total*100) + '%').join(' '), fang: fang.map(x=>x.f), ju: ju.map(x=>x.j), result: out };
}
module.exports = { analyse };

};
defs['./strength.js'] = function(module, exports, require){
// 身强身弱：特征 + 逻辑回归（只用 dev 训练；五折交叉验证估计准确率）
const { analyse } = require('./geju.js');
const G = '甲乙丙丁戊己庚辛壬癸', GW = [0,0,1,1,2,2,3,3,4,4];
const SEASON = { 寅:0,卯:0,辰:2, 巳:1,午:1,未:2, 申:3,酉:3,戌:2, 亥:4,子:4,丑:2 };
function features(p){
  const a = analyse(p), d = a.d;
  const se = SEASON[p[1][1]];
  const wang = se === d ? 1 : 0, xiang = se === (d+4)%5 ? 1 : 0;        // 得令：旺 / 相（印当令）
  const qiu = se === (d+3)%5 || se === (d+2)%5 ? 1 : 0;                   // 囚死：官杀或财当令
  const ZH = { 子:'癸', 丑:'己癸辛', 寅:'甲丙戊', 卯:'乙', 辰:'戊乙癸', 巳:'丙庚戊', 午:'丁己', 未:'己丁乙', 申:'庚壬戊', 酉:'辛', 戌:'戊辛丁', 亥:'壬甲' };
  let rootS = 0, rootW = 0, yinRoot = 0;
  p.forEach((x,k) => { if (!x) return; [...ZH[x[1]]].forEach((g,i) => { const e = GW[G.indexOf(g)]; if (e === d) (i === 0 ? rootS++ : rootW++); if (e === (d+4)%5 && i === 0) yinRoot++; }); });
  let touBi = 0, touYin = 0; p.forEach((x,k) => { if (!x || k === 2) return; const e = GW[G.indexOf(x[0])]; if (e === d) touBi++; if (e === (d+4)%5) touYin++; });
  return [1, a.ratioNum, wang, xiang, qiu, rootS, rootW, yinRoot, touBi, touYin];
}
function train(X, y, iters = 4000, lr = .1, l2 = .01){
  let w = new Array(X[0].length).fill(0);
  for (let it = 0; it < iters; it++) {
    const g = new Array(w.length).fill(0);
    X.forEach((x,i) => { const z = x.reduce((s,v,j) => s + v*w[j], 0), p = 1/(1+Math.exp(-z)); x.forEach((v,j) => g[j] += (p - y[i]) * v); });
    w = w.map((wj,j) => wj - lr * (g[j]/X.length + (j ? l2*wj : 0)));
  }
  return w;
}
const prob = (w, x) => 1/(1+Math.exp(-x.reduce((s,v,j) => s + v*w[j], 0)));
module.exports = { features, train, prob };
if (require.main === module) {
  const L = new Map(require('./labels.json').map(l => [l.id,l])), C = require('./cases_all.json'), dev = require('./split.json').dev;
  const data = dev.filter(id => { const l = L.get(id), c = C[id]; return !c.exclude && c.pillars.length === 4 && l.geju === '正格' && ['身强','身弱'].includes(l.qiangruo); })
                  .map(id => ({ id, x: features(C[id].pillars), y: L.get(id).qiangruo === '身强' ? 1 : 0 }));
  // 五折交叉验证
  let ok = 0; for (let f = 0; f < 5; f++) { const tr = data.filter((_,i) => i % 5 !== f), te = data.filter((_,i) => i % 5 === f);
    const w = train(tr.map(d => d.x), tr.map(d => d.y)); ok += te.filter(d => (prob(w, d.x) >= .5) === (d.y === 1)).length; }
  console.log(`五折交叉验证（dev 内）身强身弱准确率：${ok}/${data.length} = ${(ok/data.length*100).toFixed(1)}%`);
  const w = train(data.map(d => d.x), data.map(d => d.y));
  console.log('权重', ['常数','扶助比例','旺','相','囚死','本气根','余中气根','印本气根','比劫透','印透'].map((n,j) => n + ':' + w[j].toFixed(2)).join(' '));
  require('fs').writeFileSync('strength_w.json', JSON.stringify(w));
}

};
defs['./xiji_table.js'] = function(module, exports, require){
// 用神 → 其余十神喜忌（含按盘面强弱判断的四条）
const R = ['比劫','食伤','财','官杀','印'];
function xiRolesFor(yong, br){
  const s = r => br[r] || 0;
  switch (yong) {
    case '印':   return ['印','比劫'].concat(s('官杀') <= s('印') ? ['官杀'] : []);              // 杀轻则杀印相生为喜，杀重为病
    case '比劫': return ['比劫','印'];
    case '财':   return ['财','食伤'].concat(s('印') > s('比劫') ? [] : ['官杀']);              // 印旺用财：官杀生印为忌；劫旺用财：官杀制劫为喜
    case '食伤': return ['食伤','财','比劫'];                                                   // 比劫生食伤
    case '官杀': return ['官杀','财'].concat(s('官杀') > s('比劫') ? ['印'] : []);              // 杀重则印化杀为喜
  }
}
module.exports = { xiRolesFor, R };

};
defs['./tiaohou_table.js'] = function(module, exports, require){
// 《穷通宝鉴》调候用神表：日干 × 月支（寅卯辰巳午未申酉戌亥子丑），每格按先后次序
const MONTHS = '寅卯辰巳午未申酉戌亥子丑';
const T = {
  甲: ['丙癸','庚丙丁戊己','庚丁壬','癸丁庚','癸丁庚','癸丁庚','庚丁壬','丁丙庚','丁癸','庚丁丙戊','丁庚丙','庚丁丙'],
  乙: ['丙癸','丙癸','癸丙戊','癸','癸丙','癸丙','丙癸己','癸丙丁','癸辛','丙戊','丙','丙'],
  丙: ['壬庚','壬己','壬甲','壬癸庚','壬庚','壬庚','壬戊','壬癸','甲壬','甲戊庚壬','壬戊己','壬甲'],
  丁: ['庚甲','庚甲','甲庚','甲庚','壬庚癸','甲壬庚','甲庚丙戊','甲庚丙戊','甲庚戊','甲庚','甲庚','甲庚'],
  戊: ['丙甲癸','丙甲癸','甲丙癸','甲丙癸','壬甲丙','癸丙甲','丙癸甲','丙癸','甲癸丙','甲丙','丙甲','丙甲'],
  己: ['丙庚甲','甲癸丙','丙癸甲','癸丙','癸丙','癸丙','癸丙','癸丙','甲丙癸','丙甲戊','丙甲','丙甲'],
  庚: ['丙甲丁','丁甲庚丙','甲丁壬癸','壬戊丙丁','壬癸','丁甲','丁甲','丁甲丙','甲壬','丁丙','丁甲丙','丙丁甲'],
  辛: ['己壬庚','壬甲','壬甲','壬甲癸','壬己癸','壬庚甲','壬甲戊','壬甲','壬甲','壬丙','丙戊壬甲','丙壬戊己'],
  壬: ['庚丙戊','戊辛庚','甲庚','壬辛庚癸','癸庚辛','辛甲','戊丁','甲庚','甲丙','戊丙庚','戊丙','丙丁甲'],
  癸: ['辛丙','庚辛','丙辛甲','辛','庚辛壬癸','庚辛壬癸','丁','辛丙','辛甲壬癸','庚辛戊丁','丙辛','丙丁'],
};
const get = (dg, mz) => T[dg][MONTHS.indexOf(mz)];
module.exports = { T, MONTHS, get };

};
defs['./engine_final.js'] = function(module, exports, require){
// 网站用的最终喜用引擎（= engine_v3，模式 T1）：扶抑 + 调候（穷通宝鉴）；真从/专旺/化/旺极衰极顺势
const { analyse } = require('./geju.js');
const { features, prob } = require('./strength.js');
const W = require('./strength_w.json');
const { xiRolesFor } = require('./xiji_table.js');
const { get: tiaohouOf } = require('./tiaohou_table.js');
const WX = ['木','火','土','金','水'], R = ['比劫','食伤','财','官杀','印'];
const G = '甲乙丙丁戊己庚辛壬癸', GW = [0,0,1,1,2,2,3,3,4,4];
const EXT_HI = .8, EXT_LO = .12;
const SPECIAL = [ [/曲直|炎上|稼穑|从革|润下/, null, ['比劫','印','食伤'], '比劫'], [/从强/, '从强', ['比劫','印'], '比劫'],
  [/从财/, '从财', ['财','食伤'], '财'], [/从杀/, '从杀', ['官杀','财'], '官杀'], [/从儿/, '从儿', ['食伤','财'], '食伤'], [/从势/, '从势', ['食伤','财','官杀'], '财'] ];

function predict(p){
  const a = analyse(p), d = a.d, t = a.result[0].type, br = a.byRole;
  const part = xiRoles => { const xi = [], ji = []; R.forEach((r,k) => (xiRoles.includes(r) ? xi : ji).push(WX[(d+k)%5])); return { xi, ji }; };
  const res = (geju, qr, xiRoles, yong, how) => ({ geju, qr, yong, how, reasons: a.result[0].why, ratio: a.ratioNum, ...part(xiRoles) });
  if (/^化/.test(t)) { const h = WX.indexOf(t[1]); const xi = [WX[h], WX[(h+4)%5], WX[(h+1)%5]];
    return { geju: t.replace(/格$/,''), qr: null, yong: null, how: '化气格：喜化神及生化、泄化之神', reasons: a.result[0].why, ratio: a.ratioNum, xi, ji: WX.filter(e => !xi.includes(e)) }; }
  const conf = a.result[0].conf || '';
  // 假从（「可能为假从」）依用户决定按正统扶抑论，只有真从才顺势
  const fakeFollow = /^从(财|杀|儿|势)/.test(t) && conf.includes('假从');
  if (!fakeFollow) for (const [re, name, xiR, yong] of SPECIAL) if (re.test(t)) return res(name || t.replace(/格$/,''), null, xiR, yong, '特殊格局：顺其气势');
  if (a.ratioNum >= EXT_HI) return res('从强', null, ['比劫','印'], '比劫', '旺极：顺其旺势');
  if (a.ratioNum <= EXT_LO && (!a.dmRoot || a.dmRoot.m === 2)) return res('从势', null, ['食伤','财','官杀'], '财', '衰极：顺其弱势');
  // 正格：扶抑
  const pStrong = prob(W, features(p)), qr = pStrong >= .5 ? '身强' : '身弱';
  let yong, how;
  if (qr === '身弱') {
    const bing = ['食伤','财','官杀'].sort((x,y) => br[y] - br[x])[0];
    if (bing === '财') { yong = '比劫'; how = '财多身弱，用比劫帮身'; }
    else { yong = '印'; how = bing === '官杀' ? '杀重身轻，用印化杀' : '食伤泄重，用印制伤生身'; }
  } else {
    if (br['印'] > br['比劫']) { yong = '财'; how = '印旺身强，用财破印'; }
    else if (br['官杀'] > br['食伤'] && a.rootOf((d+3)%5)) { yong = '官杀'; how = '比劫旺，用官杀制劫'; }
    else if (br['食伤'] > 0) { yong = '食伤'; how = '身旺，用食伤泄秀'; }
    else { yong = '财'; how = '身旺，用财'; }
  }
  const r = res('正格', qr, xiRolesFor(yong, br), yong, how);
  r.pStrong = pStrong;
  // 调候：冬（亥子丑）夏（巳午未）以调候为急，首选调候用神必为喜
  const mz = p[1][1], cell = tiaohouOf(p[2][0], mz);
  r.tiaohou = cell;
  if ('巳午未亥子丑'.includes(mz)) {
    const e = WX[GW[G.indexOf(cell[0])]];
    r.ji = r.ji.filter(x => x !== e); if (!r.xi.includes(e)) r.xi.push(e);
    r.tiaohouUsed = cell[0] + e;
  }
  return r;
}
module.exports = { predict };

};
defs['./strength_w.json'] = function(module){ module.exports = [-3.5723111219478403,0.7319872584136539,0.026586555843017886,-0.474963692062476,-0.8654124963795469,1.8253663371255282,0.6077295167847944,0.8316306580132966,0.7568627305350195,0.24065686231485947]; };
const cache = {}; function req(n){ if (cache[n]) return cache[n].exports; if (!defs[n]) throw new Error('missing ' + n); const m = { exports: {} }; cache[n] = m; defs[n](m, m.exports, req); return m.exports; }
(typeof window !== 'undefined' ? window : globalThis).XY = req('./engine_final.js');
})();
