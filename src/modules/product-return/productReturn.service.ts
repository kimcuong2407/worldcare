import { isNil, get } from "lodash";
import ProductReturnCollection from "./productReturn.collection";
import loggerHelper from '@utils/logger.util';
import { InternalServerError, ValidationFailedError } from "@app/core/types/ErrorTypes";
import ProductVariantCollection from "../product/productVariant.collection";
import BatchCollection from "../batch/batch.collection";
import documentCodeUtils from '@utils/documentCode.util';
import paymentNoteService from "../payment-note/paymentNote.service";
import { PaymentNoteConstants } from "../payment-note/constant";
import inventoryTransactionService from "../inventory-transaction/inventory-transaction.service";
import { INVENTORY_TRANSACTION_TYPE } from "../inventory-transaction/constant";
import invoiceService from "../invoice/invoice.service";

const logger = loggerHelper.getLogger('product-return.service');

const productReturnAutoIncrease = async (record: any) => {
  record.setNext('product_return_code_sequence', async (err: any, record: any) => {
    if (err) {
      return new InternalServerError('Failed to increase ID.');
    }
    const productReturnCode = documentCodeUtils.initDocumentCode("TH", record.codeSequence);
    const doc = await ProductReturnCollection
      .findOne({ code: productReturnCode, branchId: get(record, '_doc.branchId') })
      .lean().exec();
    if (!isNil(doc)) productReturnAutoIncrease(record);
    record.code = productReturnCode;
    record.save();
  });
}

const persistsProductReturn = async (info: any) => {
  const code = get(info, 'code', null);
  const productReturn = await ProductReturnCollection.create(info);
  if (isNil(code)) {
    productReturnAutoIncrease(productReturn);
  }
  return productReturn;
}

const createProductReturn = async (info: any) => {
  await validateProductReturnInput(info);
  const productReturn = await persistsProductReturn(info);
  const paymentNote = await paymentNoteService.createPaymentNoteWithTransactionType(info.payment, info, PaymentNoteConstants.TTTH, false, productReturn._id);
  await createProductReturnInventoryTransaction(productReturn);
  productReturn.paymentNoteId = paymentNote._id;
  return {
    ...get(productReturn, '_doc', {}),
    paymentNote
  }
}

const createProductReturnInventoryTransaction = async (productReturnDoc: any) => {
  logger.info(`Creating Product return InventoryTransaction. productReturnId=${JSON.stringify(productReturnDoc._id)} `);
  const inventoryTransactionIds: string[] = [];
  for (const item of productReturnDoc.productReturnDetail) {
    const inventoryTransactionInfo = {
      partnerId: productReturnDoc.partnerId,
      branchId: productReturnDoc.branchId,
      productId: item.productId,
      variantId: item.variantId,
      batchId: item.batchId,
      quantity: item.quantity,
      referenceDocId: productReturnDoc._id
    }
    const createdInventoryTransaction = await inventoryTransactionService.createInventoryTransaction(
      inventoryTransactionInfo, INVENTORY_TRANSACTION_TYPE.PRODUCT_RETURN);
    inventoryTransactionIds.push(get(createdInventoryTransaction, '_doc._id'));
  }
  productReturnDoc.inventoryTransactionIds = inventoryTransactionIds;
  await productReturnDoc.save();
}

const validateProductReturnInput = async (input: any) => {
  logger.info('validating product return input. productReturnInput=' + JSON.stringify(input));
  const items = input.productReturnDetail;
  if (isNil(items) || items.length === 0) {
    throw new ValidationFailedError('productReturnDetail is not valid.');
  }
  const branchId = input.branchId;
  for (const item of items) {
    if (isNil(item.variantId)) {
      throw new ValidationFailedError('variantId is required.');
    }
    if (isNil(item.productId)) {
      throw new ValidationFailedError('productId is required.');
    }
    if (isNil(item.batchId)) {
      throw new ValidationFailedError('batchId is required.');
    }
    if (isNil(item.quantity)) {
      throw new ValidationFailedError('batchId is required.');
    }
    if (isNil(item.price)) {
      throw new ValidationFailedError('price or items.price is required.');
    }
    if (isNil(item.cost)) {
      throw new ValidationFailedError('cost or items.cost is required.');
    }
    const productVariant = await ProductVariantCollection.findOne({
      _id: item.variantId,
      branchId
    }).lean().exec();
    if (isNil(productVariant)) {
      throw new ValidationFailedError('variantId is not valid.');
    }
    const batch = await BatchCollection.findOne({
      _id: item.batchId,
      variantId: item.variantId,
      productId: item.productId
    }).lean().exec();
    if (isNil(batch)) {
      throw new ValidationFailedError('batchId is not valid.');
    }
    if(!isNil(input.invoiceId)){
      const query = {
        _id: input.invoiceId,
        invoiceDetail : {
          $elemMatch: { productId: item.productId}
        }
      }
      const invoice = await invoiceService.fetchInvoiceInfoByQuery(query);
      const detail = invoice.invoiceDetail.filter((detail: any) => detail.productId == item.productId);
      if(detail[0].quantity < item.quantity){
        throw new ValidationFailedError(`return quantity greater than quantity in invoice. InvoiceId: ${input.invoiceId}`);
      }
    }
  }
}

export default {
  createProductReturn
}