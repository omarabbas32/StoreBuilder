/**
 * PaginationDTO
 * Common DTO for paginated responses
 */
class PaginationDTO {
    constructor(data, total, page = 1, limit = 20) {
        this.data = data;
        this.pagination = {
            total,
            count: data.length,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit),
            hasNextPage: page * limit < total,
            hasPrevPage: page > 1
        };
    }
}

module.exports = PaginationDTO;
