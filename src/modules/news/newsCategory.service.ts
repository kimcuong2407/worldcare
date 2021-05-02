import { UnAuthenticated } from "@app/core/types/ErrorTypes";
import bcryptUtil from "@app/utils/bcrypt.util";
import jwtUtil from "@app/utils/jwt.util";
import { get } from "lodash";
import { Types } from "mongoose";
import { v4 as uuidv4 } from 'uuid';
import UserCollection from "../user/user.collection";
import { NEWS_STATUS } from "./constant";
import NewsCollection from "./news.collection";
import NewsCategoryCollection from "./newsCategory.collection";

// DEGREE
const createNewsCategory = async (category: any, language = 'vi') => {
  const createdNewsCategory = await NewsCategoryCollection.create(category);
  NewsCategoryCollection.setDefaultLanguage(language);
  const data = await NewsCategoryCollection.findOne({_id: createdNewsCategory._id});
  data.setLanguage(language);
  return data;
}

const getNewsCategory = async (language = 'vi') => {
  NewsCategoryCollection.setDefaultLanguage(language);
  const data = await NewsCategoryCollection.find({deletedAt: null});
  return data;
};

const updateNewsCategoryById = async (categoryId: string, category: any) => {
  const updatedNewsCategory = await NewsCategoryCollection.updateOne({_id: categoryId}, {
    $set: {
      ...category
    }
  });
  const data = await NewsCategoryCollection.findOne({_id: categoryId});
  return data;
}

const getNewsCategoryByIdOrSlug = async (categoryId: string, language = 'vi', isRaw=false) => {
  NewsCategoryCollection.setDefaultLanguage(language);
  
  let category;
  if( Types.ObjectId.isValid(categoryId)) {
    category = await NewsCategoryCollection.findById(categoryId);
  } else {
    category = await NewsCategoryCollection.findOne({slug: categoryId});
  }
  if(isRaw) {
    category = category.toJSON({virtuals: false})
    return category;
  }
  return category;
}

const deleteNewsCategory = async (categoryId: string) => {
  return NewsCategoryCollection.updateOne({_id: categoryId}, {deletedAt: new Date(), slug: uuidv4()})
}


const getNewsByCategory = async (categoryId: string, options: any, language = 'vi') => {
  NewsCategoryCollection.setDefaultLanguage(language);
  NewsCollection.setDefaultLanguage(language);

  let query: any = {
    slug: categoryId
  }
  if( Types.ObjectId.isValid(categoryId)) {
    query = {
      _id: Types.ObjectId(categoryId),
    }
  } 
  const category = await NewsCategoryCollection.findOne(query).lean();
  const news = NewsCollection.paginate({
    category: get(category, '_id'),
    status: NEWS_STATUS.PUBLISHED
  }, {
    ...options
  })
  return news;
}


export default {
  createNewsCategory,
  getNewsCategory,
  updateNewsCategoryById,
  getNewsCategoryByIdOrSlug,
  deleteNewsCategory,
  getNewsByCategory,
};
