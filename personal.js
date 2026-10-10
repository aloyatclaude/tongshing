// 本命 × 今日通胜 — 个人化计算（规则查表，近似部分会注明）
const P = (() => {
const GAN = '甲乙丙丁戊己庚辛壬癸'.split('');
const ZHI = '子丑寅卯辰巳午未申酉戌亥'.split('');
const WX = ['木','火','土','金','水'];
const GAN_WX = [0,0,1,1,2,2,3,3,4,4];
const ZHI_WX = [4,2,0,0,2,1,1,2,3,3,2,4];
const ZHI_MAIN = '癸己甲乙戊丙丁己庚辛戊壬'.split(''); // 地支本气
const SX = '鼠牛虎兔龙蛇马羊猴鸡狗猪'.split('');
const PALACE = ['年支（生肖·祖上长辈）','月支（父母·事业环境）','日支（自己·配偶宫）','时支（子女·晚年）'];
const PALACE_SHORT = ['年','月','日','时'];

const gi = g => GAN.indexOf(g), zi = z => ZHI.indexOf(z);

// 十神：以日主为我
function shiShen(me, other){
  const a = gi(me), b = gi(other), e = GAN_WX[a], o = GAN_WX[b], same = (a%2) === (b%2);
  const r = (o - e + 5) % 5;
  return [['比肩','劫财'],['食神','伤官'],['偏财','正财'],['七杀','正官'],['偏印','正印']][r][same?0:1];
}
const shiShenZhi = (me, z) => shiShen(me, ZHI_MAIN[zi(z)]);

const SS_DESC = {
  比肩:'自我、同辈日：适合和朋友同事合作、独立处理事情；不宜借钱出去。',
  劫财:'竞争、破财日：容易冲动消费或被人分财，签约投资要谨慎。',
  食神:'享受、才艺日：适合社交、聚餐、创作、休息，心情较轻松。',
  伤官:'表达、突破日：口才好点子多，但说话容易得罪人，避免顶撞上司。',
  偏财:'机会财日：适合谈生意、拓展人脉、把握偏门机会。',
  正财:'正财日：适合收款、谈薪、理财、处理稳定收入的事。',
  七杀:'压力、挑战日：适合攻坚、处理难题和竞争；忌冲动硬碰。',
  正官:'名誉、规矩日：适合面试、见上司、处理公文、签正式合约。',
  偏印:'灵感、独处日：适合研究、玄学、学冷门技能；不宜做重大承诺。',
  正印:'贵人、学习日：适合读书考试、求助长辈、签文件。',
};

// 地支关系
function zhiRel(a, b){
  const i = zi(a), j = zi(b), out = [];
  if (Math.abs(i-j) === 6) out.push({t:'冲', bad:true});
  if ((i+j) % 12 === 1) out.push({t:'六合', bad:false});
  if (i !== j && i%4 === j%4) out.push({t:'三合', bad:false});
  if ((i+j) % 12 === 7) out.push({t:'害', bad:true});
  const po = ['子酉','卯午','丑辰','未戌','寅亥','巳申'];
  if (po.includes(a+b) || po.includes(b+a)) out.push({t:'破', bad:true});
  const xing = ['寅巳','巳申','申寅','丑戌','戌未','未丑','子卯','卯子'];
  if (xing.includes(a+b) || xing.includes(b+a) || (i===j && '辰午酉亥'.includes(a))) out.push({t:'刑', bad:true});
  return out;
}
const ganHe = (a, b) => Math.abs(gi(a)-gi(b)) === 5;
const ganChong = (a, b) => Math.abs(gi(a)-gi(b)) === 6;

// 个人神煞查表
const GUIREN = {甲:'丑未',戊:'丑未',庚:'丑未',乙:'子申',己:'子申',丙:'亥酉',丁:'亥酉',辛:'寅午',壬:'卯巳',癸:'卯巳'};
const LU = {甲:'寅',乙:'卯',丙:'巳',丁:'午',戊:'巳',己:'午',庚:'申',辛:'酉',壬:'亥',癸:'子'};
const YANGREN = {甲:'卯',丙:'午',戊:'午',庚:'酉',壬:'子'};
const WENCHANG = {甲:'巳',乙:'午',丙:'申',丁:'酉',戊:'申',己:'酉',庚:'亥',辛:'子',壬:'寅',癸:'卯'};
// 三合局为基础：[驿马, 桃花, 华盖, 劫煞, 亡神, 将星]
const SANHE = {0:'寅酉辰巳亥子', 2:'申卯戌亥巳午', 1:'亥午丑寅申酉', 3:'巳子未申寅卯'}; // key = zhiIndex%4
const SANHE_NAMES = ['驿马','桃花','华盖','劫煞','亡神','将星'];
const SHA_DESC = {
  天乙贵人:'贵人日：适合求人、见重要人物、谈合作',
  禄:'禄日：利工作、收入、升迁',
  羊刃:'羊刃：精力旺但易冲动、受伤，避免争执和危险活动',
  文昌:'文昌：利考试、写作、签约、学习',
  驿马:'驿马：利出行、搬动、换环境，人容易奔波',
  桃花:'桃花：人缘好、异性缘旺；已婚者注意分寸',
  华盖:'华盖：适合独处、思考、玄学宗教；社交较淡',
  劫煞:'劫煞：防小人、破财、意外',
  亡神:'亡神：容易失误、心神不定，重要事情多检查',
  将星:'将星：有领导力，适合带队、做主',
  红鸾:'红鸾：喜庆、感情机会',
  天喜:'天喜：喜事、好消息',
  空亡:'空亡：事情容易落空、拖延，不宜定大事',
};

function shaFor(n, z){ // 地支 z 对本命触发的神煞
  const out = [], dg = n.dayGan;
  if (GUIREN[dg].includes(z)) out.push('天乙贵人');
  if (LU[dg] === z) out.push('禄');
  if (YANGREN[dg] === z) out.push('羊刃');
  if (WENCHANG[dg] === z) out.push('文昌');
  const seen = new Set();
  for (const [src, base] of [['日', n.zhi[2]], ['年', n.zhi[0]]]) {
    const tbl = SANHE[zi(base)%4];
    SANHE_NAMES.forEach((nm,k) => { if (tbl[k] === z && !seen.has(nm)) { seen.add(nm); out.push(nm); } });
  }
  const hl = ZHI[(3 - zi(n.zhi[0]) + 12) % 12];
  if (hl === z) out.push('红鸾');
  if (ZHI[(zi(hl)+6)%12] === z) out.push('天喜');
  if (n.xunKong.includes(z)) out.push('空亡');
  return out;
}

function build(p){
  const [y,m,d] = p.date.split('-').map(Number);
  const [hh,mm] = p.time ? p.time.split(':').map(Number) : [12,0];
  const solar = Solar.fromYmdHms(y,m,d,hh,mm,0), lunar = solar.getLunar(), ec = lunar.getEightChar();
  const hasTime = !!p.time;
  const pillars = [ec.getYear(), ec.getMonth(), ec.getDay(), hasTime ? ec.getTime() : null];
  const n = {
    p, hasTime, solar, lunar, ec, pillars,
    gan: pillars.map(x => x ? x[0] : null),
    zhi: pillars.map(x => x ? x[1] : null),
    hide: [ec.getYearHideGan(), ec.getMonthHideGan(), ec.getDayHideGan(), hasTime ? ec.getTimeHideGan() : null],
    nayin: [ec.getYearNaYin(), ec.getMonthNaYin(), ec.getDayNaYin(), hasTime ? ec.getTimeNaYin() : null],
    dishi: [ec.getYearDiShi(), ec.getMonthDiShi(), ec.getDayDiShi(), hasTime ? ec.getTimeDiShi() : null],
    dayGan: ec.getDayGan(), xunKong: ec.getDayXunKong(),
  };
  n.me = GAN_WX[gi(n.dayGan)];
  // 喜用：扶抑 + 调候（《穷通宝鉴》），见 xiyong.js
  const xy = XY.predict(pillars);
  n.xy = xy;
  n.st = { xi: xy.xi.map(e => WX.indexOf(e)), ji: xy.ji.map(e => WX.indexOf(e)) };
  n.natalSha = {};
  n.zhi.forEach((z,k) => { if (z) shaFor(n, z).filter(s => s!=='空亡').forEach(s => (n.natalSha[s] ||= []).push(PALACE_SHORT[k])); });
  n.count = [0,0,0,0,0];
  n.gan.forEach(g => g && n.count[GAN_WX[gi(g)]]++);
  n.zhi.forEach(z => z && n.count[ZHI_WX[zi(z)]]++);
  if (p.gender !== '') {
    const yun = ec.getYun(p.gender === 'm' ? 1 : 0);
    n.yunStart = `${yun.getStartYear()}年${yun.getStartMonth()}个月起运`;
    n.dayun = yun.getDaYun().slice(1, 10);
  }
  return n;
}

// 今日对本命
function today(n, l, wang){
  const dg = l.getDayGan(), dz = l.getDayZhi(), gz = l.getDayInGanZhi();
  const ss = shiShen(n.dayGan, dg), ssZ = shiShenZhi(n.dayGan, dz);
  const rels = [];
  n.zhi.forEach((z,k) => { if (z) zhiRel(dz, z).forEach(r => rels.push({...r, where:PALACE[k], k})); });
  n.gan.forEach((g,k) => {
    if (!g) return;
    if (ganHe(dg, g)) rels.push({t:`天干${dg}${g}合`, bad:false, where:PALACE_SHORT[k]+'干', k});
    if (ganChong(dg, g)) rels.push({t:`天干${dg}${g}冲`, bad:true, where:PALACE_SHORT[k]+'干', k});
  });
  n.pillars.forEach((pz,k) => {
    if (!pz) return;
    if (pz === gz) rels.push({t:'伏吟', bad:true, where:PALACE_SHORT[k]+'柱', k, special:true});
    if (ganChong(dg, pz[0]) && Math.abs(zi(dz)-zi(pz[1]))===6) rels.push({t:'反吟（天克地冲）', bad:true, where:PALACE_SHORT[k]+'柱', k, special:true});
  });
  const sha = shaFor(n, dz);
  const dayWx = [GAN_WX[gi(dg)], ZHI_WX[zi(dz)]];
  let wxScore = 0; dayWx.forEach(e => { if (n.st.xi.includes(e)) wxScore++; if (n.st.ji.includes(e)) wxScore--; });
  const wangIdx = WX.indexOf(wang), wangGood = n.st.xi.includes(wangIdx);

  // 评分（参考用）
  let score = 3 + wxScore * 0.5 + (wangGood ? 0.25 : -0.25);
  rels.forEach(r => { score += r.bad ? ((r.t==='冲' || r.k===2) ? -1 : -0.5) : (r.k===2 ? 0.75 : 0.4); if (r.special) score -= 0.5; });
  sha.forEach(s => { if (['天乙贵人','禄','文昌','将星','天喜','红鸾'].includes(s)) score += 0.6; if (['羊刃','劫煞','亡神','空亡'].includes(s)) score -= 0.5; });
  const stars = Math.max(1, Math.min(5, Math.round(score)));

  // 太岁
  const ly = l.getYearInGanZhiByLiChun(), lyz = ly[1];
  const ty = [];
  if (lyz === n.zhi[0]) ty.push('值太岁（本命年）');
  zhiRel(lyz, n.zhi[0]).forEach(r => { if (r.bad) ty.push(r.t + '太岁'); });
  const curYear = l.getSolar().getYear();
  const dy = n.dayun ? n.dayun.find(x => x.getStartYear() <= curYear && curYear <= x.getEndYear()) : null;

  return {dg, dz, gz, ss, ssZ, rels, sha, dayWx, wxScore, wangGood, stars, ly, ty, dy,
          lySS: shiShen(n.dayGan, ly[0])};
}

function hourTags(n, t){
  const z = t.getZhi(), tags = [];
  if (GUIREN[n.dayGan].includes(z)) tags.push(['贵人',0]);
  if (LU[n.dayGan] === z) tags.push(['禄',0]);
  if (WENCHANG[n.dayGan] === z) tags.push(['文昌',0]);
  if (n.zhi[2] && Math.abs(zi(z)-zi(n.zhi[2]))===6) tags.push(['冲日支',1]);
  if (Math.abs(zi(z)-zi(n.zhi[0]))===6) tags.push(['冲生肖',1]);
  if (n.zhi[2] && (zi(z)+zi(n.zhi[2]))%12===1) tags.push(['合日支',0]);
  return tags;
}

// 时家神煞：以当日干支对时辰（规则版，可能与个别通胜版本不同）
const JIELU = {甲:'申酉',己:'申酉',乙:'午未',庚:'午未',丙:'辰巳',辛:'辰巳',丁:'寅卯',壬:'寅卯',戊:'子丑',癸:'子丑'};
function hourSha(l, t){
  const dg = l.getDayGan(), dz = l.getDayZhi(), hg = t.getGan(), hz = t.getZhi(), out = [];
  if (GUIREN[dg].includes(hz)) out.push(['天乙贵人',0]);
  if (LU[dg] === hz) out.push(['日禄',0]);
  if (WENCHANG[dg] === hz) out.push(['文昌',0]);
  if (hz === dz) out.push(['日建',0]);
  zhiRel(hz, dz).forEach(r => out.push([{冲:'日破',六合:'日合',三合:'三合',害:'日害',破:'六破',刑:'日刑'}[r.t], r.bad?1:0]));
  if (ganHe(hg, dg)) out.push(['干合',0]);
  if (shiShen(dg, hg) === '七杀') out.push(['五不遇',1]);
  if (JIELU[dg].includes(hz)) out.push(['截路空亡',1]);
  if (l.getDayXunKong().includes(hz)) out.push(['旬空',1]);
  return out;
}

// 个人化时辰：天时（黄道/黑道、时家神煞）+ 人（十神、个人神煞、冲合刑害、五行喜忌）
const HOUR_SS = {
  比肩:'合作、独立处理事情', 劫财:'防破财、避免争执', 食神:'社交、饮食、创作', 伤官:'表达、谈判，但要慎言',
  偏财:'把握机会、谈生意', 正财:'收款、理财、谈钱', 七杀:'处理难题、竞争', 正官:'见上司、办公事、签约',
  偏印:'研究、思考、独处', 正印:'求助长辈、学习、签文件',
};
const GEN_W = {日禄:.5, 天乙贵人:.5, 文昌:.25, 日合:.25, 三合:.25, 日破:-1, 五不遇:-1, 截路空亡:-.5, 旬空:-.5, 日刑:-.5, 日害:-.5, 六破:-.25};
const PER_W = {天乙贵人:1, 禄:.75, 文昌:.5, 将星:.25, 天喜:.25, 红鸾:.25, 羊刃:-.75, 劫煞:-.25, 亡神:-.25, 空亡:-.25, 桃花:0, 驿马:0, 华盖:0};
const PER_LABEL = {天乙贵人:'你的贵人时', 禄:'你的禄时', 文昌:'你的文昌时', 空亡:'你的空亡时'};
const PAL_NAME = ['生肖','月支','日支','时支'];
function hourPersonal(n, l, t){
  const hg = t.getGan(), hz = t.getZhi(), items = [];
  const add = (label, w) => items.push({label, w});
  const lucky = t.getTianShenLuck() === '吉';
  add(t.getTianShen() + (lucky ? '黄道' : '黑道'), lucky ? .75 : -.75);
  hourSha(l, t).forEach(([x]) => { if (GEN_W[x]) add(x, GEN_W[x]); });
  shaFor(n, hz).forEach(s => add(PER_LABEL[s] || '你的' + s, PER_W[s] || 0));
  n.zhi.forEach((z, k) => {
    if (!z) return;
    zhiRel(hz, z).forEach(r => {
      // 日支（自己）与生肖看全部关系；月支、时支只看冲
      if ((k === 1 || k === 3) && r.t !== '冲') return;
      const w = r.t === '冲' ? [-1.25, -.25, -1.5, -.25][k] : r.bad ? (k === 2 ? -.5 : -.25) : (k === 2 ? .5 : .25);
      add(`${r.t === '六合' ? '合' : r.t}你${PAL_NAME[k]}`, w);
    });
  });
  let wx = 0;
  [GAN_WX[gi(hg)], ZHI_WX[zi(hz)]].forEach(e => { if (n.st.xi.includes(e)) wx += .5; else if (n.st.ji.includes(e)) wx -= .5; });
  if (wx > 0) add('五行喜用', wx); else if (wx < 0) add('五行属忌', wx);
  const score = items.reduce((a, b) => a + b.w, 0);
  let level = score >= 1 ? '宜用' : score <= -1.25 ? '慎用' : '平';
  // 冲你日支或生肖的时辰：择时首要避开，最多评为「平」
  if (items.some(i => i.label === '冲你日支' || i.label === '冲你生肖')) level = score >= 1 ? '平' : '慎用';
  // 原因：先列与结论同方向的，再按影响大小
  const sign = level === '宜用' ? 1 : level === '慎用' ? -1 : 0;
  const reasons = items.filter(i => i.w).sort((a, b) => (sign && (Math.sign(b.w) === sign) - (Math.sign(a.w) === sign)) || Math.abs(b.w) - Math.abs(a.w)).slice(0, 3);
  const neutral = items.filter(i => i.w === 0).map(i => i.label);
  const ss = shiShen(n.dayGan, hg);
  return {zhi: hz, ss, ssDesc: HOUR_SS[ss], score, level, reasons, neutral, items};
}
function dayHours(n, l){
  const hours = l.getTimes().slice(0, 12).map((t, k) => ({...hourPersonal(n, l, t), k}));
  const best = hours.filter(h => h.level === '宜用').sort((a, b) => b.score - a.score).slice(0, 3);
  const avoid = hours.filter(h => h.level === '慎用').sort((a, b) => a.score - b.score).slice(0, 3);
  return {hours, best, avoid};
}

return {GAN, ZHI, WX, GAN_WX, ZHI_WX, SX, SS_DESC, SHA_DESC, PALACE_SHORT, shiShen, shiShenZhi, build, today, hourTags, hourSha, hourPersonal, dayHours, gi, zi};
})();
