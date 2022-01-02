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
import purchaseOrderRoutes from './modules/purchase-order';
import saleRoutes from './modules/sale';
import countryRoutes from './modules/country';
import clinicServiceRoutes from './modules/clinic-service';
import supplierGroupRoutes from './modules/supplier-group';
import customerV2Routes from './modules/customer-v2';
import batchRoutes from './modules/batch';
import generalLedgerRoutes from './modules/general-ledger';
import paymentNoteRoutes from './modules/payment-note';
import saleOrdersRoutes from './modules/sale-orders';
import invoiceRoutes from './modules/invoice';
import purchaseReturnRoutes from './modules/purchase-return';
import damageItemRoutes from './modules/damage-item';

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
  purchaseOrderRoutes(app);
  saleRoutes(app);
  countryRoutes(app);
  supplierGroupRoutes(app);
  customerV2Routes(app);
  batchRoutes(app);
  generalLedgerRoutes(app);
  paymentNoteRoutes(app);
  saleOrdersRoutes(app);
  invoiceRoutes(app);
  purchaseReturnRoutes(app);
  damageItemRoutes(app);
};
