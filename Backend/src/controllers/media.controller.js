const { asyncHandler } = require('../middleware/errorHandler');
const { v4: uuidv4 } = require('uuid');

class MediaController {
    constructor(uploadService, prisma) {
        this.uploadService = uploadService;
        this.prisma = prisma;
    }

    uploadImage = asyncHandler(async (req, res) => {
        const { storeId } = req.params;
        const result = await this.uploadService.uploadFile(req.file);

        if (storeId) {
            // Save metadata to DB
            const upload = await this.prisma.upload.create({
                data: {
                    id: uuidv4(),
                    store_id: storeId,
                    filename: result.publicId,
                    original_name: result.originalName,
                    file_path: result.url,
                    file_size: result.size,
                    mime_type: result.format,
                }
            });
            return res.status(200).json({ success: true, data: upload });
        }

        res.status(200).json({
            success: true,
            data: result
        });
    });

    listByStore = asyncHandler(async (req, res) => {
        const { storeId } = req.params;
        const uploads = await this.prisma.upload.findMany({
            where: { store_id: storeId },
            orderBy: { created_at: 'desc' }
        });

        res.status(200).json({
            success: true,
            data: uploads.map(u => ({
                id: u.id,
                url: u.file_path,
                filename: u.filename,
                originalName: u.original_name,
                size: u.file_size,
                createdAt: u.created_at
            }))
        });
    });

    delete = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const upload = await this.prisma.upload.findUnique({ where: { id } });

        if (!upload) {
            return res.status(404).json({ success: false, message: 'Upload not found' });
        }

        await this.uploadService.deleteFile(upload.filename);
        await this.prisma.upload.delete({ where: { id } });

        res.status(200).json({ success: true, message: 'Upload deleted successfully' });
    });

    uploadMultiple = asyncHandler(async (req, res) => {
        const result = await this.uploadService.uploadMultiple(req.files);
        res.status(200).json({
            success: true,
            data: {
                images: result
            }
        });
    });
}

module.exports = MediaController;
