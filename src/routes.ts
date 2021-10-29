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
};
