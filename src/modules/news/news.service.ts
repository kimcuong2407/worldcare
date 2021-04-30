import { Types } from "mongoose";
import { v4 as uuidv4 } from 'uuid';
import NewsCollection from "./news.collection";

// DEGREE
const createNews = async (news: any, language = 'vi') => {
  const createdNews = await NewsCollection.create(news);
  NewsCollection.setDefaultLanguage(language);
  const data = await NewsCollection.findOne({_id: createdNews._id});
  data.setLanguage(language);
  return data;
}

const getNews = async (params: any, language = 'vi', isRaw=false) => {
  const {
    slug, status, category, startTime, endTime, options,
  } = params;
  const query: any = {
  };
  const andQuery = [];
  if(slug) {
    andQuery.push({
      slug: slug
    }
    );
  }
  if(status) {
    andQuery.push({
      status: status
    });
  }
  if(category) {
    andQuery.push({
      category: category
    });
  }
  if (startTime) {
    andQuery.push({
      updatedAt: { $gte: startTime }
    });
  }
  if (endTime) {
    andQuery.push({
      updatedAt: { $lte: startTime }
    });
  }
  if (andQuery && andQuery.length) {
    query['$and'] = andQuery;
  }
  NewsCollection.setDefaultLanguage(language);
  let data = await NewsCollection.paginate(query, {
    ...options,
    'populate': [
      { path: 'category', select: 'name' },
    ],
  });
  if(isRaw) {
    data = data.toJSON({virtuals: false})
    return data;
  }
  return data;
};

const updateNewsById = async (newsId: string, news: any) => {
  const updatedNews = await NewsCollection.updateOne({_id: newsId}, {
    $set: {
      ...news
    }
  });
  const data = await NewsCollection.findOne({_id: newsId});
  return data;
}

const getNewsByIdOrSlug = async (newsId: string, language = 'vi', isRaw=false) => {
  NewsCollection.setDefaultLanguage(language);
  
  let news;
  if( Types.ObjectId.isValid(newsId)) {
    news = await NewsCollection.findById(newsId);
  } else {
    news = await NewsCollection.findOne({slug: newsId});
  }
  if(isRaw) {
    news = news.toJSON({virtuals: false})
    return news;
  }
  return news;
}

const deleteNews = async (newsId: string) => {
  return NewsCollection.updateOne({_id: newsId}, {deletedAt: new Date(), slug: uuidv4()})
}



export default {
  createNews,
  getNews,
  updateNewsById,
  getNewsByIdOrSlug,
  deleteNews,
};
