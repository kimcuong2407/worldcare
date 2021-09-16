import StateMachine from 'ts-javascript-state-machine';
import { ORDER_ACTIONS, ORDER_STATUS } from '../constant';

export default (initState: string) => new StateMachine({
  init: initState,
  transitions: [
    // t1
    {
      name: ORDER_ACTIONS.ASSIGN,
      from: ORDER_STATUS.NEW,
      to: ORDER_STATUS.RECEIVED,
    },
    // t2
    {
      name: ORDER_ACTIONS.CANCEL,
      from: ORDER_STATUS.NEW,
      to: ORDER_STATUS.CANCELLED,
    },
    {
      name: ORDER_ACTIONS.PROCESS,
      from: ORDER_STATUS.RECEIVED,
      to: ORDER_STATUS.PROCESSED,
    },
    {
      name: ORDER_ACTIONS.REJECT,
      from: ORDER_STATUS.RECEIVED,
      to: ORDER_STATUS.NEW,
    },
    {
      name: ORDER_ACTIONS.UPDATE_LINE_ITEM,
      from: ORDER_STATUS.RECEIVED,
      to: ORDER_STATUS.RECEIVED,
    },
    {
      name: ORDER_ACTIONS.CANCEL,
      from: ORDER_STATUS.RECEIVED,
      to: ORDER_STATUS.CANCELLED,
    },
    {
      name: ORDER_ACTIONS.CONFIRM,
      from: ORDER_STATUS.PROCESSED,
      to: ORDER_STATUS.CONFIRMED,
    },
    {
      name: ORDER_ACTIONS.CANCEL,
      from: ORDER_STATUS.PROCESSED,
      to: ORDER_STATUS.CANCELLED,
    },
    {
      name: ORDER_ACTIONS.REJECT,
      from: ORDER_STATUS.PROCESSED,
      to: ORDER_STATUS.NEW,
    },
    {
      name: ORDER_ACTIONS.PACKAGE,
      from: ORDER_STATUS.CONFIRMED,
      to: ORDER_STATUS.PACKAGED,
    },
    {
      name: ORDER_ACTIONS.REJECT,
      from: ORDER_STATUS.CONFIRMED,
      to: ORDER_STATUS.NEW,
    },
    {
      name: ORDER_ACTIONS.CANCEL,
      from: ORDER_STATUS.CONFIRMED,
      to: ORDER_STATUS.CANCELLED,
    },
    {
      name: ORDER_ACTIONS.SHIPPING,
      from: ORDER_STATUS.PACKAGED,
      to: ORDER_STATUS.SHIPPING,
    },
    {
      name: ORDER_ACTIONS.REJECT,
      from: ORDER_STATUS.PACKAGED,
      to: ORDER_STATUS.NEW,
    },
    {
      name: ORDER_ACTIONS.CANCEL,
      from: ORDER_STATUS.PACKAGED,
      to: ORDER_STATUS.CANCELLED,
    },
    {
      name: ORDER_ACTIONS.CANCEL,
      from: ORDER_STATUS.SHIPPING,
      to: ORDER_STATUS.CANCELLED,
    },
    {
      name: ORDER_ACTIONS.ORDER_COMPLETION,
      from: ORDER_STATUS.SHIPPING,
      to: ORDER_STATUS.DELIVERED,
    },
  ],
});
