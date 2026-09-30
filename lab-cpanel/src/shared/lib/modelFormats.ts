export type ModelFormat = 'stl' | 'obj' | 'ply' | '3mf'

const modelFormats: Record<string, ModelFormat> = {
  stl: 'stl',
  obj: 'obj',
  ply: 'ply',
  '3mf': '3mf',
}

export function getModelFormat(fileName: string): ModelFormat | undefined {
  const extension = fileName.split('.').pop()?.toLowerCase()
  return extension ? modelFormats[extension] : undefined
}

export function isSupportedModelFile(fileName: string) {
  return getModelFormat(fileName) !== undefined
}
