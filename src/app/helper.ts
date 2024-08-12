// helper function
export function truncate(str: string, separator = '...', length = 4): string {
  const first = str.substring(0, length);
  const second = str.substring(str.length - length, str.length);

  return first + separator + second;
}

export function bufferToHexString(
  buffer: WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer>,
): string {
  return Buffer.from(buffer).toString('hex');
}
