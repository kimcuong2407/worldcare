import mongoose from 'mongoose';
import mongooseIntl from 'mongoose-intl';
import mongoosePaginate from 'mongoose-paginate-v2';

const ProductUnitSchem = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    status: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

ProductUnitSchem.plugin(mongooseIntl, {
  languages: ['vi', 'en'],
  defaultLanguage: 'vi',
});
ProductUnitSchem.plugin(mongoosePaginate);

export const ProductPositionCollection = mongoose.model(
  'product_unit',
  ProductUnitSchem
);

export default ProductPositionCollection;
