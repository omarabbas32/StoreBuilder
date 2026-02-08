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

    searchImages = asyncHandler(async (req, res) => {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ success: false, message: 'Query parameter is required' });
        }

        // We use Unsplash for high-quality professional images
        const queryTerm = encodeURIComponent(query);

        // Simulating search results with high-quality Unsplash templates
        // In a production app, this would call the Unsplash API or a search engine
        const results = [
            {
                id: 'img1',
                url: `https://images.unsplash.com/photo-1493723843671-1d655e7d98f0?q=80&w=1200&auto=format&fit=crop&q=search&term=${queryTerm}`,
                thumbnail: `https://images.unsplash.com/photo-1493723843671-1d655e7d98f0?q=80&w=400&auto=format&fit=crop&q=search&term=${queryTerm}`,
                title: `${query} Concept 1`
            },
            {
                id: 'img2',
                url: `https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1200&auto=format&fit=crop&q=search&term=${queryTerm}`,
                thumbnail: `https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=400&auto=format&fit=crop&q=search&term=${queryTerm}`,
                title: `${query} Concept 2`
            },
            {
                id: 'img3',
                url: `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop&q=search&term=${queryTerm}`,
                thumbnail: `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400&auto=format&fit=crop&q=search&term=${queryTerm}`,
                title: `${query} Concept 3`
            }
        ];

        res.status(200).json({
            success: true,
            data: results
        });
    });
}

module.exports = MediaController;
