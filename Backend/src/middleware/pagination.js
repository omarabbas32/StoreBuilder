const { getPagination } = require('../utils/pagination');

const paginationMiddleware = (req, res, next) => {
    const { page, size } = req.query;
    const { limit, offset } = getPagination(page, size);
    req.pagination = { limit, offset, page: page ? +page : 1 };
    next();
};

module.exports = paginationMiddleware;
