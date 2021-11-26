import express from 'express';
import serverRoutes from '@modules/server';
import authRoutes from '@modules/auth';
import userRoutes from '@modules/user';
import configurationRoutes from './modules/configuration';
import fileRoutes from './modules/file';
import hospitalRoutes from './modules/hospital';
import staffRoutes from './modules/staff';
import categoryRoutes from './modules/news';
import serviceRoutes from './modules/services';
import appointmentRoutes from './modules/appointment';
import generalRoutes from './modules/general';
import companyRoutes from './modules/branch';
import orderRoutes from './modules/orders';
import partnerRoutes from './modules/partner';
import employeeRoutes from './modules/employee';
import customerRoutes from './modules/customer';
import partnershipRoutes from './modules/partnership';
import couponRoutes from './modules/coupon';
import policyRoutes from './modules/policy';
import shippingVendorRoutes from './modules/shipping-vendor';
import customerAccountRoutes from './modules/customer-account';
import supplierRoutes from './modules/supplier';
import productTypeRoutes from './modules/product-type';
import productGroupRoutes from './modules/product-group';
import productPositionRoutes from './modules/product-position';
import productUnitRoutes from './modules/product-unit';
import productRouteAdministrationRoutes from './modules/product-routeadministration';
import manufacturerRoutes from './modules/manufacturer';
import serviceGroupRoutes from './modules/clinic-service-group';
import productRoutes from './modules/product';
import purchaseReceiptRoutes from './modules/purchase-receipt';
import saleRoutes from './modules/sale';
import countryRoutes from './modules/country';
import clinicServiceRoutes from './modules/clinic-service';

export default (app: express.Application): void => {
  serverRoutes(app);
  authRoutes(app);
  userRoutes(app);
  hospitalRoutes(app);
  staffRoutes(app);
  configurationRoutes(app);
  fileRoutes(app);
  categoryRoutes(app);
  serviceRoutes(app);
  appointmentRoutes(app);
  generalRoutes(app);
  companyRoutes(app);
  orderRoutes(app);
  partnerRoutes(app);
  employeeRoutes(app);
  customerRoutes(app);
  partnershipRoutes(app);
  couponRoutes(app);
  policyRoutes(app);
  shippingVendorRoutes(app);
  customerAccountRoutes(app);
  supplierRoutes(app);
  productTypeRoutes(app);
  productGroupRoutes(app);
  productPositionRoutes(app);
  productUnitRoutes(app);
  productRouteAdministrationRoutes(app);
  manufacturerRoutes(app);
  serviceGroupRoutes(app);
  clinicServiceRoutes(app);
  productRoutes(app);
  purchaseReceiptRoutes(app);
  saleRoutes(app);
  countryRoutes(app);
};
