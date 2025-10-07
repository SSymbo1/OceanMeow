export const buildLoadProtocolUrl = (...args: string[]) => {
  const fullPath = args.reduce((pre, cur) => {
    const prePath = pre.replace(/[/\\]+$/g, '');
    const curPath = cur.replace(/^[/\\]+/g, '');
    return `${prePath}/${curPath}`;
  });
  const unixLikePath = fullPath.replace(/\\/g, '/');
  return `load://${unixLikePath}`;
};
