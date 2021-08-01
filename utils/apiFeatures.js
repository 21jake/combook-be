class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const excludedFields = ['page', 'limit', 'sort', 'fields'];
    const queryObj = { ...this.queryString };
    excludedFields.forEach(field => delete queryObj[field]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = JSON.parse(
      queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
    );
    this.query = this.query.find(queryStr);
    return this;
  }

  sort() {
    const { sort, fields } = this.queryString;
    if (sort) {
      const sortBy = sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    if (fields) {
      const chosenFields = fields.split(',').join(' ');
      this.query = this.query.select(chosenFields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    let { page, limit } = this.queryString;
    page = Number(page) || 1;
    limit = Number(limit) || 20;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
