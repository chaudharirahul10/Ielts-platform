const L = [[39,9],[37,8.5],[35,8],[32,7.5],[30,7],[26,6.5],[23,6],[18,5.5],[16,5],[13,4.5],[10,4]];
const RA = [[39,9],[37,8.5],[35,8],[33,7.5],[30,7],[27,6.5],[23,6],[19,5.5],[15,5],[13,4.5],[10,4]];
const RG = [[40,9],[39,8.5],[37,8],[36,7.5],[34,7],[32,6.5],[30,6],[27,5.5],[23,5],[19,4.5],[15,4]];
const lookup = (raw, table) => { for (const [t,b] of table) if (raw >= t) return b; return 3.0; };
exports.calculateListeningBand = (raw) => lookup(raw, L);
exports.calculateReadingBand = (raw, type='academic') => lookup(raw, type==='general' ? RG : RA);
exports.calculateWritingBand = ({taskAchievement,coherenceCohesion,lexicalResource,grammaticalRange}) =>
  Math.round(((taskAchievement+coherenceCohesion+lexicalResource+grammaticalRange)/4)*2)/2;
exports.calculateSpeakingBand = ({fluencyCoherence,lexicalResource,grammaticalRange,pronunciation}) =>
  Math.round(((fluencyCoherence+lexicalResource+grammaticalRange+pronunciation)/4)*2)/2;
exports.calculateOverallBand = (l,r,w,s) => Math.round(((l+r+w+s)/4)*2)/2;
