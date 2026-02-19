const { asyncHandler } = require('../middleware/errorHandler');
const CreateCategoryRequestDTO = require('../dtos/category/CreateCategoryRequest.dto');
const UpdateCategoryRequestDTO = require('../dtos/category/UpdateCategoryRequest.dto');
const CategoryResponseDTO = require('../dtos/category/CategoryResponse.dto');

class CategoryController {
    constructor(categoryService) {
        this.categoryService = categoryService;
    }

    create = asyncHandler(async (req, res) => {
        const dto = CreateCategoryRequestDTO.fromRequest(req.validatedData);
        const result = await this.categoryService.createCategory(dto, req.user.id);
        res.status(201).json({ success: true, data: new CategoryResponseDTO(result) });
    });

    getByStore = asyncHandler(async (req, res) => {
        const results = await this.categoryService.getCategoriesByStore(req.params.storeId, req.query);
        res.status(200).json({ success: true, data: CategoryResponseDTO.fromArray(results) });
    });

    getById = asyncHandler(async (req, res) => {
        const result = await this.categoryService.getCategory(req.params.id);
        res.status(200).json({ success: true, data: new CategoryResponseDTO(result) });
    });

    update = asyncHandler(async (req, res) => {
        const dto = UpdateCategoryRequestDTO.fromRequest(req.validatedData);
        const result = await this.categoryService.updateCategory(req.params.id, dto.toPrisma(), req.user.id);
        res.status(200).json({ success: true, data: new CategoryResponseDTO(result) });
    });

    delete = asyncHandler(async (req, res) => {
        await this.categoryService.deleteCategory(req.params.id, req.user.id);
        res.status(200).json({ success: true, message: 'Category deleted successfully' });
    });
}

module.exports = CategoryController;
