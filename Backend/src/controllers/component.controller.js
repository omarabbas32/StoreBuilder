const { asyncHandler } = require('../middleware/errorHandler');

class ComponentController {
    constructor(componentService) {
        this.componentService = componentService;
    }

    getActive = asyncHandler(async (req, res) => {
        const result = await this.componentService.getActiveComponents();
        res.status(200).json({ success: true, data: result });
    });

    adminGetAll = asyncHandler(async (req, res) => {
        const result = await this.componentService.getAllComponents(req.query);
        res.status(200).json({ success: true, data: result });
    });

    create = asyncHandler(async (req, res) => {
        const result = await this.componentService.createComponent(req.body);
        res.status(201).json({ success: true, data: result });
    });

    update = asyncHandler(async (req, res) => {
        const result = await this.componentService.updateComponent(req.params.id, req.body);
        res.status(200).json({ success: true, data: result });
    });

    delete = asyncHandler(async (req, res) => {
        await this.componentService.deleteComponent(req.params.id);
        res.status(200).json({ success: true, message: 'Component deleted successfully' });
    });

    toggleActive = asyncHandler(async (req, res) => {
        const result = await this.componentService.toggleActive(req.params.id);
        res.status(200).json({ success: true, data: result });
    });
}

module.exports = ComponentController;
