// helper function
export function truncate(str: string, separator = '...'): string {
  const first = str.substring(0, 4);
  const second = str.substring(str.length - 5, str.length - 1);

  return first + separator + second;
}

export function bufferToHexString(buffer: WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer>): string {
  return Buffer.from(buffer).toString('hex')
}
