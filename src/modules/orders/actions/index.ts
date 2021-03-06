import { ORDER_ACTIONS } from '../constant';
import orderStateMachine from './order.state-machine';
import OrderAbstractHandler from './order-handler.abstract';
import AssignOrderHandler from './assign.handler';
import CancelOrderHandler from './cancel.handler';
import ConfirmOrderHandler from './confirm.handler';
import CompleteOrderHandler from './order-completion.handler';
import PackageOrderHandler from './package.handler';
import ProcessOrderHandler from './process.handler';
import ShippingOrderHandler from './shipping.handler';
import UpdateItemOrderHandler from './update-line-item.handler';
import { ValidationFailedError } from '@app/core/types/ErrorTypes';
import { upperCase } from 'lodash';
import RejectOrderHandler from './reject.handler';
import CustomerCancelOrderHandler from './customer-cancel.handler';

const getOrderActionHandler = (
  action: string,
  initialState?: string,
): OrderAbstractHandler => {
  let handler: OrderAbstractHandler;
  switch (String(action).toUpperCase()) {
    case ORDER_ACTIONS.ASSIGN:
      handler = new AssignOrderHandler(initialState);
      break;
    case ORDER_ACTIONS.CANCEL:
      handler = new CancelOrderHandler(initialState);
      break;
    case ORDER_ACTIONS.CONFIRM:
      handler = new ConfirmOrderHandler(initialState);
      break;
    case ORDER_ACTIONS.ORDER_COMPLETION:
      handler = new CompleteOrderHandler(initialState);
      break;
    case ORDER_ACTIONS.PACKAGE:
      handler = new PackageOrderHandler(initialState);
      break;
    case ORDER_ACTIONS.PROCESS:
      handler = new ProcessOrderHandler(initialState);
      break;
    case ORDER_ACTIONS.SHIPPING:
        handler = new ShippingOrderHandler(initialState);
      break;
    case ORDER_ACTIONS.UPDATE_LINE_ITEM:
      handler = new UpdateItemOrderHandler(initialState);
      break;
    case ORDER_ACTIONS.REJECT:
      handler = new RejectOrderHandler(initialState);
      break;
    case ORDER_ACTIONS.CUSTOMER_CANCEL:
      handler = new CustomerCancelOrderHandler(initialState);
      break;
    default:
      break;
  }
  if (!handler) {
    throw new ValidationFailedError('Kh??ng th???c hi???n ???????c h??nh ?????ng n??y.');
  }
  if (!handler.fsm.can(String(action).toUpperCase())) {
    throw new ValidationFailedError('H??nh ?????ng y??u c???u kh??ng ph?? h???p v???i tr???ng th??i hi???n t???i c???a ????n h??ng.');
  }

  return handler;
};


const validateAction = (
  action: string,
  initialState?: string,
): boolean => orderStateMachine(initialState).can(action);

export default {
  getOrderActionHandler,
  validateAction,
};
