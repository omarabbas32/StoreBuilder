const { asyncHandler } = require('../middleware/errorHandler');
const CreateProductRequestDTO = require('../dtos/product/CreateProductRequest.dto');
const ProductResponseDTO = require('../dtos/product/ProductResponse.dto');

class ProductController {
    constructor(productService) {
        this.productService = productService;
    }

    create = asyncHandler(async (req, res) => {
        const dto = CreateProductRequestDTO.fromRequest(req.validatedData);
        const result = await this.productService.createProduct(dto, req.user.id);
        res.status(201).json({ success: true, data: new ProductResponseDTO(result) });
    });

    update = asyncHandler(async (req, res) => {
        // req.validatedData from updateProductSchema
        const result = await this.productService.updateProduct(req.params.id, req.validatedData, req.user.id);
        res.status(200).json({ success: true, data: new ProductResponseDTO(result) });
    });

    getByStore = asyncHandler(async (req, res) => {
        const result = await this.productService.getProductsByStore(req.params.storeId, req.query);
        res.status(200).json({
            success: true,
            data: result.products,
            pagination: result.pagination
        });
    });

    getById = asyncHandler(async (req, res) => {
        const result = await this.productService.getProduct(req.params.id);
        res.status(200).json({ success: true, data: new ProductResponseDTO(result) });
    });

    reorder = asyncHandler(async (req, res) => {
        await this.productService.reorderProducts(req.validatedData, req.user.id);
        res.status(200).json({ success: true, message: 'Products reordered successfully' });
    });

    getAll = asyncHandler(async (req, res) => {
        const result = await this.productService.getAllProducts(req.query);
        res.status(200).json({
            success: true,
            data: result.products,
            pagination: result.pagination
        });
    });

    delete = asyncHandler(async (req, res) => {
        await this.productService.deleteProduct(req.params.id, req.user.id);
        res.status(200).json({ success: true, message: 'Product deleted successfully' });
    });
}

module.exports = ProductController;
