const isMatch = (haystack, arr) => arr.some((v) => haystack.includes(v));
const isMatchAll = (haystack, arr) => arr.every((v) => haystack.includes(v));

module.exports = {
  isMatch,
  isMatchAll,
};
