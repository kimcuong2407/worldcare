import { get } from 'lodash';
import subVN from 'sub-vn';
const formatAddress = (address: any) => {
  const { street, ward, district, city} = address || {};
  return {
    street,
    ward: get(subVN.getWardsByCode(ward), 'name'),
    district: get(subVN.getDistrictByCode(district), 'name'),
    city: get(subVN.getCityByCode(city), 'name'),
  }
};

const formatAddressV2 = (address: any) => {
  const { street, wardId, districtId, cityId, ...rest } = address || {};
  return {
    street,
    wardId,
    districtId,
    cityId,
    ward: get(subVN.getWardsByCode(wardId), 'name'),
    district: get(subVN.getDistrictByCode(districtId), 'name'),
    city: get(subVN.getCityByCode(cityId), 'name'),
    ...rest,
  }
};


export default {
  formatAddress,
  formatAddressV2,
}