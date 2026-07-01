function isItemWithId(node: unknown): node is { id: string } {
  return typeof node === 'object' && node !== null && typeof (node as { id?: unknown }).id === 'string';
}

function descend(node: unknown, segment: string): unknown {
  if (Array.isArray(node)) {
    return node.find((item) => isItemWithId(item) && item.id === segment) ?? node[Number(segment)];
  }
  if (typeof node === 'object' && node !== null) {
    return (node as Record<string, unknown>)[segment];
  }
  return undefined;
}

export function getAtPath(root: unknown, path: string): unknown {
  if (!path) return root;
  return path.split('.').reduce((node, segment) => descend(node, segment), root);
}

export function setAtPath(root: unknown, path: string, value: unknown): boolean {
  const segments = path.split('.');
  if (segments.length === 0) return false;

  let node: unknown = root;
  for (let i = 0; i < segments.length - 1; i++) {
    node = descend(node, segments[i]);
  }

  if (typeof node !== 'object' || node === null || Array.isArray(node)) return false;

  (node as Record<string, unknown>)[segments[segments.length - 1]] = value;
  return true;
}
