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

export default {
  formatAddress,
}