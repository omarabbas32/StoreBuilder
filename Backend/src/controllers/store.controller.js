const { asyncHandler } = require('../middleware/errorHandler');
const CreateStoreRequestDTO = require('../dtos/store/CreateStoreRequest.dto');
const UpdateStoreRequestDTO = require('../dtos/store/UpdateStoreRequest.dto');
const StoreResponseDTO = require('../dtos/store/StoreResponse.dto');

class StoreController {
    constructor(storeService) {
        this.storeService = storeService;
    }

    create = asyncHandler(async (req, res) => {
        const dto = CreateStoreRequestDTO.fromRequest(req.validatedData);
        const result = await this.storeService.createStore(dto, req.user.id);
        res.status(201).json({ success: true, data: new StoreResponseDTO(result) });
    });

    update = asyncHandler(async (req, res) => {
        const dto = UpdateStoreRequestDTO.fromRequest(req.validatedData);
        const result = await this.storeService.updateStore(req.params.id, dto, req.user.id);
        res.status(200).json({ success: true, data: new StoreResponseDTO(result) });
    });

    getBySlug = asyncHandler(async (req, res) => {
        const result = await this.storeService.getStoreBySlug(req.params.slug);
        res.status(200).json({ success: true, data: new StoreResponseDTO(result) });
    });

    getById = asyncHandler(async (req, res) => {
        const result = await this.storeService.getStore(req.params.id);
        res.status(200).json({ success: true, data: new StoreResponseDTO(result) });
    });

    getAll = asyncHandler(async (req, res) => {
        const results = await this.storeService.getAllStores(req.query);
        res.status(200).json({ success: true, data: StoreResponseDTO.fromArray(results) });
    });

    delete = asyncHandler(async (req, res) => {
        await this.storeService.deleteStore(req.params.id, req.user.id);
        res.status(200).json({ success: true, message: 'Store deleted successfully' });
    });
}

module.exports = StoreController;
