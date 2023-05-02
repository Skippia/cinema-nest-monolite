import fs from 'fs/promises'

export async function createPath(path: string) {
  try {
    await fs.access(path)
  } catch (err) {
    if ((err as any)?.code === 'ENOENT') {
      // check if directory doesn't exist
      await fs.mkdir(path, { recursive: true })
    } else {
      throw err // re-throw the error if it's not "directory doesn't exist"
    }
  }
}
