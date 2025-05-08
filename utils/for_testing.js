const reverse = (string) => {
  return string.split('').reverse().join('');
};

const average = (array) => {
  if (!array.length) return 0;

  const reducer = (acc, el) => {
    return acc + el;
  };

  return array.reduce(reducer, 0) / array.length;
};

module.exports = {
  reverse,
  average,
};
