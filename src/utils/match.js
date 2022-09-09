const isMatchSome = (haystack, arr) => arr.some((v) => haystack.includes(v));
const isMatchEvery = (haystack, arr) => arr.every((v) => haystack.includes(v));

module.exports = {
  isMatchSome,
  isMatchEvery,
};
