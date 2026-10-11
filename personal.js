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
  比肩:'同辈、合作日：适合和朋友、同事一起做事；不宜借钱出去。',
  劫财:'竞争、行动日：干劲足，适合争取机会、参与竞争；钱财多留心，不宜借钱给人或冲动消费。',
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
const WENCHANG = {甲:'巳',乙:'午',丙:'申',丁:'酉',戊:'申',己:'酉',庚:'亥',辛:'戌',壬:'寅',癸:'卯'};   // 星学大成卷一「甲乙巳午报君知」（原文辛见戌，不是子）
// 三合局为基础：[驿马, 桃花, 华盖, 劫煞, 亡神, 将星]
const SANHE = {0:'寅酉辰巳亥子', 2:'申卯戌亥巳午', 1:'亥午丑寅申酉', 3:'巳子未申寅卯'}; // key = zhiIndex%4
const SANHE_NAMES = ['驿马','桃花','华盖','劫煞','亡神','将星'];
const SHA_DESC = {
  天乙贵人:'贵人日：适合求人、见重要人物、谈合作',
  禄:'禄日：利工作、收入、升迁',
  羊刃:'羊刃：精力旺但易冲动、受伤，避免争执和危险活动',
  文昌:'文昌：利考试、写作、签约、学习',
  驿马:'驿马：利出行、搬动、换环境，人容易奔波',
  桃花:'桃花：人缘和魅力较好，容易被人注意',
  华盖:'华盖：适合独处、思考、玄学宗教；社交较淡',
  劫煞:'劫煞：防小人、破财、意外',
  亡神:'亡神：容易失误、心神不定，重要事情多检查',
  将星:'将星：有领导力，适合带队、做主',
  红鸾:'红鸾：喜庆气氛，适合聚会、见人',
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
  for (const [src, base] of [['年', n.zhi[0]]]) {   // 三命通会：驿马、桃花、华盖、将星、劫煞、亡神以年支三合起（日支起法未见原文）
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
  n.count = [0,0,0,0,0];
  n.gan.forEach(g => g && n.count[GAN_WX[gi(g)]]++);
  n.zhi.forEach(z => z && n.count[ZHI_WX[zi(z)]]++);
  if (p.gender !== '') {
    const yun = ec.getYun(p.gender === 'm' ? 1 : 0);
    const ys = yun.getStartSolar();
    n.yunAge = [yun.getStartYear(), yun.getStartMonth()];
    n.yunStart = `${yun.getStartYear()}岁${yun.getStartMonth() ? yun.getStartMonth() + '个月' : ''}交运（${ys.getYear()}年${ys.getMonth()}月）`;
    n.dayun = yun.getDaYun().slice(1, 10);
  }
  return n;
}

// 本命日标签：今天对你是什么日（坏的优先；有坏的就只显示坏的，最多两个）
const SUI_SHA = ['未','辰','丑','戌'];   // 岁煞（三杀日），按生肖三合局：申子辰→未、巳酉丑→辰、寅午戌→丑、亥卯未→戌
const ke = (a, b) => (GAN_WX[gi(b)] - GAN_WX[gi(a)] + 5) % 5 === 2;   // 天干 a 克 b
function dayTags(n, dg, dz, mz, ss, sha){
  const yz = n.zhi[0], yg = n.gan[0], dzz = n.zhi[2], bad = [], good = [];
  const chongY = (zi(dz) + 6) % 12 === zi(yz);
  if (chongY && ke(dg, yg)) bad.push({t:'天克地冲日', why:`今天${dg}${dz}：地支${dz}冲你的生肖（${yz}），天干${dg}又克你的年干${yg}`});
  else if (chongY) bad.push({t:'冲生肖日', why:`今天的日支${dz}冲你的生肖（属${SX[zi(yz)]}，${yz}）`});
  if (dz === SUI_SHA[zi(yz) % 4]) bad.push({t:'三杀日', why:`今天的日支${dz}是你生肖（${yz}）的岁煞`});
  if (dzz && (zi(dz) + 6) % 12 === zi(dzz) && !chongY) bad.push({t:'冲本命日', why:`今天的日支${dz}冲你的日支${dzz}（日柱代表你自己和配偶）`});
  // 贵人：今天的日支是你日干的天乙贵人（八字以日干查贵人；若再加年干、贵人到命，一年近半数都成贵人日，失去意义）
  const gui = GUIREN[n.dayGan].includes(dz);
  // 三刑：刑你的生肖（含自刑）；有贵人，或本月月支与你的生肖相合，则化解不计
  const monthHe = zhiRel(mz, yz).some(r => r.t === '三合' || r.t === '六合');
  if (!gui && !monthHe && zhiRel(dz, yz).some(r => r.t === '刑')) bad.push({t:'三刑日', why:dz === yz ? `今天的日支${dz}和你的生肖（${yz}）相同，${yz}遇${yz}为自刑` : `今天的日支${dz}和你的生肖（${yz}）相刑`});
  if (gui) good.push({t:'贵人日', why:`今天的日支${dz}是你的天乙贵人`});
  const caiEl = (n.me + 2) % 5, guanEl = (n.me + 3) % 5;
  if (['偏财','正财'].includes(ss) && n.st.xi.includes(caiEl)) good.push({t:'财运日', why:`今天的天干${dg}是你的${ss}，财又是你的喜用`});
  else if (sha.includes('禄')) good.push({t:'财运日', why:`今天的日支${dz}是你的禄，利工作和收入`});
  // 人缘：三合、六合你的生肖，或引动桃花、红鸾、天喜（不单独标「桃花日」，免得被理解成一定有感情事）
  const he = zhiRel(dz, yz).find(r => r.t === '三合' || r.t === '六合'), love = sha.filter(x => ['桃花','红鸾','天喜'].includes(x));
  if (he || love.length) good.push({t:'人缘日', why:he ? `今天的日支${dz}和你的生肖（${yz}）${he.t}` : `今天引动你的${love.join('、')}（命理上指人缘和喜庆气氛，不一定是感情）`});
  if (['正官','七杀'].includes(ss) && n.st.xi.includes(guanEl)) good.push({t:'事业日', why:`今天的天干${dg}是你的${ss}，官星又是你的喜用`});
  else if (sha.includes('将星')) good.push({t:'事业日', why:`今天引动你的将星`});
  if (sha.includes('文昌')) good.push({t:'学业日', why:`今天的日支${dz}是你的文昌`});
  if (sha.includes('驿马')) good.push({t:'出行日', why:`今天引动你的驿马`});
  const tags = bad.length ? bad.map(x => ({...x, bad:true})) : good.map(x => ({...x, bad:false}));
  return tags.length ? tags : [{t:'平日', bad:false, mid:true, why:'今天没有冲到你，也没有贵人、财运、人缘等特别的日子'}];
}

// 十神 × 本命日 合并成一句建议：凶日「十神本来利……；但今天……」，吉日「适合……；今天……」，平日「适合……；今天没有特别的吉凶」
const SS_CORE = {比肩:'和朋友、同事合作', 劫财:'争取机会、参与竞争', 食神:'社交、聚餐、创作、休息', 伤官:'提案、表达、做创意工作', 偏财:'谈生意、拓展人脉、把握机会',
                 正财:'收款、谈薪、理财', 七杀:'攻坚、处理难题', 正官:'面试、见上司、处理公文', 偏印:'研究、思考、学新东西', 正印:'读书考试、求助长辈、签文件'};
const SS_CAU = {比肩:'不宜借钱给人', 劫财:'钱财多留心', 伤官:'说话留分寸', 七杀:'忌冲动硬碰', 偏印:'不宜做重大承诺'};
const TAG_BAD = {冲生肖日:['冲你的生肖','重要的事尽量改期，出行、投资、签约要谨慎'], 天克地冲日:['和你的年柱天克地冲','重要的事改期，凡事低调、注意安全'],
                 三杀日:['是你的三杀日','避免动土、搬家、开业等大事'], 三刑日:['和你的生肖相刑','说话做事留余地，避免争执'], 冲本命日:['冲你的日柱','注意情绪、身体和感情，重要的事谨慎']};
const TAG_GOOD = {贵人日:['今天有贵人，求人办事比较顺','也有贵人帮忙'], 财运日:['今天财运到位，谈钱、收款比较顺','财运也到位'], 人缘日:['今天和人相处比较顺，适合见人、谈合作','和人相处也比较顺'],
                  事业日:['今天利工作，适合开会、做决定','工作上也有利'], 学业日:['今天头脑清楚，利学习、考试','头脑也清楚，利学习'], 出行日:['今天利出行、走动','也利出行、走动']};
function dayAdvice(ss, tags){
  const cau = SS_CAU[ss] ? '，' + SS_CAU[ss] : '', bad = tags.filter(x => x.bad);
  if (bad.length) return `${ss}本来利${SS_CORE[ss]}；但今天${bad.map(x => TAG_BAD[x.t][0]).join('，又')}，${TAG_BAD[bad[0].t][1]}。`;
  if (tags[0].mid) return `适合${SS_CORE[ss]}${cau}；今天没有特别的吉凶，照常做事就好。`;
  return `适合${SS_CORE[ss]}${cau}；${tags.map((x, i) => TAG_GOOD[x.t][i ? 1 : 0]).join('，')}。`;
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
  const tagsAll = dayTags(n, dg, dz, l.getMonthZhiExact(), ss, sha), tags = tagsAll.slice(0, 2);
  const badAll = tagsAll.filter(x => x.bad).map(x => x.t);
  // 坏的本命日：冲、天克地冲、三杀、冲本命最多两星，三刑最多三星，让星级和标签一致
  // 好的本命日至少三星，让星级和标签一致
  const cap = tags.some(x => x.bad && x.t !== '三刑日') ? 2 : tags.some(x => x.t === '三刑日') ? 3 : 5;
  // 平日：没有特别吉凶，星级放在 2–4 之间
  const floor = tags.some(x => !x.bad && !x.mid) ? 3 : tags[0].mid ? 2 : 1;
  const stars = Math.max(floor, Math.min(tags[0].mid ? 4 : cap, Math.round(score)));
  const advice = dayAdvice(ss, tags);

  // 太岁
  const ly = l.getYearInGanZhiByLiChun(), lyz = ly[1];
  const ty = [];
  if (lyz === n.zhi[0]) ty.push('值太岁（本命年）');
  zhiRel(lyz, n.zhi[0]).forEach(r => { if (r.bad) ty.push(r.t + '太岁'); });
  const curYear = l.getSolar().getYear();
  const dy = n.dayun ? n.dayun.find(x => x.getStartYear() <= curYear && curYear <= x.getEndYear()) : null;

  return {dg, dz, gz, ss, ssZ, rels, sha, dayWx, wxScore, wangGood, score, stars, tags, badAll, advice, ly, ty, dy,
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
  比肩:'合作、和朋友同事做事', 劫财:'争取机会；钱财多留心', 食神:'社交、饮食、创作', 伤官:'表达、谈判，但要慎言',
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
  const po = items.some(i => i.label === '日破'), allBad = t.getJi().includes('诸事不宜');
  if (allBad && !po) add('诸事不宜', -1);
  const score = items.reduce((a, b) => a + b.w, 0);
  let level = score >= 1 ? '宜用' : score <= -1.25 ? '慎用' : '平';
  // 冲你日支或生肖的时辰：择时首要避开，最多评为「平」
  if (items.some(i => i.label === '冲你日支' || i.label === '冲你生肖')) level = score >= 1 ? '平' : '慎用';
  // 日破（冲当天）或该时辰诸事不宜：通书不列为吉时，同样最多评为「平」
  if (po || allBad) level = score >= 1 ? '平' : '慎用';
  // 原因：先列与结论同方向的，再按影响大小
  const sign = level === '宜用' ? 1 : level === '慎用' ? -1 : 0;
  const reasons = items.filter(i => i.w).sort((a, b) => (sign && (Math.sign(b.w) === sign) - (Math.sign(a.w) === sign)) || Math.abs(b.w) - Math.abs(a.w)).slice(0, 3);
  const neutral = items.filter(i => i.w === 0).map(i => i.label);
  const ss = shiShen(n.dayGan, hg);
  return {zhi: hz, ss, ssDesc: HOUR_SS[ss], score, level, reasons, neutral, items};
}
// 幸运色：今天干支的五行 × 你的喜忌。今天的五行对你不利 → 取能克它或化掉它（它所生）的喜用；
// 对你有利 → 顺势取它；都不是 → 取用神。不宜色：今天对你不利的五行，否则取克幸运五行的忌神。
function luckyColor(n, tt){
  const {xi, ji} = n.st, ROLES = ['比劫','食伤','财','官杀','印'];
  const yong = n.xy.yong && ROLES.includes(n.xy.yong) ? (n.me + ROLES.indexOf(n.xy.yong)) % 5 : xi[0];
  const rank = e => (e === yong ? 0 : 1) + xi.indexOf(e) / 10;
  const day = [...new Set(tt.dayWx)], bad = day.filter(e => ji.includes(e)), good = day.filter(e => xi.includes(e));
  const badTxt = bad.map(e => WX[e]).join('、');
  let lucky, why;
  if (bad.length) {
    const ok = [];
    bad.forEach(b => { [[(b + 3) % 5, '克'], [(b + 1) % 5, '化']].forEach(([e, how]) => { if (xi.includes(e)) ok.push({e, b, how}); }); });
    const cnt = e => ok.filter(c => c.e === e).length;
    ok.sort((p, q) => cnt(q.e) - cnt(p.e) || rank(p.e) - rank(q.e));
    if (ok.length) {
      const c = ok[0]; lucky = c.e;
      why = c.how === '克' ? `今天${badTxt}气对你不利；${WX[c.e]}能克${WX[c.b]}，又是你的喜用` : `今天${badTxt}气对你不利；${WX[c.e]}能化解${WX[c.b]}气，又是你的喜用`;
    }
  }
  if (lucky === undefined && good.length) { lucky = good.sort((p, q) => rank(p) - rank(q))[0]; why = `今天${WX[lucky]}气对你有利，穿${WX[lucky]}的颜色顺势加强`; }
  if (lucky === undefined) { lucky = yong; why = `今天的五行对你影响不大，穿你喜用${WX[lucky]}的颜色最稳`; }
  let avoid = bad.filter(e => e !== lucky);
  if (!avoid.length) { const k = ji.find(e => (e + 2) % 5 === lucky); avoid = [k !== undefined ? k : ji[0]].filter(e => e !== undefined && e !== lucky); }
  return {lucky, avoid, why};
}
// ---------- 命盘：十二长生、干支关系、五行与十神力量、流月 ----------
// 十二长生（阳干顺行、阴干逆行；与 lunar-javascript 的地势逐一核对过一致）
const CS_STAGE = '长生 沐浴 冠带 临官 帝旺 衰 病 死 墓 绝 胎 养'.split(' ');
const CS_START = {甲:'亥',丙:'寅',戊:'寅',庚:'巳',壬:'申',乙:'午',丁:'酉',己:'酉',辛:'子',癸:'卯'};
const changSheng = (g, z) => { const s = zi(CS_START[g]), i = zi(z); return CS_STAGE[gi(g) % 2 === 0 ? (i - s + 12) % 12 : (s - i + 12) % 12]; };

// 干支关系（四柱两两之间，加三合局、三会、三刑）
const PN = ['年','月','日','时'];
const GAN_HE_WX = {甲己:'土', 乙庚:'金', 丙辛:'水', 丁壬:'木', 戊癸:'火'};
const LIUHE_WX = {子丑:'土', 寅亥:'木', 卯戌:'火', 辰酉:'金', 巳申:'水', 午未:'土'};
const SANHE_WX = ['水','金','火','木'];   // 按地支序号 %4：申子辰、巳酉丑、寅午戌、亥卯未
const SANHE_MID = '子酉午卯';           // 三合的中神（旺支）
function relations(n){
  const out = [], idx = [0,1,2,3].filter(k => n.pillars[k]), pos = ks => ks.map(k => PN[k]).join('');
  const key2 = (a, b, tbl) => tbl[a + b] || tbl[b + a];
  idx.forEach((a, i) => idx.slice(i + 1).forEach(b => {
    const ga = n.gan[a], gb = n.gan[b], za = n.zhi[a], zb = n.zhi[b];
    const he = key2(ga, gb, GAN_HE_WX); if (he) out.push({k:[a,b], t:`${ga}${gb}合（化${he}）`, good:true, gan:true});
    if (ganChong(ga, gb)) out.push({k:[a,b], t:`${ga}${gb}相冲`, good:false, gan:true});
    zhiRel(za, zb).forEach(r => {
      if (r.t === '三合') { const e = SANHE_WX[zi(za) % 4], mid = SANHE_MID.includes(za) || SANHE_MID.includes(zb); out.push({k:[a,b], t:`${za}${zb}${mid ? '半合' : '拱合'}${e}局`, good:true}); }
      else if (r.t === '六合') out.push({k:[a,b], t:`${za}${zb}六合（化${key2(za, zb, LIUHE_WX)}）`, good:true});
      else if (r.t === '刑' && za === zb) out.push({k:[a,b], t:`${za}${zb}自刑`, good:false});
      else out.push({k:[a,b], t:`${za}${zb}相${r.t}`, good:!r.bad});
    });
  }));
  const zs = idx.map(k => n.zhi[k]), has = t => [...t].every(c => zs.includes(c)), ks = t => idx.filter(k => t.includes(n.zhi[k]));
  [['申子辰','水'],['巳酉丑','金'],['寅午戌','火'],['亥卯未','木']].forEach(([t, e]) => { if (has(t)) out.push({k:ks(t), t:`${t}三合${e}局`, good:true, big:true}); });
  [['寅卯辰','木'],['巳午未','火'],['申酉戌','金'],['亥子丑','水']].forEach(([t, e]) => { if (has(t)) out.push({k:ks(t), t:`${t}三会${e}方`, good:true, big:true}); });
  [['寅巳申','无恩之刑'],['丑戌未','恃势之刑']].forEach(([t, nm]) => { if (has(t)) out.push({k:ks(t), t:`${t}三刑（${nm}）`, good:false, big:true}); });
  return out.map(r => ({...r, where: pos(r.k)}));
}

// 五行与十神力量：天干 1；地支藏干 本气 1、中气 0.5、余气 0.3；月令（月支）加倍
const QI_RANK = {子:[0], 丑:[0,2,2], 寅:[0,1,2], 卯:[0], 辰:[0,2,2], 巳:[0,1,2], 午:[0,1], 未:[0,2,2], 申:[0,1,2], 酉:[0], 戌:[0,2,2], 亥:[0,1]};
const QI_W = [1, .5, .3];
function power(n){
  const wx = [0,0,0,0,0], ss = {};
  const add = (g, w, self) => { wx[GAN_WX[gi(g)]] += w; if (!self) { const t = shiShen(n.dayGan, g); ss[t] = (ss[t] || 0) + w; } };
  n.gan.forEach((g, k) => { if (g) add(g, 1, k === 2); });
  n.zhi.forEach((z, k) => { if (z) n.hide[k].forEach((g, i) => add(g, QI_W[QI_RANK[z][i]] * (k === 1 ? 2 : 1), false)); });
  const tw = wx.reduce((a, b) => a + b, 0), ts = Object.values(ss).reduce((a, b) => a + b, 0);
  return { wx: wx.map(v => v / tw), ss: Object.entries(ss).map(([t, v]) => [t, v / ts]).sort((a, b) => b[1] - a[1]) };
}

// 流月：一年十二个月（以节交接），附起始日期
const JIE12 = ['立春','惊蛰','清明','立夏','芒种','小暑','立秋','白露','寒露','立冬','大雪','XIAO_HAN'];
function liuYue(year){
  const tb = Lunar.fromYmd(year, 6, 1).getJieQiTable();
  return JIE12.map((k, i) => { const s = tb[k], gz = s.getLunar().getMonthInGanZhiExact(); return {i, start: s, gz, zhi: gz[1]}; });
}

// ---------- 命带神煞：只用有古籍原文的规则（《渊海子平》《三命通会》《协纪辨方书》，红艳据《星学大成》） ----------
// 每条：名称、查法说明、出处；结果按柱（0 年 1 月 2 日 3 时）列出
const NS = {
  天乙: {甲:'丑未',戊:'丑未',庚:'丑未',乙:'子申',己:'子申',丙:'亥酉',丁:'亥酉',壬:'卯巳',癸:'卯巳',辛:'寅午'},          // 渊海子平·论起玉堂天乙贵人
  太极: {甲:'子午',乙:'子午',丙:'卯酉',丁:'卯酉',戊:'辰戌丑未',己:'辰戌丑未',庚:'寅亥',辛:'寅亥',壬:'巳申',癸:'巳申'}, // 渊海子平：以生年为主
  文昌: {甲:'巳',乙:'亥',丙:'戌',丁:'辰',戊:'申',己:'午',庚:'寅',辛:'未',壬:'卯',癸:'丑'},                          // 三命通会卷三「文昌贵」
  文昌星: {甲:'巳',乙:'午',丙:'申',丁:'酉',戊:'申',己:'酉',庚:'亥',辛:'戌',壬:'寅',癸:'卯'},                        // 星学大成卷一、古今图书集成568/587（辛见戌，非子）
  国印: {甲:'戌',乙:'亥',丙:'丑',丁:'寅',戊:'丑',己:'寅',庚:'辰',辛:'巳',壬:'未',癸:'申'},                          // 古今图书集成568：禄前第九位
  福星: {甲:'寅子',丙:'寅子戌',丁:'亥酉',戊:'申',己:'未',庚:'午',辛:'巳',壬:'辰',乙:'丑卯',癸:'丑卯'},                  // 渊海子平·论福星贵人
  禄:   {甲:'寅',乙:'卯',丙:'巳',丁:'午',戊:'巳',己:'午',庚:'申',辛:'酉',壬:'亥',癸:'子'},
  羊刃: {甲:'卯',丙:'午',戊:'午',庚:'酉',壬:'子'},                                                                      // 渊海子平：五阳有刃，五阴无刃
  金舆: {甲:'辰',乙:'巳',丙:'未',丁:'申',戊:'未',己:'申',庚:'戌',辛:'亥',壬:'丑',癸:'寅'},                              // 渊海子平：禄前第二位
  红艳: {甲:'午',乙:'申',丙:'寅',丁:'未',戊:'辰',己:'辰',庚:'戌',辛:'酉',壬:'子',癸:'申'},                              // 星学大成
  流霞: {甲:'酉',乙:'戌',丙:'未',丁:'申',戊:'巳',己:'午',庚:'辰',辛:'卯',壬:'亥',癸:'寅'},                              // 星学大成卷三、神峰通考（辛：四库本作寅、神峰作卯，取卯）
};
const XUEREN = z => ZHI[(10 - zi(z) + 12) % 12];     // 血刃：子年加戌逆数（星学大成卷三、三命通会卷三、古今图书集成568）
const HONGLUAN = z => ZHI[(3 - zi(z) + 12) % 12];    // 红鸾：子年加卯逆数（星学大成卷一）；天喜在对宫
const TIANDE = ['巳','庚','丁','申','壬','辛','亥','甲','癸','寅','丙','乙'];   // 按月支（子…亥）：子月巳、丑月庚、寅月丁…（渊海子平·天德）
const YUEDE = ['壬','庚','丙','甲'];                                              // 按月支 %4：申子辰壬、巳酉丑庚、寅午戌丙、亥卯未甲
const TIANDE_HE = {寅:'壬',辰:'丁',巳:'丙',未:'己',申:'戊',戌:'辛',亥:'庚',丑:'乙'};   // 协纪辨方书：四仲月无合
const YUEDE_HE = ['丁','乙','辛','己'];
const SANHE4 = [ // 按年支 %4：[驿马, 桃花(咸池), 华盖, 将星, 劫煞, 亡神]  （三命通会卷二）
  ['寅','酉','辰','子','巳','亥'], ['亥','午','丑','酉','寅','申'], ['申','卯','戌','午','亥','巳'], ['巳','子','未','卯','申','寅']];
const GU_GUA = {寅卯辰:['巳','丑'], 巳午未:['申','辰'], 申酉戌:['亥','未'], 亥子丑:['寅','戌']};   // 孤辰、寡宿（三命通会）
const XUETANG = {金:'巳', 木:'亥', 水:'申', 土:'申', 火:'寅'}, CIGUAN = {金:'申', 木:'寅', 水:'亥', 土:'亥', 火:'巳'};   // 按年纳音五行
const KUIGANG = ['壬辰','庚戌','戊戌','庚辰'];
const YINYANG_CUO = ['丙子','丁丑','戊寅','辛卯','壬辰','癸巳','丙午','丁未','戊申','辛酉','壬戌','癸亥'];
const SHI_E = ['甲辰','乙巳','丙申','丁亥','戊戌','己丑','庚辰','辛巳','壬申','癸亥'];
function natalShensha(n){
  const out = [[],[],[],[]], put = (k, x) => { if (n.pillars[k] && !out[k].includes(x)) out[k].push(x); };
  const ks = [0,1,2,3].filter(k => n.pillars[k]), dg = n.dayGan, yg = n.gan[0], yz = n.zhi[0], mz = n.zhi[1];
  const zhiHit = (targets, name, skip = -1) => ks.forEach(k => { if (k !== skip && targets.includes(n.zhi[k])) put(k, name); });
  zhiHit(NS.天乙[dg] + NS.天乙[yg], '天乙贵人');
  zhiHit(NS.太极[yg], '太极贵人');
  zhiHit(NS.文昌[dg] + NS.文昌[yg], '文昌贵');
  zhiHit(NS.文昌星[dg] + NS.文昌星[yg], '文昌');
  zhiHit(NS.国印[dg] + NS.国印[yg], '国印贵人');
  zhiHit(NS.福星[dg] + NS.福星[yg], '福星贵人');
  zhiHit(NS.禄[dg], '禄神');
  if (NS.羊刃[dg]) zhiHit(NS.羊刃[dg], '羊刃');
  zhiHit(NS.金舆[dg], '金舆');
  zhiHit(NS.红艳[dg], '红艳');
  zhiHit(NS.流霞[dg], '流霞');
  const [ma, tao, hua, jiang, jie, wang] = SANHE4[zi(yz) % 4];
  zhiHit(ma, '驿马', 0); zhiHit(tao, '桃花', 0); zhiHit(hua, '华盖', 0); zhiHit(jiang, '将星', 0); zhiHit(jie, '劫煞', 0); zhiHit(wang, '亡神', 0);
  zhiHit(SANHE4[zi(n.zhi[2]) % 4][1], '桃花', 2);   // 咸池亦可以日支起（神峰通考）
  zhiHit(XUEREN(yz), '血刃', 0);
  const hl = HONGLUAN(yz); zhiHit(hl, '红鸾', 0); zhiHit(ZHI[(zi(hl) + 6) % 12], '天喜', 0);
  const gg = Object.entries(GU_GUA).find(([g]) => g.includes(yz))[1]; zhiHit(gg[0], '孤辰', 0); zhiHit(gg[1], '寡宿', 0);
  const nyWx = n.nayin[0].slice(-1); zhiHit(XUETANG[nyWx], '学堂', 0); zhiHit(CIGUAN[nyWx], '词馆', 0);
  // 天德、月德及其合：按月支，看各柱天干（天德落在申亥寅巳时看地支）
  const td = TIANDE[zi(mz)], yd = YUEDE[zi(mz) % 4], tdh = TIANDE_HE[mz], ydh = YUEDE_HE[zi(mz) % 4];
  ks.forEach(k => { const g = n.gan[k], z = n.zhi[k];
    if (g === td || z === td) put(k, '天德贵人'); if (g === yd) put(k, '月德贵人');
    if (tdh && g === tdh) put(k, '天德合'); if (g === ydh) put(k, '月德合'); });
  // 天罗地网（三命通会：戌人得亥、亥人得戌为天罗；辰人得巳、巳人得辰为地网）
  const luo = {戌:'亥', 亥:'戌'}[yz], wangZ = {辰:'巳', 巳:'辰'}[yz];
  if (luo) zhiHit(luo, '天罗', 0); if (wangZ) zhiHit(wangZ, '地网', 0);
  // 日柱类
  if (KUIGANG.includes(n.pillars[2])) put(2, '魁罡');
  if (SHI_E.includes(n.pillars[2])) put(2, '十恶大败');
  [1,2,3].forEach(k => { if (n.pillars[k] && YINYANG_CUO.includes(n.pillars[k])) put(k, '阴差阳错'); });
  return out;
}

function dayHours(n, l){
  const hours = l.getTimes().slice(0, 12).map((t, k) => ({...hourPersonal(n, l, t), k}));
  const best = hours.filter(h => h.level === '宜用').sort((a, b) => b.score - a.score).slice(0, 3);
  const avoid = hours.filter(h => h.level === '慎用').sort((a, b) => a.score - b.score).slice(0, 3);
  return {hours, best, avoid};
}

return {GAN, ZHI, WX, GAN_WX, ZHI_WX, SX, SS_DESC, SHA_DESC, PALACE_SHORT, shiShen, shiShenZhi, build, today, hourTags, hourSha, hourPersonal, dayHours, luckyColor, changSheng, relations, power, liuYue, natalShensha, ZHI_MAIN, zhiRelPublic: zhiRel, gi, zi};
})();
