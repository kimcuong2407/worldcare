import appUtil from '@app/utils/app.util';
import { map } from 'lodash';
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import PolicyCollection from './policy.collection';

// DEGREE
const createPolicy = async (policy: any, language = 'vi') => {
  const createdPolicy = await PolicyCollection.create(policy);
  const data = await PolicyCollection.findOne({_id: createdPolicy._id});
  data.setLanguage(language);
  return data;
}

const getPolicy = async (language = 'vi', isRaw=false) => {
  // PolicyCollection.setDefaultLanguage(language);
  let data = await PolicyCollection.find({}).lean().sort({index: 1, createdAt: 1});
  if(isRaw) {
    return data;
  }
  return map(data, (d) => appUtil.mapLanguage(d, language));
};

const updatePolicyById = async (policyId: string, policy: any) => {
  const updatedPolicy = await PolicyCollection.updateOne({_id: policyId}, {
    $set: {
      ...policy
    }
  });
  return PolicyCollection.findById(policyId).lean();
}

const getPolicyById = async (policyId: string, language = 'vi', isRaw=false) => {
  PolicyCollection.setDefaultLanguage(language);

  if(isRaw) {
    return PolicyCollection.findById(policyId).lean();
  }

  const policy = await PolicyCollection.findById(policyId);
  return policy;
}

const deletePolicy = async (policyId: string) => {
  return PolicyCollection.findByIdAndDelete(policyId)
}



export default {
  createPolicy,
  getPolicy,
  updatePolicyById,
  getPolicyById,
  deletePolicy,
};
