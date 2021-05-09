import appUtil from '@app/utils/app.util';
import express from 'express';
import get from 'lodash/get';
import loggerHelper from '@utils/logger.util';
import map from 'lodash/map';
import pick from 'lodash/pick';
import SpecialityCollection from '../configuration/speciality.collection';

const logger = loggerHelper.getLogger('general.controller');

const getSpecialityAndHospital = async (serviceType: string, language = 'vi') => {
  try {
    const hospitalWithSpeciality = await SpecialityCollection.aggregate(
      [
        {
          '$lookup': {
            'from': 'hospital',
            'let': {
              'speciality': '$_id'
            },
            'pipeline': [
              {
                '$match': {
                  '$expr': {
                    '$and': [
                      {
                        '$in': [
                          '$$speciality', '$speciality'
                        ]
                      }
                    ]
                  }
                }
              }, {
                '$sort': {
                  'created': -1
                }
              }, {
                '$limit': 1
              }, {
                '$project': {
                  'hospitalName': 1,
                  'slug': 1,
                  '_id': 1
                }
              }
            ],
            'as': 'hospital'
          }
        }, {
          '$addFields': {
            'totalHospital': {
              '$size': '$hospital'
            },
            'hospital': {
              '$arrayElemAt': [
                '$hospital', 0
              ]
            }
          }
        }, {
          '$match': {
            'totalHospital': {
              '$gt': 0
            },
            service: serviceType,
          }
        }
      ]
    ).exec();
    return map(hospitalWithSpeciality, (data) => appUtil.mapLanguage(data, language));
  } catch (e) {
    logger.error('getSpecialityAndHospital', e);
    throw e;
  }
};


export default {
  getSpecialityAndHospital,
}