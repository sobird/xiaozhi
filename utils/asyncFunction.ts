export function asyncFunction(ms: number = 1000) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('finshed');
    }, ms);
  });
}
