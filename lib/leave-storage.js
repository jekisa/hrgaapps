const path = require('node:path')
const crypto = require('node:crypto')
const fs = require('node:fs/promises')

const MAX_FILE_SIZE = 5 * 1024 * 1024
const MIME_BY_EXTENSION = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
}

function validateUploadMetadata(file) {
  const extension = path.extname(String(file?.name || '')).toLowerCase()
  const expectedMime = MIME_BY_EXTENSION[extension]
  if (!expectedMime) throw new Error('Format file harus PDF, JPG, JPEG, atau PNG')
  if (Number(file.size) > MAX_FILE_SIZE) throw new Error('Ukuran file maksimal 5 MB')
  if (file.type !== expectedMime) throw new Error('MIME file tidak sesuai dengan ekstensinya')
  return { extension, mimeType: expectedMime }
}

async function saveLeaveAttachment(file, rootDirectory) {
  const metadata = validateUploadMetadata(file)
  const safeName = `${crypto.randomUUID()}${metadata.extension}`
  const directory = path.join(rootDirectory, 'public', 'uploads', 'cuti')
  await fs.mkdir(directory, { recursive: true })
  await fs.writeFile(path.join(directory, safeName), Buffer.from(await file.arrayBuffer()))
  return { attachmentUrl: `/uploads/cuti/${safeName}`, fileName: safeName, size: file.size, mimeType: metadata.mimeType }
}

module.exports = { MAX_FILE_SIZE, validateUploadMetadata, saveLeaveAttachment }
