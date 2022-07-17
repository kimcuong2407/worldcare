import { isNil, get, isNull, forEach, mapKeys } from "lodash";
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
import { PRODUCT_RETURN_STATUS } from "./constant";
import { INVOICE_STATUS } from "../invoice/constant";
import _ from "lodash";


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
    await productReturnAutoIncrease(productReturn);
  }
  return productReturn;
}

const createProductReturn = async (info: any, isIncome: boolean) => {
  await validateProductReturnInput(info);
  const productReturn = await persistsProductReturn(info);

  let paymentNote;
  if (isIncome) {
    paymentNote = await paymentNoteService.createPaymentNoteWithTransactionType(info.payment, info, PaymentNoteConstants.TTHDD_TH, isIncome, null);
  } else {
    paymentNote = await paymentNoteService.createPaymentNoteWithTransactionType(info.payment, info, PaymentNoteConstants.TTTH, isIncome, productReturn._id);
  }
  if (!isNil(info.invoiceId)) {
    await invoiceService.updateInvoice({ _id: info.invoiceId, branchId: info.branchId }, { productReturnId: productReturn._id });
  }
  await createProductReturnInventoryTransaction(productReturn);
  productReturn.paymentNoteId = paymentNote._id;
  await productReturn.save();
  await paymentNoteService.updatePaymentNote({ _id: paymentNote._id }, { code: documentCodeUtils.initDocumentCode(paymentNote.transactionType, productReturn.codeSequence) });
  return {
    ...get(productReturn, '_doc', {}),
  }
}

const createProductExchange = async (info: any) => {
  let productReturn;
  const refundInfo = {
    ...info.refund, branchId: info.branchId, partnerId: info.partnerId
  };
  if (info.refund.totalReturn < info.invoice.total) {
    productReturn = await createProductReturn(refundInfo, true);
  } else {
    productReturn = await createProductReturn(refundInfo, false);
  }
  const invoiceInfo = {
    ...info.invoice,
    items: info.invoice.invoiceDetail,
    branchId: info.branchId,
    partnerId: info.partnerId,
    status: INVOICE_STATUS.COMPLETED,
    attachedProductReturnId: productReturn._id,
    code: documentCodeUtils.initDocumentCode("HDD_TH", productReturn.codeSequence)
  };
  const exchangeInvoice = await invoiceService.createInvoice(invoiceInfo);
  await updateProductReturn({ _id: productReturn._id, branchId: info.branchId }, { exchangeInvoiceId: exchangeInvoice._id });
  if (info.refund.totalReturn < info.invoice.total) {
    await paymentNoteService.updatePaymentNote({ _id: productReturn.paymentNoteId }, { referenceDocId: exchangeInvoice._id });
  }
  return productReturn;

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
    if (!isNil(input.invoiceId)) {
      const query = {
        _id: input.invoiceId,
        invoiceDetail: {
          $elemMatch: { productId: item.productId }
        }
      }
      const invoice = await invoiceService.fetchInvoiceInfoByQuery(query);
      if (isNil(invoice)) {
        throw new ValidationFailedError(`invoice with ${input.invoiceId} id is not valid.`);
      }
      const detail = invoice.invoiceDetail.filter((detail: any) => detail.productId == item.productId);
      if (detail[0].quantity < item.quantity) {
        throw new ValidationFailedError(`return quantity greater than quantity in invoice. InvoiceId: ${input.invoiceId}`);
      }
    }
  }
}

const updateProductReturn = async (query: any, info: any) => {
  return await ProductReturnCollection.updateOne(
    query,
    {
      $set: {
        ...info,
      },
    },
    { new: true }
  );
};

const deleteProductReturn = async (query: any, branchId: number) => {
  const productReturn = await ProductReturnCollection.findOneAndUpdate(query, {
    deletedAt: new Date(),
    status: PRODUCT_RETURN_STATUS.CANCELED
  }).lean().exec();
  const paymentQuery = {
    _id: get(productReturn, 'paymentNoteId', null)
  };
  if (!isNil(paymentQuery)) {
    await paymentNoteService.deletePaymentNote(paymentQuery);
  }
  const inventoryTransactions = get(productReturn, 'inventoryTransactionIds');
  forEach(inventoryTransactions, async (inventoryTransaction) => {
    await inventoryTransactionService.cancelInventoryTransaction(inventoryTransaction);
  })
  const exchangeInvoiceId = get(productReturn, 'exchangeInvoiceId', null);
  if (!isNil(exchangeInvoiceId)) {
    await invoiceService.cancelInvoice(exchangeInvoiceId, branchId, null);
  }
  return true;
}

const fetchProductReturnListByQuery = async (queryInput: any, options: any) => {
  let statuses;
  if(isNil(queryInput.status)){
    statuses = null;
  } else {
    statuses = queryInput.status.split(',');
  }
  const query = {
    status: {
      $in: statuses
    },
    branchId: queryInput.branchId,
    partnerId: queryInput.partnerId
  } as any;

  const productReturn = await ProductReturnCollection.paginate(query, {
    ...options,
    sort: { createdAt: -1 },
    lean: true,
    populate: [
      { path: 'customer' },
      { path: 'paymentNote' },
      {
        path: 'exchangeInvoice',
        strictPopulate: false,
        populate: {
          path: 'invoiceDetail',
          populate: [
            {
              path: 'productId',
              model: 'product',

            },
            {
              path: 'variantId',
              model: 'product_variant'
            }
          ]
        },
      },
      {
        path: 'productReturnDetail',
        strictPopulate: false,
        populate: [
          {
            path: 'productId',
            model: 'product',
            justOne: true
          },
          {
            path: 'variantId',
            model: 'product_variant'
          }
        ]
      },
      { path: 'product' },
      { path: 'productVariant' },
      { path: 'invoice' },
      { path: 'receivedBy', select: '-password' },
      { path: 'inventoryTransactions' },
      { path: 'createdBy', select: '-password' },
    ]
  });
  const { docs, ...rest } = productReturn;
  return {
    docs,
    ...rest,
  }

}


export default {
  createProductReturn,
  createProductExchange,
  deleteProductReturn,
  fetchProductReturnListByQuery,
  updateProductReturn
}